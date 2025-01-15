import mimetypes
import unicodedata

import pycountry
from fastapi import Request
from fastapi.responses import StreamingResponse

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.params import Form
from pycountry import countries
from pydantic import ValidationError
from pydantic.utils import Optional

from backend.app.database import payments_collection
from backend.app.models import Payment
from bson.objectid import ObjectId
from backend.app.utils.calculations import calculate_total_due
import pandas as pd
from io import StringIO
from datetime import datetime, date
from fastapi.responses import JSONResponse

router = APIRouter()

def is_valid_country_code(code: str) -> bool:
    try:
        return bool(countries.get(alpha_2=code))
    except Exception:
        return False

# Helper function to normalize and upsert payments
def normalize_and_upsert(payment_data: dict):
    # Set default status to "pending" if not provided
    payment_data["payee_payment_status"] = payment_data.get("payee_payment_status", "pending")

    # Convert any datetime.date to datetime.datetime
    for key, value in payment_data.items():
        if isinstance(value, date):
            payment_data[key] = datetime.combine(value, datetime.min.time())

    # Validate the country code
    country_code = payment_data.get("payee_country")
    if not country_code or not is_valid_country_code(country_code):
        raise ValueError(f"Invalid country code: {country_code}")

    # Calculate total_due
    payment_data["total_due"] = calculate_total_due(
        payment_data.get("due_amount", 0),
        payment_data.get("discount_percent", 0),
        payment_data.get("tax_percent", 0)
    )

    # If _id is provided, update (or insert if not found). Otherwise, just insert.
    if "_id" in payment_data:
        payments_collection.update_one(
            {"_id": payment_data["_id"]},
            {"$set": payment_data},
            upsert=True
        )
    else:
        payments_collection.insert_one(payment_data)




@router.post("/payments")
def create_payment(payment: Payment):
    payment_dict = payment.dict()
    normalize_and_upsert(payment_dict)
    return {"message": "Payment added or updated successfully"}


@router.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    if file.content_type != "text/csv":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    # Read and normalize CSV data
    contents = await file.read()
    df = pd.read_csv(StringIO(contents.decode("utf-8")))

    invalid_rows = []  # Track rows that don't match the schema

    # Validate and normalize rows
    for index, row in df.iterrows():
        try:
            payment_data = row.to_dict()

            # Enforce default status
            payment_data["payee_payment_status"] = payment_data.get("payee_payment_status", "pending")

            # Validate and normalize row using the Payment schema
            payment = Payment(**payment_data)

            # If valid, upsert into MongoDB
            normalize_and_upsert(payment.dict())
        except Exception as e:
            # If row doesn't match schema, track its index or details
            invalid_rows.append({"row_index": index, "error": str(e)})

    if invalid_rows:
        # Optionally, return information about skipped rows
        return JSONResponse(
            status_code=207,
            content={
                "message": "CSV processed with some rows skipped due to errors.",
                "invalid_rows": invalid_rows
            }
        )

    return {"message": "CSV data processed successfully"}


@router.get("/payments")
def get_payments(
        page: int = Query(1, ge=1, description="Page number, starting from 1"),
        limit: int = Query(10, ge=1, le=100, description="Number of items per page (max 100)"),
        payment_id: Optional[str] = Query(None, description="Search by payment ID"),
        status: Optional[str] = Query(None, description="Filter by payment status"),
        email: Optional[str] = Query(None, description="Filter by payee email"),
        country: Optional[str] = Query(None, description="Filter by payee country"),
        searchByname: Optional[str] = Query(None, description="Search by payee first or last name"),
        searchByemail: Optional[str] = Query(None, description="Search by email address"),

):
    if payment_id:
        if not ObjectId.is_valid(payment_id):
            raise HTTPException(status_code=400, detail="Invalid payment ID")
        payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        # Remove binary data
        if "evidence" in payment:
            del payment["evidence"]

        payment["_id"] = str(payment["_id"])
        return {"data": [payment]}  # Return as a list for consistent structure


    skip = (page - 1) * limit
    query = {}
    if status:
        query["payee_payment_status"] = status
    if email:
        query["payee_email"] = email
    if country:
        query["payee_country"] = country
    if searchByname:
        query["$or"] = [
            {"payee_first_name": {"$regex": searchByname, "$options": "i"}},
            {"payee_last_name": {"$regex": searchByname, "$options": "i"}},
        ]
    if searchByemail:
        query["$or"] = [
            {"payee_email": {"$regex": searchByemail, "$options": "i"}},
        ]

    payments_cursor = payments_collection.find(query).skip(skip).limit(limit)
    payments = list(payments_cursor)
    total_count = payments_collection.count_documents(query)

    if skip >= total_count and total_count > 0:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for page {page}. Available pages: 1 to {(total_count + limit - 1) // limit}."
        )

    today = datetime.now().date()
    for payment in payments:
        payment["_id"] = str(payment["_id"])

        # Remove binary data
        if "evidence" in payment:
            del payment["evidence"]

        # Process status and total_due
        due_date = payment.get("payee_due_date")
        if due_date:
            due_date = due_date.date() if isinstance(due_date, datetime) else datetime.strptime(due_date, "%Y-%m-%d").date()

            # Only update status if it's not already "completed"
            new_status = payment.get("payee_payment_status")
            if payment.get("payee_payment_status") != "completed":
                if due_date == today:
                    new_status = "due_now"
                elif due_date < today:
                    new_status = "overdue"

            # Update status in the database if it has changed
            # if new_status != payment.get("payee_payment_status"):
                payments_collection.update_one(
                    {"_id": ObjectId(payment["_id"])},
                    {"$set": {"payee_payment_status": new_status}}
                )
                payment["payee_payment_status"] = new_status  # Reflect the change in the response

        payment["total_due"] = calculate_total_due(
            payment.get("due_amount", 0),
            payment.get("discount_percent", 0),
            payment.get("tax_percent", 0)
        )

    return {
        "data": payments,
        "page": page,
        "limit": limit,
        "total_count": total_count,
        "total_pages": (total_count + limit - 1) // limit,
    }


@router.patch("/payments/{payment_id}")
async def update_payment(
    payment_id: str,
    request: Request,
    evidence: Optional[UploadFile] = File(None)
):
    # Validate the payment_id
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="Invalid payment ID")

    # Extract form data dynamically
    form_data = await request.form()
    print(f"Raw form_data: {form_data}")

    payment_data = dict(form_data)

    # Normalize and validate fields
    for key, value in payment_data.items():
        if "date" in key.lower():  # Handle date fields
            try:
                if "utc" in key.lower():
                    payment_data[key] = datetime.fromisoformat(value)
                else:
                    payment_data[key] = datetime.combine(datetime.strptime(value, "%Y-%m-%d").date(), datetime.min.time())
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid date format for field {key}")
        elif isinstance(value, str) and value.isdigit():  # Convert numeric strings to numbers
            payment_data[key] = float(value) if "." in value else int(value)

    # Validate and normalize country code
    country_code = payment_data.get("payee_country")
    if country_code and not is_valid_country_code(country_code):
        raise HTTPException(status_code=400, detail=f"Invalid country code: {country_code}")

    # Handle evidence file if provided
    if evidence:
        file_content = await evidence.read()
        payment_data["evidence"] = file_content
        payment_data["evidence_filename"] = evidence.filename
        payment_data["evidence_content_type"] = evidence.content_type

    # Fetch the existing payment document
    existing_payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
    if not existing_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # If the status is provided, check if it's different
    if "payee_payment_status" in payment_data:
        new_status = payment_data["payee_payment_status"]
        if new_status == existing_payment.get("payee_payment_status"):
            # Status remains unchanged; no need to update it
            payment_data.pop("payee_payment_status")

    # Calculate the total due amount
    if any(key in payment_data for key in ["due_amount", "discount_percent", "tax_percent"]):
        payment_data["total_due"] = calculate_total_due(
            payment_data.get("due_amount", existing_payment.get("due_amount", 0)),
            payment_data.get("discount_percent", existing_payment.get("discount_percent", 0)),
            payment_data.get("tax_percent", existing_payment.get("tax_percent", 0)),
        )

    # Update the database only with the provided fields
    result = payments_collection.update_one(
        {"_id": ObjectId(payment_id)},
        {"$set": payment_data}
    )

    # Check if the record was updated
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {"message": "Payment updated successfully"}

@router.delete("/payments/{payment_id}")
def delete_payment(payment_id: str):
    # Validate the payment_id
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="Invalid payment ID")

    # Attempt to delete the payment
    result = payments_collection.delete_one({"_id": ObjectId(payment_id)})

    # Check if a document was deleted
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {"message": f"Payment with ID {payment_id} has been deleted successfully"}


@router.get("/payments/{payment_id}/download/")
def download_evidence(payment_id: str):
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="Invalid payment ID")

    payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
    if not payment or "evidence" not in payment:
        raise HTTPException(status_code=404, detail="No evidence found")

    # Retrieve the evidence and its metadata
    evidence_data = payment["evidence"]
    evidence_filename = payment.get("evidence_filename", "evidence.bin")
    evidence_content_type = payment.get("evidence_content_type", "application/octet-stream")

    # Infer MIME type if not explicitly stored
    if evidence_content_type == "application/octet-stream":
        evidence_content_type, _ = mimetypes.guess_type(evidence_filename)

    # Ensure the filename is safe and sanitized
    evidence_filename = (
        unicodedata.normalize("NFKD", evidence_filename)
        .encode("ascii", "ignore")
        .decode("utf-8")
        .replace("\u202f", "_")
    )

    if not evidence_content_type:
        evidence_content_type = "application/octet-stream"

    # Return the evidence as a file response
    return StreamingResponse(
        iter([evidence_data]),
        media_type=evidence_content_type,
        headers={
            "Content-Disposition": f"attachment; filename=\"{evidence_filename}\""
        }
    )


@router.get("/countries", response_model=dict)
def get_countries():
    try:
        # Aggregate distinct country codes
        country_codes = payments_collection.distinct("payee_country")
        countries = []

        for code in country_codes:
            if code:
                # Use pycountry to map code to name
                country = pycountry.countries.get(alpha_2=code.upper())
                if country:
                    countries.append({"code": code, "name": country.name})

        if not countries:
            return JSONResponse(content={"message": "No countries found"}, status_code=404)

        return {"countries": countries}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

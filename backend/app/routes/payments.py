from fastapi import APIRouter, HTTPException, UploadFile, File
from backend.app.database import payments_collection
from backend.app.models import Payment
from bson.objectid import ObjectId
from backend.app.utils.calculations import calculate_total_due

router = APIRouter()

@router.post("/payments/")
def create_payment(payment: Payment):
    payment_dict = payment.dict()
    payment_dict["total_due"] = calculate_total_due(
        payment.due_amount, payment.discount_percent, payment.tax_percent
    )
    result = payments_collection.insert_one(payment_dict)
    return {"id": str(result.inserted_id)}

@router.get("/payments/")
def get_payments():
    payments = list(payments_collection.find())
    for payment in payments:
        payment["_id"] = str(payment["_id"])  # Convert ObjectId to string
    return payments

@router.put("/payments/{payment_id}")
def update_payment(payment_id: str, payment: Payment):
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="Invalid payment ID")
    result = payments_collection.update_one(
        {"_id": ObjectId(payment_id)},
        {"$set": payment.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment updated successfully"}

@router.post("/payments/{payment_id}/upload/")
def upload_evidence(payment_id: str, file: UploadFile = File(...)):
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="Invalid payment ID")
    file_content = file.file.read()
    payments_collection.update_one(
        {"_id": ObjectId(payment_id)},
        {"$set": {"evidence": file_content}}
    )
    return {"message": "Evidence uploaded successfully"}

@router.get("/payments/{payment_id}/download/")
def download_evidence(payment_id: str):
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="Invalid payment ID")
    payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
    if "evidence" not in payment:
        raise HTTPException(status_code=404, detail="No evidence found")
    return {"file": payment["evidence"]}

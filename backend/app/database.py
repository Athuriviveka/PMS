from pymongo import MongoClient

client = MongoClient("mongodb+srv://vivekaathuri:p3JxsIwYYtE6e0Ay@pms.xq5f6.mongodb.net/?retryWrites=true&w=majority&appName=PMS")
db = client["payment_db"]  # Database name
payments_collection = db["payments"]  # Collection name

# payment_data = {
#     "payee_first_name": "John",
#     "payee_last_name": "Doe",
#     "payee_payment_status": "pending",
#     "payee_added_date_utc": "2025-01-10T10:00:00Z",
#     "payee_due_date": "2025-01-15",
#     "payee_address_line_1": "123 Main St",
#     "payee_city": "Toronto",
#     "payee_country": "CA",
#     "payee_postal_code": "M1B2K3",
#     "payee_phone_number": "+14165551234",
#     "payee_email": "john.doe@example.com",
#     "currency": "USD",
#     "due_amount": 100.00
# }
#
# # Insert the data into the collection
# result = payments_collection.insert_one(payment_data)
#
# print("Document inserted with ID:", result.inserted_id)
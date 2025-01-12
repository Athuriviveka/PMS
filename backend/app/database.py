from pymongo import MongoClient

client = MongoClient("mongodb+srv://username:password@pms.xq5f6.mongodb.net/?retryWrites=true&w=majority&appName=PMS")
db = client["payment_db"]  # Database name
payments_collection = db["payments"]  # Collection name

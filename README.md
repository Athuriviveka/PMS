Payment Management System
Overview
Payment Management System is a comprehensive application for managing payment records. It provides features for creating, updating, and deleting payments, uploading evidence files, and filtering payments based on multiple criteria. This project is built using Angular for the frontend, FastAPI for the backend, and MongoDB for data storage.

Features
CRUD Operations: Add, update, view, and delete payment records.
File Uploads: Support for uploading evidence files (PDF, PNG, JPG).
Payment Status Updates: Automatically update statuses to due_now or overdue based on the due date.
Filtering: Search payments by status, email, country, or payee name.
Proxy Setup: Seamless API calls between frontend and backend using a development proxy.

Technology Stack
Frontend: Angular v16.2
Backend: FastAPI v0.115.6
Database: MongoDB v8.0.4
Other Tools: Ngrok (for tunneling), Postman (for testing)

Setup and Installation
Prerequisites
Node.js (v14 or higher)
Python (v3.9)
MongoDB v8.0.4

Backend Setup
Navigate to the backend directory:
cd backend
Install dependencies:
pip install -r requirements.txt
Start the FastAPI server:
uvicorn backend.app.main:app --reload
Frontend Setup
Navigate to the frontend directory:
cd frontend
Install dependencies:
npm install
Start the Angular development server:
ng serve
Proxy Configuration
Configure the Angular proxy (proxy.conf.json) to route /api calls to http://localhost:8000.

# Payment Management System

## Overview
The Payment Management System is a comprehensive application designed for managing payment records efficiently. It allows users to perform CRUD operations, upload evidence files, and filter payments based on multiple criteria. The project features a user-friendly interface built with Angular, a robust backend powered by FastAPI, and MongoDB for data storage.

## Features
- **CRUD Operations**: Create, update, view, and delete payment records.
- **File Uploads**: Supports uploading evidence files in PDF, PNG, and JPG formats.
- **Dynamic Status Updates**: Automatically updates payment statuses (`due_now`, `overdue`, etc.) based on due dates.
- **Filtering and Searching**: Filter payments by status, email, country, or payee name.
- **Responsive Design**: Optimized for various screen sizes with a professional UI.
- **Proxy Setup**: Simplified API calls between frontend and backend using a development proxy.

## Technology Stack
- **Frontend**: Angular v16.2
- **Backend**: FastAPI v0.115.6
- **Database**: MongoDB v8.0.4
- **Other Tools**: 
  - Ngrok (for tunneling public URLs during development)
  - Postman (for API testing)

## Setup and Installation

### Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v14 or higher)
- **Python** (v3.9 or higher)
- **MongoDB** (v8.0.4 or higher)

---

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
2. Install Dependencies
   ```bash
   pip install -r requirements.txt

3. Start the FastAPI server:
   ```bash
   uvicorn backend.app.main:app --reload

### Frontend Setup

1. Navigate to the frontend directory:
  ```bash
  cd frontend
```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Start the Angular development server:
  ```bash
  ng serve --proxy-config proxy.conf.json
  ```

### Proxy Configuration

Configure the Angular proxy (proxy.conf.json) to route /api calls to http://localhost:8000.


PMS/                              # Root of the project
├── backend                       # Contains the FastAPI application
│   ├── .gitignore               # Defines files/folders Git should ignore
│   ├── Procfile                 # Used by Heroku or similar deployment services
│   ├── requirements.txt         # Python dependencies for the backend
│   ├── app                      # Core FastAPI application folder
│   │   ├── main.py              # Main entry point for the FastAPI app
│   │   ├── models.py            # Database models
│   │   ├── routes.py            # API endpoint definitions
│   │   └── ...                  # Other backend modules
│   ├── db                       # Database-related scripts and utilities
│   ├── tests                    # Contains test files
│   └── ...                      # Additional backend files/folders
├── frontend                     # Houses the Angular application
│   ├── pms                      # Main Angular project folder
│   │   ├── angular.json         # Angular CLI configuration (build/serve settings)
│   │   ├── package.json         # Lists Node.js dependencies
│   │   ├── proxy.conf.json      # Proxy configuration to route API calls to the backend
│   │   ├── src                  # Angular source code (components, services, etc.)
│   │   └── ...                  # Other Angular config files/folders
└── README.md                    # Provides an overview and setup instructions


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

<ul>
  <li>
    PMS/ 
    <span style="color: #777;"># Root of the project</span>
    <ul>
      <li>
        backend 
        <span style="color: #777;"># Contains the FastAPI application</span>
        <ul>
          <li>.gitignore <span style="color: #777;"># Defines files/folders Git should ignore</span></li>
          <li>Procfile <span style="color: #777;"># Used by Heroku or similar deployment services</span></li>
          <li>requirements.txt <span style="color: #777;"># Python dependencies for the backend</span></li>
          <li>
            app 
            <span style="color: #777;"># Core FastAPI application folder</span>
            <ul>
              <li>main.py <span style="color: #777;"># Main entry point for the FastAPI app</span></li>
              <li>models.py <span style="color: #777;"># Database models</span></li>
              <li>routes.py <span style="color: #777;"># API endpoint definitions</span></li>
              <li>... <span style="color: #777;"># Other backend modules</span></li>
            </ul>
          </li>
          <li>
            db 
            <span style="color: #777;"># Database-related scripts and utilities</span>
          </li>
          <li>
            tests
            <span style="color: #777;"># Contains test files</span>
          </li>
          <li>... <span style="color: #777;"># Additional backend files/folders</span></li>
        </ul>
      </li>
      <li>
        frontend 
        <span style="color: #777;"># Houses the Angular application</span>
        <ul>
          <li>
            pms 
            <span style="color: #777;"># Main Angular project folder</span>
            <ul>
              <li>angular.json <span style="color: #777;"># Angular CLI configuration (build/serve settings)</span></li>
              <li>package.json <span style="color: #777;"># Lists Node.js dependencies</span></li>
              <li>proxy.conf.json <span style="color: #777;"># Proxy configuration to route API calls to the backend</span></li>
              <li>
                src 
                <span style="color: #777;"># Angular source code (components, services, etc.)</span>
              </li>
              <li>... <span style="color: #777;"># Other Angular config files/folders</span></li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        README.md 
        <span style="color: #777;"># Provides an overview and setup instructions</span>
      </li>
    </ul>
  </li>
</ul>



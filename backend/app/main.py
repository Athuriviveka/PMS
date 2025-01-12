from fastapi import FastAPI
from backend.app.routes import payments
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Register routes
app.include_router(payments.router, prefix="/api")
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Payment API"}

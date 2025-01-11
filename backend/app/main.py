from fastapi import FastAPI
from backend.app.routes import payments

app = FastAPI()

# Register routes
app.include_router(payments.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Payment API"}

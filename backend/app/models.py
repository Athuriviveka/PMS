import pycountry
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import date, datetime

from pydantic.types import confloat

from backend.app.enums import PaymentStatus


class Payment(BaseModel):
    payee_first_name: str
    payee_last_name: str
    payee_payment_status: PaymentStatus
    payee_added_date_utc: datetime
    payee_due_date: date
    payee_address_line_1: str
    payee_address_line_2: Optional[str]
    payee_city: str
    payee_country: str
    payee_province_or_state: Optional[str]
    payee_postal_code: str
    payee_phone_number: str = Field(
        regex=r"^\+?[1-9]\d{1,14}$",  # E.164 format
        description="Phone number must be in E.164 format (e.g., +14165551234)"
    )
    payee_email: EmailStr
    currency: str
    discount_percent: Optional[confloat(ge=0, le=100)]  # Percentage between 0 and 100
    tax_percent: Optional[confloat(ge=0, le=100)]  # Percentage between 0 and 100
    due_amount: confloat(ge=0)  # Non-negative float
    total_due: Optional[float]

    @validator("payee_country")
    def validate_country(cls, value):
        # Use pycountry to validate the country code
        if not pycountry.countries.get(alpha_2=value):
            raise ValueError(f"Invalid country code: {value}")
        return value

    @validator("currency")
    def validate_currency(cls, value):
        # Use pycountry to validate the currency code
        if not pycountry.currencies.get(alpha_3=value):
            raise ValueError(f"Invalid currency code: {value}")
        return value
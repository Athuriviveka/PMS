def calculate_total_due(due_amount: float, discount: float, tax: float) -> float:
    try:
        # Ensure all inputs are converted to floats
        due_amount = float(due_amount or 0)
        discount = float(discount or 0)
        tax = float(tax or 0)
    except ValueError as e:
        raise ValueError(f"Invalid input for total due calculation: {e}")

    # Calculate discount and tax amounts
    discount_amount = due_amount * discount / 100
    tax_amount = due_amount * tax / 100

    # Return the rounded total due amount
    return round(due_amount - discount_amount + tax_amount, 2)

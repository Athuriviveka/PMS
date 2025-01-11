def calculate_total_due(due_amount: float, discount: float, tax: float) -> float:
    discount_amount = due_amount * (discount or 0) / 100
    tax_amount = due_amount * (tax or 0) / 100
    return round(due_amount - discount_amount + tax_amount, 2)

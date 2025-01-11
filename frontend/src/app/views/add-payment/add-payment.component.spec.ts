import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.scss'],
})
export class AddPaymentComponent implements OnInit {
  addPaymentForm: FormGroup;
  currencies = ['USD', 'CAD', 'EUR']; // Replace with API call if needed

  constructor(private fb: FormBuilder, private paymentService: PaymentService) {
    this.addPaymentForm = this.fb.group({
      payee_first_name: ['', Validators.required],
      payee_last_name: ['', Validators.required],
      currency: ['', Validators.required],
      due_amount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.addPaymentForm.valid) {
      this.paymentService.createPayment(this.addPaymentForm.value).subscribe(() => {
        // Handle success
      });
    }
  }
}

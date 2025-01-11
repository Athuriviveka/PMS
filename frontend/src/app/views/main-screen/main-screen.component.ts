import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss'],
})
export class MainScreenComponent implements OnInit {
  payments = [];
  displayedColumns: string[] = ['payee_first_name', 'payee_last_name', 'total_due', 'actions'];
  totalPayments = 0;

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.fetchPayments();
  }

  fetchPayments(page: number = 1) {
    this.paymentService.getPayments(page).subscribe((response: any) => {
      this.payments = response.data;
      this.totalPayments = response.total;
    });
  }

  onPageChange(event: any) {
    this.fetchPayments(event.pageIndex + 1);
  }

  deletePayment(id: string) {
    this.paymentService.deletePayment(id).subscribe(() => {
      this.fetchPayments();
    });
  }

  editPayment(payment: any) {
    // Open Edit Payment Dialog
  }
}

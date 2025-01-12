import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { PaymentService } from '../../services/payment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss'],
})
export class MainScreenComponent implements OnInit {
  payments = [];
displayedColumns: string[] = [
  'payee_first_name',
  'payee_last_name',
  'payee_payment_status',
  'payee_due_date',
  'payee_phone_number',
  'payee_email',
  'payee_address',
  'due_amount',
  'actions'
];

  totalPayments = 0;
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  countries: { code: string; name: string }[] = []; // List of countries for the dropdown


  // Filter values
  filters: { status?: string; email?: string; country?: string; searchByname?: string; searchByemail?: string} = {};


  get totalPages(): number {
    return Math.ceil(this.totalPayments / this.pageSize); // Calculate total pages dynamically
  }

  constructor(
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchCountries(); // Fetch countries
    this.fetchPayments(this.currentPage, this.pageSize);
  }

  fetchPayments(page: number, limit: number) {
    this.isLoading = true;
    this.paymentService.getPayments(page, limit, undefined, this.filters).subscribe(
      (response: any) => {
        this.payments = response.data;
        this.totalPayments = response.total_count;
        this.currentPage = response.page;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.showErrorSnackBar(error);
      }
    );
  }

  fetchCountries() {
    this.paymentService.getAvailableCountries().subscribe(
      (response: any) => {
        this.countries = response.countries;
      },
      (error) => {
        console.error('Failed to fetch countries:', error);
        this.showErrorSnackBar('Failed to fetch available countries.');
      }
    );
  }

  applyFilters() {
    this.currentPage = 1; // Reset to the first page
    this.fetchPayments(this.currentPage, this.pageSize);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchPayments(this.currentPage, this.pageSize);
  }

  onFirstPage() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.fetchPayments(this.currentPage, this.pageSize);
    }
  }

  onPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchPayments(this.currentPage, this.pageSize);
    }
  }

  onNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchPayments(this.currentPage, this.pageSize);
    }
  }

  onLastPage() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.fetchPayments(this.currentPage, this.pageSize);
    }
  }
  

  deletePayment(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Payment',
        message: 'Are you sure you want to delete this payment?'
      }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.paymentService.deletePayment(id).subscribe(
          () => {
            this.showSuccessSnackBar('Payment deleted successfully!');
            this.fetchPayments(this.currentPage, this.pageSize);
          },
          (error) => {
            this.showErrorSnackBar('Failed to delete payment.');
          }
        );
      }
    });
  }
  

  uploadCsv(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.paymentService.uploadCsv(file).subscribe(
        (response: any) => {
          this.showSuccessSnackBar('CSV uploaded and processed successfully!');
          this.fetchPayments(this.currentPage, this.pageSize); // Refresh payments
        },
        (error) => {
          this.showErrorSnackBar(error?.error?.detail || 'Failed to process CSV file.');
        }
      );
    }
  }

  downloadEvidence(paymentId: string) {
    this.paymentService.downloadEvidence(paymentId).subscribe(
      (blob) => {
        // Infer the file type from the response headers (Content-Type)
        const contentType = blob.type; // MIME type of the response
        let fileExtension = '';
  
        // Determine file extension based on MIME type
        switch (contentType) {
          case 'application/pdf':
            fileExtension = 'pdf';
            break;
          case 'image/png':
            fileExtension = 'png';
            break;
          case 'image/jpeg':
            fileExtension = 'jpg';
            break;
          default:
            fileExtension = ''; // Default extension if type is unknown
            console.warn('Unknown file type:', contentType);
        }
  
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
  
        a.download = `evidence-${paymentId}.${fileExtension}`; // Filename with dynamic extension
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        this.showErrorSnackBar('Failed to download evidence file.');
        console.error('Error downloading file:', error);
      }
    );
  }
  

  showSuccessSnackBar(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  showErrorSnackBar(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getPayments(page: number) {
    return this.http.get(`${this.apiUrl}/payments?page=${page}`);
  }

  createPayment(data: any) {
    return this.http.post(`${this.apiUrl}/payments`, data);
  }

  deletePayment(id: string) {
    return this.http.delete(`${this.apiUrl}/payments/${id}`);
  }

  uploadEvidence(paymentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/payments/${paymentId}/upload`, formData);
  }
}

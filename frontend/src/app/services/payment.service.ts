import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'api';

  constructor(private http: HttpClient) {}

  /**
   * Fetch payments: either a list or a specific payment by ID.
   */
  getPayments(
    page: number,
    limit: number = 10,
    paymentId?: string,
    filters: { status?: string; email?: string; country?: string; searchByname?: string; searchByemail?: string } = {}
  ): Observable<any> {
    let url = `${this.apiUrl}/payments?page=${page}&limit=${limit}`;
    if (paymentId) {
      url += `&payment_id=${paymentId}`;
    }
    if (filters.status) {
      url += `&status=${filters.status}`;
    }
    if (filters.email) {
      url += `&email=${filters.email}`;
    }
    if (filters.country) {
      url += `&country=${filters.country}`;
    }
    if (filters.searchByemail) {
      url += `&searchByemail=${filters.searchByemail}`;
    }
    if (filters.searchByname) {
      url += `&searchByname=${filters.searchByname}`;
    }
    return this.http.get(url);
  }

  createPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, data);
  }

  getAvailableCountries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/countries`);
  }
  

  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/payments/${id}`);
  }

  uploadCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload-csv/`, formData);
  }

  updatePayment(id: string, paymentData: any): Observable<any> {
    console.log('Raw paymentData before creating FormData:', paymentData);
  
    const formData = new FormData();
  
    for (const key in paymentData) {
      if (paymentData.hasOwnProperty(key)) {
        const value = paymentData[key];
        console.log(`Appending Key: ${key}, Value:`, value);
        if (key === 'evidenceFile' && value instanceof File) {
          formData.append('evidence', value, value.name);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value != null ? value.toString() : '');
        }
      }
    }
  
    console.log('Final FormData content after appending:');
    formData.forEach((value, key) => console.log(`${key}: ${value}`));
  
    return this.http.patch(`${this.apiUrl}/payments/${id}`, formData);
  }

  downloadEvidence(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/payments/${paymentId}/download/`, {
      responseType: 'blob',
    });
  }
  
  
  
}

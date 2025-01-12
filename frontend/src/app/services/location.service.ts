import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiBase = 'https://countriesnow.space/api/v0.1';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<any> {
    return this.http.get(`${this.apiBase}/countries`);
  }

  getCitiesByCountry(country: string): Observable<any> {
    return this.http.post(`${this.apiBase}/countries/cities`, { country });
  }

  getStatesByCountry(country: string): Observable<any> {
    return this.http.post(`${this.apiBase}/countries/states`, { country });
  }
}

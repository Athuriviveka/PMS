import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { LocationService } from '../../services/location.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CurrencyService } from 'src/app/services/currency.service';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.scss'],
})
export class AddPaymentComponent implements OnInit {
  addPaymentForm: FormGroup;
  currencies: any[] = [];
  countries: any[] = [];
  paymentStatuses = ['pending'];
  cities: string[] = [];
  states: { name: string; code: string }[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private locationService: LocationService,
    private currencyService: CurrencyService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.addPaymentForm = this.fb.group({
      payee_first_name: ['', Validators.required],
      payee_last_name: ['', Validators.required],
      payee_payment_status: ['', Validators.required],
      payee_due_date: ['', Validators.required],
      payee_address_line_1: ['', Validators.required],
      payee_address_line_2: [''],
      payee_city: ['', Validators.required],
      payee_country: ['', Validators.required],
      payee_province_or_state: [''],
      payee_postal_code: ['', Validators.required],
      payee_phone_number: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[1-9]\d{1,14}$/), // E.164 format for phone numbers
        ],
      ],
      payee_email: ['', [Validators.required, Validators.email]],
      currency: ['', Validators.required],
      due_amount: [
        null,
        [
          Validators.required,
          Validators.min(0.01), // Positive values only
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // Allow up to 2 decimal points
        ],
      ],
      discount_percent: [
        null,
        [
          Validators.min(0),
          Validators.max(100),
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // Optional with up to 2 decimal points
        ],
      ],
      tax_percent: [
        null,
        [
          Validators.min(0),
          Validators.max(100),
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // Optional with up to 2 decimal points
        ],
      ],
    });
    
  }

  ngOnInit(): void {
    this.fetchCountries();
    this.fetchCurrencies();

    // Update cities when country changes
    this.addPaymentForm.get('payee_country')?.valueChanges.subscribe((countryCode) => {
      const selectedCountry = this.countries.find(
        (country) => country.alpha2Code === countryCode
      );
      this.cities = selectedCountry?.cities || [];
      this.states = []; // Optionally reset states
    });
  }

  fetchCountries() {
    this.locationService.getCountries().subscribe(
      (response) => {
        if (response && Array.isArray(response.data)) {
          this.countries = response.data.map((item: any) => ({
            name: item.country, // Country name
            alpha2Code: item.iso2, // Country code
            cities: item.cities, // Cities within the country
            states: item.states || [], // Include states if available
          }));
          console.log('Countries with states:', this.countries);
        } else {
          console.error('Unexpected countries response:', response);
        }
      },
      (error) => console.error('Error fetching countries:', error)
    );
  }
  

  fetchCurrencies() {
    this.currencyService.getCurrencies().subscribe(
      (response) => {
        console.log('Currencies response:', response);
  
        if (response && response.rates) {
          this.currencies = Object.entries(response.rates).map(([code, value]) => ({
            code, 
            value, 
          }));
          console.log('Processed currencies:', this.currencies);
        } else {
          console.error('Unexpected structure for currencies response:', response);
          this.currencies = [];
        }
      },
      (error) => {
        console.error('Error fetching currencies:', error);
        this.currencies = []; 
      }
    );
  }

  onCountryChange(selectedCountryCode: string) {
    const selectedCountry = this.countries.find(
      (country) => country.alpha2Code === selectedCountryCode
    );
  
    if (selectedCountry) {
      const countryName = selectedCountry.name;
  
      // Fetch states using the country name
      this.locationService.getStatesByCountry(countryName).subscribe(
        (response) => {
          if (response && response.data && Array.isArray(response.data.states)) {
            // Map the states to include 'name' and 'code' properties
            this.states = response.data.states.map((state: any) => ({
              name: state.name,
              code: state.state_code,
            }));
          } else {
            console.error('Unexpected states response:', response);
            this.states = []; // Reset states if the response is invalid
          }
        },
        (error) => {
          console.error('Error fetching states:', error);
          this.states = []; // Reset states on error
        }
      );
    } else {
      this.states = []; // Reset states if no country is selected
    }
  }
  
  onSubmit() {
    if (this.addPaymentForm.valid) {
      this.isSubmitting = true;
      const formData = { ...this.addPaymentForm.value };

      // Format the date
      formData.payee_due_date = new Date(formData.payee_due_date).toISOString().split('T')[0];
      formData.payee_added_date_utc = new Date().toISOString();

      this.paymentService.createPayment(formData).subscribe(
        () => {
          this.snackBar.open('Payment added successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        },
        (error) => {
          this.snackBar.open('Failed to add payment.', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      );
    }
  }
}

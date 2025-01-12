import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { LocationService } from '../../services/location.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-edit-payment',
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./edit-payment.component.scss'],
})
export class EditPaymentComponent implements OnInit {
  editPaymentForm: FormGroup;
  paymentId!: string;
  paymentStatuses = ['pending', 'due_now', 'completed'];
  currencies: any[] = [];
  countries: any[] = [];
  cities: string[] = [];
  states: { name: string; code: string }[] = [];
  isSubmitting = false;
  evidenceFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private locationService: LocationService,
    private currencyService: CurrencyService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editPaymentForm = this.fb.group({
      payee_first_name: [{ value: '', disabled: true }, Validators.required],
      payee_last_name: [{ value: '', disabled: true }, Validators.required],
      payee_due_date: ['', Validators.required],
      due_amount: [0, [Validators.required, Validators.min(0)]],
      payee_payment_status: ['', Validators.required],
      discount_percent: [{ value: 0, disabled: true }, [Validators.min(0), Validators.max(100)]],
      tax_percent: [{ value: 0, disabled: true }, [Validators.min(0), Validators.max(100)]],
      payee_address_line_1: [{ value: '', disabled: true }, Validators.required],
      payee_address_line_2: [{ value: '', disabled: true }],
      payee_city: [{ value: '', disabled: true }, Validators.required],
      payee_country: [{ value: '', disabled: true }, Validators.required],
      payee_province_or_state: [{ value: '', disabled: true }],
      payee_postal_code: [{ value: '', disabled: true }, Validators.required],
      payee_phone_number: [{ value: '', disabled: true }, Validators.required],
      payee_email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      currency: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.params['id'];
    this.fetchCountries();
    this.fetchCurrencies();

    // Fetch the payment details and prepopulate the form
    this.paymentService.getPayments(1, 1, this.paymentId).subscribe({
      next: (response: any) => {
        if (response.data && response.data.length > 0) {
          const payment = response.data[0];
          this.editPaymentForm.patchValue(payment);
          this.onCountryChange(payment.payee_country); // Pre-fetch cities and states based on country
        } else {
          console.error('Payment not found');
        }
      },
      error: (error) => console.error('Error fetching payment:', error),
    });

    // Update cities and states when the country changes
    this.editPaymentForm.get('payee_country')?.valueChanges.subscribe((countryCode) => {
      this.onCountryChange(countryCode);
    });
  }

  fetchCountries() {
    this.locationService.getCountries().subscribe(
      (response) => {
        if (response && Array.isArray(response.data)) {
          this.countries = response.data.map((item: any) => ({
            name: item.country, // Country name
            alpha2Code: item.iso2, // Country code
            cities: item.cities || [], // Cities within the country
          }));
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
        if (response && response.rates) {
          this.currencies = Object.entries(response.rates).map(([code, value]) => ({
            code,
            value,
          }));
        } else {
          console.error('Unexpected currencies response:', response);
        }
      },
      (error) => console.error('Error fetching currencies:', error)
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
            this.states = response.data.states.map((state: any) => ({
              name: state.name,
              code: state.state_code,
            }));
          } else {
            this.states = [];
          }
        },
        (error) => {
          console.error('Error fetching states:', error);
          this.states = [];
        }
      );

      // Use cities from the country object
      this.cities = selectedCountry.cities || [];
    } else {
      this.cities = [];
      this.states = [];
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.evidenceFile = file ? file : null;
  }

  isUpdateButtonDisabled(): boolean {
    const formValid = this.editPaymentForm.valid;
    const isCompleted = this.editPaymentForm.get('payee_payment_status')?.value === 'completed';
    const evidenceRequired = isCompleted && !this.evidenceFile;

    return !formValid || this.isSubmitting || evidenceRequired;
  }

  onSubmit() {
    if (this.editPaymentForm.valid) {
      this.isSubmitting = true;
      const formData: any = { ...this.editPaymentForm.value };
      formData.payee_due_date = new Date(formData.payee_due_date).toISOString().split('T')[0];

      if (this.evidenceFile && formData.payee_payment_status === 'completed') {
        formData.evidenceFile = this.evidenceFile;
      }

      this.paymentService.updatePayment(this.paymentId, formData).subscribe(
        () => this.router.navigate(['/']),
        (error) => console.error('Error updating payment:', error)
      );
    }
  }
}

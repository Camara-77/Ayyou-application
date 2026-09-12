import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isValidNumber, getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { AuthService } from '../../../../core/services/auth.service';

export interface CountryInfo {
  code: CountryCode;
  flag: string;
  name: string;
  prefix: string;
}

export function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const regionDisplayNames = new Intl.DisplayNames(['fr'], { type: 'region' });

export function buildAllCountriesList(): CountryInfo[] {
  const codes = getCountries();
  const list: CountryInfo[] = codes.map(code => {
    let name = code as string;
    try {
      name = regionDisplayNames.of(code) || code;
    } catch {}
    let prefix = '';
    try {
      prefix = '+' + getCountryCallingCode(code);
    } catch {}
    return {
      code,
      flag: getFlagEmoji(code),
      name,
      prefix
    };
  });

  list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  // Place Senegal at top of list
  const snIndex = list.findIndex(c => c.code === 'SN');
  if (snIndex > 0) {
    const [sn] = list.splice(snIndex, 1);
    list.unshift(sn);
  }
  return list;
}

export function nameValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) {
    return { required: true };
  }
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,}$/;
  if (!nameRegex.test(val.trim())) {
    return { invalidName: true };
  }
  return null;
}

export function strictEmailValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) {
    return { required: true };
  }
  const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!strictEmailRegex.test(val) || val.includes('..') || val.startsWith('@') || val.endsWith('.')) {
    return { invalidEmail: true };
  }
  return null;
}

export function internationalPhoneValidator(selectedCountryGetter: () => CountryCode): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal) {
      return { required: true };
    }
    const cleanVal = rawVal.replace(/\s+/g, '');
    if (/[^0-9\-]/.test(cleanVal)) {
      return { invalidPhone: true };
    }
    const country = selectedCountryGetter();
    try {
      const valid = isValidNumber(cleanVal, country);
      if (!valid) {
        return { invalidPhone: true };
      }
      return null;
    } catch {
      return { invalidPhone: true };
    }
  };
}

export function strictPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) {
    return { required: true };
  }
  if (val.length < 8) {
    return { minlength: { requiredLength: 8, actualLength: val.length } };
  }
  const hasLetter = /[a-zA-ZÀ-ÿ]/.test(val);
  const hasDigit = /[0-9]/.test(val);
  const hasSpecial = /[^a-zA-Z0-9]/.test(val);

  if (!hasLetter || !hasDigit || !hasSpecial) {
    return { passwordComplexity: true };
  }
  return null;
}

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmation = group.get('passwordConfirmation')?.value;
  if (password && confirmation && password !== confirmation) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    AuthInputComponent,
    AuthButtonComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  allCountries: CountryInfo[] = buildAllCountriesList();
  selectedCountry: CountryInfo = this.allCountries.find(c => c.code === 'SN') || this.allCountries[0];
  showCountryDropdown = false;
  countrySearchQuery = '';

  showPassword = false;
  loading = false;
  errorMessage: string | null = null;

  registerForm!: FormGroup;

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, nameValidator]],
        lastName: ['', [Validators.required, nameValidator]],
        phone: ['', [Validators.required, internationalPhoneValidator(() => this.selectedCountry.code)]],
        email: ['', [Validators.required, strictEmailValidator]],
        password: ['', [Validators.required, strictPasswordValidator]],
        passwordConfirmation: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]]
      },
      { validators: passwordMatchValidator }
    );
  }

  get filteredCountries(): CountryInfo[] {
    if (!this.countrySearchQuery.trim()) {
      return this.allCountries;
    }
    const q = this.countrySearchQuery.toLowerCase().trim();
    return this.allCountries.filter(
      c => c.name.toLowerCase().includes(q) || c.prefix.includes(q) || c.code.toLowerCase().includes(q)
    );
  }

  selectCountry(country: CountryInfo): void {
    this.selectedCountry = country;
    this.showCountryDropdown = false;
    this.countrySearchQuery = '';
    this.registerForm.get('phone')?.updateValueAndValidity();
  }

  toggleCountryDropdown(): void {
    this.showCountryDropdown = !this.showCountryDropdown;
    if (!this.showCountryDropdown) {
      this.countrySearchQuery = '';
    }
  }

  get isFirstNameInvalid(): boolean {
    const control = this.registerForm.get('firstName');
    return !!(control && control.invalid && control.touched);
  }

  get isLastNameInvalid(): boolean {
    const control = this.registerForm.get('lastName');
    return !!(control && control.invalid && control.touched);
  }

  get isPhoneInvalid(): boolean {
    const control = this.registerForm.get('phone');
    return !!(control && control.invalid && control.touched);
  }

  get isEmailInvalid(): boolean {
    const control = this.registerForm.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get isPasswordInvalid(): boolean {
    const control = this.registerForm.get('password');
    return !!(control && control.invalid && control.touched);
  }

  get isPasswordConfirmationInvalid(): boolean {
    const control = this.registerForm.get('passwordConfirmation');
    const hasMismatch = this.registerForm.hasError('passwordMismatch');
    return !!(control && (control.invalid || hasMismatch) && control.touched);
  }

  get passwordValue(): string {
    return this.registerForm.get('password')?.value || '';
  }

  get passwordConfirmationValue(): string {
    return this.registerForm.get('passwordConfirmation')?.value || '';
  }

  get isPasswordMatching(): boolean {
    return (
      !!this.passwordValue &&
      !!this.passwordConfirmationValue &&
      this.passwordValue === this.passwordConfirmationValue
    );
  }

  get passwordStrength(): { level: 'faible' | 'moyen' | 'robuste' | 'none'; label: string; score: number } {
    const val = this.passwordValue;
    if (!val) {
      return { level: 'none', label: '', score: 0 };
    }
    if (val.length < 8) {
      return { level: 'faible', label: 'FAIBLE', score: 1 };
    }
    const hasLetter = /[a-zA-ZÀ-ÿ]/.test(val);
    const hasNum = /[0-9]/.test(val);
    const hasSym = /[^a-zA-Z0-9]/.test(val);

    if (hasLetter && hasNum && hasSym && val.length >= 8) {
      return { level: 'robuste', label: 'ROBUSTE', score: 3 };
    }
    if ((hasLetter && hasNum) || (hasLetter && hasSym) || (hasNum && hasSym)) {
      return { level: 'moyen', label: 'MOYEN', score: 2 };
    }
    return { level: 'faible', label: 'FAIBLE', score: 1 };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onBack(): void {
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/verify-sms']);
    }, 500);
  }
}

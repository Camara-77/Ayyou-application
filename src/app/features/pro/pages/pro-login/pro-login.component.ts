import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProAuthService } from '../../../../core/services/pro-auth.service';

@Component({
  selector: 'app-pro-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pro-login.component.html',
  styleUrls: ['./pro-login.component.scss']
})
export class ProLoginComponent {
  identifier: string = 'gourmet@ayyou.com';
  passwordText: string = '••••••••••••';
  showPassword: boolean = false;
  isLoading: boolean = false;
  isMobileMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  constructor(
    private proAuthService: ProAuthService,
    private router: Router
  ) {}

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.proAuthService.login(this.identifier, this.passwordText);
      this.router.navigate(['/pro/dashboard']);
    }, 800);
  }

  onGoogleLogin(): void {
    this.proAuthService.login(this.identifier, this.passwordText);
    this.router.navigate(['/pro/dashboard']);
  }
}

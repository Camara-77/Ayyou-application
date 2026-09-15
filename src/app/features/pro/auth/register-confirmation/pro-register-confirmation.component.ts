import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface RegistrationSummaryData {
  reference: string;
  accountType: 'Restaurant' | 'Vendeur / Commerce' | 'Livreur / Flotte';
  structureName: string;
  contactEmail: string;
  contactPhone: string;
  documentsCountText: string;
  attachedBadges: string[];
}

@Component({
  selector: 'app-pro-register-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-register-confirmation.component.html',
  styleUrls: ['./pro-register-confirmation.component.scss']
})
export class ProRegisterConfirmationComponent implements OnInit {
  summaryData: RegistrationSummaryData = {
    reference: '#AYY-PRO-8924',
    accountType: 'Restaurant',
    structureName: 'Chez Tantie Marie (Mme Marie Diouf)',
    contactEmail: 'contact@cheztantiemarie.sn',
    contactPhone: '+221 77 123 45 67',
    documentsCountText: '3 documents • 4 photos',
    attachedBadges: ['Registre NINEA', 'CNI Gérante', 'Menu & Tarifs']
  };

  isMobileMenuOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Read state passed from router navigation if present
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state && navigation.extras.state['summary']) {
      this.summaryData = { ...this.summaryData, ...navigation.extras.state['summary'] };
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goBackToProHome(): void {
    this.router.navigate(['/pro']);
  }
}

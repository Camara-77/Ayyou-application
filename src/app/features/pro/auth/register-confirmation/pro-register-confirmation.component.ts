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

import { AppLogoComponent } from '../../../../shared/components/app-logo/app-logo.component';

@Component({
  selector: 'app-pro-register-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLogoComponent],
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

  constructor(private router: Router) {
    this.loadSummaryData();
  }

  ngOnInit(): void {
    this.loadSummaryData();
  }

  private loadSummaryData(): void {
    if (typeof window !== 'undefined') {
      const historySummary = window.history?.state?.summary;
      if (historySummary) {
        this.summaryData = { ...this.summaryData, ...historySummary };
        return;
      }
      const savedSummary = sessionStorage.getItem('ayyou_pro_register_summary');
      if (savedSummary) {
        try {
          const parsed = JSON.parse(savedSummary);
          if (parsed && typeof parsed === 'object') {
            this.summaryData = { ...this.summaryData, ...parsed };
          }
        } catch (e) {
          // Fallback if parsing fails
        }
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goBackToProHome(): void {
    this.router.navigate(['/pro']);
  }
}

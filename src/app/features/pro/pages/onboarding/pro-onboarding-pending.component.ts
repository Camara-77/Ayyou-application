import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-pro-onboarding-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pending-container">
      <div class="pending-card">
        <div class="badge-status">
          <span class="pulse"></span> Candidature en cours d'examen
        </div>

        <div class="icon-header">
          <div class="icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <h1>Dossier Professionnel en Attente</h1>
        <p class="subtitle">
          Merci pour votre inscription ! Votre dossier est actuellement en cours de vérification par l'équipe Super Admin AYYOU.
        </p>

        <div class="info-box" *ngIf="statusData">
          <div class="info-row" *ngIf="statusData.etablissement">
            <span class="label">Établissement :</span>
            <span class="value">{{ statusData.etablissement.nom }}</span>
          </div>
          <div class="info-row" *ngIf="statusData.profil_livreur">
            <span class="label">Véhicule Livreur :</span>
            <span class="value">{{ statusData.profil_livreur.type_vehicule }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email de contact :</span>
            <span class="value">{{ statusData.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Statut Actuel :</span>
            <span class="status-tag pending">EN ATTENTE DE VALIDATION</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn-refresh" (click)="checkStatus()" [disabled]="isChecking">
            <span *ngIf="!isChecking">Vérifier mon statut</span>
            <span *ngIf="isChecking">Vérification en cours...</span>
          </button>
          <button class="btn-secondary" (click)="logout()">
            Se déconnecter
          </button>
        </div>

        <div class="help-text">
          <p>Un problème ? Contactez l'assistance partenaire AYYOU PRO à <a href="mailto:pro&#64;ayyou.sn">pro&#64;ayyou.sn</a> ou via WhatsApp au <strong>+221 33 800 00 00</strong>.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      font-family: inherit;
    }
    .pending-card {
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
      max-width: 520px;
      width: 100%;
      padding: 2.5rem;
      text-align: center;
    }
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fef3c7;
      color: #92400e;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 1.5rem;
    }
    .pulse {
      width: 8px;
      height: 8px;
      background: #d97706;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4);
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(217, 119, 6, 0); }
      100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background: #fffbe6;
      color: #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem auto;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.75rem;
    }
    .subtitle {
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.75rem;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
      text-align: left;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 0.9rem;
      border-bottom: 1px dashed #e2e8f0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      color: #64748b;
      font-weight: 500;
    }
    .value {
      color: #0f172a;
      font-weight: 600;
    }
    .status-tag.pending {
      background: #fef3c7;
      color: #b45309;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 1.5rem;
    }
    .btn-refresh {
      background: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 12px 20px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .btn-refresh:hover {
      background: #1e293b;
    }
    .btn-secondary {
      background: transparent;
      color: #64748b;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 20px;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .btn-secondary:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .help-text {
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .help-text a {
      color: #0284c7;
      text-decoration: none;
    }
  `]
})
export class ProOnboardingPendingComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  statusData: any = null;
  isChecking: boolean = false;

  ngOnInit(): void {
    this.checkStatus();
  }

  checkStatus(): void {
    this.isChecking = true;
    const url = `${environment.apiUrl}/api/pro/status/`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.isChecking = false;
        this.statusData = res;
        if (res.is_approved) {
          // Dossier validé ! Redirection vers le bon dashboard
          const user = this.authService.getCurrentUser();
          if (user?.roles?.includes('RESTAURANT')) {
            this.router.navigate(['/pro/restaurant/dashboard']);
          } else if (user?.roles?.includes('VENDEUR')) {
            this.router.navigate(['/pro/vendor/dashboard']);
          } else if (user?.roles?.includes('LIVREUR')) {
            this.router.navigate(['/delivery/home']);
          }
        } else if (res.merchant_status === 'REFUSE' || res.driver_status === 'REFUSE') {
          this.router.navigate(['/pro/onboarding/rejected']);
        }
      },
      error: () => {
        this.isChecking = false;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/pro/login']);
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-pro-onboarding-rejected',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="rejected-container">
      <div class="rejected-card">
        <div class="badge-status">
          Candidature non retenue
        </div>

        <div class="icon-header">
          <div class="icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
        </div>

        <h1>Dossier Non Approuvé</h1>
        <p class="subtitle">
          Votre candidature professionnelle n'a pas pu être validée par l'équipe AYYOU.
        </p>

        <div class="info-box" *ngIf="statusData">
          <div class="info-row" *ngIf="statusData.etablissement">
            <span class="label">Établissement :</span>
            <span class="value">{{ statusData.etablissement.nom }}</span>
          </div>
          <div class="info-row">
            <span class="label">Statut du Dossier :</span>
            <span class="status-tag rejected">REFUSÉ</span>
          </div>
        </div>

        <div class="actions">
          <a href="mailto:support-pro@ayyou.sn" class="btn-primary">
            Contacter le Support Partenaire
          </a>
          <button class="btn-secondary" (click)="logout()">
            Se déconnecter
          </button>
        </div>

        <div class="help-text">
          <p>Si vous pensez qu'il s'agit d'une erreur ou pour fournir des documents complémentaires, contactez notre équipe au <strong>+221 33 800 00 00</strong>.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rejected-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #fee2e2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      font-family: inherit;
    }
    .rejected-card {
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
      background: #fee2e2;
      color: #991b1b;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 1.5rem;
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background: #fef2f2;
      color: #dc2626;
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
    }
    .label {
      color: #64748b;
      font-weight: 500;
    }
    .value {
      color: #0f172a;
      font-weight: 600;
    }
    .status-tag.rejected {
      background: #fee2e2;
      color: #b91c1c;
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
    .btn-primary {
      background: #dc2626;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 12px 20px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      display: inline-block;
      transition: background 0.2s ease;
    }
    .btn-primary:hover {
      background: #b91c1c;
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
  `]
})
export class ProOnboardingRejectedComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  statusData: any = null;

  ngOnInit(): void {
    const url = `${environment.apiUrl}/api/pro/status/`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.statusData = res;
      },
      error: () => {}
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/pro/login']);
    });
  }
}

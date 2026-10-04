import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { PlanningService } from '../../../../core/services/planning.service';
import { PlannedMeal } from '../../../../core/models/planning';

export type PlanningDetailUiState = 'LOADING' | 'SUCCESS' | 'NOT_FOUND' | 'ERROR';

@Component({
  selector: 'app-planning-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './planning-detail.component.html',
  styleUrls: ['./planning-detail.component.scss']
})
export class PlanningDetailComponent implements OnInit {
  currentState: PlanningDetailUiState = 'LOADING';
  meal: PlannedMeal | null = null;
  
  showCancelConfirmModal: boolean = false;
  isCancelling: boolean = false;
  reminderDismissed: boolean = false;
  reminderValidated: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planningService = inject(PlanningService);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const mealId = Number(idParam);
      if (!isNaN(mealId)) {
        this.loadMealDetail(mealId);
      } else {
        this.currentState = 'NOT_FOUND';
      }
    } else {
      this.currentState = 'NOT_FOUND';
    }
  }

  isSubmittingAction: boolean = false;

  loadMealDetail(id: number): void {
    this.currentState = 'LOADING';
    this.planningService.getPlannedMealById(id).subscribe({
      next: (data) => {
        if (data) {
          this.meal = data;
          this.reminderValidated = !!data.rappel_valide;
          this.reminderDismissed = !!data.rappel_reporte;
          this.currentState = 'SUCCESS';
        } else {
          this.currentState = 'NOT_FOUND';
        }
      },
      error: () => {
        this.currentState = 'ERROR';
      }
    });
  }

  formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '0 FCFA';
    return num.toLocaleString('fr-FR') + ' FCFA';
  }

  getFormattedDate(dateIso: string): string {
    if (!dateIso) return '';
    const parts = dateIso.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const str = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return dateIso;
  }

  getOrderTimeDisplay(creneau?: string): string {
    if (this.meal?.heure_planifiee) {
      const parts = String(this.meal.heure_planifiee).split(':');
      if (parts.length >= 2) return `${parts[0]}h${parts[1]}`;
    }
    switch (creneau || this.meal?.creneau) {
      case 'MATIN': return '08h30';
      case 'MIDI': return '12h30';
      case 'SOIR': return '19h30';
      case 'EN_CAS': return '16h30';
      default: return '12h30';
    }
  }

  getDeliveryTimeDisplay(creneau?: string): string {
    if (this.meal?.heure_planifiee) {
      const parts = String(this.meal.heure_planifiee).split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10) + 30;
        if (m >= 60) {
          h = (h + 1) % 24;
          m = m - 60;
        }
        return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
      }
    }
    switch (creneau || this.meal?.creneau) {
      case 'MATIN': return '09h00';
      case 'MIDI': return '13h00';
      case 'SOIR': return '20h00';
      case 'EN_CAS': return '17h00';
      default: return '13h00';
    }
  }

  validateReminder(): void {
    if (this.isSubmittingAction || !this.meal) return;
    this.isSubmittingAction = true;

    this.planningService.updatePlannedMeal(this.meal.id, { rappel_valide: true }).subscribe({
      next: (updated) => {
        this.isSubmittingAction = false;
        if (this.meal) {
          this.meal.rappel_valide = updated.rappel_valide;
          this.meal.rappel_valide_at = updated.rappel_valide_at;
        }
        this.reminderValidated = true;
        setTimeout(() => {
          this.reminderDismissed = true;
        }, 1500);
      },
      error: () => {
        this.isSubmittingAction = false;
        alert('Erreur lors de la validation du rappel.');
      }
    });
  }

  postponeReminder(): void {
    if (this.isSubmittingAction || !this.meal) return;
    this.isSubmittingAction = true;

    this.planningService.updatePlannedMeal(this.meal.id, { rappel_reporte: true }).subscribe({
      next: (updated) => {
        this.isSubmittingAction = false;
        if (this.meal) {
          this.meal.rappel_reporte = updated.rappel_reporte;
          this.meal.rappel_reporte_at = updated.rappel_reporte_at;
        }
        this.reminderDismissed = true;
      },
      error: () => {
        this.isSubmittingAction = false;
        alert('Erreur lors du report du rappel.');
      }
    });
  }

  onModifySlotClick(): void {
    if (!this.meal) return;
    this.router.navigate(['/planning/edit', this.meal.id]);
  }

  openCancelModal(): void {
    this.showCancelConfirmModal = true;
  }

  closeCancelModal(): void {
    this.showCancelConfirmModal = false;
  }

  confirmCancelMeal(): void {
    if (!this.meal) return;
    this.isCancelling = true;

    this.planningService.cancelPlannedMeal(this.meal.id).subscribe({
      next: () => {
        this.isCancelling = false;
        this.showCancelConfirmModal = false;
        if (this.meal) {
          this.meal.statut = 'ANNULE';
          this.meal.statut_display = 'Annulé';
        }
        setTimeout(() => {
          this.router.navigate(['/planning']);
        }, 1000);
      },
      error: () => {
        this.isCancelling = false;
        alert('Erreur lors de l\'annulation du repas planifié.');
      }
    });
  }
}

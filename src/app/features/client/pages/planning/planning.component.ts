import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { PlanningService } from '../../../../core/services/planning.service';
import { PlannedMeal, PlanningMonthResponse } from '../../../../core/models/planning';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasPlannedMeals: boolean;
  isoString: string; // YYYY-MM-DD
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent, AppBottomNavComponent],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  private planningService = inject(PlanningService);
  private router = inject(Router);

  activeTab: 'jour' | 'semaine' | 'mois' = 'mois';

  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth(); // 0-indexed (0=Jan, 9=Oct)

  selectedDateIso: string = this.formatIsoDate(new Date());
  datesAvecRepasSet: Set<string> = new Set<string>();

  calendarDays: CalendarDay[] = [];
  weekDays: string[] = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

  mealsForSelectedDate: PlannedMeal[] = [];
  isLoading: boolean = false;
  totalRepasMois: number = 0;

  ngOnInit(): void {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.selectedDateIso = this.formatIsoDate(today);

    this.loadMonthPlanning();
  }

  selectTab(tab: 'jour' | 'semaine' | 'mois'): void {
    this.activeTab = tab;
  }

  loadMonthPlanning(): void {
    this.isLoading = true;
    const monthForApi = this.currentMonth + 1; // 1-indexed for Django (1-12)

    this.planningService.getPlanning(this.currentYear, monthForApi, this.selectedDateIso).subscribe({
      next: (res: PlanningMonthResponse) => {
        this.isLoading = false;
        this.totalRepasMois = res.total_repas_mois || 0;
        this.datesAvecRepasSet = new Set(res.dates_avec_repas || []);
        this.mealsForSelectedDate = res.repas || [];
        this.generateCalendar();
      },
      error: () => {
        this.isLoading = false;
        this.generateCalendar();
      }
    });
  }

  generateCalendar(): void {
    const days: CalendarDay[] = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Day of week for 1st of month: 0=Sunday, 1=Monday ... 6=Saturday
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Previous month padding days
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(this.currentYear, this.currentMonth - 1, dayNum);
      const iso = this.formatIsoDate(d);
      days.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: this.isToday(d),
        isSelected: iso === this.selectedDateIso,
        hasPlannedMeals: this.datesAvecRepasSet.has(iso),
        isoString: iso
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= lastDayOfMonth.getDate(); dayNum++) {
      const d = new Date(this.currentYear, this.currentMonth, dayNum);
      const iso = this.formatIsoDate(d);
      days.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: this.isToday(d),
        isSelected: iso === this.selectedDateIso,
        hasPlannedMeals: this.datesAvecRepasSet.has(iso),
        isoString: iso
      });
    }

    // Next month padding days to complete grid
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let dayNum = 1; dayNum <= remaining; dayNum++) {
        const d = new Date(this.currentYear, this.currentMonth + 1, dayNum);
        const iso = this.formatIsoDate(d);
        days.push({
          date: d,
          dayNumber: dayNum,
          isCurrentMonth: false,
          isToday: this.isToday(d),
          isSelected: iso === this.selectedDateIso,
          hasPlannedMeals: this.datesAvecRepasSet.has(iso),
          isoString: iso
        });
      }
    }

    this.calendarDays = days;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    const newDate = new Date(this.currentYear, this.currentMonth, 1);
    this.selectedDateIso = this.formatIsoDate(newDate);
    this.loadMonthPlanning();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    const newDate = new Date(this.currentYear, this.currentMonth, 1);
    this.selectedDateIso = this.formatIsoDate(newDate);
    this.loadMonthPlanning();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDateIso = day.isoString;

    if (!day.isCurrentMonth) {
      this.currentYear = day.date.getFullYear();
      this.currentMonth = day.date.getMonth();
      this.loadMonthPlanning();
    } else {
      this.generateCalendar();
      this.loadMealsForSelectedDate();
    }
  }

  loadMealsForSelectedDate(): void {
    this.isLoading = true;
    const monthForApi = this.currentMonth + 1;
    this.planningService.getPlanning(this.currentYear, monthForApi, this.selectedDateIso).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.mealsForSelectedDate = res.repas || [];
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  formatIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(d: Date): boolean {
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  }

  getMonthYearTitle(): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${months[this.currentMonth]} ${this.currentYear}`;
  }

  getSelectedDateTitle(): string {
    if (!this.selectedDateIso) return '';
    const parts = this.selectedDateIso.split('-');
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const dayNum = parseInt(parts[2], 10);

    const dateObj = new Date(year, monthIdx, dayNum);
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayName = dayNames[dateObj.getDay()];
    const monthName = monthNames[monthIdx];
    return `Repas du ${dayName} ${dayNum} ${monthName}`;
  }

  getCreneauTag(creneau: string): string {
    switch (creneau) {
      case 'MATIN': return 'Matin';
      case 'MIDI': return 'Midi';
      case 'SOIR': return 'Soir';
      case 'EN_CAS': return 'En-cas';
      default: return 'Repas';
    }
  }

  formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '0 FCFA';
    return num.toLocaleString('fr-FR') + ' FCFA';
  }

  onPlanMealClick(): void {
    this.router.navigate(['/planning/create']);
  }

  onPlanWithAiClick(): void {
    this.router.navigate(['/planning/ai'], { queryParams: { mode: 'PLANNING' } });
  }

  onDetailClick(meal: PlannedMeal): void {
    this.router.navigate(['/planning/detail', meal.id]);
  }
}

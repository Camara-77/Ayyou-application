import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface DeliveryCourse {
  id: string;
  orderRef: string;
  type: 'EXPRESS' | 'STANDARD';
  netEarningsFcfa: number;
  restaurant: {
    name: string;
    address: string;
    readyInMinutes: number;
  };
  client: {
    address: string;
    note: string;
  };
  distanceKm: number;
  estimatedDurationMinutes: number;
  requiresInsulatedBag?: boolean;
  status: 'ASSIGNED' | 'AVAILABLE' | 'EXPIRED' | 'ACCEPTED';
}

@Component({
  selector: 'app-delivery-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-home.component.html',
  styleUrl: './delivery-home.component.scss'
})
export class DeliveryHomeComponent implements OnInit, OnDestroy {

  readonly driver = {
    name: 'Abdoulaye Diop',
    rating: 4.9,
    status: 'Prêt',
    zone: 'Dakar Plateau'
  };

  assignedCourse: DeliveryCourse = {
    id: 'delivery-9482',
    orderRef: '#AY-9482',
    type: 'EXPRESS',
    netEarningsFcfa: 1000,
    restaurant: {
      name: 'Chez Loutcha',
      address: 'Dakar Plateau, Rue de Thiong',
      readyInMinutes: 3
    },
    client: {
      address: 'Résidence Teranga, Point E',
      note: 'Thiéboudienne + Yassa Poulet'
    },
    distanceKm: 1.8,
    estimatedDurationMinutes: 8,
    status: 'ASSIGNED'
  };

  availableCourses: DeliveryCourse[] = [
    {
      id: 'delivery-9485',
      orderRef: '#AY-9485',
      type: 'STANDARD',
      netEarningsFcfa: 1200,
      restaurant: {
        name: 'Le Terrou-Bi Restaurant',
        address: 'Corniche Ouest • Prête au comptoir',
        readyInMinutes: 0
      },
      client: {
        address: 'Fann Résidence',
        note: ''
      },
      distanceKm: 2.4,
      estimatedDurationMinutes: 12,
      status: 'AVAILABLE'
    },
    {
      id: 'delivery-9490',
      orderRef: '#AY-9490',
      type: 'STANDARD',
      netEarningsFcfa: 1500,
      restaurant: {
        name: 'Épicerie Fine Almadies',
        address: 'Route des Almadies • Sac isotherme',
        readyInMinutes: 0
      },
      client: {
        address: 'Ngor Extension',
        note: ''
      },
      distanceKm: 3.1,
      estimatedDurationMinutes: 15,
      requiresInsulatedBag: true,
      status: 'AVAILABLE'
    },
    {
      id: 'delivery-9494',
      orderRef: '#AY-9494',
      type: 'STANDARD',
      netEarningsFcfa: 1000,
      restaurant: {
        name: 'Dibiterie Haoussa',
        address: 'Fann • Prête dans 5 min',
        readyInMinutes: 5
      },
      client: {
        address: 'Gueule Tapée',
        note: ''
      },
      distanceKm: 1.2,
      estimatedDurationMinutes: 7,
      status: 'AVAILABLE'
    }
  ];

  remainingSeconds = 120;
  timerProgress = 100;
  isExpired = false;

  private timerId?: ReturnType<typeof setInterval>;

  constructor(public readonly router: Router) {}

  ngOnInit(): void {
    this.startAcceptanceTimer();
  }

  ngOnDestroy(): void {
    this.stopAcceptanceTimer();
  }

  get formattedTimer(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  private startAcceptanceTimer(): void {
    this.stopAcceptanceTimer();

    this.timerId = setInterval(() => {
      if (this.remainingSeconds <= 0) {
        this.expireAssignedCourse();
        return;
      }

      this.remainingSeconds--;

      this.timerProgress =
        (this.remainingSeconds / 120) * 100;
    }, 1000);
  }

  private stopAcceptanceTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  private expireAssignedCourse(): void {
    this.remainingSeconds = 0;
    this.timerProgress = 0;
    this.isExpired = true;
    this.assignedCourse.status = 'EXPIRED';

    this.stopAcceptanceTimer();
  }

  acceptAssignedCourse(): void {
    if (this.isExpired) {
      return;
    }

    this.stopAcceptanceTimer();

    this.assignedCourse.status = 'ACCEPTED';

    this.router.navigate([
      '/delivery/navigation',
      this.assignedCourse.id
    ]);
  }

  declineAssignedCourse(): void {
    this.stopAcceptanceTimer();

    this.assignedCourse.status = 'EXPIRED';
    this.isExpired = true;

    this.availableCourses = [
      ...this.availableCourses
    ];
  }

  acceptAvailableCourse(course: DeliveryCourse): void {
    course.status = 'ACCEPTED';

    this.router.navigate([
      '/delivery/navigation',
      course.id
    ]);
  }
}

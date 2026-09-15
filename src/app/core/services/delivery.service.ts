import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { DeliveryDriver, DeliveryAssignedCourse, DeliveryAvailableCourse } from '../models/delivery';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private driverSubject = new BehaviorSubject<DeliveryDriver>({
    id: 'd_abdoulaye',
    name: 'Abdoulaye Diop',
    rating: 4.9,
    status: 'Prêt',
    zone: 'Dakar Plateau',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  });
  driver$: Observable<DeliveryDriver> = this.driverSubject.asObservable();

  private initialAssignedCourse: DeliveryAssignedCourse = {
    id: 'c_9482',
    orderRef: 'AY-9482',
    remunerationFcfa: 1000,
    kitchenTimeText: 'Prêt dans 3 min',
    restaurantName: 'Chez Loutcha',
    restaurantAddress: 'Dakar Plateau, Rue de Thiong',
    dishesCountText: '2 plats',
    clientAddress: 'Résidence Teranga, Point E',
    distanceTimeText: '1,8 km • 8 min',
    itemsSummary: 'Thiébouddienne + Yassa Poulet',
    timerSeconds: 106, // Initial 01:46 as in mockup
    initialTimerSeconds: 120,
    status: 'ASSIGNED'
  };

  private assignedCourseSubject = new BehaviorSubject<DeliveryAssignedCourse>(this.initialAssignedCourse);
  assignedCourse$: Observable<DeliveryAssignedCourse> = this.assignedCourseSubject.asObservable();

  private availableCoursesSubject = new BehaviorSubject<DeliveryAvailableCourse[]>([
    {
      id: 'c_9485',
      orderRef: 'AY-9485',
      remunerationFcfa: 1200,
      restaurantName: 'Le Terrou-Bi Restaurant',
      restaurantAddressNote: 'Corniche Ouest • Prête au comptoir',
      clientAddress: 'Fann Résidence',
      distanceTimeText: '2,4 km • ~12 min de trajet'
    },
    {
      id: 'c_9490',
      orderRef: 'AY-9490',
      remunerationFcfa: 1500,
      restaurantName: 'Épicerie Fine Almadies',
      restaurantAddressNote: 'Route des Almadies • Sac isotherme',
      clientAddress: 'Ngor Extension',
      distanceTimeText: '3,1 km • ~15 min de trajet',
      requiresInsulatedBag: true
    },
    {
      id: 'c_9494',
      orderRef: 'AY-9494',
      remunerationFcfa: 1000,
      restaurantName: 'Dibiterie Haoussa',
      restaurantAddressNote: 'Fann • Prête dans 5 min',
      clientAddress: 'Gueule Tapée',
      distanceTimeText: '1,2 km • ~7 min de trajet'
    }
  ]);
  availableCourses$: Observable<DeliveryAvailableCourse[]> = this.availableCoursesSubject.asObservable();

  private timerSubscription?: Subscription;

  constructor() {
    this.startTimer();
  }

  private startTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000).subscribe(() => {
      const current = this.assignedCourseSubject.value;
      if (current.status === 'ASSIGNED' && current.timerSeconds > 0) {
        const updatedSeconds = current.timerSeconds - 1;
        const newStatus = updatedSeconds === 0 ? 'EXPIRED' : 'ASSIGNED';
        this.assignedCourseSubject.next({
          ...current,
          timerSeconds: updatedSeconds,
          status: newStatus
        });
        if (newStatus === 'EXPIRED') {
          this.timerSubscription?.unsubscribe();
        }
      }
    });
  }

  acceptCourse(courseId: string): void {
    this.timerSubscription?.unsubscribe();
    const current = this.assignedCourseSubject.value;
    this.assignedCourseSubject.next({
      ...current,
      status: 'ACCEPTED'
    });
  }

  declineCourse(courseId: string): void {
    this.timerSubscription?.unsubscribe();
    const current = this.assignedCourseSubject.value;
    this.assignedCourseSubject.next({
      ...current,
      status: 'DECLINED'
    });
  }
}

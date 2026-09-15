import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeliveryTrackingState } from '../models/client';
import { DeliveryTrackingService } from './delivery-tracking.service';

@Injectable({
  providedIn: 'root'
})
export class MockDeliveryTrackingService extends DeliveryTrackingService implements OnDestroy {
  // Coordinates representing route in Dakar: Chez Loutcha (Plateau) -> Médina -> Fann -> Point E (Villa 14)
  private readonly waypoints: [number, number][] = [
    [14.6689, -17.4367], // Chez Loutcha, Plateau
    [14.6732, -17.4385], // Av. Lamine Guèye
    [14.6795, -17.4452], // Av. Malick Sy / Médina
    [14.6858, -17.4538], // Fann Hock / Av. Cheikh Anta Diop
    [14.6925, -17.4611]  // Point E, Villa 14
  ];

  private speedKmH = 25; // Default speed 25 km/h
  private currentWaypointIndex = 0;
  private currentStepProgress = 0; // 0 to 1 between waypoints
  private timer: any = null;

  private trackingSubject = new BehaviorSubject<DeliveryTrackingState>({
    latitude: 14.6689,
    longitude: -17.4367,
    speedKmH: 25,
    distanceRemainingKm: 2.8,
    estimatedTimeMin: 12,
    estimatedArrival: '13h45',
    trafficCondition: 'Fluide',
    status: 'EN_ROUTE',
    progressPercentage: 35
  });

  trackingState$: Observable<DeliveryTrackingState> = this.trackingSubject.asObservable();

  constructor() {
    super();
    this.startSimulation();
  }

  setSpeed(speedKmH: number): void {
    this.speedKmH = speedKmH;
  }

  startSimulation(): void {
    this.stopSimulation();

    // 1-second interval update for smooth animation
    this.timer = setInterval(() => {
      this.updatePosition();
    }, 1000);
  }

  stopSimulation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private updatePosition(): void {
    if (this.currentWaypointIndex >= this.waypoints.length - 1) {
      // Reached final destination
      const destination = this.waypoints[this.waypoints.length - 1];
      this.trackingSubject.next({
        latitude: destination[0],
        longitude: destination[1],
        speedKmH: 0,
        distanceRemainingKm: 0,
        estimatedTimeMin: 0,
        estimatedArrival: 'Arrivé',
        trafficCondition: 'Fluide',
        status: 'LIVRÉE',
        progressPercentage: 100
      });
      this.stopSimulation();
      return;
    }

    // Move forward along current line segment
    this.currentStepProgress += 0.04;
    if (this.currentStepProgress >= 1) {
      this.currentStepProgress = 0;
      this.currentWaypointIndex++;
    }

    if (this.currentWaypointIndex >= this.waypoints.length - 1) {
      return;
    }

    const start = this.waypoints[this.currentWaypointIndex];
    const end = this.waypoints[this.currentWaypointIndex + 1];

    const lat = start[0] + (end[0] - start[0]) * this.currentStepProgress;
    const lng = start[1] + (end[1] - start[1]) * this.currentStepProgress;

    // Calculate total progress percentage
    const totalSegments = this.waypoints.length - 1;
    const currentProgress = (this.currentWaypointIndex + this.currentStepProgress) / totalSegments;
    const progressPercentage = Math.min(100, Math.round(currentProgress * 100));

    // Distance remaining
    const totalDistance = 2.8; // km
    const distanceRemaining = Math.max(0, parseFloat((totalDistance * (1 - currentProgress)).toFixed(1)));
    const estimatedTimeMin = Math.max(1, Math.ceil((distanceRemaining / this.speedKmH) * 60));

    // Calculate dynamic ETA time string
    const now = new Date();
    now.setMinutes(now.getMinutes() + estimatedTimeMin);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const estimatedArrival = `${hours}h${minutes}`;

    let status: 'VALIDÉE' | 'EN_CUISINE' | 'EN_ROUTE' | 'LIVRÉE' = 'EN_ROUTE';
    if (progressPercentage < 10) {
      status = 'VALIDÉE';
    } else if (progressPercentage < 25) {
      status = 'EN_CUISINE';
    } else if (progressPercentage >= 95) {
      status = 'LIVRÉE';
    }

    let trafficCondition: 'Fluide' | 'Modérée' | 'Dense' = 'Fluide';
    if (this.speedKmH < 15) {
      trafficCondition = 'Dense';
    } else if (this.speedKmH < 25) {
      trafficCondition = 'Modérée';
    }

    this.trackingSubject.next({
      latitude: lat,
      longitude: lng,
      speedKmH: this.speedKmH,
      distanceRemainingKm: distanceRemaining,
      estimatedTimeMin: estimatedTimeMin,
      estimatedArrival,
      trafficCondition,
      status,
      progressPercentage
    });
  }

  ngOnDestroy(): void {
    this.stopSimulation();
  }
}

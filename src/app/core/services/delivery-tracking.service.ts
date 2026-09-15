import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryTrackingState } from '../models/client';

@Injectable({
  providedIn: 'root'
})
export abstract class DeliveryTrackingService {
  abstract trackingState$: Observable<DeliveryTrackingState>;
  abstract setSpeed(speedKmH: number): void;
  abstract startSimulation(): void;
  abstract stopSimulation(): void;
}

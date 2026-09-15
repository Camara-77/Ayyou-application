import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { MockDeliveryTrackingService } from '../../../../core/services/mock-delivery-tracking.service';
import { OrderTrackingData, DeliveryTrackingState } from '../../../../core/models/client';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent
  ],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  trackingData: OrderTrackingData | null = null;
  liveState: DeliveryTrackingState | null = null;

  private map?: L.Map;
  private courierMarker?: L.Marker;
  private routeLine?: L.Polyline;
  private sub?: Subscription;

  // Waypoints in Dakar: Chez Loutcha (Plateau) -> Point E
  private readonly waypoints: L.LatLngExpression[] = [
    [14.6689, -17.4367], // Chez Loutcha, Plateau
    [14.6732, -17.4385],
    [14.6795, -17.4452],
    [14.6858, -17.4538],
    [14.6925, -17.4611]  // Point E, Villa 14
  ];

  constructor(
    private route: ActivatedRoute,
    private clientDataService: ClientDataService,
    private deliveryTrackingService: MockDeliveryTrackingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || 'ot1';
    this.clientDataService.getOrderTracking(id).subscribe(data => {
      this.trackingData = data;
    });
  }

  ngAfterViewInit(): void {
    this.initDakarMap();

    this.sub = this.deliveryTrackingService.trackingState$.subscribe(state => {
      this.liveState = state;
      if (this.trackingData) {
        this.trackingData.etaTime = state.estimatedArrival;
        this.trackingData.etaRemainingMinutes = state.estimatedTimeMin;
        this.trackingData.metrics.remainingTime = `${state.estimatedTimeMin} min`;
        this.trackingData.metrics.distance = `${state.distanceRemainingKm} km`;
        this.trackingData.metrics.condition = state.trafficCondition;

        // Update steps status
        if (state.status === 'EN_ROUTE') {
          this.trackingData.steps = [
            { label: 'Validée', completed: true, active: false },
            { label: 'En cuisine', completed: true, active: false },
            { label: 'En route', completed: false, active: true },
            { label: 'Livrée', completed: false, active: false }
          ];
        } else if (state.status === 'LIVRÉE') {
          this.trackingData.steps = [
            { label: 'Validée', completed: true, active: false },
            { label: 'En cuisine', completed: true, active: false },
            { label: 'En route', completed: true, active: false },
            { label: 'Livrée', completed: true, active: true }
          ];
        }
      }

      // Update courier marker on map
      if (this.courierMarker && state.latitude && state.longitude) {
        const newLatLng = L.latLng(state.latitude, state.longitude);
        this.courierMarker.setLatLng(newLatLng);
        this.map?.panTo(newLatLng, { animate: true, duration: 0.5 });
      }
    });
  }

  private initDakarMap(): void {
    const mapElement = document.getElementById('dakar-map');
    if (!mapElement) return;

    // Center map between Plateau and Point E
    this.map = L.map('dakar-map', {
      center: [14.6800, -17.4480],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Draw route polyline
    this.routeLine = L.polyline(this.waypoints, {
      color: '#E51A29',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    // Restaurant Custom Marker (Chez Loutcha)
    const restIcon = L.divIcon({
      className: 'custom-map-pin rest-pin',
      html: `<div class="pin-badge rest-badge"><span>CL</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker([14.6689, -17.4367], { icon: restIcon })
      .addTo(this.map)
      .bindPopup('<b>Chez Loutcha</b><br>Plateau, Dakar');

    // Client Destination Custom Marker (Point E)
    const clientIcon = L.divIcon({
      className: 'custom-map-pin client-pin',
      html: `<div class="pin-badge client-badge"><span>A</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker([14.6925, -17.4611], { icon: clientIcon })
      .addTo(this.map)
      .bindPopup('<b>Point E - Villa 14</b><br>Destination');

    // Courier Moto Live Custom Marker
    const courierIcon = L.divIcon({
      className: 'custom-map-pin courier-pin',
      html: `
        <div class="courier-marker-box">
          <span class="moto-icon">🏍️</span>
          <span class="badge-text">En route</span>
        </div>
      `,
      iconSize: [90, 26],
      iconAnchor: [45, 13]
    });

    this.courierMarker = L.marker([14.6689, -17.4367], { icon: courierIcon }).addTo(this.map);
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' F';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.map) {
      this.map.remove();
    }
  }
}

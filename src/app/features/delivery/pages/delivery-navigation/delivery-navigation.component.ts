import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';

import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

@Component({
  selector: 'app-delivery-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-navigation.component.html',
  styleUrls: ['./delivery-navigation.component.scss']
})
export class DeliveryNavigationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer?: ElementRef;

  orderId: string = 'delivery-9482';
  clientName: string = 'Amadou Diallo';
  orderRef: string = 'AY-9482';
  gainFcfa: number = 1000;
  deliveryAddress: string = "Point E, Rue 5 × Boulevard de l'Est";
  deliveryAppt: string = 'Résidence Teranga, Appt 4B';
  clientNote: string = 'Sonner à l\'interphone Teranga 4B, 2ème étage';
  
  instructionMeters: string = 'DANS 350 M';
  instructionTitle: string = 'Continuer tout droit';
  instructionSub: string = 'Bd Martin Luther King (Corniche Ouest)';
  estimatedTimeDistance: string = '10 min • 1,8 km';
  speedText: string = '38 km/h';

  private map?: L.Map;
  private routeLine?: L.Polyline;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || 'delivery-9482';
  }

  ngAfterViewInit(): void {
    this.initLeafletMap();
  }

  private initLeafletMap(): void {
    if (!this.mapContainer) return;

    // Dakar Waypoints: Start (Chez Loutcha, Plateau) -> End (Point E)
    const startPos: L.LatLngExpression = [14.6689, -17.4367];
    const midPos: L.LatLngExpression = [14.6795, -17.4452];
    const endPos: L.LatLngExpression = [14.6925, -17.4611];

    this.map = L.map(this.mapContainer.nativeElement, {
      center: midPos,
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Red route line matching mockup
    this.routeLine = L.polyline([startPos, midPos, endPos], {
      color: '#E51A29',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round'
    }).addTo(this.map);

    // Custom Driver Icon
    const driverIcon = L.divIcon({
      className: 'custom-driver-marker',
      html: `
        <div class="driver-marker-pin">
          <div class="bike-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5.5" cy="17.5" r="3.5"/>
              <circle cx="18.5" cy="17.5" r="3.5"/>
              <path d="M15 6L12 11H5M12 11L9 17"/>
            </svg>
          </div>
          <div class="driver-speed-badge">
            <span class="green-dot">●</span> Vous • 38 km/h
          </div>
        </div>
      `,
      iconSize: [100, 60],
      iconAnchor: [50, 30]
    });

    L.marker(midPos, { icon: driverIcon }).addTo(this.map);

    // Custom Destination Icon
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div class="dest-marker-wrap">
          <div class="dest-icon-pin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="dest-name-pill">Point E</div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 45]
    });

    L.marker(endPos, { icon: destIcon }).addTo(this.map);
  }

  recenterMap(): void {
    if (this.map) {
      this.map.setView([14.6795, -17.4452], 14);
    }
  }

  goBack(): void {
    this.location.back();
  }

  openGpsExternal(): void {
    // Open external navigation or log
  }

  markArrivedAtClient(): void {
    this.router.navigate(['/delivery/arrival', this.orderId]);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}

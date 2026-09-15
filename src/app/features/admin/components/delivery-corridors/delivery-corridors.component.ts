import { Component, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { DeliveryCorridor } from '../../models/admin-delivery.models';

@Component({
  selector: 'app-delivery-corridors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-corridors.component.html',
  styleUrls: ['./delivery-corridors.component.scss']
})
export class DeliveryCorridorsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() corridors: DeliveryCorridor[] = [];
  @ViewChild('mapContainer', { static: false }) mapContainer?: ElementRef;

  private map?: L.Map;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initDakarMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initDakarMap(): void {
    if (!this.mapContainer) return;

    // Center map on Dakar Peninsula
    const dakarCenter: L.LatLngExpression = [14.7200, -17.4700];

    this.map = L.map(this.mapContainer.nativeElement, {
      center: dakarCenter,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false
    });

    // CartoDB Voyager tiles for clean, modern map rendering
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(this.map);

    // Corridor 1: Corniche Ouest (Green #16A34A)
    const cornichePoints: L.LatLngExpression[] = [
      [14.6689, -17.4367], // Plateau
      [14.6850, -17.4600], // Fann / Point E
      [14.7080, -17.4750], // Mermoz
      [14.7230, -17.4880], // Ouakam
      [14.7450, -17.5180]  // Almadies
    ];
    L.polyline(cornichePoints, {
      color: '#16A34A',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round'
    }).addTo(this.map).bindTooltip('Axe Corniche Ouest (Fluide)', { permanent: false });

    // Corridor 2: Almadies & Ngor (Orange #EA580C)
    const almadiesPoints: L.LatLngExpression[] = [
      [14.7550, -17.5140], // Ngor
      [14.7450, -17.5180], // Almadies
      [14.7280, -17.4980]  // Les Mamelles
    ];
    L.polyline(almadiesPoints, {
      color: '#EA580C',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round'
    }).addTo(this.map).bindTooltip('Axe Almadies & Ngor (Modéré)', { permanent: false });

    // Corridor 3: VDN & Patte d\'Oie (Red #E51B2A)
    const vdnPoints: L.LatLngExpression[] = [
      [14.7050, -17.4650], // VDN Mermoz
      [14.7280, -17.4580], // VDN Liberté 6
      [14.7450, -17.4420], // Patte d'Oie
      [14.7520, -17.3930]  // Pikine
    ];
    L.polyline(vdnPoints, {
      color: '#E51B2A',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round'
    }).addTo(this.map).bindTooltip('Axe VDN & Patte d\'Oie (Ralentissements)', { permanent: false });

    // Key Dakar Hub Markers
    const hubs = [
      { name: 'Almadies', coords: [14.7450, -17.5180], color: '#EA580C', label: 'Modéré' },
      { name: 'Ngor', coords: [14.7550, -17.5140], color: '#16A34A', label: 'Fluide' },
      { name: 'Yoff', coords: [14.7590, -17.4670], color: '#16A34A', label: 'Fluide' },
      { name: 'Ouakam', coords: [14.7230, -17.4880], color: '#16A34A', label: 'Fluide' },
      { name: 'VDN / Mermoz', coords: [14.7100, -17.4720], color: '#E51B2A', label: 'Ralentissements' },
      { name: 'Plateau', coords: [14.6689, -17.4367], color: '#16A34A', label: 'Fluide' },
      { name: 'Pikine', coords: [14.7520, -17.3930], color: '#E51B2A', label: 'Ralentissements' }
    ];

    hubs.forEach(h => {
      const customIcon = L.divIcon({
        className: 'dakar-map-marker-badge',
        html: `<div class="marker-pill" style="border-left: 3px solid ${h.color};">
                <span class="dot" style="background-color: ${h.color};"></span>
                <span class="hub-name">${h.name}</span>
               </div>`,
        iconSize: [110, 26],
        iconAnchor: [55, 13]
      });

      L.marker(h.coords as L.LatLngExpression, { icon: customIcon })
        .addTo(this.map!)
        .bindPopup(`<b>${h.name}</b><br>Trafic: <span style="color:${h.color};font-weight:bold">${h.label}</span>`);
    });

    // Invalidate size after init to ensure full rendering inside container
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }
}

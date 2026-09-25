import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import * as L from 'leaflet';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { OrderService } from '../../../../core/services/order.service';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { OrderTrackingData, DeliveryTrackingState } from '../../../../core/models/client';
import { CommandeOrder } from '../../../../core/models/orders';
import { Livraison } from '../../../../core/models/delivery';

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
  locationStatusMessage: string = 'Position du livreur en cours de récupération...';

  private map?: L.Map;
  private courierMarker?: L.Marker;
  private routeLine?: L.Polyline;
  private sub?: Subscription;
  private activeDeliveryId?: number;
  private isDelivered: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private clientDataService: ClientDataService,
    private orderService: OrderService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || 'ot1';
    this.orderService.getOrderById(id).subscribe({
      next: (cmd: CommandeOrder) => {
        this.trackingData = this.mapCommandeToTrackingData(cmd);
        this.startRealDeliveryPolling(cmd.id);
      },
      error: () => {
        this.clientDataService.getOrderTracking(id).subscribe(data => {
          this.trackingData = data;
        });
      }
    });
  }

  private startRealDeliveryPolling(orderId: number): void {
    this.sub = interval(5000).pipe(
      takeWhile(() => !this.isDelivered),
      switchMap(() => this.deliveryService.getDeliveries())
    ).subscribe({
      next: (deliveries: Livraison[]) => {
        const del = deliveries.find((d: any) => d.commande === orderId || d.commande?.id === orderId);
        if (del) {
          this.activeDeliveryId = del.id;
          this.updateRealDeliveryData(del);
        }
      },
      error: () => {}
    });

    // Run initial fetch immediately
    this.deliveryService.getDeliveries().subscribe({
      next: (deliveries: Livraison[]) => {
        const del = deliveries.find((d: any) => d.commande === orderId || d.commande?.id === orderId);
        if (del) {
          this.activeDeliveryId = del.id;
          this.updateRealDeliveryData(del);
        }
      }
    });
  }

  private updateRealDeliveryData(del: any): void {
    if (!this.trackingData) return;

    if (del.code_validation) {
      this.trackingData.securityCode = del.code_validation;
    }

    if (del.livreur_nom_complet && this.trackingData.driver) {
      this.trackingData.driver.name = del.livreur_nom_complet;
      this.trackingData.driver.phone = del.livreur_telephone || this.trackingData.driver.phone;
      this.trackingData.driver.vehicle = del.livreur_vehicule || this.trackingData.driver.vehicle;
    }

    if (del.statut === 'LIVREE') {
      this.isDelivered = true;
      this.trackingData.steps = [
        { label: 'Validée', completed: true, active: false },
        { label: 'En cuisine', completed: true, active: false },
        { label: 'En route', completed: true, active: false },
        { label: 'Livrée', completed: true, active: true }
      ];
      this.locationStatusMessage = 'Commande livrée avec succès!';
      return;
    }

    if (del.statut === 'EN_LIVRAISON' || del.statut === 'EN_ROUTE' || del.statut === 'PICKUP_EFFECTUE') {
      this.trackingData.steps = [
        { label: 'Validée', completed: true, active: false },
        { label: 'En cuisine', completed: true, active: false },
        { label: 'En route', completed: false, active: true },
        { label: 'Livrée', completed: false, active: false }
      ];
    }

    const lat = del.livreur_latitude;
    const lng = del.livreur_longitude;

    if (lat && lng && this.courierMarker) {
      const newLatLng = L.latLng(lat, lng);
      this.courierMarker.setLatLng(newLatLng);
      this.map?.panTo(newLatLng, { animate: true, duration: 0.5 });
      this.locationStatusMessage = 'Livreur en route vers votre adresse';
    } else {
      this.locationStatusMessage = 'Position du livreur en cours de récupération...';
    }
  }

  ngAfterViewInit(): void {
    this.initDakarMap();
  }

  private initDakarMap(): void {
    const mapElement = document.getElementById('dakar-map');
    if (!mapElement) return;

    this.map = L.map('dakar-map', {
      center: [14.6800, -17.4480],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    const restIcon = L.divIcon({
      className: 'custom-map-pin rest-pin',
      html: `<div class="pin-badge rest-badge"><span>CL</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker([14.6689, -17.4367], { icon: restIcon })
      .addTo(this.map)
      .bindPopup('<b>Chez Loutcha</b><br>Plateau, Dakar');

    const clientIcon = L.divIcon({
      className: 'custom-map-pin client-pin',
      html: `<div class="pin-badge client-badge"><span>A</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker([14.6925, -17.4611], { icon: clientIcon })
      .addTo(this.map)
      .bindPopup('<b>Point E</b><br>Destination');

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

  private mapCommandeToTrackingData(cmd: CommandeOrder): OrderTrackingData {
    const firstSub = cmd.sous_commandes && cmd.sous_commandes.length > 0 ? cmd.sous_commandes[0] : null;

    const items: Array<{ name: string; quantity: number; price: number }> = [];
    (cmd.sous_commandes || []).forEach(sub => {
      (sub.lignes || []).forEach(l => {
        items.push({
          name: l.nom_produit_snapshot,
          quantity: l.quantite,
          price: parseFloat(l.prix_unitaire || '0')
        });
      });
    });

    return {
      id: String(cmd.id),
      orderRef: cmd.numero_commande,
      restaurant: {
        name: firstSub ? firstSub.etablissement_nom : 'Chez Loutcha',
        status: 'Ouvert',
        subtitle: 'Cuisine sénégalaise & Africaine',
        address: '101 Rue Carnot, Dakar'
      },
      etaTime: '13h45',
      etaRemainingMinutes: 20,
      steps: [
        { label: 'Validée', completed: true, active: false },
        { label: 'En cuisine', completed: cmd.statut !== 'EN_ATTENTE_PAIEMENT', active: cmd.statut === 'EN_ATTENTE_PAIEMENT' },
        { label: 'En route', completed: cmd.statut === 'LIVREE', active: cmd.statut === 'EN_COURS' },
        { label: 'Livrée', completed: cmd.statut === 'LIVREE', active: cmd.statut === 'LIVREE' }
      ],
      metrics: {
        remainingTime: '20 min',
        distance: '1.8 km',
        condition: 'Fluide'
      },
      driver: {
        name: 'Amadou Sali',
        badge: 'Livreur Pro',
        vehicle: 'Scooter Yamaha NMAX',
        rating: 4.9,
        phone: '+221 77 000 00 00'
      },
      items: items.length > 0 ? items : [{ name: 'Commande AYYOU', quantity: 1, price: parseFloat(cmd.total || '0') }],
      totalPrice: parseFloat(cmd.total || '0'),
      deliveryAddress: {
        recipientName: cmd.nom_destinataire || 'Client AYYOU',
        addressText: cmd.adresse_livraison,
        instructions: cmd.instructions_livraison || '',
        tag: 'Sans contact'
      },
      securityCode: String(cmd.id).padStart(4, '0')
    };
  }
}

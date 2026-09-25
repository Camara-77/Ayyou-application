import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Livraison } from '../../../../core/models/delivery';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';
import { DeliveryHeaderComponent } from '../../components/delivery-header/delivery-header.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeliveryBottomNavComponent, DeliveryHeaderComponent],
  templateUrl: './delivery-detail.component.html',
  styleUrl: './delivery-detail.component.scss'
})
export class DeliveryDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('leafletMap') mapContainer!: ElementRef;
  @ViewChild('pinInput0') pinInput0!: ElementRef<HTMLInputElement>;
  @ViewChild('pinInput1') pinInput1!: ElementRef<HTMLInputElement>;
  @ViewChild('pinInput2') pinInput2!: ElementRef<HTMLInputElement>;
  @ViewChild('pinInput3') pinInput3!: ElementRef<HTMLInputElement>;

  // 4-Digit PIN inputs state
  pinDigits: string[] = ['', '', '', ''];
  pinErrorMessage = '';

  private deliveryService = inject(DeliveryService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private location = inject(Location);

  delivery: Livraison | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  actionLoading = false;
  validatingPin = false;

  private map: L.Map | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idParam = params['id'] || params['orderId'];
      if (idParam) {
        const numericId = parseInt(idParam, 10);
        if (!isNaN(numericId)) {
          this.loadDelivery(numericId);
        } else {
          this.loadDeliveryByRef(idParam);
        }
      } else {
        this.isLoading = false;
        this.errorMessage = "Aucun identifiant de livraison fourni.";
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.delivery) {
      setTimeout(() => this.initMap(), 300);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  loadDelivery(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveryById(id).subscribe({
      next: (res) => {
        this.delivery = res;
        this.isLoading = false;
        setTimeout(() => this.initMap(), 300);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.errorMessage = "La livraison spécifiée est introuvable ou a été annulée.";
        } else {
          this.errorMessage = err.error?.detail || "Impossible de charger les détails de la livraison.";
        }
      }
    });
  }

  loadDeliveryByRef(ref: string): void {
    this.deliveryService.getDeliveries().subscribe({
      next: (list) => {
        const found = list.find(d => d.commande_reference === ref || d.id.toString() === ref);
        if (found) {
          this.delivery = found;
          this.isLoading = false;
          setTimeout(() => this.initMap(), 300);
        } else {
          this.isLoading = false;
          this.errorMessage = "Livraison non trouvée.";
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de récupérer la livraison.";
      }
    });
  }

  private initMap(): void {
    if (!this.mapContainer || this.map) return;

    // Default Dakar coordinates
    const lat = 14.6937;
    const lng = -17.4441;

    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.map);

      const driverIcon = L.divIcon({
        className: 'custom-driver-marker',
        html: `<div style="background:#E51A29;width:24px;height:24px;border-radius:50%;border:3px solid #FFF;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const restoIcon = L.divIcon({
        className: 'custom-resto-marker',
        html: `<div style="background:#1A1A1A;width:24px;height:24px;border-radius:50%;border:3px solid #FFF;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#FFF;font-size:10px;font-weight:bold;">R</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([lat, lng], { icon: driverIcon }).addTo(this.map);
      L.marker([lat + 0.005, lng + 0.005], { icon: restoIcon }).addTo(this.map);

    } catch (e) {
      console.warn('Leaflet map initialization skipped:', e);
    }
  }

  goBack(): void {
    this.location.back();
  }

  // Stepper & Status Logic
  get currentStep(): number {
    if (!this.delivery) return 1;
    const statusStr = this.delivery.statut as string;
    switch (statusStr) {
      case 'EN_ATTENTE':
      case 'AFFECTEE':
      case 'ACCEPTEE':
        return 1; // 1. TRAJET
      case 'ARRIVE_RESTAURANT':
      case 'EN_PREPARATION':
      case 'PRETE':
        return 2; // 2. RETRAIT
      case 'RECEPTIONNEE':
      case 'EN_LIVRAISON':
        return 3; // 3. ROUTE
      case 'LIVREE':
        return 4; // 4. DÉPÔT
      default:
        return 1;
    }
  }

  get stepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Étape 1 : Rendez-vous au restaurant';
      case 2: return 'Étape 2 : Retrait de la commande';
      case 3: return 'Étape 3 : Acheminement vers le client';
      case 4: return 'Étape 4 : Validation de la livraison';
      default: return 'Rendez-vous au restaurant';
    }
  }

  get stepBadgeText(): string {
    switch (this.currentStep) {
      case 1: return 'En route';
      case 2: return 'Au restaurant';
      case 3: return 'En livraison';
      case 4: return 'Sur place';
      default: return 'En route';
    }
  }

  get primaryActionButtonText(): string {
    switch (this.currentStep) {
      case 1: return "CONFIRMER L'ARRIVÉE AU RESTAURANT";
      case 2: return 'CONFIRMER LA RÉCUPÉRATION';
      case 3: return 'ARRIVÉ CHEZ LE CLIENT';
      case 4: return 'LIVRAISON TERMINÉE';
      default: return "CONFIRMER L'ARRIVÉE AU RESTAURANT";
    }
  }

  handlePrimaryAction(): void {
    if (!this.delivery || this.actionLoading) return;
    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.currentStep === 1) {
      this.deliveryService.arriveRestaurant(this.delivery.id).subscribe({
        next: (updated) => {
          this.delivery = updated;
          this.actionLoading = false;
          this.successMessage = "Arrivée au restaurant confirmée !";
        },
        error: (err) => {
          this.actionLoading = false;
          this.errorMessage = err.error?.detail || "Impossible de confirmer l'arrivée au restaurant.";
        }
      });
    } else if (this.currentStep === 2) {
      this.deliveryService.pickupDelivery(this.delivery.id).subscribe({
        next: (updated) => {
          this.delivery = updated;
          this.actionLoading = false;
          this.successMessage = "Commande récupérée ! En route vers le client.";
        },
        error: (err) => {
          this.actionLoading = false;
          this.errorMessage = err.error?.detail || "Impossible de valider la récupération.";
        }
      });
    } else {
      this.actionLoading = false;
    }
  }

  // Client Contact & Phone
  callClient(): void {
    if (this.delivery?.telephone_destinataire) {
      window.location.href = `tel:${this.delivery.telephone_destinataire}`;
    } else {
      alert("Numéro du client non renseigné.");
    }
  }

  openExternalGps(): void {
    if (this.delivery) {
      this.router.navigate(['/livreur/navigation', this.delivery.id]);
    }
  }

  // 4-Digit PIN Input Handlers
  onPinInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Handle paste of 4-digit code
    if (value.length >= 4) {
      const cleaned = value.replace(/\D/g, '').substring(0, 4);
      for (let i = 0; i < 4; i++) {
        this.pinDigits[i] = cleaned[i] || '';
      }
      if (this.pinInput3) this.pinInput3.nativeElement.focus();
      return;
    }

    if (value.length > 0) {
      this.pinDigits[index] = value.substring(value.length - 1);
      // Auto focus next box
      if (index === 0 && this.pinInput1) this.pinInput1.nativeElement.focus();
      if (index === 1 && this.pinInput2) this.pinInput2.nativeElement.focus();
      if (index === 2 && this.pinInput3) this.pinInput3.nativeElement.focus();
    }
  }

  onPinKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.pinDigits[index]) {
      if (index === 1 && this.pinInput0) this.pinInput0.nativeElement.focus();
      if (index === 2 && this.pinInput1) this.pinInput1.nativeElement.focus();
      if (index === 3 && this.pinInput2) this.pinInput2.nativeElement.focus();
    }
  }

  get isPinComplete(): boolean {
    return this.pinDigits.length === 4 && this.pinDigits.every(d => d.length === 1 && !isNaN(parseInt(d, 10)));
  }

  get pinCode(): string {
    return this.pinDigits.join('');
  }

  submitPinValidation(): void {
    if (!this.delivery || !this.isPinComplete || this.validatingPin) return;

    this.validatingPin = true;
    this.pinErrorMessage = '';
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      commande: this.delivery.commande || this.delivery.id,
      code_validation: this.pinCode
    };

    this.deliveryService.validateByCode(payload).subscribe({
      next: (updated) => {
        this.validatingPin = false;
        this.delivery = updated;
        this.successMessage = "Livraison validée avec succès par le code PIN !";
        this.pinDigits = ['', '', '', ''];
        this.router.navigate(['/livreur/success', updated.id || this.delivery?.id]);
      },
      error: (err) => {
        this.validatingPin = false;
        this.pinErrorMessage = "Code PIN à 4 chiffres incorrect. Veuillez vérifier auprès du client.";
        this.pinDigits = ['', '', '', ''];
        if (this.pinInput0) this.pinInput0.nativeElement.focus();
      }
    });
  }

  scanQrCode(): void {
    if (!this.delivery) return;
    this.router.navigate(['/livreur/validation', this.delivery.id]);
  }

  getEtablissementName(): string {
    if (this.delivery?.etablissements && this.delivery.etablissements.length > 0) {
      return this.delivery.etablissements.map(e => e.nom).join(', ');
    }
    return 'Établissement non renseigné';
  }

  getEtablissementAddress(): string {
    if (this.delivery?.etablissements && this.delivery.etablissements.length > 0) {
      return this.delivery.etablissements[0].adresse || 'Adresse non renseignée';
    }
    return 'Adresse non renseignée';
  }

  getEtablissementPhone(): string | null {
    if (this.delivery?.etablissements && this.delivery.etablissements.length > 0) {
      return this.delivery.etablissements[0].telephone || null;
    }
    return null;
  }

  getDestinationSector(): string {
    if (this.delivery?.adresse_livraison) {
      const addr = this.delivery.adresse_livraison;
      return addr.split(',')[0] || addr;
    }
    return 'Destination non spécifiée';
  }

  getFormattedPrice(): string {
    const raw = this.delivery?.frais_livraison ? parseInt(this.delivery.frais_livraison, 10) : 0;
    const priceNum = isNaN(raw) ? 0 : raw;
    return priceNum.toLocaleString('fr-FR');
  }

  get orderItems(): { name: string; quantity: number; options: string }[] {
    if (this.delivery?.etablissements && this.delivery.etablissements.length > 0) {
      const items: { name: string; quantity: number; options: string }[] = [];
      this.delivery.etablissements.forEach((e: any) => {
        if (e.lignes && e.lignes.length > 0) {
          e.lignes.forEach((l: any) => {
            items.push({
              name: l.nom_produit,
              quantity: l.quantite,
              options: l.variante_nom || (l.options && l.options.length > 0 ? l.options.map((o: any) => o.nom).join(', ') : '')
            });
          });
        }
      });
      if (items.length > 0) return items;
    }

    return [];
  }
}

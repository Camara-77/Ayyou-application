import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { FormsModule } from '@angular/forms';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { QuantitySelectorComponent } from '../../components/quantity-selector/quantity-selector.component';
import { CartService } from '../../../../core/services/cart.service';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { AddressService } from '../../../../core/services/address.service';
import { OrderService } from '../../../../core/services/order.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { CartItem, PaymentMethod, Restaurant, PlacePrediction } from '../../../../core/models/client';
import { BackendAddress, CheckoutPayload, CommandeOrder } from '../../../../core/models/orders';
import { Payment, Invoice, InitiatePaydunyaResponse } from '../../../../core/models/payment';
import { GooglePlacesService } from '../../../../core/services/google-places.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    ChatbotFloatingComponent,
    QuantitySelectorComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentId: string = 'wave';
  restaurant?: Restaurant;

  userAddresses: BackendAddress[] = [];
  selectedAddress?: BackendAddress;
  deliveryAddressMain: string = 'Appartement L02, Résidence les Palmiers';
  deliveryAddressSub: string = 'Dakar Plateau, Sénégal';
  recipientName: string = '';
  recipientPhone: string = '';

  addressQuery: string = '';
  placePredictions: PlacePrediction[] = [];
  showAddressSuggestions: boolean = false;
  isProcessingPayment: boolean = false;
  paymentSuccess: boolean = false;
  errorMessage: string = '';

  createdOrder?: CommandeOrder;
  createdPayment?: Payment;
  createdInvoice?: Invoice;
  orderRef: string = '#AY-9482';
  createdOrderTotal: number = 0;
  paymentMethodName: string = 'Wave Sénégal';
  deliveryValidationCode: string = '482731';
  deliveryQrToken: string = 'AYYOU-DELIVERY-DEMO-TOKEN';

  private sub?: Subscription;

  constructor(
    public cartService: CartService,
    private clientDataService: ClientDataService,
    private addressService: AddressService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private deliveryService: DeliveryService,
    private googlePlacesService: GooglePlacesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.items$.subscribe(() => {
      this.cartItems = this.cartService.getSelectedItems();
      this.updateDeliveryFee();
    });

    this.clientDataService.getPaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
    });

    this.clientDataService.getRestaurant('rest1').subscribe(res => {
      this.restaurant = res;
    });

    this.loadUserAddresses();
    this.loadUserProfile();
  }

  loadUserAddresses(): void {
    this.addressService.getAddresses().subscribe(addresses => {
      if (addresses && addresses.length > 0) {
        this.userAddresses = addresses;
        const defaultAddr = addresses.find(a => a.est_defaut) || addresses[0];
        this.selectAddress(defaultAddr);
      }
    });
  }

  loadUserProfile(): void {
    this.clientDataService.getRawUserProfile().subscribe({
      next: (res) => {
        if (res) {
          this.recipientName = res.nom_complet || `${res.prenom} ${res.nom}`.trim();
          this.recipientPhone = res.numero_telephone;
        }
      },
      error: () => {}
    });
  }

  selectAddress(addr: BackendAddress): void {
    this.selectedAddress = addr;
    this.deliveryAddressMain = addr.titre || addr.adresse;
    this.deliveryAddressSub = addr.adresse;
    this.updateDeliveryFee();
  }

  updateDeliveryFee(): void {
    const rawEtabId = this.cartItems[0]?.dish?.restaurantId;
    const etabId = (rawEtabId && rawEtabId !== 'rest1' && !isNaN(Number(rawEtabId))) ? rawEtabId : '11';
    const lat = this.selectedAddress?.latitude;
    const lng = this.selectedAddress?.longitude;
    this.cartService.estimateDeliveryFee(etabId, lat, lng).subscribe();
  }

  onAddressSearchInput(): void {
    if (!this.addressQuery.trim()) {
      this.placePredictions = [];
      this.showAddressSuggestions = false;
      return;
    }

    this.checkAndMatchLocalDakarZone(this.addressQuery);

    this.googlePlacesService.getPredictions(this.addressQuery).subscribe(predictions => {
      this.placePredictions = predictions;
      this.showAddressSuggestions = predictions.length > 0;
    });
  }

  checkAndMatchLocalDakarZone(query: string): void {
    const q = query.toLowerCase().trim();
    const dakarZones: { [key: string]: { name: string; sub: string; lat: number; lng: number } } = {
      'keur massar': { name: 'Keur Massar', sub: 'Keur Massar, Dakar, Sénégal', lat: 14.7770, lng: -17.3117 },
      'pikine': { name: 'Pikine', sub: 'Pikine, Dakar, Sénégal', lat: 14.7550, lng: -17.3900 },
      'guediawaye': { name: 'Guédiawaye', sub: 'Guédiawaye, Dakar, Sénégal', lat: 14.7700, lng: -17.3800 },
      'guédiawaye': { name: 'Guédiawaye', sub: 'Guédiawaye, Dakar, Sénégal', lat: 14.7700, lng: -17.3800 },
      'rufisque': { name: 'Rufisque', sub: 'Rufisque, Dakar, Sénégal', lat: 14.7167, lng: -17.2667 },
      'parcelles': { name: 'Parcelles Assainies', sub: 'Parcelles Assainies, Dakar, Sénégal', lat: 14.7500, lng: -17.4300 },
      'almadies': { name: 'Les Almadies', sub: 'Almadies, Dakar, Sénégal', lat: 14.7450, lng: -17.5150 },
      'yoff': { name: 'Yoff', sub: 'Yoff, Dakar, Sénégal', lat: 14.7600, lng: -17.4650 },
      'ouakam': { name: 'Ouakam', sub: 'Ouakam, Dakar, Sénégal', lat: 14.7250, lng: -17.4850 },
      'mermoz': { name: 'Mermoz', sub: 'Mermoz, Dakar, Sénégal', lat: 14.7050, lng: -17.4700 },
      'plateau': { name: 'Dakar Plateau', sub: 'Dakar Plateau, Sénégal', lat: 14.6672, lng: -17.4344 },
      'dakar plateau': { name: 'Dakar Plateau', sub: 'Dakar Plateau, Sénégal', lat: 14.6672, lng: -17.4344 },
      'fann': { name: 'Fann Résidence', sub: 'Fann, Dakar, Sénégal', lat: 14.6850, lng: -17.4650 }
    };

    for (const key of Object.keys(dakarZones)) {
      if (q.includes(key)) {
        const zone = dakarZones[key];
        this.deliveryAddressMain = zone.name;
        this.deliveryAddressSub = zone.sub;
        this.selectedAddress = {
          titre: zone.name,
          adresse: zone.sub,
          latitude: zone.lat,
          longitude: zone.lng,
          est_defaut: false
        };
        this.updateDeliveryFee();
        break;
      }
    }
  }

  selectPrediction(prediction: PlacePrediction): void {
    this.addressQuery = prediction.description || prediction.mainText;
    this.showAddressSuggestions = false;
    this.googlePlacesService.getPlaceDetails(prediction).subscribe(details => {
      this.deliveryAddressMain = details.name || prediction.mainText;
      this.deliveryAddressSub = details.formattedAddress || `${details.city}, ${details.country}`;
      this.selectedAddress = {
        titre: this.deliveryAddressMain,
        adresse: this.deliveryAddressSub,
        latitude: details.latitude,
        longitude: details.longitude,
        est_defaut: false
      };
      this.updateDeliveryFee();
    });
  }

  selectPaymentMethod(id: 'wave' | 'orange_money' | 'card' | 'cash'): void {
    this.selectedPaymentId = id;
  }

  updateQuantity(dishId: string, qty: number): void {
    this.cartService.updateQuantity(dishId, qty).subscribe(() => {
      this.updateDeliveryFee();
    });
  }

  removeItem(dishId: string): void {
    this.cartService.removeFromCart(dishId).subscribe(() => {
      this.updateDeliveryFee();
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  confirmPayment(): void {
    if (this.cartItems.length === 0 || this.isProcessingPayment) return;
    this.errorMessage = '';
    this.isProcessingPayment = true;

    const payload: CheckoutPayload = {
      adresse_livraison: `${this.deliveryAddressMain}, ${this.deliveryAddressSub}`,
      latitude_livraison: this.selectedAddress?.latitude || 14.6925,
      longitude_livraison: this.selectedAddress?.longitude || -17.4611,
      instructions_livraison: this.selectedAddress?.instructions || '',
      destinataire: {
        nom: this.recipientName || 'Moussa Diop',
        telephone: this.recipientPhone || '+221771234567'
      }
    };

    // Map UI payment method to backend Django choice ('WAVE' | 'ORANGE_MONEY')
    const backendMethode = this.selectedPaymentId === 'orange_money' ? 'ORANGE_MONEY' : 'WAVE';

    // 1. Appeler l'API de création de commande (calcul serveur)
    this.orderService.checkout(payload).subscribe({
      next: (order: CommandeOrder) => {
        this.createdOrder = order;
        this.orderRef = order.numero_commande;

        // 2. Initialiser la transaction PayTech auprès du backend Django
        this.paymentService.initiatePayTechPayment({
          commande_id: order.id,
          methode: backendMethode
        }).subscribe({
          next: (res) => {
            if (res.redirect_url && res.redirect_url.startsWith('http')) {
              // 3. Rediriger le client vers le portail de règlement PayTech (Wave, Orange Money)
              this.cartService.clearCart().subscribe(() => {
                window.location.href = res.redirect_url;
              });
            } else {
              // Simulation / Fallback interne si redirect_url directe non disponible
              this.fallbackConfirmPayment(order, res.payment_id);
            }
          },
          error: (err) => {
            this.handlePaymentError(err, 'Erreur lors de l\'initialisation du paiement PayTech.');
          }
        });

      },
      error: (err) => {
        // En cas de secours/démo hors-ligne
        this.isProcessingPayment = false;
        if (err.status === 0 || err.status >= 500) {
          this.createdOrderTotal = this.cartService.getTotal();
          this.paymentMethodName = this.selectedPaymentId === 'wave' ? 'Wave Sénégal' : 'Orange Money';
          this.paymentSuccess = true;
          this.cartService.removeSelectedItems();
        } else {
          this.handlePaymentError(err, 'Erreur lors de la création de la commande.');
        }
      }
    });
  }

  private fallbackConfirmPayment(order: CommandeOrder, paymentId: number): void {
    this.paymentService.confirmPayment(paymentId, {
      transaction_externe: `SIM_PAYDUNYA_${paymentId}`
    }).subscribe({
      next: (confirmedPayment: Payment) => {
        this.isProcessingPayment = false;
        this.createdPayment = confirmedPayment;
        this.createdOrderTotal = parseFloat(confirmedPayment.montant || order.total);
        this.paymentMethodName = confirmedPayment.methode_nom || (this.selectedPaymentId === 'wave' ? 'Wave Sénégal' : 'Orange Money');
        this.paymentSuccess = true;
        this.cartService.clearCart().subscribe();
      },
      error: (err) => {
        this.handlePaymentError(err, 'Erreur lors de la confirmation du paiement.');
      }
    });
  }

  private fallbackInitiateAndConfirm(order: CommandeOrder, backendMethode: string): void {
    this.paymentService.initiatePayment({
      commande: order.id,
      methode: backendMethode
    }).subscribe({
      next: (payment: Payment) => {
        this.fallbackConfirmPayment(order, payment.id);
      },
      error: (err) => {
        this.handlePaymentError(err, 'Erreur lors de l\'initialisation du paiement.');
      }
    });
  }

  private handlePaymentError(err: any, defaultMsg: string): void {
    this.isProcessingPayment = false;
    if (err.status === 401) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
    } else if (err.error?.detail) {
      this.errorMessage = typeof err.error.detail === 'string' ? err.error.detail : defaultMsg;
    } else if (err.error?.commande) {
      this.errorMessage = Array.isArray(err.error.commande) ? err.error.commande[0] : defaultMsg;
    } else {
      this.errorMessage = defaultMsg;
    }
  }

  closeModal(): void {
    this.paymentSuccess = false;
  }

  trackOrder(): void {
    this.paymentSuccess = false;
    const targetId = this.createdOrder?.id ? String(this.createdOrder.id) : 'ot1';
    this.router.navigate(['/order-tracking', targetId]);
  }

  viewInvoice(): void {
    this.paymentSuccess = false;
    const ref = this.createdInvoice?.numero_facture || this.orderRef || 'AY-9482';
    this.router.navigate(['/notifications'], { queryParams: { receipt: ref } });
  }

  finishOrder(): void {
    this.router.navigate(['/home']);
  }

  cancelOrder(): void {
    this.router.navigate(['/cart']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

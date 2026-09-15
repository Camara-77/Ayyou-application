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
import { CartItem, PaymentMethod, Restaurant, PlacePrediction } from '../../../../core/models/client';
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
  deliveryAddressMain: string = 'Appartement L02, Résidence les Palmiers';
  deliveryAddressSub: string = 'Dakar Plateau, Sénégal';
  addressQuery: string = '';
  placePredictions: PlacePrediction[] = [];
  showAddressSuggestions: boolean = false;
  isProcessingPayment: boolean = false;
  paymentSuccess: boolean = false;
  private sub?: Subscription;

  constructor(
    public cartService: CartService,
    private clientDataService: ClientDataService,
    private googlePlacesService: GooglePlacesService,
    private router: Router
  ) {}

  onAddressSearchInput(): void {
    if (!this.addressQuery.trim()) {
      this.placePredictions = [];
      this.showAddressSuggestions = false;
      return;
    }
    this.googlePlacesService.getPredictions(this.addressQuery).subscribe(predictions => {
      this.placePredictions = predictions;
      this.showAddressSuggestions = predictions.length > 0;
    });
  }

  selectPrediction(prediction: PlacePrediction): void {
    this.addressQuery = prediction.description || prediction.mainText;
    this.showAddressSuggestions = false;
    this.googlePlacesService.getPlaceDetails(prediction).subscribe(details => {
      this.deliveryAddressMain = details.name || prediction.mainText;
      this.deliveryAddressSub = details.formattedAddress || `${details.city}, ${details.country}`;
    });
  }

  ngOnInit(): void {
    this.sub = this.cartService.items$.subscribe(() => {
      this.cartItems = this.cartService.getSelectedItems();
    });

    this.clientDataService.getPaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
    });

    this.clientDataService.getRestaurant('rest1').subscribe(res => {
      this.restaurant = res;
    });
  }

  selectPaymentMethod(id: 'wave' | 'orange_money' | 'card' | 'cash'): void {
    this.selectedPaymentId = id;
  }

  updateQuantity(dishId: string, qty: number): void {
    this.cartService.updateQuantity(dishId, qty);
  }

  removeItem(dishId: string): void {
    this.cartService.removeFromCart(dishId);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  confirmPayment(): void {
    if (this.cartItems.length === 0) return;

    this.isProcessingPayment = true;
    setTimeout(() => {
      this.isProcessingPayment = false;
      this.paymentSuccess = true;
      this.cartService.removeSelectedItems();
    }, 1800);
  }

  closeModal(): void {
    this.paymentSuccess = false;
  }

  trackOrder(): void {
    this.paymentSuccess = false;
    this.router.navigate(['/order-tracking', 'ot1']);
  }

  viewInvoice(): void {
    this.paymentSuccess = false;
    this.router.navigate(['/notifications'], { queryParams: { receipt: 'AY-9482' } });
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

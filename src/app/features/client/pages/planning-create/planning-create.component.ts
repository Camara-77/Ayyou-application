import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { Dish, Category, Restaurant } from '../../../../core/models/client';
import { PlanningService } from '../../../../core/services/planning.service';
import { VoiceTranscriptionService } from '../../../../core/services/voice-transcription.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-planning-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './planning-create.component.html',
  styleUrls: ['./planning-create.component.scss']
})
export class PlanningCreateComponent implements OnInit {
  categories: Category[] = [];
  selectedCategoryId: string = 'all';

  // State for Restaurants & Dishes
  allRestaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  restaurantSearchQuery: string = '';
  isRestaurantDropdownOpen: boolean = false;
  selectedEstablishment: Restaurant | null = null;
  isLoadingRestaurants: boolean = false;

  allDishes: Dish[] = [];
  filteredDishes: Dish[] = [];
  dishSearchQuery: string = '';
  isDishDropdownOpen: boolean = false;
  selectedDish: Dish | null = null;
  isLoadingDishes: boolean = false;

  availableEstablishments: Restaurant[] = [];
  showEstablishmentChoice: boolean = false;
  dishMismatchNotice: string = '';

  selectedDate: string = '';
  selectedTime: string = '12:30';
  selectedMealType: 'MATIN' | 'MIDI' | 'SOIR' | 'EN_CAS' = 'MIDI';
  quantity: number = 1;

  isRecording: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  editingMealId: number | null = null;

  private clientDataService = inject(ClientDataService);
  private planningService = inject(PlanningService);
  private voiceService = inject(VoiceTranscriptionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];

    const paramId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id');
    if (paramId && !isNaN(Number(paramId))) {
      this.isEditMode = true;
      this.editingMealId = Number(paramId);
    }

    this.loadCategories();
    this.loadRestaurants();

    if (this.isEditMode && this.editingMealId) {
      this.loadMealForEditing(this.editingMealId);
    } else {
      this.loadDishes();
    }
  }

  loadMealForEditing(mealId: number): void {
    this.planningService.getPlannedMealById(mealId).subscribe(data => {
      if (data) {
        this.selectedDate = data.date_planifiee;
        this.selectedMealType = data.creneau;
        if (data.heure_planifiee) {
          this.selectedTime = String(data.heure_planifiee).substring(0, 5);
        } else {
          this.selectMealType(data.creneau);
        }
        this.quantity = data.quantite;

        // Fetch establishment
        if (data.etablissement) {
          this.clientDataService.getRestaurants().subscribe(restos => {
            this.allRestaurants = restos;
            const matchEst = restos.find(r => String(r.id) === String(data.etablissement));
            if (matchEst) {
              this.selectedEstablishment = matchEst;
            } else {
              this.selectedEstablishment = {
                id: String(data.etablissement),
                name: data.nom_etablissement,
                logoUrl: '',
                coverUrl: '',
                tagline: '',
                description: '',
                location: data.adresse_etablissement || 'Dakar',
                rating: 5,
                reviewsCount: 0,
                status: 'open',
                closingTime: '',
                categories: [],
                dishes: []
              };
            }

            // Load dishes for this establishment
            this.loadDishesForEstablishment(String(data.etablissement), () => {
              const matchDish = this.allDishes.find(d => String(d.id) === String(data.produit)) ||
                this.allDishes.find(d => d.name.toLowerCase() === data.nom_produit.toLowerCase());
              if (matchDish) {
                this.selectedDish = matchDish;
              } else {
                this.selectedDish = {
                  id: String(data.produit),
                  name: data.nom_produit,
                  description: '',
                  price: typeof data.prix_total === 'number' ? data.prix_total : parseFloat(String(data.prix_total)),
                  imageUrl: data.image_url,
                  categoryId: 'all',
                  categoryName: 'Plat',
                  restaurantId: String(data.etablissement),
                  restaurantName: data.nom_etablissement
                };
              }
            });
          });
        }
      }
    });
  }

  loadCategories(): void {
    this.clientDataService.getCategories().subscribe(cats => {
      this.categories = [
        { id: 'all', name: 'Tous', icon: '', imageUrl: '', active: true },
        ...cats
      ];
    });
  }

  loadRestaurants(): void {
    this.isLoadingRestaurants = true;
    this.clientDataService.getRestaurants().subscribe(restos => {
      this.allRestaurants = restos;
      this.filteredRestaurants = restos;
      this.isLoadingRestaurants = false;
    });
  }

  onRestaurantSearchChange(): void {
    const q = (this.restaurantSearchQuery || '').toLowerCase().trim();
    if (!q) {
      this.filteredRestaurants = this.allRestaurants;
    } else {
      this.filteredRestaurants = this.allRestaurants.filter(r =>
        r.name.toLowerCase().includes(q) || (r.location && r.location.toLowerCase().includes(q))
      );
    }
  }

  toggleRestaurantDropdown(): void {
    this.isRestaurantDropdownOpen = !this.isRestaurantDropdownOpen;
    this.isDishDropdownOpen = false;
    if (this.isRestaurantDropdownOpen && this.allRestaurants.length === 0) {
      this.loadRestaurants();
    }
  }

  /**
   * CAS A — Restaurant choisi en premier
   * CAS C — Changement de restaurant
   */
  selectEstablishment(resto: Restaurant): void {
    this.selectedEstablishment = resto;
    this.isRestaurantDropdownOpen = false;
    this.dishMismatchNotice = '';
    this.showEstablishmentChoice = false;

    // Load dishes filtered to this establishment
    this.loadDishesForEstablishment(resto.id, () => {
      if (this.selectedDish) {
        // CAS C Check: does new restaurant offer this dish?
        const isDishAvailable = this.allDishes.some(
          d => String(d.id) === String(this.selectedDish?.id) || d.name.toLowerCase() === this.selectedDish?.name.toLowerCase()
        );
        if (!isDishAvailable) {
          const oldDishName = this.selectedDish.name;
          this.selectedDish = null;
          this.dishMismatchNotice = `Le restaurant '${resto.name}' ne propose pas '${oldDishName}'. Veuillez choisir un nouveau plat ci-dessous.`;
        }
      }
    });
  }

  loadDishesForEstablishment(establishmentId: string, callback?: () => void): void {
    this.isLoadingDishes = true;
    this.clientDataService.getDishes({ establishmentId }).subscribe(items => {
      this.allDishes = items;
      this.filteredDishes = items;
      this.isLoadingDishes = false;
      if (callback) callback();
    });
  }

  loadDishes(): void {
    this.isLoadingDishes = true;
    const estId = this.selectedEstablishment ? this.selectedEstablishment.id : undefined;
    this.clientDataService.getDishes({
      categoryId: this.selectedCategoryId,
      establishmentId: estId,
      search: this.dishSearchQuery
    }).subscribe(items => {
      this.allDishes = items;
      this.filteredDishes = items;
      this.isLoadingDishes = false;
    });
  }

  onDishSearchChange(): void {
    const q = (this.dishSearchQuery || '').toLowerCase().trim();
    if (!q) {
      this.filteredDishes = this.allDishes;
    } else {
      this.filteredDishes = this.allDishes.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.restaurantName && d.restaurantName.toLowerCase().includes(q)) ||
        (d.price && String(d.price).includes(q))
      );
    }
  }

  toggleDishDropdown(): void {
    this.isDishDropdownOpen = !this.isDishDropdownOpen;
    this.isRestaurantDropdownOpen = false;
    if (this.isDishDropdownOpen) {
      if (this.selectedEstablishment) {
        this.loadDishesForEstablishment(this.selectedEstablishment.id);
      } else {
        this.loadDishes();
      }
    }
  }

  /**
   * CAS B — Plat choisi en premier
   */
  selectDish(dish: Dish): void {
    this.selectedDish = dish;
    this.isDishDropdownOpen = false;
    this.dishMismatchNotice = '';

    // Check establishments offering this dish
    this.clientDataService.getRestaurants().subscribe(allRestos => {
      // Find restaurants that offer this dish (matching restaurantId or name)
      let matchingRestos = allRestos.filter(r => String(r.id) === String(dish.restaurantId));
      if (matchingRestos.length === 0) {
        matchingRestos = allRestos.filter(r => r.name.toLowerCase() === dish.restaurantName.toLowerCase());
      }
      if (matchingRestos.length === 0) {
        matchingRestos = allRestos;
      }

      if (matchingRestos.length === 1) {
        // Single establishment offers it -> auto-fill restaurant
        this.selectedEstablishment = matchingRestos[0];
        this.availableEstablishments = matchingRestos;
        this.showEstablishmentChoice = false;
      } else if (matchingRestos.length > 1) {
        // Multiple establishments offer it -> do NOT pick arbitrarily. Ask user to choose.
        this.availableEstablishments = matchingRestos;
        this.showEstablishmentChoice = true;
        if (!this.selectedEstablishment || !matchingRestos.some(r => r.id === this.selectedEstablishment?.id)) {
          this.selectedEstablishment = null;
        }
      }
    });
  }

  confirmEstablishmentChoice(resto: Restaurant): void {
    this.selectedEstablishment = resto;
    this.showEstablishmentChoice = false;
  }

  changeDish(): void {
    this.selectedDish = null;
    this.dishMismatchNotice = '';
    this.isDishDropdownOpen = true;
  }

  changeEstablishment(): void {
    this.selectedEstablishment = null;
    this.isRestaurantDropdownOpen = true;
  }

  onSelectCategory(catId: string): void {
    this.selectedCategoryId = catId;
    this.loadDishes();
  }

  async toggleVoiceSearch(): Promise<void> {
    if (this.voiceService.isRecordingNow()) {
      this.isRecording = false;
      const { blob } = await this.voiceService.stopRecording();
      if (blob) {
        this.voiceService.transcribeAudio(blob).subscribe(res => {
          if (res.status === 'success' && res.text) {
            this.dishSearchQuery = res.text;
            this.loadDishes();
          }
        });
      }
    } else {
      const hasPerm = await this.voiceService.requestMicrophonePermission();
      if (!hasPerm) {
        alert('L\'accès au microphone est requis.');
        return;
      }
      const started = await this.voiceService.startRecording();
      if (started) {
        this.isRecording = true;
      }
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  getUnitPrice(): number {
    return this.selectedDish?.price || 0;
  }

  getCalculatedTotal(): number {
    return this.getUnitPrice() * this.quantity;
  }

  formatPrice(price: number): string {
    return (price || 0).toLocaleString('fr-FR') + ' FCFA';
  }

  getFormattedSelectedDate(): string {
    if (!this.selectedDate) return '';
    const parts = this.selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const str = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return this.selectedDate;
  }

  selectMealType(type: 'MATIN' | 'MIDI' | 'SOIR' | 'EN_CAS'): void {
    this.selectedMealType = type;
    switch (type) {
      case 'MATIN': this.selectedTime = '08:30'; break;
      case 'MIDI': this.selectedTime = '12:30'; break;
      case 'EN_CAS': this.selectedTime = '16:30'; break;
      case 'SOIR': this.selectedTime = '20:00'; break;
    }
  }

  onTimeChange(): void {
    if (!this.selectedTime) return;
    const parts = this.selectedTime.split(':');
    if (parts.length >= 1) {
      const hours = parseInt(parts[0], 10);
      if (hours < 11) {
        this.selectedMealType = 'MATIN';
      } else if (hours >= 11 && hours < 16) {
        this.selectedMealType = 'MIDI';
      } else if (hours >= 16 && hours < 18) {
        this.selectedMealType = 'EN_CAS';
      } else {
        this.selectedMealType = 'SOIR';
      }
    }
  }

  getFormattedSelectedTime(): string {
    if (!this.selectedTime) return '12h30';
    const parts = this.selectedTime.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}h${parts[1]}`;
    }
    return this.selectedTime;
  }

  getCreneauDisplayLabel(): string {
    switch (this.selectedMealType) {
      case 'MATIN': return 'Petit-déjeuner';
      case 'MIDI': return 'Déjeuner';
      case 'SOIR': return 'Dîner';
      case 'EN_CAS': return 'En-cas';
      default: return 'Déjeuner';
    }
  }

  triggerDatePicker(input: HTMLInputElement): void {
    if (input) {
      if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
        (input as any).showPicker();
      } else {
        input.focus();
        input.click();
      }
    }
  }

  triggerTimePicker(input: HTMLInputElement): void {
    if (input) {
      if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
        (input as any).showPicker();
      } else {
        input.focus();
        input.click();
      }
    }
  }

  canConfirm(): boolean {
    return !!(this.selectedDish && this.selectedEstablishment && this.selectedDate);
  }

  /**
   * ANNULATION DE LA MODIFICATION
   * NE RIEN MODIFIER EN BASE, AUCUN PATCH, AUCUN POST.
   */
  onCancel(): void {
    if (this.isEditMode && this.editingMealId) {
      this.router.navigate(['/planning/detail', this.editingMealId]);
    } else {
      this.location.back();
    }
  }

  /**
   * ENREGISTREMENT DE LA MODIFICATION (PATCH /api/orders/planning/{id}/)
   */
  confirmPlanning(): void {
    if (!this.canConfirm() || !this.selectedDish || !this.selectedEstablishment) return;

    if (!this.authService.requireAuth({
      title: 'Connexion requise',
      message: 'Veuillez vous connecter pour enregistrer votre repas.',
      actionType: 'order',
      returnUrl: this.isEditMode ? `/planning/edit/${this.editingMealId}` : '/planning/create'
    })) {
      return;
    }

    this.isSubmitting = true;

    const payload = {
      produit: Number(this.selectedDish.id),
      etablissement: Number(this.selectedEstablishment.id),
      date_planifiee: this.selectedDate,
      heure_planifiee: this.selectedTime,
      creneau: this.selectedMealType,
      prix_total: this.getCalculatedTotal(),
      quantite: this.quantity,
      instructions: `Heure choisie : ${this.getFormattedSelectedTime()}`
    };

    if (this.isEditMode && this.editingMealId) {
      // PATCH /api/orders/planning/{id}/ (Même ID)
      this.planningService.updatePlannedMeal(this.editingMealId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/planning/detail', this.editingMealId]);
        },
        error: (err) => {
          this.isSubmitting = false;
          const detailMsg = err.error?.produit || err.error?.detail || err.error?.non_field_errors || 'Veuillez vérifier les informations.';
          alert('Erreur lors de la modification : ' + (Array.isArray(detailMsg) ? detailMsg.join(' ') : detailMsg));
        }
      });
    } else {
      // POST /api/orders/planning/
      this.planningService.createPlannedMeal(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/planning']);
        },
        error: (err) => {
          this.isSubmitting = false;
          const detailMsg = err.error?.detail || err.error?.non_field_errors || 'Veuillez vérifier les informations.';
          alert('Erreur lors de la planification : ' + (Array.isArray(detailMsg) ? detailMsg.join(' ') : detailMsg));
        }
      });
    }
  }
}

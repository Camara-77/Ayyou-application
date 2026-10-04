import { Component, OnInit, ElementRef, ViewChild, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { VoiceTranscriptionService } from '../../../../core/services/voice-transcription.service';
import { PlanningAiService, PlanningAiParseResponse, SuggestedAction, DetectedProduct, DetectedEstablishment } from '../../../../core/services/planning-ai.service';
import { PlanningService } from '../../../../core/services/planning.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { Dish, Restaurant } from '../../../../core/models/client';
import { PlannedMeal } from '../../../../core/models/planning';

export type PlanningUiState =
  | 'IDLE'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'ANALYZING'
  | 'READY'
  | 'WAITING_FOR_INFORMATION'
  | 'CONFIRMING'
  | 'SUCCESS'
  | 'ERROR';

export interface ChatMessage {
  id?: number;
  role: 'USER' | 'ASSISTANT';
  text?: string;
  imagePreview?: string;
  fileName?: string;
  parsedData?: PlanningAiParseResponse | null;
  timestamp?: Date;
}

@Component({
  selector: 'app-planning-ai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './planning-ai.component.html',
  styleUrls: ['./planning-ai.component.scss']
})
export class PlanningAiComponent implements OnInit {
  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  currentState: PlanningUiState = 'IDLE';

  inputPrompt: string = '';
  userPromptText: string = '';

  entryMode: 'CHAT' | 'PLANNING' = 'CHAT';
  copiloteMessage: string = 'Que souhaitez-vous manger aujourd’hui ?';

  parsedData: PlanningAiParseResponse | null = null;
  errorMessage: string = '';
  isEditing: boolean = false;
  isConfirming: boolean = false;
  confirmSuccess: boolean = false;

  // Fil conversationnel persistant
  chatMessages: ChatMessage[] = [];
  activeConversationId: number | null = null;

  // Gestion de l'image (Bouton + et Paste)
  selectedImagePreview: string | null = null;
  selectedImageFile: File | null = null;
  isAnalyzingImage: boolean = false;

  // Menu Popup Bouton +
  isPlusMenuOpen: boolean = false;

  // Menu Burger Sub-Header
  isBurgerMenuOpen: boolean = false;

  // Tiroirs latéraux (Historique conversations & Mes planifications)
  isHistoryDrawerOpen: boolean = false;
  isPlannedMealsDrawerOpen: boolean = false;
  savedConversations: any[] = [];
  plannedMealsList: PlannedMeal[] = [];
  isLoadingConversations: boolean = false;
  isLoadingPlannedMeals: boolean = false;

  // Formulaire d'édition manuelle
  editForm = {
    nomProduit: '',
    nomEtablissement: '',
    dateIso: '',
    dateLabel: '',
    timeLabel: '',
    options: ''
  };

  // Menus déroulants recherchables
  allEstablishments: Restaurant[] = [];
  filteredEstablishments: Restaurant[] = [];
  establishmentSearchQuery: string = '';
  isEstablishmentDropdownOpen: boolean = false;
  isLoadingEstablishments: boolean = false;

  allDishes: Dish[] = [];
  filteredDishes: Dish[] = [];
  dishSearchQuery: string = '';
  isDishDropdownOpen: boolean = false;
  isLoadingDishes: boolean = false;

  isLoadingMoreMap: { [key: string]: boolean } = {};
  msgSearchQueryMap: { [key: string]: string } = {};

  // État du panier et modal de remplacement multi-établissement
  isOrderingMap: { [key: number]: boolean } = {};
  showReplaceCartModal: boolean = false;
  pendingReplaceCartDish: DetectedProduct | null = null;
  pendingReplaceCartQuantity: number = 1;

  // État d'affichage Fiche Produit Intégrée dans le Copilote (Étape 4)
  isViewingProductDetail: boolean = false;
  selectedProductDetail: DetectedProduct | null = null;

  // Sélecteur Jour / Heure AYYOU (Étape 5 UX Refinement)
  showCalendarPopover: boolean = false;
  showTimePopover: boolean = false;
  pickerSelectedDate: string = '';
  pickerSelectedTime: string = '';
  pickerFormattedDateLabel: string = '';
  pickerFormattedShortDate: string = '';

  currentCalDate: Date = new Date();
  currentCalMonthName: string = '';
  currentCalYear: number = new Date().getFullYear();
  calDaysGrid: Array<{ day: number | null; dateStr: string; isDisabled: boolean; isTodayOrSelected: boolean }> = [];

  hoursList: string[] = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  minutesList: string[] = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  selectedHour: string = '12';
  selectedMinute: string = '00';

  private voiceService = inject(VoiceTranscriptionService);
  private planningAiService = inject(PlanningAiService);
  private planningService = inject(PlanningService);
  private clientDataService = inject(ClientDataService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.currentState = 'IDLE';
    this.parsedData = null;
    this.userPromptText = '';
    this.selectedImagePreview = null;
    this.selectedImageFile = null;

    this.route.queryParams.subscribe(params => {
      const mode = (params['mode'] || 'CHAT').toUpperCase();
      this.entryMode = mode === 'PLANNING' ? 'PLANNING' : 'CHAT';

      if (this.chatMessages.length === 0) {
        if (this.entryMode === 'PLANNING') {
          this.copiloteMessage = 'Que souhaitez-vous planifier ?';
        } else {
          this.copiloteMessage = 'Que souhaitez-vous manger aujourd’hui ?';
        }
      }
    });

    this.loadInitialConversation();
  }

  onExampleClick(text: string): void {
    this.inputPrompt = text;
    this.onSubmitTextPrompt();
  }

  /**
   * ÉCOUTE DU COLLAGE PRESSE-PAPIER (CTRL + V)
   */
  @HostListener('window:paste', ['$event'])
  onClipboardPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          const file = new File(
            [blob],
            `image_collee_${Date.now()}.${blob.type.split('/')[1] || 'png'}`,
            { type: blob.type }
          );
          this.handleImageFileSelection(file);
        }
        break;
      }
    }
  }

  /**
   * Chargement de la conversation initiale ou de l'historique
   */
  loadInitialConversation(): void {
    this.planningAiService.getConversations().subscribe(convs => {
      this.savedConversations = convs;
      if (convs && convs.length > 0) {
        const lastConv = convs[0];
        this.selectConversation(lastConv.id);
      }
    });
  }

  selectConversation(convId: number): void {
    this.activeConversationId = convId;
    this.isHistoryDrawerOpen = false;
    this.isPlusMenuOpen = false;
    this.isBurgerMenuOpen = false;

    this.planningAiService.getConversationMessages(convId).subscribe(data => {
      if (data && data.messages) {
        this.chatMessages = data.messages.map((m: any) => {
          let parsed: any = m.data_payload;
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch { parsed = null; }
          }
          return {
            id: m.id,
            role: m.role as 'USER' | 'ASSISTANT',
            text: m.content || m.user_text,
            parsedData: parsed,
            timestamp: m.date_creation ? new Date(m.date_creation) : new Date()
          };
        });

        if (this.chatMessages.length > 0) {
          const lastMsg = this.chatMessages[this.chatMessages.length - 1];
          if (lastMsg.parsedData) {
            this.parsedData = lastMsg.parsedData;
            this.copiloteMessage = lastMsg.parsedData.message || lastMsg.text || '';
            this.currentState = 'READY';
          }
        }
        setTimeout(() => this.scrollToBottom(), 150);
      }
    });
  }

  startNewConversation(): void {
    this.activeConversationId = null;
    this.chatMessages = [];
    this.parsedData = null;
    this.userPromptText = '';
    this.currentState = 'IDLE';
    this.isHistoryDrawerOpen = false;
    this.isPlusMenuOpen = false;
    this.isBurgerMenuOpen = false;
    this.copiloteMessage = 'Nouvelle conversation démarrée. Que souhaitez-vous manger ou planifier ?';
  }

  deleteConversation(convId: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer cette conversation ?')) return;

    this.planningAiService.deleteConversation(convId).subscribe(() => {
      this.savedConversations = this.savedConversations.filter(c => c.id !== convId);
      if (this.activeConversationId === convId) {
        this.startNewConversation();
      }
    });
  }

  // --- MENU POPUP BOUTON + & BURGER SUB-HEADER ---

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isPlusMenuOpen && !target.closest('.plus-menu-container')) {
      this.isPlusMenuOpen = false;
    }
    if (this.isBurgerMenuOpen && !target.closest('.burger-menu-container')) {
      this.isBurgerMenuOpen = false;
    }
    if (this.showCalendarPopover && !target.closest('.ayyou-calendar-popover') && !target.closest('.btn-picker-box')) {
      this.showCalendarPopover = false;
    }
    if (this.showTimePopover && !target.closest('.ayyou-time-popover') && !target.closest('.btn-picker-box')) {
      this.showTimePopover = false;
    }
  }

  toggleBurgerMenu(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isBurgerMenuOpen = !this.isBurgerMenuOpen;
  }

  togglePlusMenu(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isPlusMenuOpen = !this.isPlusMenuOpen;
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    this.isPlusMenuOpen = false;
    if (fileInput) fileInput.click();
  }

  openHistoryDrawer(): void {
    this.isPlusMenuOpen = false;
    this.isBurgerMenuOpen = false;
    this.isHistoryDrawerOpen = true;
    this.isLoadingConversations = true;
    this.planningAiService.getConversations().subscribe(convs => {
      this.savedConversations = convs;
      this.isLoadingConversations = false;
    });
  }

  closeHistoryDrawer(): void {
    this.isHistoryDrawerOpen = false;
  }

  openPlannedMealsDrawer(): void {
    this.isPlusMenuOpen = false;
    this.isBurgerMenuOpen = false;
    this.isPlannedMealsDrawerOpen = true;
    this.isLoadingPlannedMeals = true;
    const now = new Date();
    this.planningService.getPlanning(now.getFullYear(), now.getMonth() + 1).subscribe(res => {
      this.plannedMealsList = res.repas || [];
      this.isLoadingPlannedMeals = false;
    });
  }

  closePlannedMealsDrawer(): void {
    this.isPlannedMealsDrawerOpen = false;
  }

  goToMealDetail(mealId: number): void {
    this.isPlannedMealsDrawerOpen = false;
    this.router.navigate(['/planning/detail', mealId]);
  }

  // --- GESTION DE L'IMAGE ---

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.handleImageFileSelection(file);
    input.value = '';
  }

  handleImageFileSelection(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileName = file.name.toLowerCase();
    const isExtensionValid = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp');

    if (!allowedTypes.includes(file.type) && !isExtensionValid) {
      alert('Seules les images au format JPG, PNG ou WEBP sont acceptées (les fichiers PDF, vidéos et documents sont refusés).');
      return;
    }

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeSelectedImage(): void {
    this.selectedImagePreview = null;
    this.selectedImageFile = null;
  }

  uploadAndAnalyzeImage(file: File): void {
    this.currentState = 'ANALYZING';
    this.isAnalyzingImage = true;
    this.isEditing = false;

    // Ajouter le message utilisateur dans le fil
    this.chatMessages.push({
      role: 'USER',
      text: this.inputPrompt.trim() || `[Photo transmise : ${file.name}]`,
      imagePreview: this.selectedImagePreview || undefined,
      fileName: file.name,
      timestamp: new Date()
    });
    this.scrollToBottom();

    const imageToAnalyze = file;
    this.selectedImagePreview = null;
    this.selectedImageFile = null;

    this.planningAiService.analyzeImage(imageToAnalyze).subscribe({
      next: (res) => {
        this.isAnalyzingImage = false;
        this.parsedData = res;
        this.copiloteMessage = res.message;

        if (res.status === 'food_identified') {
          this.currentState = 'READY';
        } else if (res.status === 'non_food_image' || res.status === 'unclear_image' || res.status === 'ambiguous_food_image') {
          this.currentState = 'WAITING_FOR_INFORMATION';
        } else {
          this.currentState = 'ERROR';
          this.errorMessage = res.message || 'Impossible d\'analyser cette image.';
        }

        this.chatMessages.push({
          role: 'ASSISTANT',
          text: res.message,
          parsedData: res,
          timestamp: new Date()
        });
        this.scrollToBottom();
      },
      error: () => {
        this.isAnalyzingImage = false;
        this.currentState = 'ERROR';
        this.errorMessage = 'Erreur de connexion lors de l\'analyse de l\'image.';
      }
    });
  }

  // --- TRAITEMENT DU TEXTE & REQUÊTES IA ---

  onSubmitTextPrompt(): void {
    if (this.selectedImageFile) {
      this.uploadAndAnalyzeImage(this.selectedImageFile);
      return;
    }

    if (!this.inputPrompt || !this.inputPrompt.trim()) return;
    const prompt = this.inputPrompt.trim();
    this.inputPrompt = '';
    this.userPromptText = prompt;

    // Ajouter au fil
    this.chatMessages.push({
      role: 'USER',
      text: prompt,
      timestamp: new Date()
    });
    this.scrollToBottom();

    this.parseTextPrompt(prompt);
  }

  parseTextPrompt(prompt: string, forceAction?: string, productId?: number, establishmentId?: number): void {
    this.currentState = 'ANALYZING';
    this.isEditing = false;
    this.confirmSuccess = false;

    this.planningAiService.parsePrompt(
      prompt,
      forceAction,
      this.activeConversationId || undefined,
      productId,
      establishmentId
    ).subscribe({
      next: (res) => {
        this.parsedData = res;
        if (res.conversation_id) {
          this.activeConversationId = res.conversation_id;
        }
        this.copiloteMessage = res.message || 'Demande analysée.';

        if (res.status === 'success' && res.detected_product) {
          this.currentState = 'READY';
          this.initEditForm();
        } else if (res.status === 'order_requested' && res.detected_product) {
          this.currentState = 'READY';
          this.orderDish(res.detected_product, res.quantite || 1);
          return;
        } else if (
          res.status === 'ambiguous' ||
          res.status === 'food_search' ||
          res.status === 'restaurant_search' ||
          res.status === 'category_search' ||
          res.status === 'food_recommendation' ||
          res.status === 'greeting' ||
          res.status === 'capabilities' ||
          res.status === 'general_conversation' ||
          res.status === 'budget_discovery' ||
          res.status === 'food_help' ||
          res.status === 'restaurant_selected' ||
          res.status === 'planning_created'
        ) {
          this.currentState = 'READY';
        } else if (res.status === 'out_of_scope' || res.status === 'app_help' || res.status === 'missing_info' || res.status === 'declined') {
          this.currentState = 'WAITING_FOR_INFORMATION';
        } else {
          this.currentState = 'READY';
        }

        this.chatMessages.push({
          role: 'ASSISTANT',
          text: res.message,
          parsedData: res,
          timestamp: new Date()
        });
        this.scrollToBottom();
      },
      error: () => {
        this.currentState = 'ERROR';
        this.errorMessage = 'Erreur de communication avec le serveur.';
      }
    });
  }

  selectRestaurant(est: any): void {
    const promptText = `Je sélectionne ${est.nom}`;
    this.chatMessages.push({
      role: 'USER',
      text: promptText,
      timestamp: new Date()
    });
    this.scrollToBottom();

    this.parseTextPrompt(promptText, 'SELECT_RESTAURANT', est.product_id, est.id);
  }

  selectCategory(cat: any): void {
    const promptText = cat.nom;
    this.chatMessages.push({
      role: 'USER',
      text: promptText,
      timestamp: new Date()
    });
    this.scrollToBottom();

    this.parseTextPrompt(promptText);
  }

  triggerSuggestedAction(actionItem: SuggestedAction, messageItem?: ChatMessage): void {
    if (actionItem.action === 'CREATE_PLANNING') {
      const promptToUse = messageItem?.text || this.userPromptText || 'planifie ce repas';
      this.parseTextPrompt(promptToUse, 'CREATE_PLANNING');
    } else if (actionItem.action === 'RESTAURANT_SEARCH') {
      const promptToUse = 'Voir les restaurants';
      this.chatMessages.push({
        role: 'USER',
        text: promptToUse,
        timestamp: new Date()
      });
      this.scrollToBottom();
      this.parseTextPrompt(promptToUse, 'RESTAURANT_SEARCH');
    } else if (actionItem.action === 'CONFIRM_PLANNING') {
      const promptToUse = 'Oui, planifier';
      this.chatMessages.push({
        role: 'USER',
        text: promptToUse,
        timestamp: new Date()
      });
      this.scrollToBottom();
      this.parseTextPrompt(promptToUse, 'CONFIRM_PLANNING');
    } else if (actionItem.action === 'DECLINE_PLANNING') {
      const promptToUse = 'Non';
      this.chatMessages.push({
        role: 'USER',
        text: promptToUse,
        timestamp: new Date()
      });
      this.scrollToBottom();
      this.parseTextPrompt(promptToUse, 'DECLINE_PLANNING');
    } else if (actionItem.action === 'BACK_TO_RESTAURANTS') {
      const promptToUse = 'Retour aux restaurants';
      this.chatMessages.push({
        role: 'USER',
        text: promptToUse,
        timestamp: new Date()
      });
      this.scrollToBottom();
      this.parseTextPrompt(promptToUse, 'BACK_TO_RESTAURANTS');
    } else if (actionItem.action === 'SHOW_RESTAURANT_DISHES') {
      const promptToUse = 'Voir ses plats';
      this.chatMessages.push({
        role: 'USER',
        text: promptToUse,
        timestamp: new Date()
      });
      this.scrollToBottom();
      this.parseTextPrompt(promptToUse, 'SHOW_RESTAURANT_DISHES');
    } else if (actionItem.action === 'VIEW_PLANNING') {
      this.router.navigate(['/planning']);
    } else if (actionItem.action === 'VIEW_CART') {
      this.router.navigate(['/cart']);
    } else if (actionItem.action === 'CONTINUE' || actionItem.action === 'FOOD_SEARCH') {
      this.currentState = 'READY';
    }
  }

  // --- CATALOG DISCOVERY & PAGINATION (VOIR PLUS) ---

  getMsgKey(msg: ChatMessage, prefix: string): string {
    return prefix + '_' + (msg.id || this.chatMessages.indexOf(msg));
  }

  getMsgSearchQuery(msg: ChatMessage, prefix: string): string {
    return this.msgSearchQueryMap[this.getMsgKey(msg, prefix)] || '';
  }

  setMsgSearchQuery(msg: ChatMessage, prefix: string, value: string): void {
    this.msgSearchQueryMap[this.getMsgKey(msg, prefix)] = value;
  }

  getFilteredProducts(msg: ChatMessage): DetectedProduct[] {
    const products = msg.parsedData?.matching_products || [];
    const q = this.getMsgSearchQuery(msg, 'prod').toLowerCase().trim();
    if (!q) return products;
    return products.filter(p =>
      p.nom.toLowerCase().includes(q) ||
      (p.etablissement_nom && p.etablissement_nom.toLowerCase().includes(q)) ||
      (p.prix_formate && p.prix_formate.toLowerCase().includes(q))
    );
  }

  getFilteredEstablishments(msg: ChatMessage): DetectedEstablishment[] {
    const ests = msg.parsedData?.matching_establishments || [];
    const q = this.getMsgSearchQuery(msg, 'est').toLowerCase().trim();
    if (!q) return ests;
    return ests.filter(e =>
      e.nom.toLowerCase().includes(q) ||
      (e.adresse && e.adresse.toLowerCase().includes(q)) ||
      (e.produit_propose && e.produit_propose.toLowerCase().includes(q))
    );
  }

  selectDishFromSearch(prod: DetectedProduct): void {
    const promptText = `Je veux planifier ${prod.nom} de chez ${prod.etablissement_nom || 'le restaurant'}`;
    this.chatMessages.push({
      role: 'USER',
      text: promptText,
      timestamp: new Date()
    });
    this.scrollToBottom();
    this.parseTextPrompt(promptText, 'CREATE_PLANNING', prod.id, prod.etablissement_id);
  }

  // --- GESTION DU PANIER & RÈGLES MULTI-ÉTABLISSEMENT ---

  orderDish(prod: DetectedProduct, quantity: number = 1): void {
    if (!prod || !prod.id) return;
    if (this.isOrderingMap[prod.id]) return;

    this.isOrderingMap[prod.id] = true;

    const dishObj: Dish = {
      id: prod.id,
      name: prod.nom,
      description: prod.description || '',
      price: prod.prix,
      imageUrl: prod.image_url || 'assets/images/thieboudienne.jpg',
      restaurantId: prod.etablissement_id,
      restaurantName: prod.etablissement_nom || 'AYYOU',
      est_disponible: true,
      prix_base: prod.prix
    } as unknown as Dish;

    this.cartService.addToCart(dishObj, quantity).subscribe({
      next: (res) => {
        this.isOrderingMap[prod.id] = false;
        const prodName = prod.nom;
        const qtyStr = quantity > 1 ? ` (${quantity})` : '';
        const successMsg = `🛒 **${prodName}${qtyStr}** a été ajouté à votre panier avec succès !`;

        this.chatMessages.push({
          role: 'ASSISTANT',
          text: successMsg,
          parsedData: {
            status: 'cart_added',
            message: successMsg,
            detected_product: prod,
            suggested_actions: [
              { label: '🛍️ Voir le panier', action: 'VIEW_CART' },
              { label: 'Continuer', action: 'CONTINUE' }
            ]
          },
          timestamp: new Date()
        });
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        this.isOrderingMap[prod.id] = false;
        const errorData = err.error || err;
        const detailStr = JSON.stringify(errorData).toLowerCase();

        if (
          errorData?.code === 'CART_DIFFERENT_ESTABLISHMENT' ||
          detailStr.includes('établissement') ||
          detailStr.includes('autre établissement')
        ) {
          this.pendingReplaceCartDish = prod;
          this.pendingReplaceCartQuantity = quantity;
          this.showReplaceCartModal = true;
        } else {
          const errorMsg = errorData?.detail || errorData?.message || "Ce plat n'est malheureusement plus disponible actuellement.";
          this.chatMessages.push({
            role: 'ASSISTANT',
            text: `⚠️ ${errorMsg}`,
            timestamp: new Date()
          });
          setTimeout(() => this.scrollToBottom(), 100);
        }
      }
    });
  }

  confirmReplaceCart(): void {
    if (!this.pendingReplaceCartDish) return;
    const prod = this.pendingReplaceCartDish;
    const qty = this.pendingReplaceCartQuantity;
    this.showReplaceCartModal = false;
    this.pendingReplaceCartDish = null;

    this.cartService.clearCart().subscribe(() => {
      this.orderDish(prod, qty);
    });
  }

  cancelReplaceCart(): void {
    this.showReplaceCartModal = false;
    this.pendingReplaceCartDish = null;
    this.chatMessages.push({
      role: 'ASSISTANT',
      text: 'Ajout au panier annulé. Votre panier existant a été conservé.',
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  openProductDetailInCopilot(prod: DetectedProduct): void {
    if (!prod) return;
    this.selectedProductDetail = prod;
    this.isViewingProductDetail = true;

    if (prod.id) {
      this.planningAiService.parsePrompt('', 'GET_PRODUCT_DETAIL', this.activeConversationId || undefined, prod.id).subscribe({
        next: (res) => {
          if (res && res.detected_product) {
            this.selectedProductDetail = {
              ...this.selectedProductDetail,
              ...res.detected_product
            };
          }
        }
      });
    }
  }

  goToProductDetail(prod: DetectedProduct): void {
    this.openProductDetailInCopilot(prod);
  }

  closeProductDetailInCopilot(): void {
    this.isViewingProductDetail = false;
    this.selectedProductDetail = null;
    setTimeout(() => this.scrollToBottom(), 50);
  }

  orderDishFromSearch(prod: DetectedProduct): void {
    this.orderDish(prod, 1);
  }

  loadMoreProducts(msg: ChatMessage): void {
    if (!msg.parsedData) return;
    const key = this.getMsgKey(msg, 'prod');
    const limit = msg.parsedData.limit || 6;
    const nextOffset = msg.parsedData.matching_products ? msg.parsedData.matching_products.length : 0;

    this.isLoadingMoreMap[key] = true;

    const promptText = msg.parsedData.user_text || msg.text || 'rechercher des plats';
    this.planningAiService.parsePrompt(
      promptText,
      'FOOD_SEARCH',
      this.activeConversationId || undefined,
      undefined,
      undefined,
      nextOffset,
      limit
    ).subscribe({
      next: (res) => {
        this.isLoadingMoreMap[key] = false;
        if (res.matching_products && res.matching_products.length > 0 && msg.parsedData) {
          const existingIds = new Set((msg.parsedData.matching_products || []).map(p => p.id));
          const newProducts = res.matching_products.filter(p => !existingIds.has(p.id));
          msg.parsedData.matching_products = [
            ...(msg.parsedData.matching_products || []),
            ...newProducts
          ];
          msg.parsedData.has_more = res.has_more;
          msg.parsedData.offset = res.offset;
          msg.parsedData.total_count = res.total_count;
        } else if (msg.parsedData) {
          msg.parsedData.has_more = false;
        }
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.isLoadingMoreMap[key] = false;
      }
    });
  }

  loadMoreEstablishments(msg: ChatMessage): void {
    if (!msg.parsedData) return;
    const key = this.getMsgKey(msg, 'est');
    const limit = msg.parsedData.limit || 6;
    const nextOffset = msg.parsedData.matching_establishments ? msg.parsedData.matching_establishments.length : 0;

    this.isLoadingMoreMap[key] = true;

    const promptText = msg.parsedData.user_text || msg.text || 'Voir les restaurants';
    this.planningAiService.parsePrompt(
      promptText,
      'RESTAURANT_SEARCH',
      this.activeConversationId || undefined,
      undefined,
      undefined,
      nextOffset,
      limit
    ).subscribe({
      next: (res) => {
        this.isLoadingMoreMap[key] = false;
        if (res.matching_establishments && res.matching_establishments.length > 0 && msg.parsedData) {
          const existingIds = new Set((msg.parsedData.matching_establishments || []).map(e => e.id));
          const newEsts = res.matching_establishments.filter(e => !existingIds.has(e.id));
          msg.parsedData.matching_establishments = [
            ...(msg.parsedData.matching_establishments || []),
            ...newEsts
          ];
          msg.parsedData.has_more = res.has_more;
          msg.parsedData.offset = res.offset;
          msg.parsedData.total_count = res.total_count;
        } else if (msg.parsedData) {
          msg.parsedData.has_more = false;
        }
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.isLoadingMoreMap[key] = false;
      }
    });
  }

  // --- VOCAL (WHISPER / MICROPHONE) ---

  private transcriptionRequestId: number = 0;

  async toggleVoiceRecording(): Promise<void> {
    if (this.voiceService.isRecordingNow()) {
      const currentReqId = ++this.transcriptionRequestId;
      this.currentState = 'TRANSCRIBING';
      const { blob } = await this.voiceService.stopRecording();
      if (blob) {
        this.voiceService.transcribeAudio(blob).subscribe({
          next: (res) => {
            if (currentReqId !== this.transcriptionRequestId) return;
            this.currentState = 'IDLE';
            const transcribedText = res.transcription || res.text;
            if (res.status === 'success' && transcribedText && transcribedText.trim()) {
              this.inputPrompt = transcribedText.trim();
            } else {
              this.chatMessages.push({
                role: 'ASSISTANT',
                text: 'Je n’ai pas réussi à comprendre votre message vocal. Pouvez-vous réessayer ?',
                timestamp: new Date()
              });
              setTimeout(() => this.scrollToBottom(), 100);
            }
          },
          error: (err) => {
            if (currentReqId !== this.transcriptionRequestId) return;
            this.currentState = 'IDLE';
            this.chatMessages.push({
              role: 'ASSISTANT',
              text: 'Je n’ai pas réussi à comprendre votre message vocal. Pouvez-vous réessayer ?',
              timestamp: new Date()
            });
            setTimeout(() => this.scrollToBottom(), 100);
          }
        });
      } else {
        this.currentState = 'IDLE';
      }
    } else {
      const hasPerm = await this.voiceService.requestMicrophonePermission();
      if (!hasPerm) {
        alert('L\'accès au microphone est requis pour utiliser la commande vocale.');
        return;
      }
      this.transcriptionRequestId++;
      const started = await this.voiceService.startRecording();
      if (started) {
        this.currentState = 'LISTENING';
      }
    }
  }

  cancelTranscription(): void {
    this.transcriptionRequestId++;
    if (this.voiceService.isRecordingNow()) {
      this.voiceService.stopRecording();
    }
    this.currentState = 'IDLE';
  }

  isRecording(): boolean {
    return this.voiceService.isRecordingNow();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatScrollContainer && this.chatScrollContainer.nativeElement) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  // --- ÉDITION & CONFIRMATION PLANNING ---

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initEditForm();
      this.loadEstablishments();
      const restoId = this.parsedData?.detected_establishment?.id ? String(this.parsedData.detected_establishment.id) : undefined;
      this.loadDishes(restoId);
    } else {
      this.isEstablishmentDropdownOpen = false;
      this.isDishDropdownOpen = false;
    }
  }

  // --- SÉLECTEUR JOUR & HEURE AYYOU COMPACT (ÉTAPE 5 REFINEMENT) ---

  toggleCalendarPopover(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showTimePopover = false;
    this.showCalendarPopover = !this.showCalendarPopover;
    if (this.showCalendarPopover) {
      this.generateCalendarGrid();
    }
  }

  toggleTimePopover(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showCalendarPopover = false;
    this.showTimePopover = !this.showTimePopover;
  }

  generateCalendarGrid(): void {
    const year = this.currentCalDate.getFullYear();
    const month = this.currentCalDate.getMonth();

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    this.currentCalMonthName = monthNames[month];
    this.currentCalYear = year;

    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = (firstDay + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid: Array<{ day: number | null; dateStr: string; isDisabled: boolean; isTodayOrSelected: boolean }> = [];

    for (let i = 0; i < startOffset; i++) {
      grid.push({ day: null, dateStr: '', isDisabled: true, isTodayOrSelected: false });
    }

    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const isDisabled = cellDate < today;
      const isSelected = dateStr === this.pickerSelectedDate;

      grid.push({
        day: day,
        dateStr: dateStr,
        isDisabled: isDisabled,
        isTodayOrSelected: isSelected
      });
    }

    this.calDaysGrid = grid;
  }

  prevMonth(): void {
    if (this.isPrevMonthDisabled()) return;
    this.currentCalDate = new Date(this.currentCalDate.getFullYear(), this.currentCalDate.getMonth() - 1, 1);
    this.generateCalendarGrid();
  }

  nextMonth(): void {
    this.currentCalDate = new Date(this.currentCalDate.getFullYear(), this.currentCalDate.getMonth() + 1, 1);
    this.generateCalendarGrid();
  }

  isPrevMonthDisabled(): boolean {
    const today = new Date();
    const currentFirst = new Date(this.currentCalDate.getFullYear(), this.currentCalDate.getMonth(), 1);
    const todayFirst = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentFirst <= todayFirst;
  }

  selectCalendarDay(dayObj: any, msg?: ChatMessage): void {
    if (dayObj.isDisabled || !dayObj.day) return;

    this.pickerSelectedDate = dayObj.dateStr;
    this.pickerFormattedShortDate = this.formatShortDate(this.pickerSelectedDate);
    this.pickerFormattedDateLabel = this.formatFrenchDate(this.pickerSelectedDate);
    this.showCalendarPopover = false;

    this.generateCalendarGrid();
    this.checkAndSyncSelectedDateTime(msg);
  }

  selectHour(h: string): void {
    this.selectedHour = h;
  }

  selectMinute(m: string): void {
    this.selectedMinute = m;
  }

  confirmTimeSelection(msg?: ChatMessage): void {
    this.pickerSelectedTime = `${this.selectedHour}:${this.selectedMinute}`;
    this.showTimePopover = false;
    this.checkAndSyncSelectedDateTime(msg);
  }

  formatShortDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const shortMonths = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    const dayPadded = String(day).padStart(2, '0');
    return `${dayPadded} ${shortMonths[month]}`;
  }

  formatFrenchDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = d.toLocaleDateString('fr-FR', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  getCreneauFromTime(timeStr: string): 'MATIN' | 'MIDI' | 'SOIR' | 'EN_CAS' {
    if (!timeStr) return 'MIDI';
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour < 11) return 'MATIN';
    if (hour >= 11 && hour <= 15) return 'MIDI';
    if (hour >= 16 && hour <= 21) return 'SOIR';
    return 'EN_CAS';
  }

  checkAndSyncSelectedDateTime(msg?: ChatMessage): void {
    if (!this.pickerSelectedDate || !this.pickerSelectedTime) return;

    const dateLabel = this.pickerFormattedDateLabel || this.pickerSelectedDate;
    const timeLabel = this.pickerSelectedTime;
    const creneau = this.getCreneauFromTime(this.pickerSelectedTime);

    const datetimeObj = {
      date_iso: this.pickerSelectedDate,
      date_label: dateLabel,
      time_label: timeLabel,
      creneau: creneau
    };

    if (msg && msg.parsedData) {
      msg.parsedData.detected_datetime = datetimeObj;
      msg.parsedData.intent = 'MEAL_PLANNING';
      msg.parsedData.status = 'success';
    }

    if (this.parsedData) {
      this.parsedData.detected_datetime = datetimeObj;
      this.parsedData.intent = 'MEAL_PLANNING';
      this.parsedData.status = 'success';
    }

    if (this.isEditing) {
      this.editForm.dateIso = this.pickerSelectedDate;
      this.editForm.dateLabel = dateLabel;
      this.editForm.timeLabel = timeLabel;
    }
  }

  initEditForm(): void {
    if (this.parsedData?.detected_product) {
      this.editForm.nomProduit = this.parsedData.detected_product.nom;
      this.editForm.nomEtablissement = this.parsedData.detected_establishment?.nom || this.parsedData.detected_product.etablissement_nom || '';
      this.editForm.dateIso = this.parsedData.detected_datetime?.date_iso || '';
      this.editForm.dateLabel = this.parsedData.detected_datetime?.date_label || '';
      this.editForm.timeLabel = this.parsedData.detected_datetime?.time_label || '';
      this.editForm.options = this.parsedData.detected_options || '';

      if (this.parsedData.detected_datetime?.date_iso) {
        this.pickerSelectedDate = this.parsedData.detected_datetime.date_iso;
        this.pickerFormattedShortDate = this.formatShortDate(this.pickerSelectedDate);
        this.pickerFormattedDateLabel = this.parsedData.detected_datetime.date_label || this.formatFrenchDate(this.pickerSelectedDate);
      }
      if (this.parsedData.detected_datetime?.time_label) {
        this.pickerSelectedTime = this.parsedData.detected_datetime.time_label;
        const timeParts = this.pickerSelectedTime.split(':');
        if (timeParts.length === 2) {
          this.selectedHour = timeParts[0].padStart(2, '0');
          this.selectedMinute = timeParts[1].padStart(2, '0');
        }
      }
    }
  }

  toggleEstablishmentDropdown(): void {
    this.isEstablishmentDropdownOpen = !this.isEstablishmentDropdownOpen;
    this.isDishDropdownOpen = false;
    if (this.isEstablishmentDropdownOpen && this.allEstablishments.length === 0) {
      this.loadEstablishments();
    }
  }

  loadEstablishments(query?: string): void {
    this.isLoadingEstablishments = true;
    this.clientDataService.getRestaurants({ search: query }).subscribe(data => {
      this.allEstablishments = data;
      this.onEstablishmentSearchChange();
      this.isLoadingEstablishments = false;
    });
  }

  onEstablishmentSearchChange(): void {
    const q = (this.establishmentSearchQuery || '').toLowerCase().trim();
    if (!q) {
      this.filteredEstablishments = this.allEstablishments;
    } else {
      this.filteredEstablishments = this.allEstablishments.filter(e =>
        e.name.toLowerCase().includes(q) || (e.location && e.location.toLowerCase().includes(q))
      );
    }
  }

  selectEstablishment(resto: Restaurant): void {
    this.editForm.nomEtablissement = resto.name;
    if (this.parsedData) {
      if (!this.parsedData.detected_establishment) {
        this.parsedData.detected_establishment = { id: Number(resto.id), nom: resto.name, adresse: resto.location };
      } else {
        this.parsedData.detected_establishment.id = Number(resto.id);
        this.parsedData.detected_establishment.nom = resto.name;
        this.parsedData.detected_establishment.adresse = resto.location;
      }
      if (this.parsedData.detected_product) {
        this.parsedData.detected_product.etablissement_id = Number(resto.id);
        this.parsedData.detected_product.etablissement_nom = resto.name;
        this.parsedData.detected_product.etablissement_adresse = resto.location;
      }
    }
    this.isEstablishmentDropdownOpen = false;
    this.loadDishes(resto.id);
  }

  toggleDishDropdown(): void {
    this.isDishDropdownOpen = !this.isDishDropdownOpen;
    this.isEstablishmentDropdownOpen = false;
    if (this.isDishDropdownOpen && this.allDishes.length === 0) {
      const restoId = this.parsedData?.detected_establishment?.id ? String(this.parsedData.detected_establishment.id) : undefined;
      this.loadDishes(restoId);
    }
  }

  loadDishes(establishmentId?: string, query?: string): void {
    this.isLoadingDishes = true;
    this.clientDataService.getDishes({ establishmentId, search: query }).subscribe(data => {
      this.allDishes = data;
      this.onDishSearchChange();
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

  selectDish(dish: Dish): void {
    this.editForm.nomProduit = dish.name;
    if (this.parsedData?.detected_product) {
      this.parsedData.detected_product.id = Number(dish.id);
      this.parsedData.detected_product.nom = dish.name;
      this.parsedData.detected_product.prix = dish.price;
      this.parsedData.detected_product.prix_formate = (dish.price || 0).toLocaleString('fr-FR') + ' FCFA';
      this.parsedData.detected_product.image_url = dish.imageUrl;
      this.parsedData.detected_product.etablissement_id = Number(dish.restaurantId);
      this.parsedData.detected_product.etablissement_nom = dish.restaurantName;
    }

    if (dish.restaurantName) {
      this.editForm.nomEtablissement = dish.restaurantName;
      if (this.parsedData) {
        if (!this.parsedData.detected_establishment) {
          this.parsedData.detected_establishment = {
            id: Number(dish.restaurantId),
            nom: dish.restaurantName,
            adresse: ''
          };
        } else {
          this.parsedData.detected_establishment.id = Number(dish.restaurantId);
          this.parsedData.detected_establishment.nom = dish.restaurantName;
        }
      }
    }

    this.isDishDropdownOpen = false;
  }

  saveEdit(): void {
    if (this.parsedData?.detected_product) {
      this.parsedData.detected_product.nom = this.editForm.nomProduit;
      if (this.parsedData.detected_establishment) {
        this.parsedData.detected_establishment.nom = this.editForm.nomEtablissement;
      }
      if (this.parsedData.detected_datetime) {
        this.parsedData.detected_datetime.date_label = this.editForm.dateLabel;
        this.parsedData.detected_datetime.time_label = this.editForm.timeLabel;
      }
      this.parsedData.detected_options = this.editForm.options;
    }
    this.isEditing = false;
    this.isEstablishmentDropdownOpen = false;
    this.isDishDropdownOpen = false;
  }

  confirmPlanning(): void {
    if (!this.parsedData?.detected_product) return;

    if (!this.authService.requireAuth({
      title: 'Connexion requise',
      message: 'Veuillez vous connecter pour enregistrer un repas dans votre planning.',
      actionType: 'order',
      returnUrl: '/planning/ai'
    })) {
      return;
    }

    this.isConfirming = true;

    const payload = {
      produit: this.parsedData.detected_product.id,
      etablissement: this.parsedData.detected_establishment?.id || this.parsedData.detected_product.etablissement_id,
      date_planifiee: this.parsedData.detected_datetime?.date_iso || new Date().toISOString().split('T')[0],
      creneau: this.parsedData.detected_datetime?.creneau || 'MIDI',
      prix_total: this.parsedData.detected_product.prix,
      quantite: 1,
      instructions: this.parsedData.detected_options || ''
    };

    this.planningAiService.confirmPlanning(payload).subscribe({
      next: () => {
        this.isConfirming = false;
        this.confirmSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/planning']);
        }, 1200);
      },
      error: (err) => {
        this.isConfirming = false;
        alert('Erreur lors de la création du planning : ' + (err.error?.detail || 'Veuillez réessayer.'));
      }
    });
  }
}

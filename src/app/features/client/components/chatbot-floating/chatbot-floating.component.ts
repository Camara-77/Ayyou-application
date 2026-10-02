import { Component, HostListener, OnInit, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiChatService, ChatMessage, RecommendationCard } from '../../../../core/services/ai-chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VoiceTranscriptionService } from '../../../../core/services/voice-transcription.service';

@Component({
  selector: 'app-chatbot-floating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-floating.component.html',
  styleUrls: ['./chatbot-floating.component.scss']
})
export class ChatbotFloatingComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private aiChatService = inject(AiChatService);
  private voiceService = inject(VoiceTranscriptionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  badgeCount: number = 1;
  isOpen: boolean = false;
  isLoading: boolean = false;
  isRecording: boolean = false;
  isTranscribing: boolean = false;
  userInput: string = '';

  quotaUsed: number = 0;
  quotaMax: number = 7;
  isQuotaExceeded: boolean = false;
  timeRemainingFormatted: string = '';

  messages: ChatMessage[] = [];
  private shouldScrollBottom: boolean = false;

  // Dragging state
  isDragging: boolean = false;
  hasDragged: boolean = false;

  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private initialPosX: number = 0;
  private initialPosY: number = 0;

  posX: number = 16;
  posY: number = 140;

  get isClientInterface(): boolean {
    const url = this.router.url.toLowerCase();
    const isNonClientRoute =
      url.startsWith('/pro') ||
      url.startsWith('/vendeur') ||
      url.startsWith('/delivery') ||
      url.startsWith('/livreur') ||
      url.startsWith('/admin') ||
      url.startsWith('/login') ||
      url.startsWith('/register') ||
      url.startsWith('/onboarding') ||
      url.startsWith('/verify-otp') ||
      url.startsWith('/reset-password');

    const isVideoFeed =
      url === '/' ||
      url === '/home' ||
      url.startsWith('/feed') ||
      url.startsWith('/video');

    return !isNonClientRoute && !isVideoFeed;
  }

  ngOnInit(): void {

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 440;
    const containerWidth = 440;
    const initialLeft = Math.max(16, (screenWidth - containerWidth) / 2 + 16);
    this.posX = initialLeft;
    this.posY = 140;

    // Welcome message initialization
    this.messages.push({
      id: 'welcome',
      sender: 'ai',
      text: 'Bonjour ! Je suis votre Conseiller Gastronomique AYYOU 🇸🇳. Vous pouvez m’écrire ou cliquer sur le micro 🎙️ pour me parler ! Que souhaitez-vous déguster à Dakar aujourd’hui ?',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom) {
      this.scrollToBottom();
      this.shouldScrollBottom = false;
    }
  }

  toggleChat(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.hasDragged) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.badgeCount = 0;
        this.shouldScrollBottom = true;
      }
    }
  }

  async toggleVoiceRecording(): Promise<void> {
    if (this.isLoading || this.isTranscribing) return;

    if (this.isRecording) {
      // Arrêt de l'enregistrement et envoi pour transcription
      this.isRecording = false;
      this.isTranscribing = true;

      const { blob: audioBlob, durationMs } = await this.voiceService.stopRecording();
      if (durationMs < 600 || !audioBlob || audioBlob.size < 500) {
        this.isTranscribing = false;
        return;
      }

      this.voiceService.transcribeAudio(audioBlob).subscribe({
        next: (res) => {
          this.isTranscribing = false;
          if (res.status === 'success' && res.text) {
            this.userInput = res.text;
            // Envoi automatique de la recherche transcrite au chatbot IA
            this.sendMessage();
          } else {
            this.messages.push({
              sender: 'ai',
              text: res.message || "Désolé, je n'ai pas pu comprendre votre message vocal. N'hésitez pas à me réenregistrer ou à l'écrire au clavier.",
              timestamp: new Date()
            });
            this.shouldScrollBottom = true;
          }
        },
        error: (err) => {
          this.isTranscribing = false;
          this.messages.push({
            sender: 'ai',
            text: "Désolé, une erreur technique est survenue lors de la transcription. Vous pouvez saisir votre demande au clavier.",
            timestamp: new Date()
          });
          this.shouldScrollBottom = true;
        }
      });
    } else {
      // Démarrage de l'enregistrement
      const success = await this.voiceService.startRecording();
      if (success) {
        this.isRecording = true;
      } else {
        this.messages.push({
          sender: 'ai',
          text: "L'accès au microphone n'a pas pu être activé. Veuillez vérifier les autorisations de votre navigateur.",
          timestamp: new Date()
        });
        this.shouldScrollBottom = true;
      }
    }
  }

  sendMessage(): void {
    const query = this.userInput.trim();
    if (!query || this.isLoading) return;

    // Add User Message
    this.messages.push({
      sender: 'user',
      text: query,
      timestamp: new Date()
    });

    this.userInput = '';
    this.isLoading = true;
    this.shouldScrollBottom = true;

    // Build history payload for contextual memory
    const historyPayload = this.messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ sender: m.sender, text: m.text }));

    // Call Backend AI Service
    this.aiChatService.sendMessage(query, historyPayload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.quota_used !== undefined) {
          this.quotaUsed = res.quota_used;
        }
        if (res.quota_max !== undefined) {
          this.quotaMax = res.quota_max;
        }
        if (res.is_quota_exceeded !== undefined) {
          this.isQuotaExceeded = res.is_quota_exceeded;
        }
        if (res.formatted_time_remaining) {
          this.timeRemainingFormatted = res.formatted_time_remaining;
        }

        this.messages.push({
          sender: 'ai',
          text: res.reply,
          cards: res.cards || [],
          timestamp: new Date()
        });
        this.shouldScrollBottom = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.messages.push({
          sender: 'ai',
          text: 'Désolé, une erreur est survenue lors de la recherche. Veuillez réessayer.',
          timestamp: new Date()
        });
        this.shouldScrollBottom = true;
      }
    });
  }

  viewEstablishmentMenu(card: RecommendationCard): void {
    this.isOpen = false;
    if (card.etablissement_id) {
      this.router.navigate(['/restaurant', card.etablissement_id]);
    }
  }

  orderProduct(card: RecommendationCard): void {
    const isAuth = this.authService.requireAuth({
      title: 'Connectez-vous pour commander',
      message: `Connectez-vous ou créez un compte pour commander le plat "${card.nom}".`,
      actionType: 'cart',
      actionPayload: { productId: card.produit_id }
    });

    if (isAuth) {
      this.isOpen = false;
      this.router.navigate(['/product', card.produit_id]);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  // --- MOUSE DRAG ---
  onMouseDown(event: MouseEvent): void {
    this.startDrag(event.clientX, event.clientY);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.moveDrag(event.clientX, event.clientY);
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.endDrag();
  }

  // --- TOUCH DRAG ---
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startDrag(touch.clientX, touch.clientY);
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.isDragging && event.touches.length === 1) {
      const touch = event.touches[0];
      this.moveDrag(touch.clientX, touch.clientY);
    }
  }

  @HostListener('window:touchend')
  onTouchEnd(): void {
    this.endDrag();
  }

  private startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.hasDragged = false;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.initialPosX = this.posX;
    this.initialPosY = this.posY;
  }

  private moveDrag(clientX: number, clientY: number): void {
    const deltaX = clientX - this.dragStartX;
    const deltaY = clientY - this.dragStartY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      this.hasDragged = true;
    }

    let newX = this.initialPosX + deltaX;
    let newY = this.initialPosY + deltaY;

    const btnSize = 54;
    const maxX = (typeof window !== 'undefined' ? window.innerWidth : 440) - btnSize - 10;
    const maxY = (typeof window !== 'undefined' ? window.innerHeight : 800) - btnSize - 10;

    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(10, Math.min(newY, maxY));

    this.posX = newX;
    this.posY = newY;
  }

  private endDrag(): void {
    if (this.isDragging) {
      this.isDragging = false;
      setTimeout(() => {
        this.hasDragged = false;
      }, 100);
    }
  }
}

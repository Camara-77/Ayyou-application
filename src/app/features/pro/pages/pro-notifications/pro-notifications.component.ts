import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';

export interface ProNotificationItem {
  id: string;
  type: 'ORDER' | 'ORDER_READY' | 'CLIENT_MESSAGE' | 'PAYMENT' | 'SUBSCRIPTION' | 'SYSTEM';
  title: string;
  subtitle?: string;
  message: string;
  timeFormatted: string;
  isRead: boolean;
  isPinned: boolean;
  priority: 'high' | 'normal';
  orderRef?: string;
  avatarBg?: string;
  avatarText?: string;
  statusBadgeText?: string;
  statusBadgeClass?: string;
  footerLeftText?: string;
  footerLeftClass?: string;
  footerActionText?: string;
  footerActionClass?: string;
}

@Component({
  selector: 'app-pro-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-notifications.component.html',
  styleUrls: ['./pro-notifications.component.scss']
})
export class ProNotificationsComponent implements OnInit {
  searchQuery: string = '';
  notifications: ProNotificationItem[] = [];
  filteredNotifications: ProNotificationItem[] = [];

  ngOnInit(): void {
    this.notifications = [
      {
        id: 'notif-sub-1',
        type: 'SUBSCRIPTION',
        isPinned: true,
        isRead: false,
        priority: 'high',
        title: 'Paiement de l\'abonnement AYYOU PRO',
        subtitle: 'Renouvellement mensuel — Épinglé',
        timeFormatted: "Aujourd'hui",
        message: 'Votre abonnement AYYOU PRO (Formule Restaurant Gourmet) a été renouvelé avec succès. Facture disponible.',
        avatarBg: '#FFF1F2',
        avatarText: 'AY',
        statusBadgeText: 'Épinglé',
        statusBadgeClass: 'badge-pinned',
        footerLeftText: 'Statut : Actif',
        footerLeftClass: 'text-green',
        footerActionText: 'Voir la facture',
        footerActionClass: 'btn-text-link'
      },
      {
        id: 'notif-ord-1',
        type: 'ORDER_READY',
        isPinned: false,
        isRead: false,
        priority: 'high',
        title: 'Chez Loutcha',
        subtitle: 'Commande #AY-9482 • En cours',
        timeFormatted: "À l'instant",
        message: 'Votre commande est prête au comptoir de retrait.',
        avatarBg: '#FEF3C7',
        avatarText: 'CL',
        footerLeftText: 'À retirer avant 13h15',
        footerLeftClass: 'text-red-bold',
        footerActionText: 'Voir le QR Code',
        footerActionClass: 'btn-red-pill'
      },
      {
        id: 'notif-client-1',
        type: 'CLIENT_MESSAGE',
        isPinned: false,
        isRead: true,
        priority: 'normal',
        title: 'La Fourchette Dakar',
        subtitle: 'Service Relations Clientèle',
        timeFormatted: 'Hier, 20h25',
        message: '« Merci pour votre fidélité Moussa ! Votre commande spéciale a été préparée avec soin. Nous espérons vous revoir très bientôt sur l\'application AYYOU. »',
        avatarBg: '#1A1A1A',
        avatarText: 'LF',
        footerLeftText: 'Livré à l\'habitation',
        footerLeftClass: 'badge-green-pill',
        footerActionText: 'Contacter',
        footerActionClass: 'btn-pink-pill'
      },
      {
        id: 'notif-cc-1',
        type: 'ORDER',
        isPinned: false,
        isRead: true,
        priority: 'normal',
        title: 'Click & Collect #AY-9482',
        subtitle: 'Validé',
        timeFormatted: '13h15',
        message: 'Votre code de retrait a été validé au comptoir de Chez Loutcha. Facture archivée automatiquement.',
        avatarBg: '#FFF1F2',
        avatarText: 'CC',
        statusBadgeText: 'Validé',
        statusBadgeClass: 'badge-green',
        footerActionText: 'Voir reçu',
        footerActionClass: 'btn-text-link'
      },
      {
        id: 'notif-new-1',
        type: 'ORDER',
        isPinned: false,
        isRead: false,
        priority: 'high',
        title: 'Nouvelle commande reçue',
        subtitle: 'Commande #AY-9490 • 3 articles',
        timeFormatted: 'Il y a 5 min',
        message: 'Nouvelle commande de Fatou Sall (5 500 FCFA). Veuillez valider la préparation.',
        avatarBg: '#E0F2FE',
        avatarText: 'NC',
        footerLeftText: '5 500 FCFA',
        footerLeftClass: 'text-dark-bold',
        footerActionText: 'Voir la commande',
        footerActionClass: 'btn-red-pill'
      }
    ];

    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredNotifications = [...this.notifications].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      return;
    }

    const q = this.searchQuery.toLowerCase().trim();
    this.filteredNotifications = this.notifications.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
      n.message.toLowerCase().includes(q) ||
      (n.orderRef && n.orderRef.toLowerCase().includes(q))
    );
  }

  toggleRead(notif: ProNotificationItem): void {
    notif.isRead = !notif.isRead;
  }
}

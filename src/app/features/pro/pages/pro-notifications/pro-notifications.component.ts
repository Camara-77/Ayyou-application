import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { NotificationService, NotificationApiItem } from '../../../../core/services/notification.service';

export interface ProNotificationItem {
  id: string;
  type: string;
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
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  searchQuery: string = '';
  apiNotifications: NotificationApiItem[] = [];
  notifications: ProNotificationItem[] = [];
  filteredNotifications: ProNotificationItem[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getNotifications().subscribe({
      next: (items) => {
        this.apiNotifications = items;
        this.notifications = items.map(n => this.mapApiToProItem(n));
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || "Erreur de chargement des notifications.";
      }
    });
  }

  private mapApiToProItem(n: NotificationApiItem): ProNotificationItem {
    const isOrder = n.type_notification === 'ORDER' || n.reference_type === 'Commande';
    const isDelivery = n.type_notification === 'DELIVERY' || n.reference_type === 'Livraison';
    const isPro = n.type_notification === 'PRO_VALIDATION' || n.type_notification === 'SUBSCRIPTION';

    let avatarText = 'AY';
    let avatarBg = '#FFF1F2';
    if (isOrder) {
      avatarText = 'CMD';
      avatarBg = '#FEF3C7';
    } else if (isDelivery) {
      avatarText = 'LIV';
      avatarBg = '#E0F2FE';
    } else if (isPro) {
      avatarText = 'PRO';
      avatarBg = '#F3E8FF';
    }

    const d = n.created_at ? new Date(n.created_at) : new Date();
    const timeFormatted = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    return {
      id: String(n.id),
      type: n.type_notification,
      title: n.titre,
      subtitle: `${n.type_notification_display} • ${n.canal_display}`,
      message: n.message,
      timeFormatted,
      isRead: n.est_lu,
      isPinned: !n.est_lu,
      priority: n.est_lu ? 'normal' : 'high',
      orderRef: n.reference_id,
      avatarBg,
      avatarText,
      statusBadgeText: n.est_lu ? 'Lue' : 'Nouveau',
      statusBadgeClass: n.est_lu ? 'badge-green' : 'badge-pinned',
      footerLeftText: n.reference_id ? `Réf : #${n.reference_id}` : undefined,
      footerActionText: n.reference_id ? 'Consulter' : undefined,
      footerActionClass: 'btn-text-link'
    };
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredNotifications = [...this.notifications].sort((a, b) => {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
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
    const numericId = parseInt(notif.id, 10);
    if (!isNaN(numericId) && !notif.isRead) {
      this.notificationService.markAsRead(numericId).subscribe({
        next: () => {
          notif.isRead = true;
          notif.statusBadgeText = 'Lue';
          notif.statusBadgeClass = 'badge-green';
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }
}

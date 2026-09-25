import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Livraison, LivreurProfile } from '../../../../core/models/delivery';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

@Component({
  selector: 'app-delivery-success',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-success.component.html',
  styleUrl: './delivery-success.component.scss'
})
export class DeliverySuccessComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  delivery: Livraison | null = null;
  driverProfile: LivreurProfile | null = null;
  isLoading = true;
  errorMessage = '';

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

    this.loadDriverProfile();
  }

  loadDriverProfile(): void {
    this.deliveryService.getDriverProfile().subscribe({
      next: (profile) => {
        this.driverProfile = profile;
      },
      error: () => {}
    });
  }

  loadDelivery(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveryById(id).subscribe({
      next: (res) => {
        this.delivery = res;
        this.isLoading = false;
        if (res.statut !== 'LIVREE') {
          console.warn("La livraison n'est pas encore marquée comme LIVREE. Redirection...");
          this.router.navigate(['/livreur/detail', res.id]);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || "Impossible de charger la livraison.";
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
          if (found.statut !== 'LIVREE') {
            this.router.navigate(['/livreur/detail', found.id]);
          }
        } else {
          this.isLoading = false;
          this.errorMessage = "Livraison introuvable.";
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de récupérer la livraison.";
      }
    });
  }

  getFormattedTime(): string {
    if (this.delivery?.date_validation) {
      const date = new Date(this.delivery.date_validation);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}h${minutes}`;
      }
    } else if (this.delivery?.updated_at) {
      const date = new Date(this.delivery.updated_at);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}h${minutes}`;
      }
    }
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}h${minutes}`;
  }

  getDestinationSector(): string {
    if (this.delivery?.adresse_livraison) {
      const addr = this.delivery.adresse_livraison;
      return addr.split(',')[0].trim();
    }
    return 'Destination non renseignée';
  }

  getFormattedGain(): string {
    const raw = this.delivery?.frais_livraison ? parseInt(this.delivery.frais_livraison, 10) : 0;
    const gainNum = isNaN(raw) ? 0 : raw;
    return gainNum.toLocaleString('fr-FR');
  }

  getPayoutPhoneFormatted(): string {
    const rawPhone = this.driverProfile?.telephone_reversement || this.driverProfile?.numero_telephone || '';
    const cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.length >= 9) {
      const prefix = cleaned.substring(cleaned.length - 9, cleaned.length - 7);
      const suffix = cleaned.substring(cleaned.length - 2);
      return `${prefix} *** ** ${suffix}`;
    }
    return rawPhone || 'Non renseigné';
  }

  goHome(): void {
    this.router.navigate(['/delivery/home']);
  }

  goBack(): void {
    this.router.navigate(['/delivery/home']);
  }
}

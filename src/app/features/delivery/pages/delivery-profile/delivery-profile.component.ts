import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

@Component({
  selector: 'app-delivery-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-profile.component.html',
  styleUrls: ['./delivery-profile.component.scss']
})
export class DeliveryProfileComponent implements OnInit {
  driverName: string = 'Abdoulaye Diop';
  driverRole: string = 'Livreur AYYOU Pro · Dakar';
  driverAvatar: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  isOnDuty: boolean = true;

  vehicleName: string = 'Honda CG 125 Scooter';
  vehiclePlate: string = 'DK-4882-AZ';
  insuranceExpiry: string = "31/12/2025";
  
  interventionSectors: string = 'Dakar Plateau, Point E, Fann, Médina, Corniche Ouest';
  payoutAccount: string = 'Wave Sénégal';
  payoutPhone: string = '+221 77 *** ** 89';

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }

  toggleOnDuty(): void {
    this.isOnDuty = !this.isOnDuty;
  }

  switchToClientMode(): void {
    this.router.navigate(['/']);
  }

  logoutProSession(): void {
    alert('Déconnexion de la session Pro...');
    this.router.navigate(['/']);
  }
}

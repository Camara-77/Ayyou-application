import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

export interface CompletedCourseData {
  orderId: string;
  orderRef: string;
  completionTime: string;
  deliveryLocationShort: string;
  instantTotalFcfa: string;
  netGainFcfa: string;
  paymentMethod: string;
  paymentStatus: string;
  validationMethod: string;
  pickupLocation: {
    name: string;
    address: string;
  };
  dropoffLocation: {
    name: string;
    address: string;
  };
  durationMinutes: string;
  distanceKm: string;
  status: 'COMPLETED';
}

import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-detail.component.html',
  styleUrls: ['./delivery-detail.component.scss']
})
export class DeliveryDetailComponent implements OnInit {
  course: CompletedCourseData = {
    orderId: 'delivery-9482',
    orderRef: '#AY-9482',
    completionTime: '13h42',
    deliveryLocationShort: 'Point E',
    instantTotalFcfa: '1 500 FCFA',
    netGainFcfa: '+1 000 FCFA',
    paymentMethod: 'Wave (77 *** ** 89)',
    paymentStatus: 'Effectué',
    validationMethod: 'QR validé 13h42',
    pickupLocation: {
      name: 'Chez Loutcha',
      address: 'Plateau, Dakar'
    },
    dropoffLocation: {
      name: 'Amadou Diallo',
      address: 'Point E, Résidence Teranga'
    },
    durationMinutes: '19 min',
    distanceKm: '2,6 km',
    status: 'COMPLETED'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const routeOrderId = this.route.snapshot.paramMap.get('orderId');
    if (routeOrderId) {
      this.course.orderId = routeOrderId;
    }
  }

  goBack(): void {
    this.location.back();
  }

  readyForNextCourse(): void {
    this.router.navigate(['/delivery/home']);
  }
}

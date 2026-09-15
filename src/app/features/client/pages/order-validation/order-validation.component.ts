import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { OrderValidationData } from '../../../../core/models/client';

@Component({
  selector: 'app-order-validation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent
  ],
  templateUrl: './order-validation.component.html',
  styleUrls: ['./order-validation.component.scss']
})
export class OrderValidationComponent implements OnInit {
  validationData: OrderValidationData | null = null;

  constructor(
    private route: ActivatedRoute,
    private clientDataService: ClientDataService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || 'ov1';
    this.clientDataService.getOrderValidation(id).subscribe(data => {
      this.validationData = data;
    });
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' F';
  }
}

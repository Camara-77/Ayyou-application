import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstablishmentDetail } from '../../models/admin-business.models';

@Component({
  selector: 'app-establishment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './establishment-list.component.html',
  styleUrls: ['./establishment-list.component.scss']
})
export class EstablishmentListComponent {
  @Input() establishments: EstablishmentDetail[] = [];
  @Input() selectedEstablishment: EstablishmentDetail | null = null;
  @Output() selectEstablishment = new EventEmitter<EstablishmentDetail>();

  currentPage: number = 1;
  totalPages: number = 37;

  onRowClick(item: EstablishmentDetail): void {
    this.selectEstablishment.emit(item);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}

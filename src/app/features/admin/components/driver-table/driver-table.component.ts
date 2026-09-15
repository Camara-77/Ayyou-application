import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverDetail } from '../../models/admin-driver.models';

@Component({
  selector: 'app-driver-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-table.component.html',
  styleUrls: ['./driver-table.component.scss']
})
export class DriverTableComponent {
  @Input() drivers: DriverDetail[] = [];
  @Input() selectedDriver: DriverDetail | null = null;
  @Output() selectDriver = new EventEmitter<DriverDetail>();

  currentPage: number = 1;
  totalPages: number = 32;

  onRowClick(driver: DriverDetail): void {
    this.selectDriver.emit(driver);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}

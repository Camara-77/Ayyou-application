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
  @Input() totalCount: number = 0;
  @Input() selectedDriver: DriverDetail | null = null;
  @Output() selectDriver = new EventEmitter<DriverDetail>();

  currentPage: number = 1;

  onRowClick(driver: DriverDetail): void {
    this.selectDriver.emit(driver);
  }
}

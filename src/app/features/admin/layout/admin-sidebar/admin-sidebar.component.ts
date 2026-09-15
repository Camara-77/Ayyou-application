import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  @Input() adminName: string = 'Mamadou D.';
  @Input() adminRole: string = 'Admin Principal';
  @Input() isOpenMobile: boolean = false;
  @Output() logout = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }
}

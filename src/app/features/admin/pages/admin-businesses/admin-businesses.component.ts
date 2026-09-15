import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { EstablishmentDetail, EstablishmentFilterTab, EstablishmentStatsSummary } from '../../models/admin-business.models';
import { AdminBusinessService } from '../../services/admin-business.service';
import { EstablishmentStatsComponent } from '../../components/establishment-stats/establishment-stats.component';
import { EstablishmentFiltersComponent } from '../../components/establishment-filters/establishment-filters.component';
import { EstablishmentListComponent } from '../../components/establishment-list/establishment-list.component';
import { EstablishmentDetailsPanelComponent } from '../../components/establishment-details-panel/establishment-details-panel.component';

@Component({
  selector: 'app-admin-businesses',
  standalone: true,
  imports: [
    CommonModule,
    EstablishmentStatsComponent,
    EstablishmentFiltersComponent,
    EstablishmentListComponent,
    EstablishmentDetailsPanelComponent
  ],
  templateUrl: './admin-businesses.component.html',
  styleUrls: ['./admin-businesses.component.scss']
})
export class AdminBusinessesComponent implements OnInit {
  establishments$!: Observable<EstablishmentDetail[]>;
  selectedEstablishment$!: Observable<EstablishmentDetail | null>;
  stats$!: Observable<EstablishmentStatsSummary>;

  currentTab: EstablishmentFilterTab = 'ALL';
  currentNeighborhood: string = 'ALL';

  constructor(private businessService: AdminBusinessService) {}

  ngOnInit(): void {
    this.stats$ = this.businessService.getStatsSummary();
    this.selectedEstablishment$ = this.businessService.selectedEstablishment$;
    this.loadFiltered();
  }

  onTabChange(tab: EstablishmentFilterTab): void {
    this.currentTab = tab;
    this.loadFiltered();
  }

  onNeighborhoodChange(neighborhood: string): void {
    this.currentNeighborhood = neighborhood;
    this.loadFiltered();
  }

  onSelectEstablishment(item: EstablishmentDetail): void {
    this.businessService.selectEstablishment(item);
  }

  onApproveEstablishment(id: string): void {
    this.businessService.approveEstablishment(id);
    this.loadFiltered();
  }

  onRejectEstablishment(id: string): void {
    this.businessService.rejectEstablishment(id);
    this.loadFiltered();
  }

  private loadFiltered(): void {
    this.establishments$ = this.businessService.filterEstablishments(this.currentTab, this.currentNeighborhood);
  }
}

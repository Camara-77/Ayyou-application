import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminSettingsService } from '../../services/admin-settings.service';
import {
  AdminCollaborator,
  AuditLogEntry,
  DeliveryCorridor,
  GeographicZone,
  PaymentGatewayConfig,
  PricingTier,
  RolePermissionsConfig,
  SettingsSummaryCardData,
  SystemRoleType
} from '../../models/admin-settings.models';
import { CollaboratorsTableComponent } from '../../components/settings/collaborators-table/collaborators-table.component';
import { RolePermissionsPanelComponent } from '../../components/settings/role-permissions-panel/role-permissions-panel.component';
import { InviteCollaboratorModalComponent } from '../../components/settings/invite-collaborator-modal/invite-collaborator-modal.component';
import { AuditLogModalComponent } from '../../components/settings/audit-log-modal/audit-log-modal.component';

export type SettingsTab = 'EQUIPE' | 'ZONES' | 'PRICING' | 'PAYMENTS' | 'SECURITY';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CollaboratorsTableComponent,
    RolePermissionsPanelComponent,
    InviteCollaboratorModalComponent,
    AuditLogModalComponent
  ],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {
  activeTab: SettingsTab = 'EQUIPE';

  summaryCards$: Observable<SettingsSummaryCardData[]>;
  collaborators$: Observable<AdminCollaborator[]>;
  rolePermissions$: Observable<RolePermissionsConfig>;
  zones$: Observable<GeographicZone[]>;
  corridors$: Observable<DeliveryCorridor[]>;
  pricingTiers$: Observable<PricingTier[]>;
  paymentGateways$: Observable<PaymentGatewayConfig[]>;
  auditLogs$: Observable<AuditLogEntry[]>;

  isInviteModalOpen: boolean = false;
  isAuditModalOpen: boolean = false;
  hasUnsavedChanges: boolean = false;
  showSavedToast: boolean = false;

  constructor(private adminSettingsService: AdminSettingsService) {
    this.summaryCards$ = this.adminSettingsService.summaryCards$;
    this.collaborators$ = this.adminSettingsService.getCollaborators();
    this.rolePermissions$ = this.adminSettingsService.rolePermissions$;
    this.zones$ = this.adminSettingsService.geographicZones$;
    this.corridors$ = this.adminSettingsService.deliveryCorridors$;
    this.pricingTiers$ = this.adminSettingsService.pricingTiers$;
    this.paymentGateways$ = this.adminSettingsService.paymentGateways$;
    this.auditLogs$ = this.adminSettingsService.auditLogs$;
  }

  ngOnInit(): void {}

  onTabSelect(tab: SettingsTab): void {
    this.activeTab = tab;
  }

  onSearchCollaborators(query: string): void {
    this.collaborators$ = this.adminSettingsService.getCollaborators(query);
  }

  onTogglePermission(permId: string): void {
    this.adminSettingsService.togglePermission(permId);
    this.hasUnsavedChanges = true;
  }

  onOpenInviteModal(): void {
    this.isInviteModalOpen = true;
  }

  onCloseInviteModal(): void {
    this.isInviteModalOpen = false;
  }

  onSendInvite(event: { name: string; email: string; role: SystemRoleType; scope: string }): void {
    this.adminSettingsService.inviteCollaborator(event).subscribe(() => {
      this.collaborators$ = this.adminSettingsService.getCollaborators();
      this.hasUnsavedChanges = true;
    });
  }

  onOpenAuditModal(): void {
    this.isAuditModalOpen = true;
  }

  onCloseAuditModal(): void {
    this.isAuditModalOpen = false;
  }

  onSaveSettings(): void {
    this.adminSettingsService.saveAllSettings().subscribe(() => {
      this.hasUnsavedChanges = false;
      this.showSavedToast = true;
      setTimeout(() => {
        this.showSavedToast = false;
      }, 3500);
    });
  }
}

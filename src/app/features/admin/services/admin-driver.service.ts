import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DriverDetail, DriverDocument, DriverFilterTab, DriverStatsSummary, DriverStatus } from '../models/admin-driver.models';
import { environment } from '../../../../environments/environment';

function isPdfUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('.pdf') || (!lower.includes('.jpg') && !lower.includes('.jpeg') && !lower.includes('.png') && !lower.includes('.webp') && !lower.includes('.gif'));
}

function isImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp') || lower.includes('.gif');
}

function formatDriverDocTitle(docType: string, comment?: string): string {
  if (comment && comment.trim()) {
    return comment.trim();
  }
  switch (docType) {
    case 'PIECE_IDENTITE':
      return 'Pièce d\'Identité (CNI)';
    case 'PERMIS_CONDUIRE':
      return 'Permis de Conduire';
    case 'CARTE_GRISE':
      return 'Carte Grise & Assurance';
    case 'CASIER_JUDICIAIRE':
      return 'Casier Judiciaire (B3)';
    default:
      return 'Document Officiel Livreur';
  }
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const baseUrl = environment.apiUrl ? environment.apiUrl.replace(/\/+$/, '') : '';
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${path}`;
}

export function mapBackendDriverToDriverDetail(d: any): DriverDetail {
  const isCandidate = d.statut_verification === 'EN_ATTENTE';
  const isRefused = d.statut_verification === 'REFUSE';
  const isAvailable = d.est_disponible;

  let status: DriverStatus = 'HORS_LIGNE';
  let statusText = '• Hors ligne';

  if (isCandidate) {
    status = 'DOSSIER_A_VALIDER';
    statusText = '• Dossier à valider';
  } else if (isRefused) {
    status = 'HORS_LIGNE';
    statusText = '• Refusé';
  } else if (isAvailable) {
    status = 'DISPONIBLE';
    statusText = '• Disponible';
  } else {
    status = 'EN_LIVRAISON';
    statusText = '• En livraison';
  }

  const candidat = d.candidat || {};
  const firstName = d.prenom || candidat.prenom || (d.nom_complet ? d.nom_complet.split(' ')[0] : 'Livreur');
  const lastName = d.nom || candidat.nom || (d.nom_complet ? d.nom_complet.split(' ').slice(1).join(' ') : '');
  const fullName = d.nom_complet || candidat.nom_complet || `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'LV';
  const email = d.email || candidat.email || '';
  const phone = d.telephone || d.numero_telephone || candidat.numero_telephone || '';

  const regDate = d.date_creation
    ? new Date(d.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date inconnue';

  const vehType = d.type_vehicule || 'Moto';
  const vehBrand = d.marque || '';
  const vehModel = d.modele || '';
  const vehicle = `${vehType} ${vehBrand} ${vehModel}`.trim();
  const vehicleDeclaredFull = `${vehType} ${vehBrand} ${vehModel} (${d.immatriculation || 'Plaque N/A'})`.trim();

  const rawDocs: any[] = d.documents || [];
  const documents: DriverDocument[] = rawDocs.map((doc: any) => {
    const rawUrl = doc.fichier_url || doc.fichier_url_ou_reference || '';
    const fileUrl = resolveMediaUrl(rawUrl);
    const isPdf = isPdfUrl(fileUrl);
    const isImage = isImageUrl(fileUrl);
    const docTitle = formatDriverDocTitle(doc.type_document, doc.commentaire);
    const docSub = doc.date_creation
      ? `Soumis le ${new Date(doc.date_creation).toLocaleDateString('fr-FR')}`
      : (doc.statut === 'VALIDE' ? 'Document validé' : 'Vérification requise');

    return {
      id: doc.id ? doc.id.toString() : `doc-${Math.random()}`,
      typeDocument: doc.type_document || 'AUTRE',
      title: docTitle,
      subtitle: docSub,
      statut: doc.statut || 'EN_ATTENTE',
      commentaire: doc.commentaire || '',
      fichierUrl: fileUrl,
      dateCreation: doc.date_creation,
      isValidated: doc.statut === 'VALIDE',
      isPdf,
      isImage
    };
  });

  return {
    id: d.id ? d.id.toString() : '',
    firstName,
    lastName,
    fullName,
    initials,
    licensePlate: d.immatriculation || 'Non immatriculé',
    phone,
    email,
    zone: 'Dakar / Médina',
    vehicle,
    vehicleDeclaredFull,
    status,
    statusText,
    currentMissionTitle: isCandidate
      ? 'Instruction du dossier en cours'
      : (isAvailable ? 'En attente d\'attribution' : 'Service actif'),
    isCandidate,
    submittedAt: `Soumis le ${regDate}`,
    photoUrl: d.photo_url ? resolveMediaUrl(d.photo_url) : undefined,
    documentsCount: `${documents.length} reçue(s)`,
    documents
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminDriverService {
  private http = inject(HttpClient);

  private driversSubject = new BehaviorSubject<DriverDetail[]>([]);
  private selectedSubject = new BehaviorSubject<DriverDetail | null>(null);

  drivers$ = this.driversSubject.asObservable();
  selectedDriver$ = this.selectedSubject.asObservable();

  getDriverDetail(id: string): Observable<DriverDetail> {
    const url = `${environment.apiUrl}/api/admin/drivers/${id}/`;
    return this.http.get<any>(url).pipe(
      map(raw => {
        const detail = mapBackendDriverToDriverDetail(raw);
        this.selectedSubject.next(detail);
        return detail;
      }),
      catchError(err => {
        console.error(`Erreur chargement profil livreur ${id}:`, err);
        return of(null as any);
      })
    );
  }

  getStatsSummary(): Observable<DriverStatsSummary> {
    const url = `${environment.apiUrl}/api/admin/drivers/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        const items = rawItems.map(mapBackendDriverToDriverDetail);

        const totalCount = items.length;
        const connectedCount = items.filter(d => d.status === 'DISPONIBLE' || d.status === 'EN_LIVRAISON').length;
        const availableCount = items.filter(d => d.status === 'DISPONIBLE').length;
        const deliveringCount = items.filter(d => d.status === 'EN_LIVRAISON').length;
        const offlineCount = items.filter(d => d.status === 'HORS_LIGNE').length;
        const applicationsCount = items.filter(d => d.isCandidate || d.status === 'DOSSIER_A_VALIDER').length;

        return {
          totalCount,
          connectedCount,
          connectedSubtext: `${connectedCount} livreur(s) actif(s)`,
          availableCount,
          availableSubtext: `${availableCount} disponible(s)`,
          deliveringCount,
          deliveringSubtext: `${deliveringCount} en livraison`,
          offlineCount,
          offlineSubtext: `${offlineCount} hors ligne`,
          applicationsCount,
          applicationsSubtext: `${applicationsCount} dossier(s) à vérifier`
        };
      }),
      catchError(() => of({
        totalCount: 0,
        connectedCount: 0,
        connectedSubtext: '0 connecté',
        availableCount: 0,
        availableSubtext: '0 disponible',
        deliveringCount: 0,
        deliveringSubtext: '0 en livraison',
        offlineCount: 0,
        offlineSubtext: '0 hors ligne',
        applicationsCount: 0,
        applicationsSubtext: '0 dossier'
      }))
    );
  }

  selectDriver(item: DriverDetail): void {
    this.selectedSubject.next(item);
    if (item && item.id) {
      this.getDriverDetail(item.id).subscribe();
    }
  }

  approveCandidate(id: string): Observable<DriverDetail | null> {
    const url = `${environment.apiUrl}/api/admin/drivers/${id}/approve/`;
    return this.http.patch<any>(url, {}).pipe(
      map(raw => {
        const updated = mapBackendDriverToDriverDetail(raw);
        const currentList = this.driversSubject.getValue().map(item => item.id === id ? updated : item);
        this.driversSubject.next(currentList);

        const currentSelected = this.selectedSubject.getValue();
        if (currentSelected && currentSelected.id === id) {
          this.selectedSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur validation candidat livreur:', err);
        return of(null);
      })
    );
  }

  rejectCandidate(id: string, motif?: string): Observable<DriverDetail | null> {
    const url = `${environment.apiUrl}/api/admin/drivers/${id}/reject/`;
    return this.http.patch<any>(url, { motif: motif || 'Dossier non conforme' }).pipe(
      map(raw => {
        const updated = mapBackendDriverToDriverDetail(raw);
        const currentList = this.driversSubject.getValue().map(item => item.id === id ? updated : item);
        this.driversSubject.next(currentList);

        const currentSelected = this.selectedSubject.getValue();
        if (currentSelected && currentSelected.id === id) {
          this.selectedSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur refus candidat livreur:', err);
        return of(null);
      })
    );
  }

  filterDrivers(tab: DriverFilterTab, zone: string, vehicleType: string): Observable<DriverDetail[]> {
    const url = `${environment.apiUrl}/api/admin/drivers/`;

    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        let items = rawItems.map(mapBackendDriverToDriverDetail);

        items = items.filter(item => {
          let matchTab = true;
          if (tab === 'DISPONIBLE') matchTab = item.status === 'DISPONIBLE';
          else if (tab === 'EN_LIVRAISON') matchTab = item.status === 'EN_LIVRAISON' || item.status === 'RECUPERATION';
          else if (tab === 'HORS_LIGNE') matchTab = item.status === 'HORS_LIGNE';
          else if (tab === 'DOSSIER_A_VALIDER') matchTab = item.isCandidate || item.status === 'DOSSIER_A_VALIDER';

          let matchZone = true;
          if (zone && zone !== 'ALL' && zone !== 'Toutes les zones') {
            matchZone = item.zone.toLowerCase().includes(zone.toLowerCase());
          }

          let matchVehicle = true;
          if (vehicleType && vehicleType !== 'ALL' && vehicleType !== 'Type de véhicule (Tous)') {
            matchVehicle = item.vehicle.toLowerCase().includes(vehicleType.toLowerCase());
          }

          return matchTab && matchZone && matchVehicle;
        });

        this.driversSubject.next(items);

        const currentSelected = this.selectedSubject.getValue();
        if (items.length > 0) {
          if (!currentSelected || !items.some(i => i.id === currentSelected.id)) {
            this.selectedSubject.next(items[0]);
          }
        } else {
          this.selectedSubject.next(null);
        }

        return items;
      }),
      catchError(err => {
        console.error('Erreur chargement livreurs backend:', err);
        this.driversSubject.next([]);
        this.selectedSubject.next(null);
        return of([]);
      })
    );
  }

  analyzeDocumentsWithCopilot(id: string): Observable<any> {
    const url = `${environment.apiUrl}/api/admin/drivers/${id}/analyze-documents/`;
    return this.http.post<any>(url, {});
  }

  resendEmail(id: string, motif?: string): Observable<any> {
    const url = `${environment.apiUrl}/api/admin/drivers/${id}/resend-email/`;
    return this.http.post<any>(url, { motif });
  }
}

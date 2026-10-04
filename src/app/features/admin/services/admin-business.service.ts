import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  EstablishmentDetail,
  EstablishmentDocument,
  EstablishmentFilterTab,
  EstablishmentStatsSummary,
  EstablishmentStatus,
  EstablishmentType
} from '../models/admin-business.models';
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

function formatDocTitle(docType: string, comment?: string): string {
  if (comment && comment.trim()) {
    return comment.trim();
  }
  switch (docType) {
    case 'REGISTRE_COMMERCE':
      return 'NINEA / Registre de Commerce';
    case 'CERTIFICAT_HYGIENE':
      return 'Certificat d\'Hygiène & Salubrité';
    case 'CNI_GERANT':
      return 'CNI du Gérant';
    case 'PIECE_IDENTITE':
      return 'Pièce d\'Identité (CNI)';
    case 'PERMIS_CONDUIRE':
      return 'Permis de Conduire';
    case 'CARTE_GRISE':
      return 'Carte Grise & Assurance';
    default:
      return 'Document Officiel';
  }
}

export function mapBackendBusinessToEstablishmentDetail(b: any): EstablishmentDetail {
  const type: EstablishmentType = b.type_etablissement === 'VENDEUR' ? 'VENDEUR' : 'RESTAURANT';

  let status: EstablishmentStatus = 'EN_ATTENTE';
  if (b.statut_verification === 'VALIDE' || b.est_verifie) {
    status = 'ACTIF';
  } else if (b.statut_verification === 'REFUSE' || b.statut === 'REJETE') {
    status = 'REJETE';
  } else if (b.statut === 'SUSPENDU') {
    status = 'SUSPENDU';
  } else {
    status = 'EN_ATTENTE';
  }

  const candidat = b.candidat || {};
  const ownerFirstName = b.proprietaire_prenom || candidat.prenom || (b.proprietaire_nom ? b.proprietaire_nom.split(' ')[0] : 'Responsable');
  const ownerLastName = b.proprietaire_nom || candidat.nom || (b.proprietaire_nom ? b.proprietaire_nom.split(' ').slice(1).join(' ') : '');
  const ownerFullName = b.proprietaire_nom_complet || candidat.nom_complet || `${ownerFirstName} ${ownerLastName}`.trim();
  const email = b.proprietaire_email || candidat.email || '';
  const phone = b.telephone || b.proprietaire_telephone || candidat.numero_telephone || '';

  const regDate = b.date_creation
    ? new Date(b.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date inconnue';

  const neighborhood = b.adresse ? b.adresse.split(',')[0].trim() : 'Dakar';

  const rawDocs: any[] = b.documents || [];
  const documents: EstablishmentDocument[] = rawDocs.map((doc: any) => {
    const fileUrl = doc.fichier_url || doc.fichier_url_ou_reference || '';
    const isPdf = isPdfUrl(fileUrl);
    const isImage = isImageUrl(fileUrl);
    const docTitle = formatDocTitle(doc.type_document, doc.commentaire);
    const docSub = doc.date_creation
      ? `Soumis le ${new Date(doc.date_creation).toLocaleDateString('fr-FR')}`
      : (doc.statut === 'VALIDE' ? 'Document validé' : 'En attente de vérification');

    return {
      id: doc.id ? doc.id.toString() : `doc-${Math.random()}`,
      typeDocument: doc.type_document || 'AUTRE',
      title: docTitle,
      documentRef: `DOC-#${doc.id || 'N/A'}`,
      subtitle: docSub,
      statut: doc.statut || 'EN_ATTENTE',
      commentaire: doc.commentaire || '',
      fichierUrl: fileUrl,
      dateCreation: doc.date_creation,
      isPdf,
      isImage,
      iconType: doc.statut === 'VALIDE' ? 'check' : 'eye'
    };
  });

  const photos: string[] = [];
  if (b.couverture || b.couverture_url) {
    photos.push(b.couverture || b.couverture_url);
  }
  documents.filter(d => d.isImage && d.fichierUrl).forEach(d => {
    if (!photos.includes(d.fichierUrl!)) {
      photos.push(d.fichierUrl!);
    }
  });

  return {
    id: b.id ? b.id.toString() : '',
    name: b.nom || 'Établissement',
    ownerFirstName,
    ownerLastName,
    ownerFullName,
    phone,
    email,
    type,
    typeDisplay: b.type_display || (type === 'VENDEUR' ? 'Vendeur à domicile' : 'Restaurant'),
    category: b.specialite || (type === 'VENDEUR' ? 'Commerce & Primeur' : 'Cuisine générale'),
    subCategory: b.slogan || (type === 'VENDEUR' ? 'Épicerie & Produits' : 'Plats & Spécialités'),
    neighborhood,
    address: b.adresse || 'Dakar, Sénégal',
    performanceText: b.est_verifie 
      ? `${b.nombre_produits || 0} produit(s) en ligne` 
      : 'En attente de vérification',
    ordersCount: 0,
    status,
    submittedAt: `Soumis le ${regDate}`,
    commissionRate: type === 'VENDEUR' ? '10.0% commerce' : '15.0% standard',
    logoUrl: b.logo || b.logo_url || undefined,
    couvertureUrl: b.couverture || b.couverture_url || undefined,
    documentsCount: `${documents.length} Fichier(s)`,
    documents,
    photos
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminBusinessService {
  private http = inject(HttpClient);

  private establishmentsSubject = new BehaviorSubject<EstablishmentDetail[]>([]);
  private selectedSubject = new BehaviorSubject<EstablishmentDetail | null>(null);

  establishments$ = this.establishmentsSubject.asObservable();
  selectedEstablishment$ = this.selectedSubject.asObservable();

  getBusinessDetail(id: string): Observable<EstablishmentDetail> {
    const url = `${environment.apiUrl}/api/admin/businesses/${id}/`;
    return this.http.get<any>(url).pipe(
      map(raw => {
        const detail = mapBackendBusinessToEstablishmentDetail(raw);
        this.selectedSubject.next(detail);
        return detail;
      }),
      catchError(err => {
        console.error(`Erreur chargement détails établissement ${id}:`, err);
        return of(null as any);
      })
    );
  }

  getStatsSummary(): Observable<EstablishmentStatsSummary> {
    const url = `${environment.apiUrl}/api/admin/businesses/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        const items = rawItems.map(mapBackendBusinessToEstablishmentDetail);

        const total = items.length;
        const activeRestaurants = items.filter(i => i.type === 'RESTAURANT' && i.status === 'ACTIF').length;
        const commercesAndSellers = items.filter(i => i.type === 'VENDEUR' && i.status === 'ACTIF').length;
        const pendingApproval = items.filter(i => i.status === 'EN_ATTENTE').length;

        return {
          total,
          totalSubtext: `${total} partenaire(s) au total`,
          activeRestaurants,
          activeRestaurantsSubtext: `${activeRestaurants} restaurant(s) actif(s)`,
          commercesAndSellers,
          commercesAndSellersSubtext: `${commercesAndSellers} commerce(s) actif(s)`,
          pendingApproval,
          pendingApprovalSubtext: `${pendingApproval} dossier(s) en attente`,
          monthlyVolume: 'Volume AYYOU',
          monthlyVolumeSubtext: 'Données en temps réel'
        };
      }),
      catchError(() => of({
        total: 0,
        totalSubtext: '0 partenaire',
        activeRestaurants: 0,
        activeRestaurantsSubtext: 'Aucun',
        commercesAndSellers: 0,
        commercesAndSellersSubtext: 'Aucun',
        pendingApproval: 0,
        pendingApprovalSubtext: 'Aucun dossier',
        monthlyVolume: '0 FCFA',
        monthlyVolumeSubtext: 'Non disponible'
      }))
    );
  }

  selectEstablishment(item: EstablishmentDetail): void {
    this.selectedSubject.next(item);
    if (item && item.id) {
      this.getBusinessDetail(item.id).subscribe();
    }
  }

  approveEstablishment(id: string): Observable<EstablishmentDetail | null> {
    const url = `${environment.apiUrl}/api/admin/businesses/${id}/approve/`;
    return this.http.patch<any>(url, {}).pipe(
      map(raw => {
        const updated = mapBackendBusinessToEstablishmentDetail(raw);
        const currentList = this.establishmentsSubject.getValue().map(i => i.id === id ? updated : i);
        this.establishmentsSubject.next(currentList);

        const currentSel = this.selectedSubject.getValue();
        if (currentSel && currentSel.id === id) {
          this.selectedSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur approbation établissement:', err);
        return of(null);
      })
    );
  }

  rejectEstablishment(id: string, motif?: string): Observable<EstablishmentDetail | null> {
    const url = `${environment.apiUrl}/api/admin/businesses/${id}/reject/`;
    return this.http.patch<any>(url, { motif: motif || 'Dossier non conforme' }).pipe(
      map(raw => {
        const updated = mapBackendBusinessToEstablishmentDetail(raw);
        const currentList = this.establishmentsSubject.getValue().map(i => i.id === id ? updated : i);
        this.establishmentsSubject.next(currentList);

        const currentSel = this.selectedSubject.getValue();
        if (currentSel && currentSel.id === id) {
          this.selectedSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur rejet établissement:', err);
        return of(null);
      })
    );
  }

  filterEstablishments(tab: EstablishmentFilterTab, neighborhood: string): Observable<EstablishmentDetail[]> {
    let params = new HttpParams();

    if (tab === 'RESTAURANTS') {
      params = params.set('type_etablissement', 'RESTAURANT');
    } else if (tab === 'VENDEURS') {
      params = params.set('type_etablissement', 'VENDEUR');
    } else if (tab === 'PENDING') {
      params = params.set('est_verifie', 'false');
    }

    const url = `${environment.apiUrl}/api/admin/businesses/`;

    return this.http.get<any>(url, { params }).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        let items = rawItems.map(mapBackendBusinessToEstablishmentDetail);

        if (neighborhood && neighborhood !== 'ALL' && neighborhood !== 'Tous les quartiers') {
          items = items.filter(item => item.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()));
        }

        this.establishmentsSubject.next(items);

        const currentSel = this.selectedSubject.getValue();
        if (items.length > 0) {
          if (!currentSel || !items.some(i => i.id === currentSel.id)) {
            this.selectedSubject.next(items[0]);
          }
        } else {
          this.selectedSubject.next(null);
        }

        return items;
      }),
      catchError(err => {
        console.error('Erreur chargement établissements backend:', err);
        this.establishmentsSubject.next([]);
        this.selectedSubject.next(null);
        return of([]);
      })
    );
  }

  analyzeDocumentsWithCopilot(id: string): Observable<any> {
    const url = `${environment.apiUrl}/api/admin/businesses/${id}/analyze-documents/`;
    return this.http.post<any>(url, {});
  }

  resendEmail(id: string, motif?: string): Observable<any> {
    const url = `${environment.apiUrl}/api/admin/businesses/${id}/resend-email/`;
    return this.http.post<any>(url, { motif });
  }
}

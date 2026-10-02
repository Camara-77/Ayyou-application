import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export type AccountType = 'RESTAURANT' | 'VENDEUR' | 'LIVREUR';

interface UploadedDocument {
  name: string;
  file: File | null;
  status: 'PENDING' | 'IMPORTED' | 'VALIDATED' | 'NONE';
}

interface PhotoCategory {
  key: string;
  title: string;
  subtitle: string;
  file: File | null;
  previewUrl: string | null;
}

import { DriverAuthService, DriverProfile } from '../../../delivery/services/driver-auth.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  ProRegisterService,
  RestaurantRegisterPayload,
  VendeurRegisterPayload,
  LivreurRegisterPayload,
  RegisterProResponse
} from '../../services/pro-register.service';

import { AppLogoComponent } from '../../../../shared/components/app-logo/app-logo.component';

@Component({
  selector: 'app-pro-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AppLogoComponent],
  templateUrl: './pro-register.component.html',
  styleUrls: ['./pro-register.component.scss']
})
export class ProRegisterComponent implements OnInit {
  selectedType: AccountType = 'RESTAURANT';
  registerForm!: FormGroup;
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;
  errorMessage: string = '';

  isMobileMenuOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private driverAuthService: DriverAuthService,
    private authService: AuthService,
    private proRegisterService: ProRegisterService
  ) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Equipment Radio selection for Livreur
  hasBag: 'own' | 'kit' = 'kit';

  // Documents for Restaurant / Vendeur
  nineaDoc: UploadedDocument = { name: '', file: null, status: 'PENDING' };
  hygieneDoc: UploadedDocument = { name: '', file: null, status: 'NONE' };

  // Documents for Livreur
  cniDoc: UploadedDocument = { name: '', file: null, status: 'NONE' };
  permisDoc: UploadedDocument = { name: '', file: null, status: 'NONE' };
  casierDoc: UploadedDocument = { name: '', file: null, status: 'NONE' };
  carteGriseDoc: UploadedDocument = { name: '', file: null, status: 'NONE' };

  // Photo Categories for Restaurant (4) and Vendeur (3)
  photoCategoriesRestaurant: PhotoCategory[] = [
    { key: 'facade', title: 'Façade extérieure', subtitle: 'Vue de la devanture', file: null, previewUrl: null },
    { key: 'interior', title: 'Intérieur', subtitle: 'Comptoir / Accueil', file: null, previewUrl: null },
    { key: 'dining', title: 'Restauration', subtitle: 'Salle clients', file: null, previewUrl: null },
    { key: 'kitchen', title: 'Cuisine', subtitle: 'Poste de cuisson', file: null, previewUrl: null }
  ];

  photoCategoriesVendeur: PhotoCategory[] = [
    { key: 'facade', title: 'Façade boutique / Étalage', subtitle: 'Vue extérieure ou comptoir', file: null, previewUrl: null },
    { key: 'stock', title: 'Rayons ou Préparation', subtitle: 'Organisation des stocks', file: null, previewUrl: null },
    { key: 'products', title: 'Produits phares', subtitle: 'Articles emballés ou étiquetés', file: null, previewUrl: null }
  ];

  districtsList: string[] = [
    'Dakar Plateau & Médina',
    'Almadies & Ngor',
    'Point E & Mermoz',
    'VDN & Sacré-Cœur',
    'Yoff & Ouakam',
    'Maristes & Hann',
    'Banlieue & Pikine & Guédiawaye'
  ];

  vendeurCategoriesList: string[] = [
    'Épicerie & Supermarché',
    'Traiteur & Pâtisserie',
    'Produits Frais & Marché',
    'Boutique Gourmande',
    'Artisanat Alimentaire',
    'Autres'
  ];

  vehicleTypesList: string[] = [
    'Moto scooter 125cc / 150cc',
    'Moto tricyles / Cargobike',
    'Vélo / Vélo Électrique',
    'Voiture utilitaire'
  ];

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      // Section 1: Coordonnées
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneCountryCode: ['+221'],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\s]{8,12}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],

      // Section 2: Détails Établissement / Véhicule
      businessName: [''],
      category: [''],
      speciality: [''],
      district: ['Dakar Plateau & Médina'],
      address: [''],

      // Livreur Specific
      vehicleType: ['Moto scooter 125cc / 150cc'],
      vehicleModel: [''],
      licensePlate: ['']
    });
  }

  selectType(type: AccountType): void {
    this.selectedType = type;
    this.errorMessage = '';
  }

  get currentPhotoCategories(): PhotoCategory[] {
    return this.selectedType === 'VENDEUR' ? this.photoCategoriesVendeur : this.photoCategoriesRestaurant;
  }

  onDocumentSelected(event: Event, docKey: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (docKey === 'cni') {
        this.cniDoc = { name: file.name, file, status: 'IMPORTED' };
      } else if (docKey === 'permis') {
        this.permisDoc = { name: file.name, file, status: 'IMPORTED' };
      } else if (docKey === 'casier') {
        this.casierDoc = { name: file.name, file, status: 'IMPORTED' };
      } else if (docKey === 'carteGrise') {
        this.carteGriseDoc = { name: file.name, file, status: 'IMPORTED' };
      } else if (docKey === 'ninea') {
        this.nineaDoc = { name: file.name, file, status: 'IMPORTED' };
      } else if (docKey === 'hygiene') {
        this.hygieneDoc = { name: file.name, file, status: 'IMPORTED' };
      }
    }
  }

  onPhotoSelected(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const list = this.currentPhotoCategories;
      const cat = list.find(c => c.key === key);
      if (cat) {
        cat.file = file;
        const reader = new FileReader();
        reader.onload = () => {
          cat.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  triggerFileInput(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.click();
    }
  }

  get isFormValid(): boolean {
    if (this.registerForm.invalid) {
      return false;
    }
    return true;
  }

  private formatPhone(phone: string): string {
    const cleaned = (phone || '').replace(/\s+/g, '');
    if (!cleaned) return '+221770000000';
    if (cleaned.startsWith('+221')) return cleaned;
    if (cleaned.startsWith('221')) return `+${cleaned}`;
    return `+221${cleaned}`;
  }

  private mapVehicleType(vehicleStr: string): 'MOTO' | 'VOITURE' | 'VELO' | 'AUTRE' {
    const lower = (vehicleStr || '').toLowerCase();
    if (lower.includes('moto') || lower.includes('scooter')) {
      return 'MOTO';
    }
    if (lower.includes('vélo') || lower.includes('velo')) {
      return 'VELO';
    }
    if (lower.includes('voiture') || lower.includes('utilitaire')) {
      return 'VOITURE';
    }
    return 'AUTRE';
  }

  onSubmit(): void {
    if (!this.isFormValid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires avant de soumettre.';
      return;
    }

    const val = this.registerForm.value;

    if (val.password !== val.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const phone = this.formatPhone(val.phone);
    const password = val.password;
    const confirmPassword = val.confirmPassword;

    if (this.selectedType === 'RESTAURANT') {
      const nomEtablissement = val.businessName || `Restaurant ${val.firstName}`;
      const email = (val.email || '').trim().toLowerCase();

      const formData = new FormData();
      formData.append('email', email);
      formData.append('numero_telephone', phone);
      formData.append('password', password);
      formData.append('password_confirm', confirmPassword);
      formData.append('prenom', val.firstName || '');
      formData.append('nom', val.lastName || '');
      formData.append('nom_etablissement', nomEtablissement);
      formData.append('adresse', val.address || val.district || 'Dakar');
      formData.append('slogan', '');
      formData.append('specialite', val.speciality || '');
      formData.append('telephone_etablissement', phone);

      if (this.nineaDoc.file) formData.append('ninea_file', this.nineaDoc.file);
      if (this.hygieneDoc.file) formData.append('hygiene_file', this.hygieneDoc.file);

      const facade = this.photoCategoriesRestaurant.find(c => c.key === 'facade')?.file;
      if (facade) formData.append('photo_facade', facade);

      const interior = this.photoCategoriesRestaurant.find(c => c.key === 'interior')?.file;
      if (interior) formData.append('photo_interior', interior);

      const dining = this.photoCategoriesRestaurant.find(c => c.key === 'dining')?.file;
      if (dining) formData.append('photo_dining', dining);

      const kitchen = this.photoCategoriesRestaurant.find(c => c.key === 'kitchen')?.file;
      if (kitchen) formData.append('photo_kitchen', kitchen);

      this.proRegisterService.registerRestaurant(formData).subscribe({
        next: (res: RegisterProResponse) => {
          this.isSubmitting = false;
          this.submitSuccess = true;

          const badges: string[] = [];
          if (this.nineaDoc.file) badges.push('Registre NINEA');
          if (this.hygieneDoc.file) badges.push('Certificat d\'Hygiène');
          if (facade) badges.push('Photo Façade');
          if (interior) badges.push('Photo Intérieur');
          if (dining) badges.push('Photo Salle');
          if (kitchen) badges.push('Photo Cuisine');
          if (badges.length === 0) badges.push('Dossier Soumis');

          const summary = {
            reference: `#AYY-REST-${res.etablissement_id || res.user_id || 'PRO'}`,
            accountType: 'Restaurant' as const,
            structureName: `${nomEtablissement} (${val.firstName} ${val.lastName})`,
            contactEmail: email,
            contactPhone: phone,
            documentsCountText: `${badges.length} document(s) & photo(s)`,
            attachedBadges: badges
          };

          if (typeof window !== 'undefined') {
            sessionStorage.setItem('ayyou_pro_register_summary', JSON.stringify(summary));
          }

          this.router.navigate(['/pro/register/confirmation'], {
            state: { summary }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Échec de l\'inscription. Veuillez vérifier les informations.';
        }
      });

    } else if (this.selectedType === 'VENDEUR') {
      const nomEtablissement = val.businessName || `Boutique ${val.firstName}`;
      const email = (val.email || '').trim().toLowerCase();

      const formData = new FormData();
      formData.append('email', email);
      formData.append('numero_telephone', phone);
      formData.append('password', password);
      formData.append('password_confirm', confirmPassword);
      formData.append('prenom', val.firstName || '');
      formData.append('nom', val.lastName || '');
      formData.append('nom_etablissement', nomEtablissement);
      formData.append('adresse', val.address || val.district || 'Dakar');
      formData.append('slogan', '');
      formData.append('specialite', val.category || '');
      formData.append('telephone_etablissement', phone);

      if (this.nineaDoc.file) formData.append('ninea_file', this.nineaDoc.file);
      if (this.hygieneDoc.file) formData.append('hygiene_file', this.hygieneDoc.file);

      const facade = this.photoCategoriesVendeur.find(c => c.key === 'facade')?.file;
      if (facade) formData.append('photo_facade', facade);

      const stock = this.photoCategoriesVendeur.find(c => c.key === 'stock')?.file;
      if (stock) formData.append('photo_stock', stock);

      const products = this.photoCategoriesVendeur.find(c => c.key === 'products')?.file;
      if (products) formData.append('photo_products', products);

      this.proRegisterService.registerVendeur(formData).subscribe({
        next: (res: RegisterProResponse) => {
          this.isSubmitting = false;
          this.submitSuccess = true;

          const badges: string[] = [];
          if (this.nineaDoc.file) badges.push('Registre NINEA');
          if (this.hygieneDoc.file) badges.push('Certificat d\'Hygiène');
          if (facade) badges.push('Photo Façade');
          if (stock) badges.push('Photo Rayons/Stock');
          if (products) badges.push('Photo Produits');
          if (badges.length === 0) badges.push('Dossier Commerce');

          const summary = {
            reference: `#AYY-VND-${res.etablissement_id || res.user_id || 'PRO'}`,
            accountType: 'Vendeur / Commerce' as const,
            structureName: `${nomEtablissement} (${val.firstName} ${val.lastName})`,
            contactEmail: email,
            contactPhone: phone,
            documentsCountText: `${badges.length} document(s) & photo(s)`,
            attachedBadges: badges
          };

          if (typeof window !== 'undefined') {
            sessionStorage.setItem('ayyou_pro_register_summary', JSON.stringify(summary));
          }

          this.router.navigate(['/pro/register/confirmation'], {
            state: { summary }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Échec de l\'inscription. Veuillez vérifier les informations.';
        }
      });

    } else { // LIVREUR
      if (!this.cniDoc.file || !(this.cniDoc.file instanceof File)) {
        this.isSubmitting = false;
        this.errorMessage = 'Veuillez téléverser votre pièce d\'identité (CNI / Passeport) obligatoire.';
        return;
      }
      if (!this.permisDoc.file || !(this.permisDoc.file instanceof File)) {
        this.isSubmitting = false;
        this.errorMessage = 'Veuillez téléverser votre permis de conduire obligatoire.';
        return;
      }

      const email = (val.email || '').trim().toLowerCase();
      const prenom = val.firstName || '';
      const nom = val.lastName || '';

      const formData = new FormData();
      formData.append('email', email);
      formData.append('numero_telephone', phone);
      formData.append('password', password);
      formData.append('password_confirm', confirmPassword);
      formData.append('prenom', prenom);
      formData.append('nom', nom);
      formData.append('type_vehicule', this.mapVehicleType(val.vehicleType));
      formData.append('marque', val.vehicleModel || '');
      formData.append('modele', val.vehicleModel || '');
      formData.append('immatriculation', val.licensePlate || '');

      if (this.cniDoc.file instanceof File) formData.append('cni_file', this.cniDoc.file);
      if (this.permisDoc.file instanceof File) formData.append('permis_file', this.permisDoc.file);
      if (this.casierDoc.file instanceof File) formData.append('casier_file', this.casierDoc.file);
      if (this.carteGriseDoc.file instanceof File) formData.append('carte_grise_file', this.carteGriseDoc.file);

      this.proRegisterService.registerLivreur(formData).subscribe({
        next: (res: RegisterProResponse) => {
          this.isSubmitting = false;
          this.submitSuccess = true;

          const badges: string[] = [];
          if (this.cniDoc.file) badges.push('Pièce d\'Identité (CNI)');
          if (this.permisDoc.file) badges.push('Permis de conduire');
          if (this.casierDoc.file) badges.push('Casier judiciaire');
          if (this.carteGriseDoc.file) badges.push('Carte grise');
          if (badges.length === 0) badges.push('Pièces justificatives');

          const summary = {
            reference: `#AYY-LIV-${res.profil_livreur_id || res.user_id || 'PRO'}`,
            accountType: 'Livreur / Flotte' as const,
            structureName: `${prenom} ${nom}`,
            contactEmail: email,
            contactPhone: phone,
            documentsCountText: `${badges.length} document(s) téléversé(s)`,
            attachedBadges: badges
          };

          if (typeof window !== 'undefined') {
            sessionStorage.setItem('ayyou_pro_register_summary', JSON.stringify(summary));
          }

          this.router.navigate(['/pro/register/confirmation'], {
            state: { summary }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Échec de l\'inscription. Veuillez vérifier les informations.';
        }
      });
    }
  }
}

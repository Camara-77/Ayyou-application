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

@Component({
  selector: 'app-pro-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pro-register.component.html',
  styleUrls: ['./pro-register.component.scss']
})
export class ProRegisterComponent implements OnInit {
  selectedType: AccountType = 'LIVREUR';
  registerForm!: FormGroup;
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;
  errorMessage: string = '';

  isMobileMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Equipment Radio selection for Livreur
  hasBag: 'own' | 'kit' = 'kit';

  // Documents for Restaurant / Vendeur
  nineaDoc: UploadedDocument = { name: '', file: null, status: 'PENDING' };
  hygieneDoc: UploadedDocument = { name: '', file: null, status: 'NONE' };

  // Documents for Livreur
  cniDoc: UploadedDocument = { name: 'CNI_recto_verso.pdf (1.8 Mo)', file: null, status: 'VALIDATED' };
  permisDoc: UploadedDocument = { name: 'Permis_Conduire_Moussa.jpg (2.4 Mo)', file: null, status: 'VALIDATED' };
  casierDoc: UploadedDocument = { name: '', file: null, status: 'PENDING' };
  carteGriseDoc: UploadedDocument = { name: '', file: null, status: 'NONE' };

  // Photo Categories for Restaurant (4) and Vendeur (3)
  photoCategoriesRestaurant: PhotoCategory[] = [
    { key: 'facade', title: 'Façade extérieure', subtitle: 'Vue de la devanture', file: null, previewUrl: 'mock_facade' },
    { key: 'interior', title: 'Intérieur', subtitle: 'Comptoir / Accueil', file: null, previewUrl: 'mock_interior' },
    { key: 'dining', title: 'Restauration', subtitle: 'Salle clients', file: null, previewUrl: null },
    { key: 'kitchen', title: 'Cuisine', subtitle: 'Poste de cuisson', file: null, previewUrl: null }
  ];

  photoCategoriesVendeur: PhotoCategory[] = [
    { key: 'facade', title: 'Façade boutique / Étalage', subtitle: 'Vue extérieure ou comptoir', file: null, previewUrl: 'mock_facade' },
    { key: 'stock', title: 'Rayons ou Préparation', subtitle: 'Organisation des stocks', file: null, previewUrl: 'mock_stock' },
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

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

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
      password: [''],
      confirmPassword: [''],

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

  onSubmit(): void {
    if (!this.isFormValid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires avant de soumettre.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      if (this.selectedType === 'RESTAURANT') {
        this.router.navigate(['/pro/restaurant/dashboard']);
      } else if (this.selectedType === 'VENDEUR') {
        this.router.navigate(['/pro/vendor/dashboard']);
      } else {
        this.router.navigate(['/pro/delivery/home']);
      }
    }, 1200);
  }
}

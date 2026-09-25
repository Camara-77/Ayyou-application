import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProStudioService } from '../../../../core/services/pro-studio.service';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProfessionalService } from '../../../../core/services/professional.service';
import { ProDish } from '../../../../core/models/pro';

import { MainCategory, CATEGORIES_HIERARCHY } from '../../../../core/constants/taxonomy';

@Component({
  selector: 'app-pro-studio-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-studio-upload.component.html',
  styleUrls: ['./pro-studio-upload.component.scss']
})
export class ProStudioUploadComponent implements OnInit {
  productName: string = '';
  productPrice: number | null = null;
  description: string = '';

  categoriesHierarchy: MainCategory[] = CATEGORIES_HIERARCHY;
  selectedMainCategory: MainCategory = CATEGORIES_HIERARCHY[0];
  selectedSubCategory: string = CATEGORIES_HIERARCHY[0].subCategories[0];

  selectedDishId: string = '';
  dishes: ProDish[] = [];
  selectedFile: File | null = null;
  videoFileSelected: boolean = false;
  videoPreviewUrl: string = '';
  extractedThumbnailUrl: string = '';
  defaultFoodBgUrl: string = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
  videoDurationSeconds: number = 0;
  isUploading: boolean = false;
  errorMessage: string = '';

  constructor(
    private proStudioService: ProStudioService,
    private proMenuService: ProMenuService,
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.proMenuService.dishes$.subscribe(d => {
      this.dishes = d;
      if (d.length > 0) {
        const first = d[0];
        this.selectedDishId = first.id;
        this.productName = first.name;
        this.productPrice = first.price;
        this.description = first.description || '';
      }
    });
  }

  onDishSelect(dishId: string): void {
    this.selectedDishId = dishId;
    const selected = this.dishes.find(d => d.id === dishId);
    if (selected) {
      this.productName = selected.name;
      this.productPrice = selected.price;
      this.description = selected.description || '';
    }
  }

  selectMainCategory(mainCat: MainCategory): void {
    this.selectedMainCategory = mainCat;
    this.selectedSubCategory = mainCat.subCategories.length > 0 ? mainCat.subCategories[0] : 'Général';
  }

  selectSubCategory(subCat: string): void {
    this.selectedSubCategory = subCat;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.videoFileSelected = true;
      this.errorMessage = '';

      // Extrait la première frame réécrivant la miniature
      this.extractFirstFrameThumbnail(file);

      const url = URL.createObjectURL(file);
      this.videoPreviewUrl = url;

      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(tempVideo.src);
        this.videoDurationSeconds = Math.round(tempVideo.duration || 0);
        if (this.videoDurationSeconds > 180) {
          this.errorMessage = 'La durée maximale autorisée pour une vidéo est de 3 minutes (180 secondes).';
        }
      };
    }
  }

  private extractFirstFrameThumbnail(file: File): void {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 360;
        canvas.height = video.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          this.extractedThumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.warn('Extraction miniature frame:', e);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }

  publishVideo(): void {
    if (!this.videoFileSelected) {
      this.errorMessage = 'Veuillez filmer ou importer une vidéo.';
      return;
    }

    if (this.videoDurationSeconds > 180) {
      this.errorMessage = 'La durée maximale autorisée pour une vidéo est de 3 minutes (180 secondes).';
      return;
    }

    if (!this.productName || !this.productName.trim()) {
      this.errorMessage = 'Le nom du produit est obligatoire.';
      return;
    }

    if (!this.productPrice || Number(this.productPrice) <= 0) {
      this.errorMessage = 'Veuillez indiquer un prix valide (FCFA).';
      return;
    }

    if (this.description && this.description.length > 280) {
      this.errorMessage = 'La description ne peut pas dépasser 280 caractères.';
      return;
    }

    this.errorMessage = '';
    this.isUploading = true;

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('video_file', this.selectedFile);
    } else {
      formData.append('media_url', this.videoPreviewUrl);
    }
    if (this.selectedDishId) {
      formData.append('produit_id', this.selectedDishId);
      formData.append('produit', this.selectedDishId);
    }
    formData.append('title', this.productName.trim());
    formData.append('description', this.description ? this.description.trim() : `#${this.selectedMainCategory.name.replace(/\s+/g, '')} #${this.selectedSubCategory.replace(/\s+/g, '')}`);
    formData.append('category', this.selectedMainCategory.name);
    formData.append('sub_category', this.selectedSubCategory);
    formData.append('duree_secondes', this.videoDurationSeconds.toString());

    this.professionalService.uploadVideoFeed(formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        const newVid = this.proStudioService.mapBackendToProVideo(res);
        if (this.extractedThumbnailUrl) {
          newVid.thumbnailUrl = this.extractedThumbnailUrl;
        }
        newVid.category = this.selectedMainCategory.name;
        newVid.subCategory = this.selectedSubCategory;
        this.proStudioService.prependVideo(newVid);
        this.router.navigate(['/pro/profile']);
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage = err?.error?.detail || err?.message || 'Erreur lors du téléversement de la vidéo vers Cloudinary.';
      }
    });
  }
}

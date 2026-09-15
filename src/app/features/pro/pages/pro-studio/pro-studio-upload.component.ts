import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProStudioService } from '../../../../core/services/pro-studio.service';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProDish } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-studio-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-studio-upload.component.html',
  styleUrls: ['./pro-studio-upload.component.scss']
})
export class ProStudioUploadComponent implements OnInit {
  productName: string = 'Thiéboudienne Rouge Royale';
  productPrice: number | null = 4500;
  description: string = 'Riz rouge traditionnel sénégalais préparé avec du mérou frais et des légumes locaux.';
  selectedCategory: string = 'Plat';
  categories: string[] = ['Plat', 'Boisson', 'Dessert', 'Entrée'];

  selectedDishId: string = 'd1';
  dishes: ProDish[] = [];
  videoFileSelected: boolean = true;
  videoPreviewUrl: string = 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-41584-large.mp4';
  isUploading: boolean = false;
  errorMessage: string = '';

  constructor(
    private proStudioService: ProStudioService,
    private proMenuService: ProMenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.proMenuService.dishes$.subscribe(d => this.dishes = d);
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.videoFileSelected = true;
      this.errorMessage = '';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.videoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  publishVideo(): void {
    // Form Validations
    if (!this.videoFileSelected) {
      this.errorMessage = 'Veuillez filmer ou importer une vidéo.';
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

    setTimeout(() => {
      this.isUploading = false;
      const selectedDish = this.dishes.find(d => d.id === this.selectedDishId);

      this.proStudioService.addVideo({
        title: this.productName.trim(),
        dishName: this.productName.trim(),
        priceFcfa: Number(this.productPrice),
        category: this.selectedCategory,
        description: this.description ? this.description.trim() : '#Thieboudienne #DakarFood #AYYOU',
        videoUrl: this.videoPreviewUrl,
        thumbnailUrl: selectedDish?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        dishTag: this.productName.trim()
      });

      this.router.navigate(['/pro/studio/success']);
    }, 800);
  }
}

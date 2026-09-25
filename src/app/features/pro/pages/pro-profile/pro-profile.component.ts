import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProStudioService } from '../../../../core/services/pro-studio.service';
import { ProfessionalService, BackendEtablissement } from '../../../../core/services/professional.service';
import { ProProfile, ProDish, ProVideoUpload } from '../../../../core/models/pro';
import { CATEGORIES_HIERARCHY } from '../../../../core/constants/taxonomy';

@Component({
  selector: 'app-pro-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-profile.component.html',
  styleUrls: ['./pro-profile.component.scss']
})
export class ProProfileComponent implements OnInit {
  public proAuthService = inject(ProAuthService);
  public proMenuService = inject(ProMenuService);
  public proStudioService = inject(ProStudioService);
  private professionalService = inject(ProfessionalService);
  private router = inject(Router);

  profile!: ProProfile;
  dishes: ProDish[] = [];
  videos: ProVideoUpload[] = [];
  selectedTab: 'menu' | 'videos' = 'menu';
  selectedCategory: string = 'Tous';
  categories: string[] = ['Tous', ...CATEGORIES_HIERARCHY.map(c => c.name)];
  videoCategories: string[] = ['Tous', ...CATEGORIES_HIERARCHY.map(c => c.name)];
  selectedVideoCategory: string = 'Tous';
  establishment: BackendEtablissement | null = null;

  ngOnInit(): void {
    this.selectedCategory = 'Tous';
    this.proAuthService.profile$.subscribe(p => this.profile = p);

    // Charge les catégories réelles depuis Django pour compléter les filtres
    this.professionalService.getCategories().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          const names = Array.from(new Set([...CATEGORIES_HIERARCHY.map(c => c.name), ...cats.map(c => c.nom)]));
          this.categories = ['Tous', ...names];
          this.videoCategories = ['Tous', ...names];
        }
      },
      error: () => {}
    });

    this.proStudioService.videos$.subscribe(v => this.videos = v);

    // Charge les données de l'établissement puis récupère ses vrais plats et ses vraies vidéos
    this.professionalService.getMyEstablishment().subscribe({
      next: (etab) => {
        this.establishment = etab;
        const mapped = this.professionalService.mapEtablissementToProfile(etab);
        this.proAuthService.updateProfile(mapped);
        this.proMenuService.loadBackendProducts(etab.id).subscribe();
        this.proStudioService.loadFeedPublications(etab.id).subscribe();
      },
      error: () => {
        this.proMenuService.loadBackendProducts().subscribe();
        this.proStudioService.loadFeedPublications().subscribe();
      }
    });

    this.proMenuService.dishes$.subscribe(d => this.dishes = d);
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  setVideoCategory(cat: string): void {
    this.selectedVideoCategory = cat;
  }

  get filteredDishes(): ProDish[] {
    if (!this.selectedCategory || this.selectedCategory === 'Tous') {
      return this.dishes;
    }
    const target = this.selectedCategory.toLowerCase();
    return this.dishes.filter(d => 
      (d.category && d.category.toLowerCase() === target) ||
      (d.categoryName && d.categoryName.toLowerCase() === target)
    );
  }

  get filteredVideos(): ProVideoUpload[] {
    if (!this.selectedVideoCategory || this.selectedVideoCategory === 'Tous') {
      return this.videos;
    }
    const target = this.selectedVideoCategory.toLowerCase();
    return this.videos.filter(v => 
      (v.category && v.category.toLowerCase() === target) ||
      (v.dishTag && v.dishTag.toLowerCase() === target)
    );
  }

  toggleDishVisibility(dishId: string): void {
    this.proMenuService.toggleDishVisibility(dishId);
  }

  toggleVideoVisibility(videoId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.proStudioService.toggleVideoVisibility(videoId);
  }

  deleteDish(dishId: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce plat du menu ?')) {
      this.proMenuService.deleteDish(dishId);
    }
  }

  previewVideo(video: ProVideoUpload): void {
    this.router.navigate(['/pro/studio/preview']);
  }

  logout(): void {
    this.proAuthService.logout();
    this.router.navigate(['/pro/login']);
  }
}

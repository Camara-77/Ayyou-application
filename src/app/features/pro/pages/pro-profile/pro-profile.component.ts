import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProStudioService } from '../../../../core/services/pro-studio.service';
import { ProProfile, ProDish, ProVideoUpload } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-profile.component.html',
  styleUrls: ['./pro-profile.component.scss']
})
export class ProProfileComponent implements OnInit {
  profile!: ProProfile;
  dishes: ProDish[] = [];
  videos: ProVideoUpload[] = [];
  selectedTab: 'menu' | 'videos' = 'videos';
  selectedCategory: string = 'Tous';
  categories: string[] = ['Tous', 'Plats Nationaux', 'Entrées', 'Boissons & ...'];
  videoCategories: string[] = ['Tous', 'Plats Nationaux', 'Entrées', 'Boissons & ...'];
  selectedVideoCategory: string = 'Tous';

  constructor(
    public proAuthService: ProAuthService,
    public proMenuService: ProMenuService,
    public proStudioService: ProStudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.proAuthService.profile$.subscribe(p => this.profile = p);
    this.proMenuService.dishes$.subscribe(d => this.dishes = d);
    this.proStudioService.videos$.subscribe(v => this.videos = v);
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  setVideoCategory(cat: string): void {
    this.selectedVideoCategory = cat;
  }

  get filteredVideos(): ProVideoUpload[] {
    if (this.selectedVideoCategory === 'Tous') {
      return this.videos;
    }
    return this.videos.filter(v => v.category === this.selectedVideoCategory || v.dishTag === this.selectedVideoCategory);
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProStudioService } from '../../../../core/services/pro-studio.service';
import { ProVideoUpload } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-studio-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-studio-preview.component.html',
  styleUrls: ['./pro-studio-preview.component.scss']
})
export class ProStudioPreviewComponent implements OnInit {
  video!: ProVideoUpload;
  isLiked: boolean = false;
  likesCountFormatted: string = '1.2k';

  constructor(
    private proStudioService: ProStudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const videos = this.proStudioService.getVideos();
    this.video = videos[0] || {
      id: 'v1',
      title: 'Thiéboudienne Penda Mbaye',
      dishName: 'Thiéboudienne Penda Mbaye',
      priceFcfa: 4500,
      description: '#Thieboudienne #DakarFood #AYYOU',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-41584-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      dishTag: 'Thiéboudienne Penda Mbaye',
      viewsCount: 1240,
      likesCount: 1200,
      createdAt: new Date().toISOString()
    };
  }

  toggleLike(): void {
    this.isLiked = !this.isLiked;
    if (this.isLiked) {
      this.likesCountFormatted = '1.2k+1';
    } else {
      this.likesCountFormatted = '1.2k';
    }
  }

  shareVideo(): void {
    if (navigator.share) {
      navigator.share({
        title: this.video.title,
        text: 'Regarde cette vidéo culinaire sur AYYOU !',
        url: window.location.href
      }).catch(() => {});
    }
  }

  goToOrder(): void {
    this.router.navigate(['/cart']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProStudioService } from '../../../../core/services/pro-studio.service';
import { ProVideoUpload } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-studio-success',
  standalone: true,
  imports: [CommonModule, RouterModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-studio-success.component.html',
  styleUrls: ['./pro-studio-success.component.scss']
})
export class ProStudioSuccessComponent implements OnInit {
  latestVideo?: ProVideoUpload;

  constructor(private proStudioService: ProStudioService) {}

  ngOnInit(): void {
    const list = this.proStudioService.getVideos();
    if (list && list.length > 0) {
      this.latestVideo = list[0];
    } else {
      this.latestVideo = {
        id: 'v_default',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-41584-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        dishName: 'Thiéboudienne Rouge Royal',
        title: 'Thiéboudienne Rouge Royal',
        priceFcfa: 4500,
        description: '#Thieboudienne #DakarFood #AYYOU',
        viewsCount: 0,
        publishedAt: "À l'instant"
      };
    }
  }
}

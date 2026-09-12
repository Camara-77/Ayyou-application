import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements AfterViewInit {
  private router = inject(Router);

  @ViewChild('logoVideo') logoVideo?: ElementRef<HTMLVideoElement>;

  // Exact path to AYYOU logo MP4 animation
  logoAssetUrl = '/assets/branding/logoanimeayyou.mp4';
  logoAssetType: 'video' | 'image' = 'video';

  ngAfterViewInit(): void {
    if (this.logoVideo?.nativeElement) {
      const video = this.logoVideo.nativeElement;
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  onContinue(): void {
    this.router.navigate(['/login']);
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { UserProfile } from '../../../../core/models/client';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userProfile?: UserProfile;

  constructor(
    private clientDataService: ClientDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientDataService.getUserProfile().subscribe(profile => {
      this.userProfile = profile;
    });
  }

  toggleNotifications(): void {
    if (this.userProfile) {
      this.userProfile.notificationsEnabled = !this.userProfile.notificationsEnabled;
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}

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
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  userProfile?: UserProfile;
  fullName: string = 'Moussa Diop';
  phone: string = '+221 77 123 45 67';
  email: string = 'moussa.diop@ayyou.sn';
  addressMain: string = 'Point E, Rue 5';
  addressSub: string = 'Dakar, Sénégal';
  birthDate: string = '14 Mars 1990';
  isSavedNotification: boolean = false;

  constructor(
    private clientDataService: ClientDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientDataService.getUserProfile().subscribe(profile => {
      this.userProfile = profile;
      if (profile) {
        this.fullName = profile.name;
      }
    });
  }

  saveChanges(): void {
    this.isSavedNotification = true;
    setTimeout(() => {
      this.isSavedNotification = false;
      this.router.navigate(['/profile']);
    }, 1200);
  }

  deleteAccount(): void {
    this.router.navigate(['/login']);
  }
}

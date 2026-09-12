import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, AuthHeaderComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
}

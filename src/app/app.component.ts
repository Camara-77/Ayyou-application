import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent } from './core/components/auth-modal/auth-modal.component';
import { ChatbotFloatingComponent } from './features/client/components/chatbot-floating/chatbot-floating.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthModalComponent, ChatbotFloatingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ayyou';
}

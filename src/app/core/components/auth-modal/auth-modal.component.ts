import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthModalService, AuthModalConfig } from '../../services/auth-modal.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent implements OnInit, OnDestroy {
  private authModalService = inject(AuthModalService);
  private router = inject(Router);

  isOpen = false;
  config: AuthModalConfig = {};

  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.authModalService.isOpen$.subscribe(open => {
      this.isOpen = open;
    });

    this.sub.add(
      this.authModalService.config$.subscribe(cfg => {
        this.config = cfg;
      })
    );
  }

  onLogin(): void {
    this.authModalService.closeModal();
    const returnUrl = this.config.returnUrl || this.router.url;
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  onRegister(): void {
    this.authModalService.closeModal();
    const returnUrl = this.config.returnUrl || this.router.url;
    this.router.navigate(['/register'], { queryParams: { returnUrl } });
  }

  onClose(): void {
    this.authModalService.closeModal();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

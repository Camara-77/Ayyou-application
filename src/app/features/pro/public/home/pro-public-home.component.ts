import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface PartnerCard {
  id: number;
  name: string;
  speciality: string;
  location: string;
  status: string;
  imageUrl: string;
}

@Component({
  selector: 'app-pro-public-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-public-home.component.html',
  styleUrls: ['./pro-public-home.component.scss']
})
export class ProPublicHomeComponent implements OnInit, OnDestroy {
  activeSection: string = 'accueil';
  isMobileMenuOpen: boolean = false;
  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;

  partners: PartnerCard[] = [
    {
      id: 1,
      name: 'Chez Loutcha',
      speciality: 'Dakar Plateau • Cuisine Africaine',
      location: 'Plateau, Dakar',
      status: 'Ouvert',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'Chez La Mère',
      speciality: 'Almadies • Grillades & Poissons',
      location: 'Almadies, Dakar',
      status: 'Ouvert',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      name: 'Le Délice de Dakar',
      speciality: 'Point E • Pâtisserie & Traiteur',
      location: 'Point E, Dakar',
      status: 'Ouvert',
      imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 4,
      name: 'Ngor la Brise',
      speciality: 'Ngor • Cuisine de la Mer',
      location: 'Ngor, Dakar',
      status: 'Ouvert',
      imageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 5,
      name: 'Le Petit Dakar',
      speciality: 'Mermoz • Cuisine Locale',
      location: 'Mermoz, Dakar',
      status: 'Ouvert',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 6,
      name: 'N\'Gaïdé Food',
      speciality: 'Yoff • Fast-Food & Burger',
      location: 'Yoff, Dakar',
      status: 'Ouvert',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
    }
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.setupIntersectionObserver();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    const sectionIds = ['accueil', 'services', 'livraison', 'partenaires', 'avantages'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          this.activeSection = entry.target.id;
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0.1, 0.25, 0.5]
    });

    sections.forEach(section => this.observer?.observe(section));
  }

  scrollToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeSection = sectionId;
    this.isMobileMenuOpen = false;

    if (this.isBrowser) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  navigateToPartner(partnerId: number): void {
    this.router.navigate(['/restaurant', partnerId]);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}

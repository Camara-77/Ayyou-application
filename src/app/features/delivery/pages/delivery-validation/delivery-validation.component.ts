import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Livraison } from '../../../../core/models/delivery';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

@Component({
  selector: 'app-delivery-validation',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-validation.component.html',
  styleUrl: './delivery-validation.component.scss'
})
export class DeliveryValidationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  private deliveryService = inject(DeliveryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  delivery: Livraison | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Camera & Torch states
  hasCameraPermission = false;
  cameraError = '';
  isScanning = false;
  isTorchOn = false;
  hasTorchSupport = false;

  scannedQrToken: string | null = null;
  validatingBackend = false;
  isDeliveryCompleted = false;

  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private barcodeDetector: any = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idParam = params['id'] || params['orderId'];
      if (idParam) {
        const numericId = parseInt(idParam, 10);
        if (!isNaN(numericId)) {
          this.loadDelivery(numericId);
        } else {
          this.loadDeliveryByRef(idParam);
        }
      } else {
        this.isLoading = false;
        this.errorMessage = "Aucun identifiant de livraison fourni.";
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isLoading) {
      this.initCamera();
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  loadDelivery(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveryById(id).subscribe({
      next: (res) => {
        this.delivery = res;
        this.isLoading = false;
        if (res.statut === 'LIVREE') {
          this.isDeliveryCompleted = true;
          this.router.navigate(['/livreur/success', res.id]);
        } else {
          setTimeout(() => this.initCamera(), 300);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || "Impossible de charger la livraison.";
      }
    });
  }

  loadDeliveryByRef(ref: string): void {
    this.deliveryService.getDeliveries().subscribe({
      next: (list) => {
        const found = list.find(d => d.commande_reference === ref || d.id.toString() === ref);
        if (found) {
          this.delivery = found;
          this.isLoading = false;
          if (found.statut === 'LIVREE') {
            this.isDeliveryCompleted = true;
            this.router.navigate(['/livreur/success', found.id]);
          } else {
            setTimeout(() => this.initCamera(), 300);
          }
        } else {
          this.isLoading = false;
          this.errorMessage = "Livraison introuvable.";
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de récupérer la livraison.";
      }
    });
  }

  initCamera(): void {
    this.cameraError = '';
    this.hasCameraPermission = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.cameraError = "La caméra n'est pas supportée par ce navigateur.";
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
    }).then((stream) => {
      this.mediaStream = stream;
      this.hasCameraPermission = true;

      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.play().catch(() => {});
      }

      // Check Torch support
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          this.hasTorchSupport = true;
        }
      }

      // Init Native BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        try {
          this.barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        } catch (e) {
          this.barcodeDetector = null;
        }
      }

      this.startScanLoop();
    }).catch((err) => {
      console.warn('Erreur permission caméra:', err);
      this.cameraError = "Autorisation caméra nécessaire pour scanner le QR Code.";
    });
  }

  toggleTorch(): void {
    if (!this.mediaStream) return;
    const track = this.mediaStream.getVideoTracks()[0];
    if (track && this.hasTorchSupport) {
      this.isTorchOn = !this.isTorchOn;
      track.applyConstraints({
        advanced: [{ torch: this.isTorchOn } as any]
      }).catch(() => {});
    }
  }

  private startScanLoop(): void {
    this.isScanning = true;

    const scanFrame = () => {
      if (!this.isScanning || this.validatingBackend || this.isDeliveryCompleted) return;

      if (this.barcodeDetector && this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          this.barcodeDetector.detect(video).then((barcodes: any[]) => {
            if (barcodes && barcodes.length > 0) {
              const qrValue = barcodes[0].rawValue;
              if (qrValue) {
                this.onQrDetected(qrValue);
                return;
              }
            }
            if (this.isScanning) {
              this.animFrameId = requestAnimationFrame(scanFrame);
            }
          }).catch(() => {
            if (this.isScanning) {
              this.animFrameId = requestAnimationFrame(scanFrame);
            }
          });
          return;
        }
      }

      if (this.isScanning) {
        this.animFrameId = requestAnimationFrame(scanFrame);
      }
    };

    this.animFrameId = requestAnimationFrame(scanFrame);
  }

  onQrDetected(qrToken: string): void {
    if (this.validatingBackend || this.scannedQrToken === qrToken) return;

    this.scannedQrToken = qrToken;
    this.errorMessage = '';
    this.successMessage = '';

    // Automatically trigger backend validation
    this.submitBackendQrValidation(qrToken);
  }

  submitBackendQrValidation(token: string): void {
    if (this.validatingBackend) return;
    this.validatingBackend = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.deliveryService.validateByQr({ token_qr: token }).subscribe({
      next: (updated) => {
        this.validatingBackend = false;
        this.delivery = updated;
        this.isDeliveryCompleted = true;
        this.successMessage = "Livraison validée avec succès !";
        this.stopCamera();

        // Redirect to success confirmation page
        this.router.navigate(['/livreur/success', updated.id || this.delivery?.id]);
      },
      error: (err) => {
        this.validatingBackend = false;
        this.errorMessage = err.error?.detail || "QR Code invalide pour cette livraison.";
        // Reset scanned token to allow scanning again
        setTimeout(() => {
          this.scannedQrToken = null;
        }, 2000);
      }
    });
  }

  manualValidateClick(): void {
    if (this.scannedQrToken) {
      this.submitBackendQrValidation(this.scannedQrToken);
    } else if (this.delivery?.token_qr) {
      this.submitBackendQrValidation(this.delivery.token_qr);
    } else {
      const manualCode = prompt("Saisissez ou collez le code QR du client :");
      if (manualCode) {
        this.submitBackendQrValidation(manualCode.trim());
      }
    }
  }

  stopCamera(): void {
    this.isScanning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  goBack(): void {
    this.stopCamera();
    this.location.back();
  }
}

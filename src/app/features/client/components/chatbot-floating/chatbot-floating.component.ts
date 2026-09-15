import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot-floating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-floating.component.html',
  styleUrls: ['./chatbot-floating.component.scss']
})
export class ChatbotFloatingComponent implements OnInit {
  badgeCount: number = 1;
  isOpen: boolean = false;

  // Dragging state
  isDragging: boolean = false;
  hasDragged: boolean = false;

  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private initialPosX: number = 0;
  private initialPosY: number = 0;

  posX: number = 16;
  posY: number = 140;

  ngOnInit(): void {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 440;
    const containerWidth = 440;
    const initialLeft = Math.max(16, (screenWidth - containerWidth) / 2 + 16);
    this.posX = initialLeft;
    this.posY = 140;
  }

  toggleChat(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.hasDragged) {
      this.isOpen = !this.isOpen;
    }
  }

  // --- MOUSE DRAG ---
  onMouseDown(event: MouseEvent): void {
    this.startDrag(event.clientX, event.clientY);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.moveDrag(event.clientX, event.clientY);
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.endDrag();
  }

  // --- TOUCH DRAG ---
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startDrag(touch.clientX, touch.clientY);
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.isDragging && event.touches.length === 1) {
      const touch = event.touches[0];
      this.moveDrag(touch.clientX, touch.clientY);
    }
  }

  @HostListener('window:touchend')
  onTouchEnd(): void {
    this.endDrag();
  }

  private startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.hasDragged = false;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.initialPosX = this.posX;
    this.initialPosY = this.posY;
  }

  private moveDrag(clientX: number, clientY: number): void {
    const deltaX = clientX - this.dragStartX;
    const deltaY = clientY - this.dragStartY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      this.hasDragged = true;
    }

    let newX = this.initialPosX + deltaX;
    let newY = this.initialPosY + deltaY;

    // Viewport Boundary Constraints
    const btnSize = 54;
    const maxX = (typeof window !== 'undefined' ? window.innerWidth : 440) - btnSize - 10;
    const maxY = (typeof window !== 'undefined' ? window.innerHeight : 800) - btnSize - 10;

    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(10, Math.min(newY, maxY));

    this.posX = newX;
    this.posY = newY;
  }

  private endDrag(): void {
    if (this.isDragging) {
      this.isDragging = false;
      setTimeout(() => {
        this.hasDragged = false;
      }, 100);
    }
  }
}

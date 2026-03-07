import { Component, OnInit, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartComponent } from './components/cart/cart.component';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    FooterComponent,
    CartComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col" [class.overflow-hidden]="cartService.isOpen()">
      <app-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
      <app-cart />

      <!-- Toast Notification -->
      @if (toast()) {
        <div class="toast" [class]="'toast-' + toast()!.type">
          <span>{{ toast()!.icon }}</span>
          <p>{{ toast()!.message }}</p>
        </div>
      }

      <!-- Scroll to Top Button -->
      @if (showScrollTop()) {
        <button
          (click)="scrollToTop()"
          class="fixed bottom-6 left-6 z-30 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-glow-saffron transition-all duration-300 hover:scale-110"
          style="background: linear-gradient(135deg, #FF6B1A, #8B1A1A);"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      }
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  showScrollTop = signal(false);
  toast = signal<{message: string; type: string; icon: string} | null>(null);

  constructor(public cartService: CartService) {}

  ngOnInit() {
    // Listen for cart-related toasts
    this.cartService.toast$.subscribe(t => {
      if (t) {
        this.toast.set(t);
        setTimeout(() => this.toast.set(null), 3000);
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.showScrollTop.set(window.scrollY > 400);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

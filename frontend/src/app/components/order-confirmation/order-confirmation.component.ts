import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/interfaces';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#1A0A00] via-[#3D1A00] to-[#8B1A1A] flex items-center justify-center p-4">
      @if (loading()) {
        <div class="text-center text-white">
          <div class="text-4xl animate-spin">🌶️</div>
          <p class="mt-4 font-body">Loading your order...</p>
        </div>
      } @else if (order()) {
        <div class="max-w-lg w-full">
          <!-- Success Animation -->
          <div class="text-center mb-8">
            <div class="success-checkmark">✅</div>
            <h1 class="font-heading text-4xl text-white font-bold mt-4 mb-2">
              Order Confirmed!
            </h1>
            <p class="font-body text-gold-300 text-lg">
              Namaste! Your delicious food is being prepared.
            </p>
          </div>

          <!-- Order Card -->
          <div class="bg-white/95 rounded-3xl p-6 shadow-2xl">
            <!-- Order Number -->
            <div class="text-center mb-6 pb-6 border-b border-gold-100">
              <p class="font-body text-sm text-gray-500 mb-1">Order Number</p>
              <p class="font-heading text-2xl font-bold text-saffron-500">{{ order()!.order_number }}</p>
            </div>

            <!-- Customer Info -->
            <div class="mb-6">
              <h3 class="font-body font-bold text-spice-dark mb-3">📦 Order Details</h3>
              <div class="space-y-2 text-sm text-gray-600">
                <p>👤 {{ order()!.customer_name }}</p>
                <p>📧 {{ order()!.customer_email }}</p>
                @if (order()!.customer_phone) {
                  <p>📱 {{ order()!.customer_phone }}</p>
                }
                <p class="font-semibold text-saffron-500">
                  {{ order()!.order_type === 'delivery' ? '🛵 Delivery' : '🏃 Pickup' }}
                  — ~{{ order()!.order_type === 'delivery' ? '45' : '20' }} mins
                </p>
              </div>
            </div>

            <!-- Order Total -->
            <div class="bg-gradient-to-r from-saffron-50 to-amber-50 rounded-2xl p-4 mb-6">
              <div class="flex justify-between items-center">
                <span class="font-body font-bold text-spice-dark">Total Paid</span>
                <span class="font-heading text-2xl font-bold text-saffron-500">
                  \${{ order()!.total.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Tracking Note -->
            <div class="text-center text-sm text-gray-500 mb-6">
              <p>📧 A confirmation email has been sent to</p>
              <p class="font-semibold text-spice-dark">{{ order()!.customer_email }}</p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3">
              <a routerLink="/menu" class="btn-primary text-center">
                🍛 Order More Food
              </a>
              <a routerLink="/" class="btn-secondary text-center">
                🏠 Back to Home
              </a>
            </div>
          </div>

          <!-- Fun Quote -->
          <p class="text-center text-white/40 font-body text-sm mt-6 italic">
            "Kitne aadmi the? Sirf tumhara order!" 🌶️
          </p>
        </div>
      } @else {
        <div class="text-center text-white">
          <p class="font-heading text-2xl mb-4">Order not found</p>
          <a routerLink="/" class="btn-primary">Go Home</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .success-checkmark {
      font-size: 5rem;
      animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  route = inject(ActivatedRoute);
  orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const order = await this.orderService.getOrder(id);
      this.order.set(order);
    }
    this.loading.set(false);
  }
}

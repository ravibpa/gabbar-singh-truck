import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { CartItem, MenuItem, Toast } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Cart state signals
  readonly items = signal<CartItem[]>([]);
  readonly isOpen = signal(false);
  readonly promoCode = signal<string>('');
  readonly discount = signal(0);

  // Toast subject for notifications
  readonly toast$ = new Subject<Toast | null>();

  // Computed values
  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );

  readonly taxRate = 0.08; // 8% tax

  readonly tax = computed(() =>
    parseFloat((this.subtotal() * this.taxRate).toFixed(2))
  );

  readonly deliveryFee = signal(3.99);
  readonly freeDeliveryThreshold = 35.00;

  readonly actualDeliveryFee = computed(() =>
    this.subtotal() >= this.freeDeliveryThreshold ? 0 : this.deliveryFee()
  );

  readonly total = computed(() =>
    parseFloat((
      this.subtotal() +
      this.tax() +
      this.actualDeliveryFee() -
      this.discount()
    ).toFixed(2))
  );

  readonly isEmpty = computed(() => this.items().length === 0);

  constructor() {
    // Restore cart from localStorage
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('gst-cart');
      if (saved) {
        this.items.set(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('gst-cart', JSON.stringify(this.items()));
    } catch {
      // ignore
    }
  }

  // Add item to cart
  addItem(menuItem: MenuItem, quantity = 1) {
    const existing = this.items().find(i => i.menu_item_id === menuItem.id);

    if (existing) {
      this.updateQuantity(existing.id, existing.quantity + quantity);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        image_url: menuItem.image_url,
        is_vegetarian: menuItem.is_vegetarian,
      };
      this.items.update(items => [...items, newItem]);
    }

    this.saveToStorage();
    this.showToast(`${menuItem.name} added to cart!`, 'success', '🛒');
  }

  // Remove item from cart
  removeItem(cartItemId: string) {
    const item = this.items().find(i => i.id === cartItemId);
    this.items.update(items => items.filter(i => i.id !== cartItemId));
    this.saveToStorage();

    if (item) {
      this.showToast(`${item.name} removed`, 'info', '🗑️');
    }
  }

  // Update quantity
  updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(cartItemId);
      return;
    }

    this.items.update(items =>
      items.map(i => i.id === cartItemId ? { ...i, quantity } : i)
    );
    this.saveToStorage();
  }

  // Update special instructions
  updateInstructions(cartItemId: string, instructions: string) {
    this.items.update(items =>
      items.map(i => i.id === cartItemId ? { ...i, special_instructions: instructions } : i)
    );
    this.saveToStorage();
  }

  // Clear cart
  clear() {
    this.items.set([]);
    this.discount.set(0);
    this.promoCode.set('');
    localStorage.removeItem('gst-cart');
  }

  // Apply promo code
  applyPromoCode(code: string, discountAmount: number) {
    this.promoCode.set(code);
    this.discount.set(discountAmount);
    this.showToast(`Promo code applied! You saved $${discountAmount.toFixed(2)}`, 'success', '🎉');
  }

  // Open/close cart
  openCart() { this.isOpen.set(true); }
  closeCart() { this.isOpen.set(false); }
  toggleCart() { this.isOpen.update(v => !v); }

  // Toast notification
  showToast(message: string, type: 'success' | 'error' | 'info', icon: string) {
    this.toast$.next({ message, type, icon });
    setTimeout(() => this.toast$.next(null), 3100);
  }

  // Get serialized items for order
  getOrderItems() {
    return this.items().map(item => ({
      menu_item_id: item.menu_item_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      special_instructions: item.special_instructions,
    }));
  }
}

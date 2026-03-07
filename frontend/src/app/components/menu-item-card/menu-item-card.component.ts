import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../models/interfaces';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-item-card.component.html',
  styleUrl: './menu-item-card.component.scss'
})
export class MenuItemCardComponent {
  @Input({ required: true }) item!: MenuItem;

  cartService = inject(CartService);
  quantity = signal(1);
  added = signal(false);

  get spiceArray(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  get isInCart(): boolean {
    return this.cartService.items().some(i => i.menu_item_id === this.item.id);
  }

  get cartQuantity(): number {
    return this.cartService.items().find(i => i.menu_item_id === this.item.id)?.quantity ?? 0;
  }

  addToCart() {
    this.cartService.addItem(this.item, 1);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1500);
  }

  increaseQuantity() {
    if (this.isInCart) {
      const item = this.cartService.items().find(i => i.menu_item_id === this.item.id);
      if (item) {
        this.cartService.updateQuantity(item.id, item.quantity + 1);
      }
    }
  }

  decreaseQuantity() {
    const item = this.cartService.items().find(i => i.menu_item_id === this.item.id);
    if (item) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

  getImageSrc(): string {
    if (this.item.image_url) return this.item.image_url;
    // Emoji-based placeholder images
    const emojiMap: Record<string, string> = {
      'Butter Chicken': '🍛',
      'Dal Makhani': '🫕',
      'Masala Dosa': '🥞',
      'Tupaki Chicken': '🍗',
      'Biryani': '🍚',
      'Filter Coffee': '☕',
    };
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (this.item.name.includes(key)) return emoji;
    }
    return this.item.is_vegetarian ? '🥘' : '🍗';
  }

  get hasImage(): boolean {
    return !!(this.item.image_url);
  }
}

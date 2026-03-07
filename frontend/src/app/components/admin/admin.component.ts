import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { SupabaseService } from '../../services/supabase.service';
import { MenuItem, MenuCategory, Order } from '../../models/interfaces';

type AdminTab = 'dashboard' | 'menu' | 'orders' | 'settings';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  auth = inject(AuthService);
  menuService = inject(MenuService);
  orderService = inject(OrderService);
  supabase = inject(SupabaseService);
  fb = inject(FormBuilder);

  activeTab = signal<AdminTab>('dashboard');
  loading = signal(false);
  orders = signal<Order[]>([]);
  allMenuItems = signal<MenuItem[]>([]);
  editingItem = signal<MenuItem | null>(null);
  showItemModal = signal(false);
  saving = signal(false);
  error = signal('');
  successMsg = signal('');

  // Stats
  todayOrders = signal(0);
  todayRevenue = signal(0);
  totalItems = signal(0);

  itemForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    category_id: ['', Validators.required],
    is_vegetarian: [false],
    spice_level: [1],
    is_available: [true],
    is_featured: [false],
    is_special: [false],
    image_url: [''],
    sort_order: [0],
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    await Promise.all([
      this.menuService.loadCategories(),
      this.loadAllMenuItems(),
      this.loadOrders(),
    ]);
    this.calculateStats();
    this.loading.set(false);
  }

  async loadAllMenuItems() {
    try {
      const items = await this.menuService.loadAllItems();
      this.allMenuItems.set(items);
      this.totalItems.set(items.length);
    } catch {}
  }

  async loadOrders() {
    try {
      const orders = await this.orderService.getAllOrders(100);
      this.orders.set(orders);
    } catch {}
  }

  calculateStats() {
    const today = new Date().toDateString();
    const todayOrders = this.orders().filter(o =>
      new Date(o.created_at!).toDateString() === today
    );
    this.todayOrders.set(todayOrders.length);
    this.todayRevenue.set(todayOrders.reduce((sum, o) => sum + o.total, 0));
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
    this.showItemModal.set(false);
  }

  openAddItem() {
    this.editingItem.set(null);
    this.itemForm.reset({
      name: '', description: '', price: 0, category_id: '',
      is_vegetarian: false, spice_level: 1, is_available: true,
      is_featured: false, is_special: false, image_url: '', sort_order: 0
    });
    this.showItemModal.set(true);
  }

  openEditItem(item: MenuItem) {
    this.editingItem.set(item);
    this.itemForm.patchValue({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      is_vegetarian: item.is_vegetarian,
      spice_level: item.spice_level,
      is_available: item.is_available,
      is_featured: item.is_featured,
      is_special: item.is_special,
      image_url: item.image_url,
      sort_order: item.sort_order,
    });
    this.showItemModal.set(true);
  }

  closeModal() {
    this.showItemModal.set(false);
    this.editingItem.set(null);
    this.error.set('');
  }

  async saveItem() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const data = this.itemForm.value;

      if (this.editingItem()) {
        await this.menuService.updateItem(this.editingItem()!.id, data);
        this.successMsg.set('Item updated successfully!');
      } else {
        await this.menuService.createItem(data);
        this.successMsg.set('Item created successfully!');
      }

      await this.loadAllMenuItems();
      this.closeModal();
      setTimeout(() => this.successMsg.set(''), 3000);
    } catch (e: any) {
      this.error.set(e.message || 'Failed to save item');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await this.menuService.deleteItem(item.id);
      await this.loadAllMenuItems();
      this.successMsg.set('Item deleted.');
      setTimeout(() => this.successMsg.set(''), 3000);
    } catch (e: any) {
      this.error.set(e.message);
    }
  }

  async toggleAvailability(item: MenuItem) {
    await this.menuService.toggleAvailability(item.id, !item.is_available);
    await this.loadAllMenuItems();
  }

  async updateOrderStatus(order: Order, status: Order['status']) {
    try {
      await this.orderService.updateOrderStatus(order.id!, status);
      await this.loadOrders();
    } catch {}
  }

  getCategoryName(categoryId: string): string {
    return this.menuService.categories().find(c => c.id === categoryId)?.name || '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      ready: 'status-ready',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return map[status] || '';
  }

  get spiceLevels() { return [1, 2, 3, 4, 5]; }
  get pendingOrders() { return this.orders().filter(o => o.status === 'pending').length; }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { SupabaseService } from '../../services/supabase.service';
import { MenuItem, MenuCategory, Order, SiteOffer } from '../../models/interfaces';
import { environment } from '../../../environments/environment';

type AdminTab = 'dashboard' | 'menu' | 'orders' | 'offers' | 'settings';

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

  // Offers
  offers = signal<SiteOffer[]>([]);
  editingOffer = signal<SiteOffer | null>(null);
  showOfferModal = signal(false);
  offerSaving = signal(false);

  // Settings
  settingsSaving = signal(false);
  stripeMode = environment.stripePublishableKey?.startsWith('pk_live') ? 'live' : 'test';
  stripeKey = environment.stripePublishableKey
    ? environment.stripePublishableKey.substring(0, 10) + '...' + environment.stripePublishableKey.slice(-4)
    : 'Not configured';
  logoUrl = signal('');
  logoSaving = signal(false);

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

  offerForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    badge_text: ['', Validators.required],
    discount_type: ['percentage', Validators.required],
    discount_value: [0, [Validators.required, Validators.min(0)]],
    applies_to: ['all', Validators.required],
    is_active: [true],
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
      this.loadOffers(),
      this.loadLogoUrl(),
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

  async loadOffers() {
    try {
      const { data } = await this.supabase.client
        .from('site_offers')
        .select('*')
        .order('sort_order', { ascending: true });
      this.offers.set((data || []) as SiteOffer[]);
    } catch {}
  }

  async loadLogoUrl() {
    try {
      const { data } = await this.supabase.client
        .from('site_settings')
        .select('settings')
        .eq('id', 'main')
        .single();
      if (data?.settings?.logo_url) {
        this.logoUrl.set(data.settings.logo_url);
      }
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

  getItemsForCategory(categoryId: string): MenuItem[] {
    return this.allMenuItems().filter(i => i.category_id === categoryId);
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
    this.showItemModal.set(false);
    this.showOfferModal.set(false);
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

  // ===== OFFERS =====
  openAddOffer() {
    this.editingOffer.set(null);
    this.offerForm.reset({
      title: '', description: '', badge_text: '',
      discount_type: 'percentage', discount_value: 0,
      applies_to: 'all', is_active: true, sort_order: 0
    });
    this.showOfferModal.set(true);
  }

  openEditOffer(offer: SiteOffer) {
    this.editingOffer.set(offer);
    this.offerForm.patchValue(offer);
    this.showOfferModal.set(true);
  }

  closeOfferModal() {
    this.showOfferModal.set(false);
    this.editingOffer.set(null);
    this.error.set('');
  }

  async saveOffer() {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }

    this.offerSaving.set(true);
    this.error.set('');

    try {
      const data = this.offerForm.value;
      if (this.editingOffer()?.id) {
        const { error } = await this.supabase.client
          .from('site_offers')
          .update(data)
          .eq('id', this.editingOffer()!.id);
        if (error) throw error;
        this.successMsg.set('Offer updated!');
      } else {
        const { error } = await this.supabase.client
          .from('site_offers')
          .insert(data);
        if (error) throw error;
        this.successMsg.set('Offer created!');
      }
      await this.loadOffers();
      this.closeOfferModal();
      setTimeout(() => this.successMsg.set(''), 3000);
    } catch (e: any) {
      this.error.set(e.message || 'Failed to save offer');
    } finally {
      this.offerSaving.set(false);
    }
  }

  async toggleOffer(offer: SiteOffer) {
    try {
      const { error } = await this.supabase.client
        .from('site_offers')
        .update({ is_active: !offer.is_active })
        .eq('id', offer.id);
      if (error) throw error;
      await this.loadOffers();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }

  async deleteOffer(offer: SiteOffer) {
    if (!confirm(`Delete offer "${offer.title}"?`)) return;
    try {
      const { error } = await this.supabase.client
        .from('site_offers')
        .delete()
        .eq('id', offer.id);
      if (error) throw error;
      await this.loadOffers();
      this.successMsg.set('Offer deleted.');
      setTimeout(() => this.successMsg.set(''), 3000);
    } catch (e: any) {
      this.error.set(e.message);
    }
  }

  getOfferDiscountLabel(offer: SiteOffer): string {
    if (offer.discount_value === 0) return offer.badge_text;
    return offer.discount_type === 'percentage'
      ? `${offer.discount_value}% OFF`
      : `$${offer.discount_value} OFF`;
  }

  // ===== SETTINGS =====
  async saveLogo() {
    if (!this.logoUrl()) return;
    this.logoSaving.set(true);
    try {
      // Upsert into site_settings
      const { error } = await this.supabase.client
        .from('site_settings')
        .upsert({ id: 'main', settings: { logo_url: this.logoUrl() } }, { onConflict: 'id' });
      if (error) throw error;
      this.successMsg.set('Logo URL saved! Refresh the site to see changes.');
      setTimeout(() => this.successMsg.set(''), 4000);
    } catch (e: any) {
      this.error.set('Failed to save logo: ' + e.message);
    } finally {
      this.logoSaving.set(false);
    }
  }

  get spiceLevels() { return [1, 2, 3, 4, 5]; }
  get pendingOrders() { return this.orders().filter(o => o.status === 'pending').length; }
}

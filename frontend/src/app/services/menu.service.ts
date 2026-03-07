import { Injectable, inject, signal, computed } from '@angular/core';
import { from, Observable, map, catchError, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { MenuItem, MenuCategory, MenuType } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private supabase = inject(SupabaseService);

  // Signals for reactive state
  readonly categories = signal<MenuCategory[]>([]);
  readonly items = signal<MenuItem[]>([]);
  readonly loading = signal(false);
  readonly selectedType = signal<MenuType>('all');
  readonly searchQuery = signal('');
  readonly vegFilter = signal<'all' | 'veg' | 'nonveg'>('all');

  // Computed filtered items
  readonly filteredItems = computed(() => {
    let items = this.items();
    const type = this.selectedType();
    const query = this.searchQuery().toLowerCase();
    const vegFilter = this.vegFilter();

    if (type !== 'all') {
      const catIds = this.categories()
        .filter(c => c.type === type)
        .map(c => c.id);
      items = items.filter(i => catIds.includes(i.category_id));
    }

    if (query) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query) ||
        i.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    if (vegFilter === 'veg') {
      items = items.filter(i => i.is_vegetarian);
    } else if (vegFilter === 'nonveg') {
      items = items.filter(i => !i.is_vegetarian);
    }

    return items;
  });

  readonly featuredItems = computed(() =>
    this.items().filter(i => i.is_featured && i.is_available)
  );

  readonly specialItems = computed(() =>
    this.items().filter(i => i.is_special && i.is_available)
  );

  readonly northItems = computed(() => {
    const northCatIds = this.categories()
      .filter(c => c.type === 'north')
      .map(c => c.id);
    return this.items().filter(i => northCatIds.includes(i.category_id) && i.is_available);
  });

  readonly southItems = computed(() => {
    const southCatIds = this.categories()
      .filter(c => c.type === 'south')
      .map(c => c.id);
    return this.items().filter(i => southCatIds.includes(i.category_id) && i.is_available);
  });

  // Load all categories
  async loadCategories(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      this.categories.set(data as MenuCategory[]);
    }
  }

  // Load all menu items with category info
  async loadMenuItems(): Promise<void> {
    this.loading.set(true);

    const { data, error } = await this.supabase.client
      .from('menu_items')
      .select(`
        *,
        category:menu_categories(*)
      `)
      .eq('is_available', true)
      .order('sort_order');

    if (!error && data) {
      this.items.set(data as MenuItem[]);
    }

    this.loading.set(false);
  }

  // Load all items (including unavailable) for admin
  async loadAllItems(): Promise<MenuItem[]> {
    const { data, error } = await this.supabase.client
      .from('menu_items')
      .select(`*, category:menu_categories(*)`)
      .order('sort_order');

    if (error) throw error;
    return (data || []) as MenuItem[];
  }

  // Create menu item
  async createItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await this.supabase.client
      .from('menu_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as MenuItem;
  }

  // Update menu item
  async updateItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await this.supabase.client
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update local state
    this.items.update(items =>
      items.map(i => i.id === id ? { ...i, ...updates } : i)
    );

    return data as MenuItem;
  }

  // Delete menu item
  async deleteItem(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    this.items.update(items => items.filter(i => i.id !== id));
  }

  // Toggle item availability
  async toggleAvailability(id: string, is_available: boolean): Promise<void> {
    await this.updateItem(id, { is_available });
  }

  // Upload menu item image
  async uploadItemImage(itemId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `menu-items/${itemId}.${ext}`;

    const { error } = await this.supabase.uploadImage('menu-images', path, file);
    if (error) throw error;

    return this.supabase.getPublicUrl('menu-images', path);
  }

  // Get item by ID
  getItemById(id: string): MenuItem | undefined {
    return this.items().find(i => i.id === id);
  }

  // Get items by category
  getItemsByCategory(categoryId: string): MenuItem[] {
    return this.items().filter(i => i.category_id === categoryId && i.is_available);
  }
}

import { Component, OnInit, inject, signal, computed, AfterViewInit, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { MenuItemCardComponent } from '../menu-item-card/menu-item-card.component';
import { MenuCategory } from '../../models/interfaces';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MenuItemCardComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, AfterViewInit {
  menuService = inject(MenuService);
  route = inject(ActivatedRoute);
  el = inject(ElementRef);

  activeTab = signal<'all' | 'north' | 'south' | 'special'>('all');
  searchQuery = signal('');
  vegFilter = signal<'all' | 'veg' | 'nonveg'>('all');

  constructor() {
    effect(() => {
      // Re-run scroll reveal whenever items or categories load
      this.menuService.items();
      this.menuService.categories();
      setTimeout(() => this.setupScrollReveal(), 50);
    });
  }

  tabs = [
    { id: 'all', label: 'All Dishes', icon: '🍽️' },
    { id: 'north', label: 'North Indian', icon: '🏔️' },
    { id: 'south', label: 'South Indian', icon: '🌴' },
    { id: 'special', label: "Chef's Special", icon: '⭐' },
  ] as const;

  ngOnInit() {
    this.menuService.loadCategories();
    this.menuService.loadMenuItems();

    // Handle query params for type
    this.route.queryParams.subscribe(params => {
      if (params['type'] && ['all', 'north', 'south', 'special'].includes(params['type'])) {
        this.setTab(params['type'] as any);
      }
    });
  }

  ngAfterViewInit() {
    this.setupScrollReveal();
  }

  private observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('revealed');
    }),
    { threshold: 0.05 }
  );

  private setupScrollReveal() {
    setTimeout(() => {
      this.el.nativeElement.querySelectorAll('.reveal:not(.revealed)').forEach((el: Element) => this.observer.observe(el));
    }, 100);
  }

  setTab(tab: 'all' | 'north' | 'south' | 'special') {
    this.activeTab.set(tab);
    this.menuService.selectedType.set(tab);
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.menuService.searchQuery.set(query);
  }

  setVegFilter(filter: 'all' | 'veg' | 'nonveg') {
    this.vegFilter.set(filter);
    this.menuService.vegFilter.set(filter);
  }

  get categoryGroups() {
    const items = this.menuService.filteredItems();
    const categories = this.menuService.categories();
    const activeType = this.activeTab();

    const filteredCats = activeType === 'all'
      ? categories
      : categories.filter(c => c.type === activeType);

    return filteredCats
      .map(cat => ({
        category: cat,
        items: items.filter(i => i.category_id === cat.id)
      }))
      .filter(g => g.items.length > 0);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.vegFilter.set('all');
    this.menuService.searchQuery.set('');
    this.menuService.vegFilter.set('all');
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery() !== '' || this.vegFilter() !== 'all';
  }
}

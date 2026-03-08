import { Component, OnInit, inject, signal, ElementRef, AfterViewInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { MenuItemCardComponent } from '../menu-item-card/menu-item-card.component';
import { SupabaseService } from '../../services/supabase.service';
import { MenuItem, SiteOffer } from '../../models/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, MenuItemCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  readonly Math = Math;
  menuService = inject(MenuService);
  private supabase = inject(SupabaseService);
  private el = inject(ElementRef);

  // Catering form state
  cateringName = '';
  cateringEmail = '';
  cateringPhone = '';
  cateringDate = '';
  cateringGuests = '';
  cateringEvent = '';
  cateringMessage = '';
  cateringSubmitted = signal(false);
  cateringLoading = signal(false);
  cateringError = signal('');

  async submitCatering() {
    if (!this.cateringName.trim() || !this.cateringEmail.trim() || !this.cateringPhone.trim()) {
      this.cateringError.set('Please fill in your name, email, and phone number.');
      return;
    }
    this.cateringLoading.set(true);
    this.cateringError.set('');
    const { error } = await this.supabase.client
      .from('catering_inquiries')
      .insert({
        name: this.cateringName.trim(),
        email: this.cateringEmail.trim(),
        phone: this.cateringPhone.trim(),
        event_date: this.cateringDate || null,
        guest_count: this.cateringGuests || null,
        event_type: this.cateringEvent || null,
        message: this.cateringMessage.trim() || null,
      });
    this.cateringLoading.set(false);
    if (error) {
      // Fallback: open mailto with form data pre-filled
      const subject = encodeURIComponent('Catering Inquiry from ' + this.cateringName);
      const body = encodeURIComponent(
        `Name: ${this.cateringName}\nPhone: ${this.cateringPhone}\nEmail: ${this.cateringEmail}` +
        (this.cateringDate ? `\nEvent Date: ${this.cateringDate}` : '') +
        (this.cateringGuests ? `\nGuests: ${this.cateringGuests}` : '') +
        (this.cateringEvent ? `\nEvent Type: ${this.cateringEvent}` : '') +
        (this.cateringMessage ? `\n\nMessage: ${this.cateringMessage}` : '')
      );
      window.open(`mailto:namaste@gabbarsinghtruck.com?subject=${subject}&body=${body}`);
    }
    this.cateringSubmitted.set(true);
    this.cateringName = ''; this.cateringEmail = ''; this.cateringPhone = '';
    this.cateringDate = ''; this.cateringGuests = ''; this.cateringEvent = '';
    this.cateringMessage = '';
  }

  activeOffers = signal<SiteOffer[]>([]);

  particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: ['🌶️', '🫛', '🧅', '🧄', '⭐', '🪷', '✨', '🍃'][i % 8],
    style: this.randomParticleStyle()
  }));

  ngOnInit() {
    this.menuService.loadCategories();
    this.menuService.loadMenuItems();
    this.loadActiveOffers();
  }

  async loadActiveOffers() {
    try {
      const { data } = await this.supabase.client
        .from('site_offers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      this.activeOffers.set((data || []) as SiteOffer[]);
    } catch {}
  }

  ngAfterViewInit() {
    this.setupScrollReveal();
  }

  private homeObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('revealed');
    }),
    { threshold: 0.08 }
  );

  constructor() {
    effect(() => {
      this.menuService.items();
      this.menuService.categories();
      setTimeout(() => this.setupScrollReveal(), 100);
    });
  }

  private setupScrollReveal() {
    setTimeout(() => {
      this.el.nativeElement.querySelectorAll('.reveal:not(.revealed)').forEach((el: Element) => {
        this.homeObserver.observe(el);
      });
    }, 100);
  }

  private randomParticleStyle(): string {
    const top = Math.random() * 90;
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 3 + Math.random() * 2;
    const size = 1.2 + Math.random() * 1.5;
    return `top:${top}%;left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;font-size:${size}rem;opacity:${0.08 + Math.random() * 0.12}`;
  }

  get tupakiItem(): MenuItem | undefined {
    return this.menuService.items().find(i => i.name.includes('Tupaki'));
  }

  get northFeatured(): MenuItem[] {
    const northCatIds = this.menuService.categories()
      .filter(c => c.type === 'north')
      .map(c => c.id);
    return this.menuService.items()
      .filter(i => northCatIds.includes(i.category_id) && i.is_featured && i.is_available)
      .slice(0, 3);
  }

  get southFeatured(): MenuItem[] {
    const southCatIds = this.menuService.categories()
      .filter(c => c.type === 'south')
      .map(c => c.id);
    return this.menuService.items()
      .filter(i => southCatIds.includes(i.category_id) && i.is_featured && i.is_available)
      .slice(0, 3);
  }
}

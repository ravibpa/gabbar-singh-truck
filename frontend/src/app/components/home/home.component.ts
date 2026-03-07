import { Component, OnInit, inject, signal, ElementRef, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { MenuItemCardComponent } from '../menu-item-card/menu-item-card.component';
import { MenuItem } from '../../models/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, MenuItemCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  menuService = inject(MenuService);
  private el = inject(ElementRef);

  particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: ['🌶️', '🫛', '🧅', '🧄', '⭐', '🪷', '✨', '🍃'][i % 8],
    style: this.randomParticleStyle()
  }));

  ngOnInit() {
    this.menuService.loadCategories();
    this.menuService.loadMenuItems();
  }

  ngAfterViewInit() {
    this.setupScrollReveal();
  }

  private setupScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => {
        observer.observe(el);
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

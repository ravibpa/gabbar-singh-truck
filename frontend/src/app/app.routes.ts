import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    title: 'Gabbar Singh Truck | Authentic Indian Street Food'
  },
  {
    path: 'menu',
    loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent),
    title: 'Menu | Gabbar Singh Truck'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout | Gabbar Singh Truck'
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () => import('./components/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    title: 'Order Confirmed | Gabbar Singh Truck'
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
    title: 'Admin Panel | Gabbar Singh Truck'
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./components/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Admin Login | Gabbar Singh Truck'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

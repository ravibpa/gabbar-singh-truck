import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A0A00] via-[#3D1A00] to-[#8B1A1A] p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-3 group">
            <span class="text-4xl">🌶️</span>
            <div>
              <div class="font-heading text-2xl font-bold text-gradient-saffron">Gabbar Singh Truck</div>
              <div class="text-xs text-gold-500 tracking-widest uppercase">Admin Panel</div>
            </div>
          </a>
        </div>

        <!-- Login Card -->
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gold-200/30">
          <h1 class="font-heading text-2xl font-bold text-spice-dark mb-2">Welcome Back</h1>
          <p class="text-sm text-spice-dark/50 mb-8">Sign in to manage your food truck</p>

          <form [formGroup]="form" (ngSubmit)="signIn()" class="flex flex-col gap-5">
            <div>
              <label class="form-label">Email Address</label>
              <input type="email" formControlName="email" class="form-input"
                     placeholder="admin@gabbarsinghtruck.com" />
            </div>

            <div>
              <label class="form-label">Password</label>
              <input type="password" formControlName="password" class="form-input"
                     placeholder="••••••••" />
            </div>

            @if (error()) {
              <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                ⚠️ {{ error() }}
              </div>
            }

            <button type="submit" class="btn-primary w-full py-4" [disabled]="loading()">
              @if (loading()) {
                <span class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing in...
              } @else {
                🔑 Sign In
              }
            </button>
          </form>

          <p class="text-center text-xs text-spice-dark/40 mt-6">
            <a routerLink="/" class="text-saffron-500 hover:underline">← Back to website</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async signIn() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    const result = await this.auth.signIn(email!, password!);

    if (result.error) {
      this.error.set(result.error);
      this.loading.set(false);
      return;
    }

    this.router.navigate(['/admin']);
  }
}

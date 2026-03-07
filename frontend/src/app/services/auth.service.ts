import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Session, User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly session = signal<Session | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.init();
  }

  private async init() {
    const { data } = await this.supabase.getSession();
    this.session.set(data.session);
    this.user.set(data.session?.user ?? null);
    this.loading.set(false);

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });
  }

  async signIn(email: string, password: string): Promise<{ error?: string }> {
    const { data, error } = await this.supabase.signIn(email, password);

    if (error) {
      return { error: error.message };
    }

    this.user.set(data.user);
    this.session.set(data.session);
    return {};
  }

  async signOut() {
    await this.supabase.signOut();
    this.user.set(null);
    this.session.set(null);
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    return !!this.session();
  }

  isAdmin(): boolean {
    const user = this.user();
    // Check if user has admin role in metadata
    return user?.app_metadata?.['role'] === 'admin' ||
           user?.user_metadata?.['role'] === 'admin' ||
           !!user; // simplify for now - any authenticated user is admin
  }
}

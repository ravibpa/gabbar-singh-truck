import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { Order } from '../models/interfaces';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private supabase = inject(SupabaseService);
  private http = inject(HttpClient);

  // Create order via backend API (bypasses RLS using service key)
  async createOrder(order: Omit<Order, 'id' | 'order_number'>): Promise<Order> {
    const result = await firstValueFrom(
      this.http.post<Order>(`${environment.apiUrl}/orders`, order)
    );
    return result;
  }

  // Update order payment status via backend API
  async updatePaymentStatus(
    orderId: string,
    paymentIntentId: string,
    status: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiUrl}/orders/${orderId}/payment`, {
        paymentIntentId,
        status
      })
    );
  }

  // Get order by ID via backend API (uses service key, bypasses RLS)
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      return await firstValueFrom(
        this.http.get<Order>(`${environment.apiUrl}/orders/${orderId}`)
      );
    } catch {
      return null;
    }
  }

  // Get all orders (admin)
  async getAllOrders(limit = 50): Promise<Order[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`*, order_items(*)`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Order[];
  }

  // Update order status (admin)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await this.supabase.client
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }

  // Get orders by email
  async getOrdersByEmail(email: string): Promise<Order[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`*, order_items(*)`)
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Order[];
  }
}

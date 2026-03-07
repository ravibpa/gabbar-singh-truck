import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Order, OrderItem } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private supabase = inject(SupabaseService);

  // Create order
  async createOrder(order: Omit<Order, 'id' | 'order_number'>): Promise<Order> {
    const { items, ...orderData } = order;

    // Insert order
    const { data: orderResult, error: orderError } = await this.supabase.client
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map(item => ({
      ...item,
      order_id: orderResult.id
    }));

    const { error: itemsError } = await this.supabase.client
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return orderResult as Order;
  }

  // Update order payment status
  async updatePaymentStatus(
    orderId: string,
    paymentIntentId: string,
    status: string
  ): Promise<void> {
    const { error } = await this.supabase.client
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_status: status,
        status: status === 'succeeded' ? 'confirmed' : 'pending'
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) return null;
    return data as Order;
  }

  // Get all orders (admin)
  async getAllOrders(limit = 50): Promise<Order[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
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

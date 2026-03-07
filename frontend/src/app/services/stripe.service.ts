import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private http = inject(HttpClient);
  private stripePromise: Promise<Stripe | null>;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  // Create payment intent via backend
  async createPaymentIntent(amount: number, currency = 'usd', metadata?: Record<string, string>) {
    const response = await firstValueFrom(
      this.http.post<{ client_secret: string; payment_intent_id: string }>(
        `${environment.apiUrl}/stripe/create-payment-intent`,
        { amount: Math.round(amount * 100), currency, metadata }
      )
    );
    return response;
  }

  // Mount Stripe Payment Element to a DOM element
  async mountPaymentElement(elementId: string, clientSecret: string): Promise<void> {
    const stripe = await this.stripePromise;
    if (!stripe) throw new Error('Stripe failed to initialize');

    this.elements = stripe.elements({
      clientSecret,
      appearance: {
        theme: 'flat',
        variables: {
          colorPrimary: '#FF6B1A',
          colorBackground: '#FFF8F0',
          colorText: '#2C1810',
          colorDanger: '#8B1A1A',
          fontFamily: 'Poppins, sans-serif',
          fontSizeBase: '14px',
          spacingUnit: '4px',
          borderRadius: '12px',
        },
        rules: {
          '.Input': {
            border: '2px solid rgba(201, 162, 39, 0.3)',
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 248, 240, 0.8)',
          },
          '.Input:focus': {
            borderColor: '#FF6B1A',
            boxShadow: '0 0 0 3px rgba(255, 107, 26, 0.15)',
          },
          '.Label': {
            fontWeight: '600',
            color: '#2C1810',
          },
        }
      }
    });

    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount(`#${elementId}`);
  }

  // Confirm payment
  async confirmPayment(returnUrl: string): Promise<{ error?: any }> {
    const stripe = await this.stripePromise;
    if (!stripe || !this.elements) {
      return { error: { message: 'Stripe not initialized' } };
    }

    const { error } = await stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required'
    });

    return { error };
  }

  // Destroy elements
  destroyElements() {
    this.paymentElement?.destroy();
    this.paymentElement = null;
    this.elements = null;
  }

  // Validate promo code via backend
  async validatePromoCode(code: string, orderAmount: number) {
    return firstValueFrom(
      this.http.post<{
        valid: boolean;
        discount_type?: 'percentage' | 'fixed';
        discount_value?: number;
        discount_amount?: number;
        message?: string;
      }>(
        `${environment.apiUrl}/promo/validate`,
        { code, order_amount: orderAmount }
      )
    );
  }
}

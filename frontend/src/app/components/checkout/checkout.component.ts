import { Component, OnInit, OnDestroy, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { StripeService } from '../../services/stripe.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  cartService = inject(CartService);
  stripeService = inject(StripeService);
  orderService = inject(OrderService);
  router = inject(Router);
  fb = inject(FormBuilder);

  step = signal<1 | 2>(1); // 1 = info, 2 = payment
  loading = signal(false);
  paymentLoading = signal(false);
  error = signal('');
  promoInput = signal('');
  promoLoading = signal(false);
  orderId = signal<string | null>(null);
  clientSecret = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{10,}$/)]],
    order_type: ['pickup', Validators.required],
    street: [''],
    city: [''],
    state: [''],
    zip: [''],
    notes: [''],
  });

  ngOnInit() {
    // Redirect if cart is empty
    if (this.cartService.isEmpty()) {
      this.router.navigate(['/menu']);
    }

    // Dynamic validators for delivery
    this.form.get('order_type')?.valueChanges.subscribe(type => {
      const addressFields = ['street', 'city', 'state', 'zip'];
      if (type === 'delivery') {
        addressFields.forEach(f => {
          this.form.get(f)?.setValidators(Validators.required);
          this.form.get(f)?.updateValueAndValidity();
        });
      } else {
        addressFields.forEach(f => {
          this.form.get(f)?.clearValidators();
          this.form.get(f)?.updateValueAndValidity();
        });
      }
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.stripeService.destroyElements();
  }

  get orderType(): 'pickup' | 'delivery' {
    return this.form.get('order_type')?.value;
  }

  async proceedToPayment() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      // Create payment intent
      const formData = this.form.value;
      const pi = await this.stripeService.createPaymentIntent(
        this.cartService.total(),
        'usd',
        {
          customer_email: formData.email,
          customer_name: formData.name,
          order_type: formData.order_type,
        }
      );

      this.clientSecret.set(pi.client_secret);
      this.step.set(2);

      // Mount Stripe payment element after step change
      setTimeout(async () => {
        try {
          await this.stripeService.mountPaymentElement('stripe-payment-element', pi.client_secret);
        } catch (e: any) {
          this.error.set('Failed to load payment form: ' + e.message);
        }
      }, 100);

    } catch (e: any) {
      this.error.set(e.message || 'Something went wrong. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async confirmPayment() {
    this.paymentLoading.set(true);
    this.error.set('');

    try {
      const formData = this.form.value;

      // Create order record first
      const order = await this.orderService.createOrder({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        order_type: formData.order_type,
        delivery_address: formData.order_type === 'delivery' ? {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        } : undefined,
        notes: formData.notes,
        subtotal: this.cartService.subtotal(),
        tax: this.cartService.tax(),
        delivery_fee: this.cartService.actualDeliveryFee(),
        discount: this.cartService.discount(),
        total: this.cartService.total(),
        promo_code: this.cartService.promoCode() || undefined,
        items: this.cartService.getOrderItems(),
      });

      this.orderId.set(order.id!);

      // Confirm with Stripe
      const returnUrl = `${window.location.origin}/order-confirmation/${order.id}`;
      const { error } = await this.stripeService.confirmPayment(returnUrl);

      if (error) {
        this.error.set(error.message || 'Payment failed. Please try again.');
        return;
      }

      // Payment succeeded
      await this.orderService.updatePaymentStatus(order.id!, 'pi_confirmed', 'succeeded');
      this.cartService.clear();
      this.router.navigate(['/order-confirmation', order.id]);

    } catch (e: any) {
      this.error.set(e.message || 'Payment failed. Please try again.');
    } finally {
      this.paymentLoading.set(false);
    }
  }

  async applyPromo() {
    if (!this.promoInput()) return;
    this.promoLoading.set(true);

    try {
      const result = await this.stripeService.validatePromoCode(
        this.promoInput(),
        this.cartService.subtotal()
      );

      if (result.valid && result.discount_amount) {
        this.cartService.applyPromoCode(this.promoInput(), result.discount_amount);
        this.promoInput.set('');
      } else {
        this.cartService.showToast(result.message || 'Invalid promo code', 'error', '❌');
      }
    } catch {
      this.cartService.showToast('Failed to validate promo code', 'error', '❌');
    } finally {
      this.promoLoading.set(false);
    }
  }

  goBack() {
    this.step.set(1);
    this.stripeService.destroyElements();
    this.clientSecret.set(null);
    this.error.set('');
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (control?.errors?.['required']) return 'This field is required';
    if (control?.errors?.['email']) return 'Enter a valid email address';
    if (control?.errors?.['minlength']) return 'Too short';
    if (control?.errors?.['pattern']) return 'Invalid format';
    return '';
  }
}

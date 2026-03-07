// ============================================================
// STRIPE ROUTES - Payment Processing
// ============================================================
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================================
// CREATE PAYMENT INTENT
// POST /api/stripe/create-payment-intent
// ============================================================
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // in cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        restaurant: 'Gabbar Singh Truck',
        ...metadata
      }
    });

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// STRIPE WEBHOOK
// POST /api/stripe/webhook
// ============================================================
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

      // Update order payment status in Supabase
      await supabase
        .from('orders')
        .update({
          stripe_payment_status: 'succeeded',
          status: 'confirmed'
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log(`❌ Payment failed: ${paymentIntent.id}`);

      await supabase
        .from('orders')
        .update({ stripe_payment_status: 'failed', status: 'cancelled' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ============================================================
// GET PAYMENT STATUS
// GET /api/stripe/payment-status/:paymentIntentId
// ============================================================
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const pi = await stripe.paymentIntents.retrieve(req.params.paymentIntentId);
    res.json({ status: pi.status, amount: pi.amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

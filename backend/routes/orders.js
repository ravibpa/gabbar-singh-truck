// ============================================================
// ORDERS ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// POST /api/orders - Create new order (bypasses RLS via service key)
router.post('/', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;

    if (!orderData.customer_name || !orderData.customer_email || !orderData.total) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items if provided
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({ ...item, order_id: order.id }));
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/payment - Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentIntentId, status } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_status: status,
        status: status === 'succeeded' ? 'confirmed' : 'pending'
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders - Get all orders (admin)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

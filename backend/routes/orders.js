// ============================================================
// ORDERS ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Email transporter (only if SMTP is configured)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOrderReceipt(order, items) {
  if (!transporter) return;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const itemsHtml = (items || []).map(item =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:center;">x${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:right;">$${(item.total_price || item.unit_price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:'Poppins',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff8f0;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1A0A00,#8B1A1A);padding:32px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:8px;">🌶️</div>
        <h1 style="font-family:Georgia,serif;color:#FFD700;margin:0;font-size:1.6rem;">Gabbar Singh Truck</h1>
        <p style="color:rgba(255,248,240,0.7);margin:8px 0 0;font-size:0.9rem;">Order Confirmed!</p>
      </div>
      <div style="padding:28px;">
        <p style="color:#2C1810;font-size:1rem;">Hi <strong>${order.customer_name}</strong>,</p>
        <p style="color:#2C1810;font-size:0.9rem;">Your order <strong style="color:#FF6B1A;">${order.order_number || '#' + order.id?.substring(0,8)}</strong> has been received. 🎉</p>
        <p style="color:#2C1810;font-size:0.9rem;">Order type: <strong>${order.order_type === 'delivery' ? '🛵 Delivery' : '🏃 Pickup'}</strong></p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;background:white;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#1A0A00;">
              <th style="padding:10px 12px;color:#C9A227;text-align:left;font-size:0.8rem;">Item</th>
              <th style="padding:10px 12px;color:#C9A227;text-align:center;font-size:0.8rem;">Qty</th>
              <th style="padding:10px 12px;color:#C9A227;text-align:right;font-size:0.8rem;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="border-top:2px solid rgba(201,162,39,0.2);padding-top:16px;text-align:right;">
          <p style="margin:4px 0;font-size:0.85rem;color:rgba(44,24,16,0.6);">Subtotal: $${(order.subtotal || 0).toFixed(2)}</p>
          ${order.discount ? `<p style="margin:4px 0;font-size:0.85rem;color:#138808;">Discount: -$${order.discount.toFixed(2)}</p>` : ''}
          <p style="margin:4px 0;font-size:0.85rem;color:rgba(44,24,16,0.6);">Tax: $${(order.tax || 0).toFixed(2)}</p>
          ${order.delivery_fee ? `<p style="margin:4px 0;font-size:0.85rem;color:rgba(44,24,16,0.6);">Delivery: $${order.delivery_fee.toFixed(2)}</p>` : ''}
          <p style="margin:8px 0 0;font-size:1.2rem;font-weight:700;color:#FF6B1A;">Total: $${order.total.toFixed(2)}</p>
        </div>

        <div style="margin-top:24px;padding:16px;background:rgba(201,162,39,0.08);border-radius:10px;border-left:4px solid #C9A227;">
          <p style="margin:0;font-size:0.85rem;color:#2C1810;">🌶️ <strong>Thank you for choosing Gabbar Singh Truck!</strong></p>
          <p style="margin:8px 0 0;font-size:0.8rem;color:rgba(44,24,16,0.6);">Questions? Call us or reply to this email.</p>
        </div>
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: `"Gabbar Singh Truck 🌶️" <${fromEmail}>`,
      to: order.customer_email,
      subject: `Order Confirmed 🌶️ ${order.order_number || ''} - Gabbar Singh Truck`,
      html,
    });
    console.log(`✅ Receipt sent to ${order.customer_email}`);
  } catch (err) {
    console.error('Failed to send receipt:', err.message);
  }
}

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

    // Send receipt email asynchronously (don't block response)
    sendOrderReceipt(order, items).catch(() => {});

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

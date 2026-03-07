const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// POST /api/promo/validate
router.post('/validate', async (req, res) => {
  try {
    const { code, order_amount } = req.body;

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return res.json({ valid: false, message: 'Invalid or expired promo code' });
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.json({ valid: false, message: 'This promo code has expired' });
    }

    // Check max uses
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return res.json({ valid: false, message: 'This promo code has reached its usage limit' });
    }

    // Check minimum order
    if (order_amount < promo.min_order_amount) {
      return res.json({
        valid: false,
        message: `Minimum order of $${promo.min_order_amount} required for this code`
      });
    }

    // Calculate discount
    let discount_amount = 0;
    if (promo.discount_type === 'percentage') {
      discount_amount = (order_amount * promo.discount_value) / 100;
    } else {
      discount_amount = promo.discount_value;
    }

    res.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount_amount: parseFloat(discount_amount.toFixed(2)),
      message: `Promo applied! You save $${discount_amount.toFixed(2)}`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// GET /api/menu/categories
router.get('/categories', async (req, res) => {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/menu/items
router.get('/items', async (req, res) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, category:menu_categories(*)')
    .eq('is_available', true)
    .order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;

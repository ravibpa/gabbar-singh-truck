-- ============================================================
-- GABBAR SINGH TRUCK - Seed Data
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO menu_categories (id, name, type, description, icon, sort_order) VALUES
  ('11111111-0000-0000-0000-000000000001', 'North Indian Mains', 'north', 'Rich, creamy curries and tandoor specialties from the heartland of India', '🍛', 1),
  ('11111111-0000-0000-0000-000000000002', 'North Indian Breads', 'north', 'Fresh-baked naans and rotis from our tandoor oven', '🫓', 2),
  ('11111111-0000-0000-0000-000000000003', 'North Indian Drinks', 'north', 'Refreshing lassis and Indian beverages', '🥛', 3),
  ('22222222-0000-0000-0000-000000000001', 'South Indian Mains', 'south', 'Authentic flavors from Tamil Nadu, Kerala, and Andhra Pradesh', '🌿', 4),
  ('22222222-0000-0000-0000-000000000002', 'South Indian Snacks', 'south', 'Crispy dosas, fluffy idlis and savory vadas', '🥞', 5),
  ('22222222-0000-0000-0000-000000000003', 'South Indian Drinks', 'south', 'Aromatic filter coffee and refreshing drinks', '☕', 6),
  ('33333333-0000-0000-0000-000000000001', 'Chef Specials', 'special', 'Our legendary secret recipes that keep you coming back', '⭐', 7);

-- ============================================================
-- MENU ITEMS
-- ============================================================

-- NORTH INDIAN MAINS
INSERT INTO menu_items (category_id, name, description, price, is_vegetarian, spice_level, is_featured, tags, sort_order) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Butter Chicken', 'Tender chicken in a rich, velvety tomato-cream sauce with aromatic spices. The quintessential North Indian comfort dish.', 15.99, false, 2, true, ARRAY['popular', 'bestseller'], 1),
  ('11111111-0000-0000-0000-000000000001', 'Dal Makhani', 'Slow-cooked black lentils simmered overnight with tomatoes, cream and butter. A true Punjabi masterpiece.', 13.99, true, 1, false, ARRAY['vegetarian', 'popular'], 2),
  ('11111111-0000-0000-0000-000000000001', 'Paneer Tikka Masala', 'Charred cottage cheese cubes in a spiced onion-tomato gravy. Rich, tangy and absolutely divine.', 14.99, true, 2, false, ARRAY['vegetarian'], 3),
  ('11111111-0000-0000-0000-000000000001', 'Lamb Rogan Josh', 'Slow-braised Kashmir lamb with whole spices, yogurt and crimson Kashmiri chilies. Bold, aromatic perfection.', 18.99, false, 3, false, ARRAY['premium'], 4),
  ('11111111-0000-0000-0000-000000000001', 'Chicken Biryani', 'Fragrant basmati rice layered with spiced chicken, caramelized onions, saffron and fresh mint. Dum-cooked to perfection.', 16.99, false, 2, true, ARRAY['popular', 'rice'], 5),
  ('11111111-0000-0000-0000-000000000001', 'Palak Paneer', 'Fresh cottage cheese cubes in a velvety spinach sauce spiced with ginger, garlic and garam masala.', 13.99, true, 2, false, ARRAY['vegetarian', 'healthy'], 6),
  ('11111111-0000-0000-0000-000000000001', 'Chicken Tikka', 'Juicy chicken marinated in yogurt and spices, char-grilled in our tandoor oven. Served with mint chutney.', 14.99, false, 2, false, ARRAY['tandoor'], 7),

-- NORTH INDIAN BREADS
  ('11111111-0000-0000-0000-000000000002', 'Garlic Naan', 'Soft leavened bread with garlic and butter, baked in tandoor oven. Perfect for scooping up curries.', 3.99, true, 1, false, ARRAY['bread'], 1),
  ('11111111-0000-0000-0000-000000000002', 'Butter Naan', 'Classic soft naan glazed with butter fresh from the tandoor. Light, fluffy perfection.', 2.99, true, 1, false, ARRAY['bread'], 2),
  ('11111111-0000-0000-0000-000000000002', 'Cheese Naan', 'Naan stuffed with melted cheese and herbs. An indulgent, crowd-pleasing favorite.', 4.99, true, 1, false, ARRAY['bread', 'cheese'], 3),
  ('11111111-0000-0000-0000-000000000002', 'Paratha', 'Whole wheat layered flatbread cooked on the griddle with ghee. Flaky, rich and satisfying.', 3.49, true, 1, false, ARRAY['bread'], 4),

-- NORTH INDIAN DRINKS
  ('11111111-0000-0000-0000-000000000003', 'Mango Lassi', 'Thick, creamy yogurt shake blended with Alphonso mangoes and a hint of cardamom. Pure sunshine in a glass.', 5.99, true, 1, true, ARRAY['drink', 'popular'], 1),
  ('11111111-0000-0000-0000-000000000003', 'Sweet Lassi', 'Traditional Punjabi yogurt drink blended with sugar, rose water and topped with cream.', 4.99, true, 1, false, ARRAY['drink'], 2),
  ('11111111-0000-0000-0000-000000000003', 'Salted Lassi', 'Refreshing savory yogurt drink with cumin, rock salt and fresh mint. The perfect summer cooler.', 4.99, true, 1, false, ARRAY['drink'], 3),
  ('11111111-0000-0000-0000-000000000003', 'Masala Chai', 'Aromatic Indian spiced tea brewed with ginger, cardamom, cinnamon and milk. Soul-warming goodness.', 3.49, true, 1, false, ARRAY['drink', 'hot'], 4),

-- SOUTH INDIAN MAINS
  ('22222222-0000-0000-0000-000000000001', 'Chicken Chettinad', 'Fiery Chettinad curry from Tamil Nadu with freshly ground kalpasi, marathi mokku and star anise. Intensely aromatic.', 16.99, false, 4, true, ARRAY['spicy', 'popular'], 1),
  ('22222222-0000-0000-0000-000000000001', 'Kerala Fish Curry', 'Coconut-based fish curry from God''s Own Country, soured with kodampuli and infused with curry leaves.', 17.99, false, 3, false, ARRAY['seafood', 'coconut'], 2),
  ('22222222-0000-0000-0000-000000000001', 'Hyderabadi Dum Biryani', 'Royal Hyderabadi biryani with layered saffron rice and slow-cooked spiced meat. A legacy of the Nizams.', 17.99, false, 2, true, ARRAY['popular', 'rice', 'premium'], 3),
  ('22222222-0000-0000-0000-000000000001', 'Sambar Rice', 'Comforting rice cooked with tangy tamarind sambar lentils, vegetables and tempered with mustard seeds.', 11.99, true, 2, false, ARRAY['vegetarian', 'healthy'], 4),
  ('22222222-0000-0000-0000-000000000001', 'Avial', 'Kerala mixed vegetable stew cooked with coconut and yogurt, tempered with coconut oil and curry leaves.', 12.99, true, 1, false, ARRAY['vegetarian', 'kerala'], 5),

-- SOUTH INDIAN SNACKS
  ('22222222-0000-0000-0000-000000000002', 'Masala Dosa', 'Crispy fermented rice crepe stuffed with spiced potato filling, served with sambar and three chutneys.', 10.99, true, 2, true, ARRAY['popular', 'vegetarian'], 1),
  ('22222222-0000-0000-0000-000000000002', 'Rava Dosa', 'Instant crispy lacy crepe made from semolina and rice flour. Light, crunchy and delightful.', 9.99, true, 1, false, ARRAY['vegetarian', 'crispy'], 2),
  ('22222222-0000-0000-0000-000000000002', 'Idli Sambar (3 pcs)', 'Fluffy steamed rice cakes served with piping hot sambar and fresh coconut chutney. South India''s pride.', 8.99, true, 1, false, ARRAY['vegetarian', 'breakfast'], 3),
  ('22222222-0000-0000-0000-000000000002', 'Medu Vada (2 pcs)', 'Crispy, spongy donut-shaped fritters made from urad dal, spiced with ginger and curry leaves.', 7.99, true, 1, false, ARRAY['vegetarian', 'crispy'], 4),
  ('22222222-0000-0000-0000-000000000002', 'Uttapam', 'Thick, soft rice pancake topped with onions, tomatoes, green chilies and coriander. The Indian pizza!', 10.99, true, 2, false, ARRAY['vegetarian'], 5),
  ('22222222-0000-0000-0000-000000000002', 'Pongal', 'Comforting rice and lentil porridge tempered with ghee, black pepper, cashews and curry leaves.', 9.99, true, 1, false, ARRAY['vegetarian', 'healthy'], 6),

-- SOUTH INDIAN DRINKS
  ('22222222-0000-0000-0000-000000000003', 'Filter Coffee', 'Authentic South Indian filter coffee brewed with dark roasted Arabica-Robusta blend, served in traditional steel tumbler.', 3.99, true, 1, true, ARRAY['drink', 'hot', 'popular'], 1),
  ('22222222-0000-0000-0000-000000000003', 'Tender Coconut', 'Fresh tender coconut water served chilled. Nature''s most refreshing electrolyte drink.', 4.99, true, 1, false, ARRAY['drink', 'fresh'], 2),
  ('22222222-0000-0000-0000-000000000003', 'Rasam', 'Thin, peppery tamarind broth spiced with turmeric and coriander. The ultimate digestive tonic.', 3.49, true, 2, false, ARRAY['drink', 'hot'], 3),

-- CHEF SPECIALS
  ('33333333-0000-0000-0000-000000000001', 'Tupaki Chicken', 'Our legendary Andhra-style explosive chicken curry! Marinated in 12 secret spices, slow-cooked with green chilies and curry leaves for a flavor explosion like no other. Gabbar''s most prized creation — if you dare!', 18.99, false, 5, true, ARRAY['bestseller', 'spicy', 'signature', 'chef-special'], 1),
  ('33333333-0000-0000-0000-000000000001', 'Gabbar''s Special Biryani', 'The crown jewel of our menu! Fragrant basmati layered with tender meat marinated for 24 hours in Gabbar''s secret spice mix. Dum-cooked and served with raita and salan.', 21.99, false, 3, true, ARRAY['signature', 'premium', 'chef-special'], 2),
  ('33333333-0000-0000-0000-000000000001', 'Sholay Paneer', 'Fire-roasted paneer with bell peppers in our fiery secret sauce. Smoky, spicy and utterly addictive.', 16.99, true, 4, false, ARRAY['vegetarian', 'spicy', 'signature'], 3),
  ('33333333-0000-0000-0000-000000000001', 'Basanti Kheer', 'Creamy cardamom-saffron rice pudding garnished with gold leaf, pistachios and rose petals. As beautiful as Basanti!', 7.99, true, 1, false, ARRAY['dessert', 'sweet', 'signature'], 4);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
INSERT INTO site_settings (key, value, description) VALUES
  ('business_info', '{
    "name": "Gabbar Singh Truck",
    "tagline": "Authentic Desi Flavors. Street Style.",
    "description": "Born in the streets of Punjab, raised on the roads of America — Gabbar Singh Truck brings you the most authentic and explosive Indian street food experience. Our recipes have been perfected over three generations.",
    "phone": "+1 (555) 424-2272",
    "email": "namaste@gabbarsinghtruck.com",
    "address": "On wheels across the city!",
    "instagram": "@gabbarsinghtruck",
    "facebook": "GabbarSinghTruck",
    "twitter": "@GabbarTruck"
  }', 'Main business information'),

  ('hours', '{
    "monday": {"open": "11:00", "close": "21:00", "closed": false},
    "tuesday": {"open": "11:00", "close": "21:00", "closed": false},
    "wednesday": {"open": "11:00", "close": "21:00", "closed": false},
    "thursday": {"open": "11:00", "close": "21:00", "closed": false},
    "friday": {"open": "11:00", "close": "23:00", "closed": false},
    "saturday": {"open": "10:00", "close": "23:00", "closed": false},
    "sunday": {"open": "10:00", "close": "20:00", "closed": false}
  }', 'Business hours'),

  ('delivery_settings', '{
    "delivery_fee": 3.99,
    "free_delivery_above": 35.00,
    "tax_rate": 0.08,
    "min_order_delivery": 15.00,
    "estimated_pickup_time": 20,
    "estimated_delivery_time": 45
  }', 'Delivery and order settings'),

  ('hero_content', '{
    "headline": "Taste the Legend",
    "subheadline": "Authentic Indian Street Food",
    "description": "From the tandoors of Punjab to the coconut kitchens of Kerala — Gabbar Singh Truck brings India''s most explosive flavors to your doorstep.",
    "cta_primary": "Order Now",
    "cta_secondary": "View Full Menu"
  }', 'Hero section content');

-- ============================================================
-- PROMO CODES (Sample)
-- ============================================================
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, is_active) VALUES
  ('GABBAR10', 'percentage', 10, 20.00, 100, true),
  ('FIRSTDOSA', 'fixed', 5.00, 15.00, 200, true),
  ('TUPAKI20', 'percentage', 20, 30.00, 50, true);

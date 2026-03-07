# 🌶️ Gabbar Singh Truck — Authentic Indian Street Food

> *"Kitne aadmi the? Sirf tumhara order!"*

A premium Indian food truck web application built with Angular 17, Supabase, and Stripe.

## 🚀 Live Demo
- **Frontend**: https://gabbarsinghtruck.netlify.app
- **Admin Panel**: https://gabbarsinghtruck.netlify.app/admin

## 🔑 Default Test Credentials
- **Admin Email**: `admin@gabbarsinghtruck.com`
- **Admin Password**: `GabbarAdmin2026!`

## 🏗️ Architecture

```
gabbar-singh-truck/
├── frontend/          # Angular 17 (Standalone Components + Signals)
│   ├── src/app/
│   │   ├── components/    # All UI components
│   │   ├── services/      # Supabase, Stripe, Cart, Menu, Auth
│   │   ├── models/        # TypeScript interfaces
│   │   └── guards/        # Route guards
│   └── tailwind.config.js
├── backend/           # Node.js + Express (Stripe webhooks)
│   └── routes/        # stripe, orders, menu, promo
└── supabase/
    └── migrations/    # Database schema
```

## 🍛 Features

- **Two Complete Menus**: North Indian & South Indian
- **Tupaki Chicken**: Signature chef's special, prominently featured
- **Real-time Cart**: Persistent, signal-based state management
- **Stripe Checkout**: Secure payment processing
- **Admin Panel**: Full CRUD for menu items + order management
- **Promo Codes**: Percentage & fixed discount support
- **Mobile First**: Fully responsive 2026 design
- **Indian Aesthetic**: Saffron, maroon, gold color scheme with mandala patterns

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 (Standalone + Signals) |
| Styling | Tailwind CSS + Custom SCSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Backend | Node.js + Express |
| Hosting | Netlify |

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/gabbar-singh-truck.git
cd gabbar-singh-truck
```

### 2. Supabase Setup
1. Go to https://app.supabase.com
2. Open project: `etsscpoqitclfvlqfyzh`
3. Run SQL from `supabase/migrations/001_initial.sql`
4. Run seed data from `supabase/seed.sql`
5. Create admin user in Authentication → Users

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Update `src/environments/environment.ts`:
```typescript
export const environment = {
  supabaseUrl: 'https://etsscpoqitclfvlqfyzh.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
  stripePublishableKey: 'pk_test_...',
  apiUrl: 'http://localhost:3001/api',
};
```

```bash
npm start  # Runs at http://localhost:4200
```

### 4. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your Stripe secret key
npm run dev  # Runs at http://localhost:3001
```

### 5. Stripe Test Cards
- ✅ Success: `4242 4242 4242 4242`
- ❌ Decline: `4000 0000 0000 0002`
- Use any future date and any 3-digit CVC

## 🎨 Indian Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Saffron | `#FF6B1A` | Primary CTA, accents |
| Maroon | `#8B1A1A` | Secondary, dark elements |
| Gold | `#C9A227` | Decorative, dividers |
| Cream | `#FFF8F0` | Background |
| Deep Brown | `#2C1810` | Text |

## 📱 Promo Codes (Test)
- `GABBAR10` — 10% off on orders above $20
- `FIRSTDOSA` — $5 off on orders above $15
- `TUPAKI20` — 20% off on orders above $30

## 🔒 Admin Panel
Navigate to `/admin/login` with Supabase admin credentials.

Features:
- Dashboard with live stats
- Menu CRUD (Add/Edit/Delete items)
- Toggle item availability
- Real-time order management
- Order status updates

---
Made with ❤️ and lots of 🌶️ | Gabbar Singh Truck © 2026

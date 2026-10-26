# JO JO EFFECTS & CO. — Professional E-Commerce Platform

> **"Your Everyday Finds, Made Easy."**  
> A clean, high-performance online shopping store featuring curated **Women's Hair**, **Fashion Handbags**, **Watches**, and **Phone Accessories**, equipped with direct WhatsApp order confirmation, USD payment coordination, and a comprehensive Administrator Dashboard.

---

## 1. Official Business Identity

| Detail | Official Value |
|---|---|
| **Business Name** | **JO JO EFFECTS & CO.** |
| **Location** | Sioux Falls, South Dakota, United States |
| **Official Business Contact Number** | **+1 (605) 900-8992** *(Visible on Contact page & footer)* |
| **Official WhatsApp Number** | **+1 (443) 743-5959** *(Internal only; strictly never rendered as visible text)* |
| **Official Currency** | **USD ($)** |
| **Official Payment Methods** | Cash App, Venmo, Zelle, PayPal |
| **Core Product Categories** | 1. Women's Hair <br> 2. Women's Fashion Handbags <br> 3. Phone Accessories <br> 4. Watches |

---

## 2. Key Features

### For Customers:
- **Luxe Split-Layout Hero**: Commercial studio photography on clean white backdrops with direct routes into curated collections.
- **Dynamic Catalog**: Full product browsing with category filtering, real-time search, price range filter, in-stock filtering, and sorting (Newest, Price asc/desc, Name).
- **Product Detail Views (`/product/[slug]`)**:
  - High-resolution multi-angle image gallery with thumbnail switcher.
  - Price and sale price comparison with variant selectors (hair lengths, colors, styles).
  - Quantity picker, **Add to Bag**, and **Buy Now**.
  - **Inquire on WhatsApp** button with pre-filled product details.
  - Technical specifications table and related recommendations.
- **Slide-Out Shopping Bag Drawer**: Quantity steppers, free nationwide US shipping progress bar ($100 threshold), and real-time total calculation.
- **Frictionless Checkout (`/checkout`)**:
  - Full customer contact and delivery address form (US).
  - Payment method selection with clear instructions for Cash App, Venmo, Zelle, and PayPal.
  - Unique order reference generator (e.g. `JJE-20261026-XXXX`).
- **Order Confirmation (`/checkout/success`)**:
  - Comprehensive order receipt with status (`Awaiting Verification`).
  - **Confirm on WhatsApp** button with pre-filled order reference, customer name, items, and total amount.
  - Print receipt option.
- **Contact Us & Customer Inquiries (`/contact`)**:
  - Direct telephone contact: `+1 (605) 900-8992`.
  - Functional WhatsApp concierge button.
  - Website inquiry submission form saving directly to the database.

### For Administrators:
- **Protected Admin Console (`/admin/login`, `/admin/dashboard`)**:
  - Key Performance Indicators: Total Revenue (USD), Orders, Pending Orders, Catalog Size, New Inquiries.
  - Inventory Watch: Low stock alerts for swift restocking.
  - Recent orders feed with quick status inspection.
- **Product Management (`/admin/products`, `/admin/products/new`)**:
  - Add, edit, publish/unpublish, feature, or delete items.
  - Direct file upload from phone, desktop, or laptop.
  - Image ordering, primary photo selector, and thumbnail preview.
  - Variant management (lengths, styles, price adjustments, stock).
  - Key-value specifications editor.
- **Category Management (`/admin/categories`)**:
  - Add and edit categories with cover image uploads.
- **Order Fulfillment (`/admin/orders`)**:
  - Search and filter orders by status (`new`, `processing`, `shipped`, `delivered`, `cancelled`, `on_hold`) and payment status (`awaiting_verification`, `paid`, `pending`, `failed`, `refunded`).
  - Add shipping carrier & tracking numbers.
  - Append internal notes and history.
  - Export orders to CSV for spreadsheet workflows.
- **Customer Inquiries Inbox (`/admin/inquiries`)**:
  - View all inquiries submitted from the website.
  - Direct 1-click WhatsApp customer reply button.
  - Update inquiry status (`new`, `in_progress`, `responded`, `resolved`).
- **Content Editor (`/admin/content`)**:
  - Edit top announcement bar text and destination link.
  - Edit homepage hero headline, description, call-to-actions, and hero image.
  - Edit About Us editorial narrative.
- **Settings & Database (`/admin/settings`)**:
  - Edit public business phone number and internal WhatsApp number.
  - Configure Cash App cashtag, Venmo handle, Zelle details, and PayPal link.
  - Live Supabase connection manager.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL, Storage, and Auth) with reactive client persistence fallback
- **Hosting & CI/CD**: Vercel / GitHub
- **Design System**: Dominant white `#FFFFFF`, Primary black `#111111`, Luxury Gold `#D4AF62`, Light Grey `#F5F5F5`, Poppins typography

---

## 4. Supabase Setup Guide

The application is fully functional out of the box with persistent local state. To connect your remote Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open the file `supabase/migrations/20261026_init_schema.sql` from this repository.
4. Copy and paste the SQL content into Supabase and click **Run**. This provisions all 11 tables (`products`, `categories`, `orders`, `inquiries`, `site_settings`, etc.) and Row Level Security policies.
5. In your Supabase project settings under **API**, copy your **Project URL** and **anon public key**.
6. Set these in your environment variables:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
   *(Alternatively, go to `/admin/settings` in the app and paste them directly into the Supabase Backend Connection section).*

---

## 5. Deployment Guide (Vercel & GitHub)

### GitHub:
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for JO JO EFFECTS & CO. storefront and admin"
   git branch -M main
   git remote add origin https://github.com/your-username/jojo-effects.git
   git push -u origin main
   ```

### Vercel:
1. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository `jojo-effects`.
3. Set the Framework Preset to **Vite**.
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Deploy**. Vercel will build and deploy your store with global CDN caching.

---

## 6. Administrative Access

To access the store management dashboard:
1. Navigate to `/admin/login` or click **Admin Dashboard** in the website footer.
2. Default administrator credentials:
   - **Email:** `admin@jojoeffects.com`
   - **Password:** `jojo2026admin`
3. Credentials can be modified or linked to Supabase Auth users in `/admin/settings`.

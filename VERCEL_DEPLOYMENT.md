# Deploying AM invest on Vercel (Vercel Deployment Guide)

This application is fully optimized and pre-configured for seamless 1-click deployment on **Vercel**.

---

## 🚀 Quick Deployment Methods

### Option 1: Deploy via GitHub (Recommended)
1. Push this repository to **GitHub** (or export it to GitHub from the top settings menu).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** > **"Project"**.
4. Import your GitHub repository.
5. Vercel will automatically detect:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click **Deploy**!

---

### Option 2: Deploy via Vercel CLI
If deploying from your terminal:
```bash
# 1. Install Vercel CLI globally (if not already installed)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod
```

---

## ⚙️ Pre-Configured Files

1. **`vercel.json`**:
   - **SPA Rewrites**: Automatically routes client-side single page navigation (`/admin`, `/recharge`, `/plans`, etc.) to `/index.html` preventing any `404 Not Found` page reload errors.
   - **Serverless API Routes**: Connects `/api/*` requests directly to Vercel Serverless Functions in the `/api` directory.
   - **Webhook Routing**: Maps `/webhook/payin` and `/webhook/payout` to the serverless payment webhook handlers.

2. **Serverless Functions in `/api`**:
   - `/api/health` - Platform uptime & health check
   - `/api/watchpay/create-order` - Server-side WatchPay order creation & MD5 signing
   - `/api/watchpay/check-order` - Real-time order polling
   - `/api/watchpay/callback` - Payment webhook handler
   - `/api/sunpays/create-payin` - Sunpays HMAC-SHA256 pay-in creation
   - `/api/sunpays/check-order` - Sunpays order status checker
   - `/api/sunpays/balance` - Sunpays balance inquiry
   - `/api/sunpays/create-payout` - Sunpays payout dispatcher

---

## 🔑 Environment Variables (Optional)
If configuring live Sunpays API credentials in Vercel:
Go to **Project Settings** > **Environment Variables** in Vercel dashboard and set:
- `SUNPAYS_MERCHANT_ID`
- `SUNPAYS_PAYIN_API_KEY`
- `SUNPAYS_PAYIN_API_SECRET`
- `SUNPAYS_PAYOUT_API_KEY`
- `SUNPAYS_PAYOUT_API_SECRET`

# HyderabadZone — Full Stack Real Estate Platform

## 📦 Project Structure

```
hyderabadzone-backend/   → Laravel 11 REST API
hyderabadzone-web/       → React 18 SPA (Vite + Tailwind)
```

---

## 🚀 Backend Setup (Laravel API)

### 1. Upload to Hostinger
```bash
# Upload hyderabadzone-api/ to your Hostinger server (via FTP or Git)
# Point api.hyderabadzone.in to the /public folder
```

### 2. Install dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### 3. Configure environment
```bash
cp .env.example .env
php artisan key:generate

# Edit .env with your:
# - DB credentials (Hostinger MySQL)
# - Razorpay keys
# - Fast2SMS / Twilio keys
# - Cloudflare R2 credentials
```

### 4. Run migrations + seed locations
```bash
php artisan migrate --force
php artisan db:seed --class=LocationSeeder
```

### 5. Cache for production
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6. Set permissions
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 7. Set up cron (Hostinger cPanel → Cron Jobs)
```
* * * * * cd /home/user/hyderabadzone-api && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🌐 Frontend Setup (React)

### 1. Install dependencies
```bash
cd hyderabadzone-web
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Set VITE_API_URL=https://api.hyderabadzone.in
```

### 3. Build for production
```bash
npm run build
# Output: dist/ folder
```

### 4. Upload to Hostinger
```bash
# Upload dist/ contents to /public_html/
# Point hyderabadzone.in to /public_html/
```

### 5. Nginx SPA config (add to Hostinger via .htaccess for Apache)
```apache
# public_html/.htaccess
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## 🔑 First Admin Setup

After deployment, make yourself admin via MySQL:
```sql
UPDATE users SET role = 'admin' WHERE phone = 'YOUR_PHONE';
```

Then login at `/login` and access `/admin`.

---

## 📋 File Reference

### Backend Files
| File | Purpose |
|------|---------|
| `database/migrations/` | All 5 migration files (run in order) |
| `database/seeders/LocationSeeder.php` | Seeds all 120+ Hyderabad locations |
| `app/Models/User.php` | User model with Sanctum auth |
| `app/Models/Property.php` | Property model with scopes + formatters |
| `app/Http/Controllers/Api/AuthController.php` | OTP send + verify + JWT |
| `app/Http/Controllers/Api/PropertyController.php` | Full property CRUD + image upload |
| `app/Http/Controllers/Api/PaymentController.php` | Razorpay integration |
| `app/Http/Controllers/Api/OtherControllers.php` | Search, Locations, Leads, Users |
| `app/Http/Controllers/Api/Admin/AdminControllers.php` | Admin: approve/reject/analytics |
| `app/Services/Services.php` | OTP, Razorpay, Image, Ranking services |
| `app/Console/Commands/ExpireListings.php` | Daily cron: expires old listings |
| `routes/api.php` | All 35+ API routes |

### Frontend Files
| File | Purpose |
|------|---------|
| `src/main.jsx` | React entry + providers |
| `src/App.jsx` | Router + lazy page loading |
| `src/api/index.js` | All API modules (axios) |
| `src/store/authStore.js` | Zustand auth state |
| `src/utils/index.js` | Price formatting, EMI calc, WhatsApp links |
| `src/pages/Home.jsx` | Decision engine homepage |
| `src/pages/Search.jsx` | Search + filters |
| `src/pages/PropertyDetail.jsx` | Detail + EMI + lead form |
| `src/pages/Payment.jsx` | Razorpay checkout |
| `src/pages/DashboardAndList.jsx` | User dashboard + list property wizard |
| `src/pages/Admin/AdminDashboard.jsx` | Admin panel + approvals |
| `src/pages/Admin/AdminPages.jsx` | Manage listings + analytics |
| `src/components/search/SearchBar.jsx` | Autocomplete search bar |
| `src/components/ui/PropertyCard.jsx` | Reusable property card |

---

## 🏗️ Phases Remaining

- **Phase 4**: Google Maps integration, AI recommendations, price trends
- **Phase 5**: ✅ Razorpay done
- **Phase 6**: ✅ Admin panel done
- **Phase 7**: Rate limiting, Redis caching, image optimization
- **Phase 8**: Nginx config, SSL, Supervisor

---

## 💡 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| OTP auth (no passwords) | Better UX for Indian mobile-first users |
| `price_type` ENUM | Handles sqft/sqyd/total pricing correctly |
| `rank_score` column | Enables featured→verified→new ordering |
| `expires_at` + daily cron | Automatic listing expiry after 30 days |
| Cloudflare R2 for images | Cheaper than S3, globally cached |
| Zustand for state | Lighter than Redux, perfect for auth |
| React Query for data | Automatic caching + background refresh |

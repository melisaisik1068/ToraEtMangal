# TORA ET MANGAL

Premium steakhouse / mangal restoranı için production-ready QR menü, masa siparişi, sipariş takibi ve yönetim paneli.

Müşteri masadaki QR kodu okutur, dijital menüden sipariş verir, garson veya hesap ister. Restoran ekibi aynı siparişleri admin panelinden canlı yönetir.

## Teknolojiler

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM + PostgreSQL
- Zustand (kalıcı sepet)
- Zod + React Hook Form
- Jose (HttpOnly JWT oturum) + bcryptjs
- Motion, Lucide, `qrcode`

## Kurulum

```bash
npm install
```

PostgreSQL için Docker (yerel 5432 doluysa 5433 kullanılır):

```bash
docker compose up -d
```

Ortam dosyası:

```bash
copy .env.example .env
```

`.env` içinde özellikle şunları doldurun:

- `DATABASE_URL`
- `AUTH_SECRET` (en az 16 karakter, üretimde uzun rastgele değer)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (seed ile admin hesabı oluşur)
- `NEXT_PUBLIC_SITE_URL`
- telefon, WhatsApp, Instagram, Maps

## Veritabanı

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run db:studio
```

İlk kurulumda migration yerine şema eşlemesi de kullanılabilir:

```bash
npm run db:push
npm run db:seed
```

Seed şunları yükler:

- 8 kategori
- 30+ ürün
- 20 masa (her biri özel QR menü)
- restoran ayarları
- admin kullanıcısı (`.env` içindeki e-posta/şifre)

## Geliştirme

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Menü: [http://localhost:3000/menu](http://localhost:3000/menu)
- Masa 12 QR: [http://localhost:3000/qr/12](http://localhost:3000/qr/12)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Production

```bash
npm run lint
npm test
npm run build
npm start
```

Vercel’e deploy ederken PostgreSQL (Neon, Supabase, RDS vb.) bağlayın. `prisma generate` `postinstall` ve `build` içinde çalışır.

Gerekli Vercel env değişkenleri `.env.example` ile aynıdır.

## Admin erişimi

Kimlik bilgileri koda gömülmez. `npm run db:seed` çalışınca `ADMIN_EMAIL` ve `ADMIN_PASSWORD` ile bir `User` kaydı oluşur. Oturum HttpOnly cookie + JWT ile tutulur. `/admin` ve `/api/admin/*` middleware ile korunur.

## QR sistemi

Her masa için URL:

`https://domain.com/qr/{masaNo}`

Örnek: Masa 12 → `/qr/12`

QR okutulunca masa numarası sepete yazılır. Sipariş `tableId` ile kaydedilir. Admin panelinde masa, ürünler, toplam ve durum görünür.

Admin > Masalar > QR görüntüle:

- yazdırılabilir kart
- PNG indirme
- link kopyalama

## Sipariş durumları

`PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `SERVED` → `COMPLETED`  
(`CANCELLED` ara adımlardan)

Sipariş numarası biçimi: `#TE20260045`

## NPM komutları

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm start` | Production sunucu |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:seed` | Seed |
| `npm run db:studio` | Prisma Studio |

## Güvenlik notları

- Kullanıcı girdileri Zod ile doğrulanır
- Sorgular Prisma üzerinden gider
- Admin API’leri public değildir
- Şifreler bcrypt ile hashlenir
- Login / sipariş / rezervasyon / garson çağrısında basit rate limit vardır
- Hassas sırlar yalnızca env üzerinden okunur

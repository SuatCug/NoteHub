# SearchNote

Üniversite öğrencilerinin ders notlarını paylaştığı, başkalarının notlarını keşfettiği ve aynı dersleri çalışan insanlarla bağ kurduğu sosyal not paylaşım platformu.

**Canlı demo:** [searchnote.netlify.app](https://searchnote.netlify.app)

> Not: Backend Render'ın ücretsiz planında çalıştığı için uzun süre istek gelmezse uyku moduna geçer; ilk açılış 30–60 saniye sürebilir.

---

## Özellikler

### Not paylaşımı
- PDF, Word (DOCX), görsel (JPG/PNG) ve arşiv (ZIP/RAR) yükleme (varsayılan en fazla 25 MB)
- Dosya içeriği uzantısıyla karşılaştırılarak doğrulanır (sahte uzantılı dosyalar reddedilir)
- Üniversite, bölüm, ders kodu/adı, hoca ve dönem bilgileri
- PDF ve görseller için sayfa içi önizleme (pdf.js)
- Kredi/puan sistemi yok — indirme sınırsız ve ücretsiz

### Sosyal akış
- Sosyal medya düzeninde ana sayfa: sol menü, ortada akış, sağda öneriler
- **All / Popular / Following / Saved** sekmeleri ve "Load more" ile sayfalama
- Gönderi kartlarında beğenme, yorum, indirme, paylaşma (bağlantı kopyalama) ve kaydetme
- **Popular Courses:** not sayısı ve beğeniye göre öne çıkan dersler
- **Active Now:** karşılıklı takipleşilen kişilerden son 15 dakikada aktif olanlar
- **Who to Follow:** aynı üniversite/bölümdeki kişiler öncelikli takip önerileri

### Etkileşim
- Beğeni, yorum, takip sistemi
- **Bildirimler:** beğeni, yorum, yeni takipçi, gruba katılım, katılma isteği ve onayı (geri alınan eylemin bildirimi de silinir)
- Birebir mesajlaşma ve engelleme
- Notun yazarına "Ask the author" ile doğrudan soru sorma

### Çalışma grupları
- Herkese açık ve özel (kurucu onaylı) gruplar
- Grup sohbeti
- Notları sadece grup üyelerine açık olarak gruba paylaşma

### Arama ve keşif
- Kelime bazlı arama: not başlığı, ders, hoca, üniversite ve yazar adında arar
- Aynı aramada eşleşen kişiler de listelenir
- Üniversite, bölüm, dönem, dosya türü ve sıralama filtreleri

### Ziyaretçi deneyimi
- Giriş yapmamış kullanıcıya tanıtım (landing) sayfası; gerçek zamanlı topluluk sayaçları
- Not kataloğu ve arama sadece üyelere açık (API düzeyinde de korunur)
- Paylaşılan tek bir not, profil veya grup bağlantısı ziyaretçiye de açılır

### Diğer
- Tamamen mobil uyumlu: telefonda alt sekme çubuğu, kısayollar, hikâye tarzı "Active now" şeridi
- Yardım merkezi, topluluk kuralları, iletişim formu ve yasal sayfalar (KVKK, gizlilik, çerezler, telif)
- İsteğe bağlı `.edu.tr` e-posta şartı ve e-posta doğrulaması

---

## Teknolojiler

| Katman | Teknolojiler |
| --- | --- |
| **Frontend** | React 19, Vite, Redux Toolkit + RTK Query, React Router 7, Tailwind CSS 4, lucide-react, pdf.js |
| **Backend** | Node.js, Express 5, MongoDB + Mongoose, JWT, bcrypt, express-validator, Multer, Helmet, Nodemailer |
| **Depolama** | Cloudinary (yapılandırılmamışsa yerel disk) |
| **Yayın** | Netlify (frontend), Render (backend), MongoDB Atlas (veritabanı) |

---

## Proje yapısı

```
.
├── backend/
│   ├── config/          # Veritabanı bağlantısı, özellik anahtarları
│   ├── controllers/     # Endpoint mantığı
│   ├── middlewares/     # Kimlik doğrulama, doğrulama, hata, yükleme, rate limit
│   ├── models/          # Mongoose şemaları (User, Note, Group, Notification, ...)
│   ├── routes/          # /api altındaki route'lar
│   ├── services/        # Depolama, bildirim, not listeleme, e-posta, ...
│   ├── scripts/         # Örnek veri (seed) ve Cloudinary taşıma betikleri
│   ├── utils/
│   ├── validations/     # express-validator kuralları
│   └── index.js
└── frontend/
    ├── public/
    └── src/
        ├── app/         # Redux store ve auth slice
        ├── components/  # feed, layout, notes, groups, messages, users, common
        ├── lib/         # Yardımcılar ve sabitler
        ├── pages/       # Sayfa bileşenleri
        └── services/    # RTK Query API tanımları
```

---

## Kurulum

### Gereksinimler
- Node.js 20+
- Bir MongoDB veritabanı (örn. ücretsiz [MongoDB Atlas](https://www.mongodb.com/atlas) kümesi)
- (İsteğe bağlı) Cloudinary hesabı ve SMTP bilgileri

### 1. Depoyu klonlayın

```bash
git clone <repo-url>
cd <repo-klasörü>
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

`.env` dosyasını doldurun (bkz. [Ortam değişkenleri](#ortam-değişkenleri)), ardından:

```bash
npm run dev            # http://localhost:5000
```

### 3. Frontend

Yeni bir terminalde:

```bash
cd frontend
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev            # http://localhost:5173
```

### 4. (İsteğe bağlı) Örnek veri

Demo kullanıcılar, notlar ve gruplar oluşturmak için:

```bash
cd backend
npm run seed           # örnek veriyi ekler
npm run seed:clear     # örnek veriyi siler
```

Demo hesapların e-posta ve şifreleri `backend/scripts/seed.js` içinde tanımlıdır.

---

## Ortam değişkenleri

### Backend (`backend/.env`)

| Değişken | Açıklama |
| --- | --- |
| `PORT` | Sunucu portu (varsayılan `5000`) |
| `NODE_ENV` | `development` / `production` |
| `MONGO_URI` | MongoDB bağlantı adresi |
| `JWT_SECRET` | JWT imzalama anahtarı (uzun ve rastgele bir değer) |
| `JWT_EXPIRES_IN` | Oturum süresi (örn. `7d`) |
| `CLIENT_URL` | Frontend adresi; CORS ve e-posta bağlantıları için. Birden fazlaysa virgülle ayrılır |
| `REQUIRE_EDU_EMAIL` | `true` ise sadece `.edu.tr` e-postalarla kayıt olunabilir |
| `REQUIRE_EMAIL_VERIFICATION` | `true` ise e-posta doğrulanmadan yükleme, indirme ve etkileşim yapılamaz |
| `MAX_FILE_SIZE_MB` | En büyük dosya boyutu (varsayılan `25`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Doğrulama e-postaları için SMTP. Boşsa bağlantı konsola yazılır |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>`. Boşsa dosyalar `backend/uploads` klasörüne kaydedilir |

### Frontend (`frontend/.env`)

| Değişken | Açıklama |
| --- | --- |
| `VITE_API_URL` | Backend API adresi (örn. `http://localhost:5000/api`) |
| `VITE_REQUIRE_EDU_EMAIL` | Backend'deki `REQUIRE_EDU_EMAIL` ile aynı tutulmalı |

> `.env` dosyaları `.gitignore` ile hariç tutulur; gizli bilgileri asla commit'lemeyin.

---

## API özeti

Tüm endpoint'ler `/api` altındadır. Korumalı endpoint'ler `Authorization: Bearer <token>` başlığı ister.

| Kaynak | Başlıca endpoint'ler |
| --- | --- |
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, e-posta doğrulama |
| **Notlar** | `GET /notes` (arama, üyeler), `GET /notes/feed`, `GET /notes/saved`, `GET /notes/trending-courses`, `GET /notes/:id`, `POST /notes`, `PATCH/DELETE /notes/:id` |
| **Not etkileşimi** | `POST/DELETE /notes/:id/like`, `POST/DELETE /notes/:id/save`, `POST /notes/:id/comments`, `GET /notes/:id/preview`, `GET /notes/:id/download` |
| **Kullanıcılar** | `GET /users/search`, `GET /users/active`, `GET /users/suggestions`, `GET /users/:id`, `POST/DELETE /users/:id/follow`, `POST/DELETE /users/:id/block` |
| **Gruplar** | Listeleme, oluşturma, katılma/ayrılma, üyeler, katılma istekleri, grup notları ve sohbet |
| **Mesajlar** | Konuşmalar, mesaj gönderme, okunmamış sayısı |
| **Bildirimler** | `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/read-all`, `PATCH /notifications/:id/read` |
| **Diğer** | `GET /stats` (herkese açık sayaçlar), `POST /contact` |

---

## Yayına alma

**Backend (Render)**
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Ortam değişkenlerini Render panelinden ekleyin. `CLIENT_URL` frontend adresiyle birebir aynı olmalı (örn. `https://searchnote.netlify.app`, sonda `/` olmadan).

**Frontend (Netlify)**
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- `VITE_API_URL` değerini backend adresine göre ayarlayın (örn. `https://<render-servisi>.onrender.com/api`).
- SPA yönlendirmesi `frontend/public/_redirects` ile sağlanır.

---

## Notlar

- Mesajlaşma, grup sohbeti ve bildirimler WebSocket yerine periyodik sorgulama (polling) ile güncellenir.
- Mesaj gönderme hızı sınırı bellekte tutulur; birden fazla sunucu örneğiyle çalıştırılacaksa Redis gibi paylaşımlı bir depo gerekir.
- Bildirimler 90 gün sonra otomatik silinir (MongoDB TTL index).

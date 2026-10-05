require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const routes = require('./routes');
const initSocket = require('./sockets');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Avatarlar frontend'den (farklı origin) <img> ile yüklenebilsin diye CORP gevşetiliyor.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Origin'ler tarayıcının gönderdiği biçimle birebir eşleşmeli: boşluk, tırnak ve sondaki "/" temizlenir.
const allowedOrigins = process.env.CLIENT_URL?.split(',')
  .map((o) => o.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
  .filter(Boolean);
console.log('🌐 CORS allowed origins:', allowedOrigins?.length ? allowedOrigins : '*');
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Sadece avatarlar herkese açık servis edilir; not dosyaları yalnızca /api/notes/:id/download ile indirilir.
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'SearchNote API is running.' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Express ve Socket.io aynı HTTP sunucusunu paylaşır (anlık mesaj, bildirim ve çevrimiçi durum).
const server = http.createServer(app);
initSocket(server, allowedOrigins);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 API + Socket.io running at http://localhost:${PORT}`);
  });
});

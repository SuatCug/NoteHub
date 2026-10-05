const dns = require('dns');
const mongoose = require('mongoose');

// Windows'ta Node'un c-ares tabanlı DNS çözücüsü bazı ağlarda (VPN/sanal adaptör vb.)
// mongodb+srv:// bağlantısının gerektirdiği SRV kaydını çözemiyor. Genel bir DNS
// sunucusu belirtmek bu sorunu çözüyor.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

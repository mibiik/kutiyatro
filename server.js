require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { google } = require('googleapis');
const admin = require('firebase-admin');

// TODO: Firebase Admin SDK'yı başlatmak için servis hesabı anahtarını güvenli bir şekilde sağlayın.
// Bu bilgiyi Firebase projenizin ayarlarından (Ayarlar > Servis Hesapları) alabilirsiniz.
// const serviceAccount = require('./path/to/your/serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

const app = express();
const PORT = 3002;
const CONTENT_PATH = path.join(__dirname, 'content.json');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS headers for API requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Panel koruma middleware'i artık browser tarafında yapılıyor
// Server tarafında koruma kaldırıldı
app.use(express.static(path.join(__dirname)));

// --- Multer (Dosya Yükleme) Ayarları ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/'); // Dosyaların kaydedileceği klasör
    },
    filename: function (req, file, cb) {
        // Dosya adını benzersiz hale getir (zaman damgası + orijinal ad)
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- API Endpoints ---

// GET: Mevcut içeriği gönder
app.get('/api/content', (req, res) => {
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('İçerik okunurken bir hata oluştu.');
        }
        // Önbelleği önlemek için tarayıcıya talimat gönder
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// GET: Doğrudan content.json dosyasını servis et (Vercel fallback)
app.get('/content.json', (req, res) => {
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Content.json okuma hatası:', err);
            return res.status(404).send('Content.json bulunamadı.');
        }
        
        // CORS ve cache headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Type', 'application/json');
        
        res.send(data);
    });
});

// POST: Gelen yeni içeriği kaydet
app.post('/api/content', (req, res) => {
    const newContent = req.body;
    fs.writeFile(CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('İçerik kaydedilirken hata:', err);
            return res.status(500).send('İçerik kaydedilemedi.');
        }
        res.send('İçerik başarıyla kaydedildi.');
    });
});

// POST: Resim Yükleme
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Dosya yüklenmedi.');
    }
    // Multer 'assets' klasörüne kaydetti, dosya yolunu geri gönderiyoruz
    res.json({ filePath: `assets/${req.file.filename}` });
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
    console.log(`Yönetim paneli girişi: http://localhost:${PORT}/login.html`);
});

// Vercel export
module.exports = app; 
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { google } = require('googleapis');

const app = express();
const PORT = 3002;
const CONTENT_PATH = path.join(__dirname, 'content.json');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
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
    console.log(`Yönetim paneline http://localhost:${PORT}/panel.html adresinden ulaşabilirsiniz.`);
}); 
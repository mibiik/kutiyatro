const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

// CORS ayarları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Content.json dosyasının yolu
const CONTENT_PATH = path.join(__dirname, '..', 'content.json');

// Multer ayarları - Vercel için memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API Endpoints

// GET: Mevcut içeriği gönder
app.get('/api/content', (req, res) => {
    try {
        if (fs.existsSync(CONTENT_PATH)) {
            const data = fs.readFileSync(CONTENT_PATH, 'utf8');
            
            // Önbelleği önlemek için tarayıcıya talimat gönder
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Content-Type', 'application/json');
            
            res.send(data);
        } else {
            // Varsayılan içerik döndür
            const defaultContent = {
                oyunlar: [],
                oyuncular: [],
                yonetim_kurulu: []
            };
            res.json(defaultContent);
        }
    } catch (err) {
        console.error('İçerik okunurken hata:', err);
        res.status(500).json({ error: 'İçerik okunurken bir hata oluştu.' });
    }
});

// POST: Gelen yeni içeriği kaydet
app.post('/api/content', (req, res) => {
    try {
        const newContent = req.body;
        fs.writeFileSync(CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf8');
        res.json({ message: 'İçerik başarıyla kaydedildi.' });
    } catch (err) {
        console.error('İçerik kaydedilirken hata:', err);
        res.status(500).json({ error: 'İçerik kaydedilemedi.' });
    }
});

// POST: Resim Yükleme (Vercel'de dosya sistemi read-only, bu sadece demo için)
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Dosya yüklenmedi.' });
    }
    
    // Vercel'de gerçek dosya yükleme için external service gerekli
    // Bu sadece geliştirme amaçlı bir placeholder
    const fileName = Date.now() + '-' + req.file.originalname;
    res.json({ 
        filePath: `assets/${fileName}`,
        message: 'Dosya yükleme Vercel\'de çalışmıyor, local geliştirme için kullanın'
    });
});

// Vercel için export
module.exports = app; 
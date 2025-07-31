# 🎭 KUTİY - Koç Üniversitesi Tiyatro Kulübü

## 🌟 Proje Hakkında

KUTİY, Koç Üniversitesi Tiyatro Kulübü'nün modern web platformudur. Bu proje, kulübün oyunlarını, oyuncularını ve etkinliklerini yönetmek için kapsamlı bir sistem sunar.

## ✨ Özellikler

### 🎭 Ana Site
- **Modern ve responsive tasarım**
- **Oyun kataloğu** - Detaylı oyun bilgileri
- **Oyuncu profilleri** - Kapsamlı oyuncu havuzu  
- **Galeri sistemi** - Görsel yönetimi
- **Arama ve filtreleme** - Gelişmiş arama

### 🛡️ Yönetim Paneli
- **Rol tabanlı erişim kontrolü** (4 seviye)
- **İçerik yönetimi** - Oyun, oyuncu, medya
- **Kullanıcı profil sistemi**
- **Sıralama ve görünürlük kontrolü**
- **Medya yükleme ve galeri yönetimi**

## 🚀 Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/mibiik/kutiyatro.git
cd kutiyatro

# Bağımlılıkları yükleyin  
npm install

# Sunucuyu başlatın
npm start
```

## 🌐 Erişim

- **Ana Site**: http://localhost:3002/
- **Panel Girişi**: http://localhost:3002/login.html
- **Yönetim Paneli**: http://localhost:3002/panel.html

## 👥 Kullanıcı Sistemi

### 🔐 Varsayılan Giriş
- **Şifre**: `kutiy2025` (tüm kullanıcılar için)
- **İlk giriş**: Şifre değiştirme zorunlu

### 👑 Rol Sistemi
- **Admin**: Eş Başkan, Genel Sekreter
- **Editor**: Festival, Mali, Organizasyon, Sosyal Medya Sorumlusu
- **Manager**: Tasarım, Teknik, Turne, Oda Tiyatrosu Sorumlusu  
- **Member**: Kurul Üyesi

## 🎯 Ana Özellikler

### 🎭 Oyun Yönetimi
- Oyun ekleme/düzenleme/silme
- Poster ve galeri yönetimi
- Oyuncu atama sistemi
- Sıralama kontrolü

### 👤 Oyuncu Havuzu
- Profil fotoğrafı yönetimi
- Kişisel bilgiler
- Rol geçmişi
- Durum takibi

### 📸 Medya Sistemi
- Toplu dosya yükleme
- Otomatik optimizasyon
- Galeri organizasyonu

## 🔧 Teknik Detaylar

### Backend
- **Framework**: Express.js
- **Storage**: JSON + localStorage
- **Upload**: Multer middleware

### Frontend  
- **Styling**: Pure CSS3
- **JavaScript**: Vanilla ES6+
- **Icons**: Font Awesome
- **Fonts**: Anton, Montserrat

## 📁 Dosya Yapısı

```
kutiy/
├── 🏠 Ana Site
│   ├── index.html
│   ├── oyunlar.html
│   └── oyun-detay.html
├── 🛡️ Yönetim  
│   ├── login.html
│   ├── panel.html
│   └── profile.html
├── 🎨 Stiller
│   ├── style.css
│   └── mobile.css
├── ⚡ JavaScript
│   ├── script.js
│   └── panel.js
└── 📂 Assets
    └── assets/
```

## 🎯 Kullanım

### İlk Kurulum
1. Sunucuyu başlatın: `npm start`
2. Login sayfasına gidin
3. Varsayılan şifre ile giriş yapın
4. Yeni şifre belirleyin

### Oyun Yönetimi
1. Panel → "Oyun Ekle"
2. Bilgileri doldurun
3. Poster yükleyin
4. Oyuncu atayın
5. Kaydedin

### Profil Yönetimi
1. Panel → Profil simgesi
2. Bilgilerinizi güncelleyin
3. Profil fotoğrafı yükleyin

## 📱 Mobil Uyumluluk

- Responsive tasarım
- Touch optimizasyonu
- Mobil menü
- Hızlı yükleme

## 🛡️ Güvenlik

- Base64 şifreleme
- Session timeout (8 saat)
- Rol tabanlı erişim
- CORS korunması

## 📞 İletişim

- **Instagram**: @kutiyatro
- **Email**: info@kutiy.ku.edu.tr
- **GitHub**: Bu repo

---

**🎭 Made with ❤️ by KUTİY Team 🎭** 
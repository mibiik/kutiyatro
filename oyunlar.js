// Oyunlar sayfası için JavaScript

let tumOyunlar = [];
let filtrelenmisOyunlar = [];

// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', function() {
    oyunlariYukle();
    filtreleriBaslat();
});

// Oyunları API'den yükle
async function oyunlariYukle() {
    try {
        const response = await fetch('/api/content');
        const data = await response.json();
        
        tumOyunlar = data.oyunlar || [];
        filtrelenmisOyunlar = [...tumOyunlar];
        
        oyunlariGoster();
        
    } catch (error) {
        console.error('Oyunlar yüklenirken hata:', error);
        document.getElementById('bos-durum').style.display = 'block';
    }
}

// Oyunları grid'de göster
function oyunlariGoster() {
    const grid = document.getElementById('oyunlar-grid');
    const bosDurum = document.getElementById('bos-durum');
    
    if (filtrelenmisOyunlar.length === 0) {
        grid.innerHTML = '';
        bosDurum.style.display = 'block';
        return;
    }
    
    bosDurum.style.display = 'none';
    
    grid.innerHTML = filtrelenmisOyunlar.map(oyun => {
        return `
            <div class="oyun-kart" onclick="oyunDetayAc(${oyun.id})">
                <div class="oyun-afis">
                    <img src="${oyun.afis}" alt="${oyun.ad}" onerror="this.src='assets/logo-placeholder.png'">
                    <div class="durum-badge durum-${oyun.durum}">
                        ${getDurumText(oyun.durum)}
                    </div>
                    <div class="kategori-badge kategori-${oyun.kategori}">
                        ${getKategoriText(oyun.kategori)}
                    </div>
                </div>
                <div class="oyun-bilgi">
                    <h3 class="oyun-adi">${oyun.ad}</h3>
                    <p class="oyun-yazar">Yazar: ${oyun.yazar}</p>
                    <p class="oyun-yonetmen">Yönetmen: ${oyun.yonetmen}</p>
                    
                    <div class="oyun-tarih-mekan">
                        <div class="tarih">
                            <span>📅</span>
                            <span>${oyun.tarih}</span>
                        </div>
                        <div class="mekan">
                            <span>📍</span>
                            <span>${oyun.mekan}</span>
                        </div>
                    </div>
                    
                    <p class="oyun-aciklama">${oyun.aciklama}</p>
                    
                    <div class="oyun-footer">
                        <div class="bilet-durumu">
                            ${oyun.bilet ? 
                                '<span class="bilet-var">🎫 Bilet Mevcut</span>' : 
                                '<span class="bilet-yok">Bilet satışı başlamadı</span>'
                            }
                        </div>
                        <button class="detay-button">Detayları Gör</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Durum metni döndür
function getDurumText(durum) {
    const durumlar = {
        'yaklasiyor': 'Yaklaşan',
        'oynaniyor': 'Sahnede',
        'bitmis': 'Tamamlandı'
    };
    return durumlar[durum] || durum;
}

// Kategori metni döndür
function getKategoriText(kategori) {
    const kategoriler = {
        'ana': 'Ana Oyun',
        'oda': 'Oda Tiyatrosu'
    };
    return kategoriler[kategori] || kategori;
}

// Filtreleri başlat
function filtreleriBaslat() {
    const kategoriFiltre = document.getElementById('kategori-filtre');
    const durumFiltre = document.getElementById('durum-filtre');
    const aramaInput = document.getElementById('arama-input');
    
    kategoriFiltre.addEventListener('change', filtreleriUygula);
    durumFiltre.addEventListener('change', filtreleriUygula);
    aramaInput.addEventListener('input', filtreleriUygula);
}

// Filtreleri uygula
function filtreleriUygula() {
    const kategori = document.getElementById('kategori-filtre').value;
    const durum = document.getElementById('durum-filtre').value;
    const aramaMetni = document.getElementById('arama-input').value.toLowerCase();
    
    filtrelenmisOyunlar = tumOyunlar.filter(oyun => {
        // Kategori filtresi
        if (kategori !== 'tumu' && oyun.kategori !== kategori) {
            return false;
        }
        
        // Durum filtresi
        if (durum !== 'tumu' && oyun.durum !== durum) {
            return false;
        }
        
        // Arama filtresi
        if (aramaMetni) {
            const aramaBolgeleri = [
                oyun.ad,
                oyun.yazar,
                oyun.yonetmen,
                oyun.yardimci_yonetmen || '',
                oyun.aciklama
            ].join(' ').toLowerCase();
            
            if (!aramaBolgeleri.includes(aramaMetni)) {
                return false;
            }
        }
        
        return true;
    });
    
    oyunlariGoster();
}

// Oyun detay modalını aç
function oyunDetayAc(oyunId) {
    const oyun = tumOyunlar.find(o => o.id === oyunId);
    if (!oyun) return;
    
    // Modal elementlerini doldur
    document.getElementById('modal-afis-img').src = oyun.afis;
    document.getElementById('modal-oyun-adi').textContent = oyun.ad;
    document.getElementById('modal-yazar').textContent = oyun.yazar;
    document.getElementById('modal-yonetmen').textContent = oyun.yonetmen;
    
    // Yardımcı yönetmen varsa göster
    const yardimciYonetmenRow = document.getElementById('modal-yardimci-yonetmen-row');
    if (oyun.yardimci_yonetmen && oyun.yardimci_yonetmen.trim()) {
        document.getElementById('modal-yardimci-yonetmen').textContent = oyun.yardimci_yonetmen;
        yardimciYonetmenRow.style.display = 'block';
    } else {
        yardimciYonetmenRow.style.display = 'none';
    }
    
    // Oyun bilgileri
    document.getElementById('modal-tarih').textContent = oyun.tarih;
    document.getElementById('modal-mekan').textContent = oyun.mekan;
    document.getElementById('modal-sure').textContent = oyun.sure;
    
    const kategoriElement = document.getElementById('modal-kategori');
    kategoriElement.textContent = getKategoriText(oyun.kategori);
    kategoriElement.className = `kategori-badge kategori-${oyun.kategori}`;
    
    // Açıklama
    document.getElementById('modal-aciklama').textContent = oyun.aciklama;
    
    // Bilet linki
    const biletSection = document.getElementById('modal-bilet-section');
    if (oyun.bilet && oyun.bilet.trim()) {
        document.getElementById('modal-bilet-link').href = oyun.bilet;
        biletSection.style.display = 'block';
    } else {
        biletSection.style.display = 'none';
    }
    
    // Oyuncuları doldur
    oyunculariDoldur(oyun.oyuncular || []);
    
    // Fotoğrafları doldur
    fotograflariDoldur(oyun.fotograflar || []);
    
    // Modalı göster
    document.getElementById('oyun-detay-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Oyuncuları modal'a doldur
function oyunculariDoldur(oyuncular) {
    const container = document.getElementById('modal-oyuncular');
    
    if (oyuncular.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Oyuncu kadrosu henüz açıklanmadı.</p>';
        return;
    }
    
    container.innerHTML = oyuncular.map(oyuncu => `
        <div class="oyuncu-item">
            <div class="oyuncu-ad">${oyuncu.ad}</div>
            <div class="oyuncu-karakter">${oyuncu.karakter}</div>
        </div>
    `).join('');
}

// Fotoğrafları modal'a doldur
function fotograflariDoldur(fotograflar) {
    const section = document.getElementById('modal-fotograflar-section');
    const container = document.getElementById('modal-fotograflar');
    
    if (fotograflar.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = fotograflar.map(foto => `
        <div class="fotograf-item" onclick="fotografBuyut('${foto}')">
            <img src="${foto}" alt="Oyun Fotoğrafı" onerror="this.style.display='none'">
        </div>
    `).join('');
}

// Fotoğraf büyütme (basit implementasyon)
function fotografBuyut(fotoSrc) {
    // Yeni pencerede fotoğrafı aç
    window.open(fotoSrc, '_blank');
}

// Modal'ı kapat
function modalKapat() {
    document.getElementById('oyun-detay-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Modal dışına tıklandığında kapat
document.getElementById('oyun-detay-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        modalKapat();
    }
});

// ESC tuşu ile modal'ı kapat
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        modalKapat();
    }
}); 
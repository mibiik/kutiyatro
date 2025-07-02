// Oyunlar sayfası için JavaScript

document.addEventListener('DOMContentLoaded', () => {
let tumOyunlar = [];
let filtrelenmisOyunlar = [];

async function oyunlariYukle() {
    try {
            const response = await fetch('/content.json'); // API yerine doğrudan dosyayı çek
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        const data = await response.json();
        tumOyunlar = (data.oyunlar || []).sort((a, b) => (a.siralama || 999) - (b.siralama || 999)); // Sıralamaya göre sırala
            filtrelenmisOyunlar = [...tumOyunlar]; // Başlangıçta tüm oyunları göster
        oyunlariGoster();
    } catch (error) {
        console.error('Oyunlar yüklenirken hata:', error);
            const grid = document.getElementById('oyunlar-grid');
            if(grid) {
                grid.innerHTML = '<p class="hata-mesaji">Oyunlar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>';
            }
    }
}

function oyunlariGoster() {
    const grid = document.getElementById('oyunlar-grid');
    const bosDurum = document.getElementById('bos-durum');

        if (!grid) return;
    
    if (filtrelenmisOyunlar.length === 0) {
        grid.innerHTML = '';
            if(bosDurum) bosDurum.style.display = 'block';
        return;
    }
    
        if(bosDurum) bosDurum.style.display = 'none';
    
    grid.innerHTML = filtrelenmisOyunlar.map(oyun => {
        return `
            <div class="modern-oyun-kart" onclick="oyunDetayAc(${oyun.id})">
                <div class="kart-afis-container">
                    <img src="${oyun.afis}" alt="${oyun.ad}" class="kart-afis" onerror="this.src='assets/logo-placeholder.png'">
                    <div class="kart-overlay">
                        <div class="overlay-content">
                            <div class="play-icon">
                                <i class="fas fa-play"></i>
                            </div>
                            <p class="overlay-text">Detayları Gör</p>
                        </div>
                    </div>
                                        <div class="kart-badges">
                        <span class="durum-badge durum-${oyun.durum}">
                            ${getDurumText(oyun.durum, oyun.kategori)}
                        </span>
                    </div>
                </div>
                
                <div class="kart-content">
                    <div class="kart-header">
                        <h3 class="kart-baslik">${oyun.ad}</h3>
                        <div class="kart-meta">
                            ${oyun.yazar && oyun.yazar.toLowerCase() !== 'belirtilmemiş' ? `
                                <div class="meta-item">
                                    <i class="fas fa-feather-alt"></i>
                                    <span>${oyun.yazar}</span>
                                </div>
                            ` : ''}
                            ${oyun.yonetmen && oyun.yonetmen.toLowerCase() !== 'belirtilmemiş' ? `
                                <div class="meta-item">
                                    <i class="fas fa-video"></i>
                                    <span>${oyun.yonetmen}</span>
                        </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="kart-detaylar">
                        <div class="detay-grup">
                            ${oyun.tarih && oyun.tarih.toLowerCase() !== 'belirtilmemiş' ? `
                                <div class="detay-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>${oyun.tarih}</span>
                                </div>
                            ` : ''}
                            ${(oyun.mekan || oyun.konum) && (oyun.mekan || oyun.konum).toLowerCase() !== 'belirtilmemiş' ? `
                                <div class="detay-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${oyun.mekan || oyun.konum}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="kart-footer">
                            ${oyun.bilet ? 
                            `<a href="${oyun.bilet}" target="_blank" class="bilet-btn bilet-aktif" onclick="event.stopPropagation();">
                                <i class="fas fa-ticket-alt"></i>
                                <span>Bilet Al</span>
                            </a>` :
                            `<div class="bilet-btn bilet-pasif">
                                <i class="fas fa-ticket-alt"></i>
                                <span>Bilet Mevcut Değil</span>
                            </div>`
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

    function oyunlariFiltrele(kriter, deger) {
        if (kriter === 'all') {
            filtrelenmisOyunlar = tumOyunlar;
        } else if (kriter === 'durum') {
            filtrelenmisOyunlar = tumOyunlar.filter(oyun => oyun.durum === deger);
        } else if (kriter === 'kategori') {
            filtrelenmisOyunlar = tumOyunlar.filter(oyun => oyun.kategori === deger);
        }
        oyunlariGoster();
    }

function filtreleriBaslat() {
        const filtreButonlari = document.querySelectorAll('.filtre-btn');
        filtreButonlari.forEach(buton => {
            buton.addEventListener('click', () => {
                // Aktif durumu yönet
                document.querySelector('.filtre-btn.aktif').classList.remove('aktif');
                buton.classList.add('aktif');

                const kriter = buton.dataset.filtre;
                const deger = buton.dataset.deger;

                if (kriter === 'all') {
                    oyunlariFiltrele('all');
                } else {
                    oyunlariFiltrele(kriter, deger);
                }
            });
        });

        // Arama input'u için event listener
        const aramaInput = document.getElementById('arama-input');
        if (aramaInput) {
            aramaInput.addEventListener('input', (e) => {
                aramaYap(e.target.value);
            });
        }

        // Kategori ve durum select'leri için event listener
        const kategoriFiltre = document.getElementById('kategori-filtre');
        const durumFiltre = document.getElementById('durum-filtre');
        
        if (kategoriFiltre) {
            kategoriFiltre.addEventListener('change', () => {
                filtreleriUygula();
            });
        }
        
        if (durumFiltre) {
            durumFiltre.addEventListener('change', () => {
                filtreleriUygula();
            });
        }
    }

    function aramaYap(aramaMetni) {
        const aramaKelime = aramaMetni.toLowerCase().trim();
        
        if (!aramaKelime) {
            filtrelenmisOyunlar = [...tumOyunlar];
        } else {
            filtrelenmisOyunlar = tumOyunlar.filter(oyun => {
                return oyun.ad.toLowerCase().includes(aramaKelime) ||
                       oyun.yazar.toLowerCase().includes(aramaKelime) ||
                       oyun.yonetmen.toLowerCase().includes(aramaKelime) ||
                       oyun.aciklama.toLowerCase().includes(aramaKelime);
            });
        }
        
        // Diğer filtreleri de uygula
        filtreleriUygula();
    }

    function filtreleriUygula() {
        const kategoriFiltre = document.getElementById('kategori-filtre');
        const durumFiltre = document.getElementById('durum-filtre');
        const aramaInput = document.getElementById('arama-input');
        
        let sonuc = [...tumOyunlar];
        
        // Arama filtresi
        if (aramaInput && aramaInput.value.trim()) {
            const aramaKelime = aramaInput.value.toLowerCase().trim();
            sonuc = sonuc.filter(oyun => {
                return oyun.ad.toLowerCase().includes(aramaKelime) ||
                       oyun.yazar.toLowerCase().includes(aramaKelime) ||
                       oyun.yonetmen.toLowerCase().includes(aramaKelime) ||
                       oyun.aciklama.toLowerCase().includes(aramaKelime);
            });
        }
        
        // Kategori filtresi
        if (kategoriFiltre && kategoriFiltre.value !== 'tumu') {
            sonuc = sonuc.filter(oyun => oyun.kategori === kategoriFiltre.value);
        }
        
        // Durum filtresi (gelecekte kullanım için)
        if (durumFiltre && durumFiltre.value !== 'tumu') {
            sonuc = sonuc.filter(oyun => oyun.durum === durumFiltre.value);
        }
        
        filtrelenmisOyunlar = sonuc;
        oyunlariGoster();
    }
    
    // Oyun detay sayfası için yönlendirme fonksiyonu
    window.oyunDetayAc = function(oyunId) {
        window.location.href = `oyun-detay.html?id=${oyunId}`;
    };

    // Fotoğraf büyütme fonksiyonu (gelecekte kullanım için)
function fotografBuyut(fotoSrc) {
        if (fotoSrc && fotoSrc.trim()) {
    window.open(fotoSrc, '_blank');
}
    }

    oyunlariYukle();
    filtreleriBaslat();
});

// Yardımcı fonksiyonlar
function getDurumText(durum, kategori) {
    if (durum === 'yaklasan') return 'Yaklaşan';
    if (durum === 'bitmis') return 'Oynandı';
    
    // Belirsiz durum için kategori bilgisini göster
    if (kategori === 'ana') return 'Ana Sahne';
    if (kategori === 'oda') return 'Oda Tiyatrosu';
    return 'Belirsiz';
}

function getKategoriText(kategori) {
    if (kategori === 'ana') return '<i class="fas fa-theater-masks"></i> Ana Sahne';
    if (kategori === 'oda') return '<i class="fas fa-home"></i> Oda Tiyatrosu';
    return '<i class="fas fa-masks-theater"></i> Diğer';
}

// Global erişim için tumOyunlar'ı dışarıda bırak
window.tumOyunlar = tumOyunlar;
window.filtrelenmisOyunlar = filtrelenmisOyunlar; 
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
                             <span>${oyun.tarih || 'Belirtilmemiş'}</span>
                        </div>
                        <div class="mekan">
                            <span>📍</span>
                             <span>${oyun.mekan || 'Belirtilmemiş'}</span>
                        </div>
                    </div>
                    
                     <p class="oyun-aciklama">${oyun.aciklama.substring(0, 100)}...</p>
                    
                    <div class="oyun-footer">
                        <div class="bilet-durumu">
                            ${oyun.bilet ? 
                                 `<a href="${oyun.bilet}" target="_blank" class="bilet-var">🎫 Bilet Al</a>` :
                                 '<span class="bilet-yok">Bilet Mevcut Değil</span>'
                            }
                        </div>
                        <button class="detay-button">Detayları Gör</button>
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
function getDurumText(durum) {
    if (durum === 'yaklasan') return 'Yaklaşan';
    if (durum === 'bitmis') return 'Oynandı';
    return 'Belirsiz';
}

function getKategoriText(kategori) {
    if (kategori === 'ana') return 'Ana Sahne';
    if (kategori === 'oda') return 'Oda Tiyatrosu';
    return 'Diğer';
}

// Global erişim için tumOyunlar'ı dışarıda bırak
window.tumOyunlar = tumOyunlar;
window.filtrelenmisOyunlar = filtrelenmisOyunlar; 
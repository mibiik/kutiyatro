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
        tumOyunlar = data.oyunlar || [];
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
    }
    
    // Oyun detay modalını aç (yeni şık tasarım)
    function oyunDetayAc(oyunId) {
        const oyun = tumOyunlar.find(o => o.id === oyunId);
        if (!oyun) {
            console.error('Oyun bulunamadı:', oyunId);
            return;
        }
        
        // Eski modalı kaldır
        const eskiModal = document.getElementById('yeni-oyun-modal');
        if (eskiModal) {
            eskiModal.remove();
        }

        // Yeni modal oluştur
        const modal = document.createElement('div');
        modal.id = 'yeni-oyun-modal';
        modal.className = 'yeni-oyun-modal';

        // Oyuncu listesi güvenli şekilde oluştur
        let oyuncuListesi = '';
        if (oyun.oyuncular && Array.isArray(oyun.oyuncular) && oyun.oyuncular.length > 0) {
            oyuncuListesi = oyun.oyuncular.map(oyuncu => {
                // Oyuncu string ise direkt kullan, object ise ad özelliğini al
                const oyuncuAdi = typeof oyuncu === 'string' ? oyuncu : (oyuncu.ad || 'İsimsiz');
                const karakter = (typeof oyuncu === 'object' && oyuncu.karakter) ? 
                    `<div style="color: #aaa; font-size: 0.85rem; margin-top: 4px;">${oyuncu.karakter}</div>` : '';
                
                return `
                    <div class="yeni-oyuncu-kart">
                        <div class="yeni-oyuncu-ad">${oyuncuAdi}</div>
                        ${karakter}
                    </div>
                `;
            }).join('');
        } else {
            oyuncuListesi = '<p style="color: #aaa; text-align: center; font-style: italic;">Kadro henüz açıklanmadı.</p>';
        }

        // Bilet bölümü güvenli şekilde oluştur
        const biletSection = (oyun.bilet && oyun.bilet.trim()) 
            ? `<div class="yeni-bilet-section">
                 <a href="${oyun.bilet}" target="_blank" class="yeni-bilet-btn">
                     🎫 Bilet Al
                 </a>
               </div>`
            : '';

        // Modal HTML'i oluştur
        modal.innerHTML = `
            <div class="yeni-modal-container">
                <button class="yeni-modal-kapat" onclick="modalKapat()">&times;</button>
                
                <div class="yeni-modal-icerik">
                    <!-- Sol Taraf: Afiş -->
                    <div class="yeni-modal-afis-bolumu">
                        <div class="yeni-modal-afis-wrapper">
                            <img src="${oyun.afis || 'assets/afis-placeholder.png'}" 
                                 alt="${oyun.ad || 'Oyun Afişi'}" 
                                 class="yeni-modal-afis"
                                 id="modal-afis-${oyunId}"
                                 onerror="this.src='assets/logo-placeholder.png'">
                            <div class="yeni-afis-overlay">
                                <h2 class="yeni-overlay-baslik">${oyun.ad || 'İsimsiz Oyun'}</h2>
                                <p class="yeni-overlay-yazar">${oyun.yazar || 'Bilinmeyen Yazar'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sağ Taraf: İçerik -->
                    <div class="yeni-modal-icerik-bolumu">
                        <!-- Başlık Alanı -->
                        <div class="yeni-modal-baslik-alani">
                            <h2 class="yeni-modal-baslik">${oyun.ad || 'İsimsiz Oyun'}</h2>
                            <p class="yeni-modal-yazar">${oyun.yazar || 'Bilinmeyen Yazar'}</p>
                        </div>
                        
                        <!-- Bilgi Grid -->
                        <div class="yeni-bilgi-grid">
                            <div class="yeni-bilgi-item">
                                <span class="yeni-bilgi-label">Tarih</span>
                                <div class="yeni-bilgi-value">${oyun.tarih || '-'}</div>
                            </div>
                            <div class="yeni-bilgi-item">
                                <span class="yeni-bilgi-label">Saat</span>
                                <div class="yeni-bilgi-value">${oyun.saat || '-'}</div>
                            </div>
                            <div class="yeni-bilgi-item">
                                <span class="yeni-bilgi-label">Mekan</span>
                                <div class="yeni-bilgi-value">${oyun.mekan || '-'}</div>
                            </div>
                            <div class="yeni-bilgi-item">
                                <span class="yeni-bilgi-label">Süre</span>
                                <div class="yeni-bilgi-value">${oyun.sure || '-'}</div>
                            </div>
                            <div class="yeni-bilgi-item">
                                <span class="yeni-bilgi-label">Yönetmen</span>
                                <div class="yeni-bilgi-value">${oyun.yonetmen || '-'}</div>
                            </div>
                            <div class="yeni-bilgi-item">
                                <span class="yeni-bilgi-label">Tür</span>
                                <div class="yeni-bilgi-value">${oyun.tur || '-'}</div>
                            </div>
                        </div>
                        
                        <!-- Açıklama -->
                        <div class="yeni-modal-aciklama">
                            <h3>Oyun Hakkında</h3>
                            <p>${oyun.aciklama || 'Açıklama mevcut değil.'}</p>
                        </div>
                        
                        <!-- Oyuncular -->
                        <div class="yeni-modal-oyuncular">
                            <h3>Oyuncu Kadrosu</h3>
                            <div class="yeni-oyuncular-grid">
                                ${oyuncuListesi}
                            </div>
                        </div>
                        
                        ${biletSection}
                    </div>
                </div>
            </div>
        `;

        // Modal'ı sayfaya ekle
        document.body.appendChild(modal);
        
        // Afiş tıklama event listener'ı ekle
        const afisElement = document.getElementById(`modal-afis-${oyunId}`);
        if (afisElement) {
            afisElement.addEventListener('click', function(e) {
                e.stopPropagation();
                tamEkranAfisGoster(
                    oyun.afis || 'assets/afis-placeholder.png', 
                    oyun.ad || 'İsimsiz Oyun', 
                    oyun.yazar || 'Bilinmeyen Yazar'
                );
            });
        }
        
        // Body scroll'unu engelle
        document.body.style.overflow = 'hidden';
        
        // Modal açma animasyonu
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Modal dışına tıklayınca kapat
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modalKapat();
            }
        });
    }

    // Modal kapatma fonksiyonu (birleştirilmiş)
    function modalKapat() {
        const modal = document.getElementById('yeni-oyun-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                modal.remove();
            }, 400);
        }
    }

    // Tam ekran afiş fonksiyonları
    function tamEkranAfisGoster(afisUrl, oyunAdi, yazar) {
        // Eski tam ekran modalını kaldır
        const eskiModal = document.getElementById('tam-ekran-afis-modal');
        if (eskiModal) {
            eskiModal.remove();
        }

        // Yeni tam ekran modal oluştur
        const modal = document.createElement('div');
        modal.id = 'tam-ekran-afis-modal';
        modal.className = 'tam-ekran-afis-modal';

        modal.innerHTML = `
            <div class="tam-ekran-afis-container">
                <img src="${afisUrl}" 
                     alt="${oyunAdi}" 
                     class="tam-ekran-afis"
                     onerror="this.src='assets/logo-placeholder.png'">
                <button class="tam-ekran-kapat" onclick="tamEkranAfisKapat()">&times;</button>
                <div class="tam-ekran-bilgi">
                    <h3 class="tam-ekran-baslik">${oyunAdi}</h3>
                    <p class="tam-ekran-yazar">${yazar}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Modal açma animasyonu
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Modal dışına tıklayınca kapat
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                tamEkranAfisKapat();
            }
        });
    }

    function tamEkranAfisKapat() {
        const modal = document.getElementById('tam-ekran-afis-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 400);
        }
    }

    // ESC tuşu ile modal kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modalKapat();
            tamEkranAfisKapat();
        }
    });

    // Fotoğraf büyütme fonksiyonu (gelecekte kullanım için)
function fotografBuyut(fotoSrc) {
        if (fotoSrc && fotoSrc.trim()) {
    window.open(fotoSrc, '_blank');
}
    }

    // Global erişim için window'a ekle
    window.oyunDetayAc = oyunDetayAc;
    window.modalKapat = modalKapat;
    window.tamEkranAfisGoster = tamEkranAfisGoster;
    window.tamEkranAfisKapat = tamEkranAfisKapat;

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
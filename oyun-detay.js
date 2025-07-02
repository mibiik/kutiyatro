// oyun-detay.js
document.addEventListener('DOMContentLoaded', () => {
    // URL'den oyun ID'sini al
    const params = new URLSearchParams(window.location.search);
    const oyunId = params.get('id');

    const loadingSpinner = document.getElementById('loading-spinner');
    const detayContainer = document.getElementById('oyun-detay-container');

    if (!oyunId) {
        detayContainer.innerHTML = '<p class="hata-mesaji">Oyun bulunamadı. Lütfen geçerli bir oyun ID\'si sağlayın.</p>';
        loadingSpinner.style.display = 'none';
        detayContainer.classList.remove('hidden');
        return;
    }

    let tumOyuncular = []; // Global oyuncu havuzu

    async function veriCek() {
        try {
            const response = await fetch('/content.json');
            if (!response.ok) {
                throw new Error('Veri çekilemedi.');
            }
            const data = await response.json();
            
            // Oyuncu havuzunu ayarla
            tumOyuncular = data.oyuncu_havuzu || [];
            
            // Oyunu bul
            console.log('Aranan oyun ID:', oyunId);
            console.log('Mevcut oyunlar:', data.oyunlar.map(o => ({id: o.id, ad: o.ad})));
            
            const oyun = data.oyunlar.find(o => o.id == oyunId || o.id.toString() === oyunId);
            
            console.log('Bulunan oyun:', oyun);
            if (oyun) {
                console.log('Oyun oyuncuları:', oyun.oyuncular);
                sayfayiDoldur(oyun);
            } else {
                throw new Error('Oyun bulunamadı.');
            }

        } catch (error) {
            console.error('Veri çekme hatası:', error);
            detayContainer.innerHTML = `<p class="hata-mesaji">Hata: ${error.message}</p>`;
        } finally {
            // Yükleme animasyonunu gizle ve içeriği göster
            loadingSpinner.style.display = 'none';
            detayContainer.classList.remove('hidden');
        }
    }

    function oyuncuListesiOlustur(oyuncular) {
        console.log('oyuncuListesiOlustur çağrıldı, oyuncular:', oyuncular);
        console.log('oyuncular array mi?', Array.isArray(oyuncular));
        console.log('oyuncular length:', oyuncular ? oyuncular.length : 'undefined');
        
        if (!oyuncular || oyuncular.length === 0) {
            console.log('Oyuncu kadrosu boş veya undefined');
            return '<li>Oyuncu kadrosu açıklanmadı.</li>';
        }

        return oyuncular.map(oyuncu => {
            // Oyuncu nesne veya string olabilir
            let oyuncuAdi, karakter;
            if (typeof oyuncu === 'string') {
                oyuncuAdi = oyuncu;
                karakter = '';
            } else if (oyuncu.ad) {
                oyuncuAdi = oyuncu.ad;
                karakter = oyuncu.karakter || '';
            } else {
                return '<li>Bilinmeyen oyuncu</li>';
            }

            // Oyuncu havuzundan resim bul
            const normalize = s => s ? s.trim().toLowerCase('tr-TR') : '';
            const havuzOyuncu = tumOyuncular.find(o => normalize(o.ad) === normalize(oyuncuAdi));
            const img = (havuzOyuncu && havuzOyuncu.img && havuzOyuncu.img !== 'assets/pngegg.png') ? havuzOyuncu.img : 'assets/1751453697640-organizator-1881-logo-F1F415.png';
            
            return `
                <li class="oyuncu-avatar-item">
                    <img src="${img}" alt="${oyuncuAdi}" class="oyuncu-avatar-img" onerror="this.src='assets/1751453697640-organizator-1881-logo-F1F415.png'">
                    <span class="oyuncu-avatar-name">${oyuncuAdi}${karakter ? ' - ' + karakter : ''}</span>
                </li>
            `;
        }).join('');
    }

    function sayfayiDoldur(oyun) {
        // Sayfa başlığını güncelle
        document.title = `${oyun.ad} - KUTİY`;
        
        console.log('Oyun verisi:', oyun);
        console.log('Oyuncular:', oyun.oyuncular);
        console.log('Oyuncu havuzu:', tumOyuncular);
        
        // Tarih kontrolü
        const now = new Date();
        let oyunTarihi = null;
        if (oyun.tarih) {
            oyunTarihi = new Date(oyun.tarih + (oyun.saat ? 'T' + oyun.saat : ''));
        }
        const tarihGelecek = oyunTarihi && oyunTarihi > now;
        
        // HTML içeriğini oluştur
        detayContainer.innerHTML = `
            <div class="oyun-detay-hero">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <div class="hero-afis-container">
                        <img src="${oyun.afis || 'assets/theater.png'}" alt="${oyun.ad} Afişi" class="hero-afis" onerror="this.src='assets/theater.png'">
                        <div class="fullscreen-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 3H21V9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M9 21H3V15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M21 3L14 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M3 21L10 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div class="hero-text">
                        <h1>${oyun.ad}</h1>
                        <p class="yazar">${oyun.yazar || 'Yazar belirtilmemiş'}</p>
                        ${tarihGelecek ? `
                            <div class="oyun-hero-seans-bilgi">
                                <span class="oyun-hero-tarih"><i class="fas fa-calendar-alt"></i> ${oyun.tarih}</span>
                                <span class="oyun-hero-saat"><i class="fas fa-clock"></i> ${oyun.saat || ''}</span>
                                ${oyun.bilet ? 
                                    `<a href="${oyun.bilet}" class="oyun-hero-bilet bilet-yesil" target="_blank"><i class="fas fa-ticket-alt"></i> Bilet Al</a>` : 
                                    `<span class="oyun-hero-bilet bilet-yesil pasif">Biletler Tükendi</span>`
                                }
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="oyun-detay-body">
                <div class="detay-grid">
                    <div class="detay-kart">
                        <h3><i class="fas fa-info-circle"></i> Oyun Hakkında</h3>
                        <p>${oyun.aciklama || 'Açıklama mevcut değil.'}</p>
                    </div>

                    <div class="detay-kart">
                        <h3><i class="fas fa-users"></i> Kadro</h3>
                        <ul class="kadro-listesi">
                            <li><strong>Yönetmen:</strong> ${oyun.yonetmen || 'Belirtilmemiş'}</li>
                            ${oyun.yardimciYonetmen ? `<li><strong>Yrd. Yönetmen:</strong> ${oyun.yardimciYonetmen}</li>` : ''}
                        </ul>
                        <h4>Oyuncular</h4>
                        <ul class="oyuncu-listesi oyuncu-avatar-grid">
                            ${(() => {
                                console.log('HTML oluşturma anında oyun.oyuncular:', oyun.oyuncular);
                                const result = oyuncuListesiOlustur(oyun.oyuncular);
                                console.log('oyuncuListesiOlustur sonucu:', result);
                                return result;
                            })()}
                        </ul>
                        ${(oyun.diger_roller && oyun.diger_roller.length > 0 && !(oyun.diger_roller.length === 1 && oyun.diger_roller[0] === 'Belirtilmemiş')) ? `
                        <h4 style="margin-top: 1rem;">Teknik Ekip</h4>
                        <ul class="kadro-listesi">
                            ${oyun.diger_roller.map(rol => `<li>${rol}</li>`).join('')}
                        </ul>
                        ` : ''}
                    </div>

                    <div class="detay-kart">
                        <h3><i class="fas fa-calendar-alt"></i> Seans Bilgileri</h3>
                         <p><strong>Tarih:</strong> ${oyun.tarih || 'Belirtilmemiş'}</p>
                         <p><strong>Saat:</strong> ${oyun.saat || 'Belirtilmemiş'}</p>
                         <p><strong>Mekan:</strong> ${oyun.mekan || oyun.konum || 'Belirtilmemiş'}</p>
                         <p><strong>Süre:</strong> ${oyun.sure || 'Belirtilmemiş'}</p>
                         ${oyun.bilet ? `<a href="${oyun.bilet}" class="bilet-butonu" target="_blank">Bilet Al</a>` : '<p class="bilet-yok">Bilet mevcut değil.</p>'}
                    </div>
                </div>
                
                ${(oyun.galeri && oyun.galeri.length > 0) ? `
                <div class="galeri-section">
                    <h2><i class="fas fa-images"></i> Galeri</h2>
                    <div class="galeri-grid">
                        ${oyun.galeri.map(foto => `<img src="${foto}" alt="Oyun Galerisi" class="galeri-item" onerror="this.style.display='none'">`).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;

        // Arka plan resmini CSS custom property olarak ata (blur efekti için)
        const heroDiv = detayContainer.querySelector('.oyun-detay-hero');
        if (heroDiv) {
            heroDiv.style.setProperty('--hero-bg-image', `url('${oyun.afis || 'assets/theater.png'}')`);
        }
        
        // Afişe tıklama olayını ekle
        const heroAfisContainer = detayContainer.querySelector('.hero-afis-container');
        if (heroAfisContainer && oyun.afis) {
            heroAfisContainer.style.cursor = 'pointer';
            heroAfisContainer.addEventListener('click', () => {
                showFullscreenAfis(oyun.afis);
            });
        }
    }

    function showFullscreenAfis(src) {
        // Mevcut bir modal varsa kaldır
        const existingModal = document.getElementById('fullscreen-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const fullscreenHtml = `
            <div id="fullscreen-modal" class="fullscreen-modal">
                <span class="fullscreen-close-btn">&times;</span>
                <img src="${src}" alt="Afiş Tam Ekran" class="fullscreen-afis-img" onerror="this.src='assets/theater.png'">
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', fullscreenHtml);
        document.body.style.overflow = 'hidden'; // Arka plan kaydırmayı engelle

        const fullscreenModal = document.getElementById('fullscreen-modal');
        
        const closeFullscreen = () => {
            fullscreenModal.classList.add('closing');
            document.body.style.overflow = ''; // Kaydırmayı geri aç
            setTimeout(() => {
                if (fullscreenModal) {
                    fullscreenModal.remove();
                }
            }, 300); // Animasyon süresiyle eşleşmeli
            document.removeEventListener('keydown', handleEsc);
        };
        
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                closeFullscreen();
            }
        };

        fullscreenModal.querySelector('.fullscreen-close-btn').addEventListener('click', closeFullscreen);
        fullscreenModal.addEventListener('click', (e) => {
            if (e.target === fullscreenModal) {
                closeFullscreen();
            }
        });
        
        document.addEventListener('keydown', handleEsc);
    }

    // Veri çekme işlemini başlat
    veriCek();
}); 
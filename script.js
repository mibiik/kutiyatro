// Header'ı scroll'a göre değiştir
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.desktop-header');
    const progressBar = document.querySelector('.progress-bar'); // Progress bar'ı seç

    if (header) {
        window.addEventListener('scroll', () => {
            // Header scroll efekti
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Progress bar hesaplaması
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            if(progressBar) {
                progressBar.style.width = scrolled + "%";
            }
        });
    }

    // Tüm içeriği çekmek için tek bir fonksiyon
    async function fetchContent() {
        try {
            // Vercel'de doğrudan dosyayı çek, lokalde API'yi kullan
            const response = await fetch('/content.json'); 
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            
            // Fonksiyonları çağır
            populateHero(data.hero);
            populateHakkimizda(data.hakkimizda);
            
            // Ekip
            if (data.ekip) {
                renderEkip(data.ekip);
            }

            // Footer (İletişim)
            if (data.iletisim) {
                const sosyalMedya = document.querySelector('.sosyal-medya');
                if (sosyalMedya) {
                    sosyalMedya.innerHTML = `
                        <a href="${data.iletisim.instagram}" target="_blank">Instagram</a>
                        <a href="${data.iletisim.twitter}" target="_blank">Twitter</a>
                        <a href="${data.iletisim.youtube}" target="_blank">Youtube</a>
                    `;
                }
                const iletisimBilgileri = document.querySelector('.iletisim-bilgileri');
                if (iletisimBilgileri) {
                    iletisimBilgileri.innerHTML = `
                        <p>${data.iletisim.adres.replace(/<br>/g, '<br>')}</p>
                        <p>${data.iletisim.email}</p>
                    `;
                }
            }
            
            // Oyunlar
            if (data.oyunlar) {
                window.tumOyunlar = data.oyunlar;
                renderYaklasanOyunlar(data.oyunlar); // Yaklaşanları render et
                renderOneCikanOyunlar(data.oyunlar);  // Öne Çıkanları (Bitmiş) render et
            }

        } catch (error) {
            console.error('Sayfa içeriği oluşturulurken hata:', error);
        }
    }

    function populateHero(heroData) {
        if (!heroData) return;
        const heroTitle = document.querySelector('#hero h1');
        const heroSubtitle = document.querySelector('#hero .event-highlight p');
        if (heroTitle) heroTitle.textContent = heroData.title;
        if (heroSubtitle) heroSubtitle.textContent = heroData.subtitle;
    }

    function populateHakkimizda(hakkimizdaData) {
        if (!hakkimizdaData) return;
        const hakkimizdaText = document.querySelector('#hakkimizda .hakkimizda-icerik p');
        if (hakkimizdaText) hakkimizdaText.textContent = hakkimizdaData.text;
    }

    function renderEkip(ekipUyeleri) {
        const ekipGridContainer = document.querySelector('.ekip-grid');
        if (!ekipGridContainer) return;

        ekipGridContainer.innerHTML = '';

        // Başkanları üste almak için sıralama yapabiliriz (isteğe bağlı)
        ekipUyeleri.sort((a, b) => {
            const aIsBaskan = a.rol === 'Eş Başkan' || a.rol === 'Başkan';
            const bIsBaskan = b.rol === 'Eş Başkan' || b.rol === 'Başkan';
            return bIsBaskan - aIsBaskan;
        });
        
        // Tüm üyeleri tek bir döngüde oluştur
        ekipUyeleri.forEach(uye => {
            const isBaskan = uye.rol === 'Eş Başkan' || uye.rol === 'Başkan';
            ekipGridContainer.innerHTML += createEkipPerson(uye, isBaskan);
        });
    }

    function createEkipPerson(uye, isBaskan) {
        const personClass = isBaskan ? 'ekip-person baskan' : 'ekip-person';
        
        return `
            <div class="${personClass}">
                <img src="${uye.img || 'assets/pngegg.png'}" alt="${uye.ad}" class="person-image">
                <h3 class="person-name">${uye.ad}</h3>
                <p class="person-role">${uye.rol}</p>
            </div>
        `;
    }

    function renderYaklasanOyunlar(oyunlar) {
        const container = document.querySelector('#oyunlar .oyun-galerisi');
        if (!container) return;

        const gosterilecekOyunlar = oyunlar.filter(oyun => oyun.durum === 'yaklasiyor').slice(0, 3);

        if (gosterilecekOyunlar.length === 0) {
            container.innerHTML = '<p style="text-align: center; width: 100%;">Yaklaşan oyun bulunmuyor.</p>';
            return;
        }

        container.innerHTML = '';
        gosterilecekOyunlar.forEach(oyun => {
            const oyunKartHTML = `
                <div class="oyun-karti-modern" onclick="showOyunModal(${oyun.id})">
                    <img src="${oyun.afis || 'assets/afis-placeholder.png'}" alt="${oyun.ad} Afişi" class="oyun-karti-modern-banner">
                    <div class="oyun-karti-modern-bilgi">
                        <h3 class="oyun-karti-modern-baslik">${oyun.ad}</h3>
                        <p class="oyun-karti-modern-detay">Yazar: ${oyun.yazar || 'Bilinmiyor'}</p>
                        <p class="oyun-karti-modern-detay">Yönetmen: ${oyun.yonetmen || 'Bilinmiyor'}</p>
                        <div class="oyun-karti-modern-ek-bilgi">
                            <p class="oyun-karti-modern-detay">${oyun.tarih || ''}</p>
                            <p class="oyun-karti-modern-detay">${oyun.mekan || ''}</p>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += oyunKartHTML;
        });
    }

    function renderOneCikanOyunlar(oyunlar) {
        const container = document.querySelector('#oyunlarimiz .oyunlar-grid');
        if (!container) return;

        // Panelde "Öne Çıkar" olarak işaretlenen oyunları filtrele.
        // Sıralama zaten panelde yapıldığı için burada sadece filtrelemek yeterli.
        const gosterilecekOyunlar = oyunlar.filter(oyun => oyun.oneCikan === true).slice(0, 5); // En fazla 5 tane göster

        if (gosterilecekOyunlar.length === 0) {
            container.innerHTML = '<p style="text-align: center; width: 100%;">Öne çıkarılan oyun bulunmuyor.</p>';
            return;
        }

        container.innerHTML = '';
        gosterilecekOyunlar.forEach(oyun => {
            const oyunId = oyun.id || oyunlar.indexOf(oyun); // ID yoksa geçici index kullan
            const oyunKartHTML = `
                <div class="oyun-karti-modern" onclick="showOyunModal('${oyunId}')">
                    <img src="${oyun.afis || 'assets/afis-placeholder.png'}" alt="${oyun.ad} Afişi" class="oyun-karti-modern-banner">
                    <div class="oyun-karti-modern-bilgi">
                        <h3 class="oyun-karti-modern-baslik">${oyun.ad}</h3>
                        <p class="oyun-karti-modern-detay">Yazar: ${oyun.yazar || 'Bilinmiyor'}</p>
                        <p class="oyun-karti-modern-detay">Yönetmen: ${oyun.yonetmen || 'Bilinmiyor'}</p>
                        <div class="oyun-karti-modern-ek-bilgi">
                             <p class="oyun-karti-modern-detay">${oyun.tarih || ''}</p>
                             <p class="oyun-karti-modern-detay">${oyun.konum || ''}</p>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += oyunKartHTML;
        });
    }

    // --- Animasyonlar ve Diğer İşlevler (Mevcut kodunuzdan) ---
    const animatedSections = document.querySelectorAll('.animated-section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedSections.forEach(section => {
        observer.observe(section);
    });

    // Sayfa yüklendiğinde içeriği doldur
    fetchContent();
});

// Scroll Animasyonları
const scrollElements = document.querySelectorAll("section");

const elementInView = (el, dividend = 1) => {
  const elementTop = el.getBoundingClientRect().top;

  return (
    elementTop <=
    (window.innerHeight || document.documentElement.clientHeight) / dividend
  );
};

const displayScrollElement = (element) => {
  element.classList.add("is-visible");
};

const hideScrollElement = (element) => {
  element.classList.remove("is-visible");
};

const handleScrollAnimation = () => {
  scrollElements.forEach((el) => {
    if (elementInView(el, 1.25)) {
      displayScrollElement(el);
    } else {
      hideScrollElement(el);
    }
  })
}

window.addEventListener("scroll", () => {
  handleScrollAnimation();
});

// Initial check
handleScrollAnimation();

// Oyun detay modalı fonksiyonu (yeni şık tasarım)
window.showOyunModal = function(oyunId) {
    const oyun = window.tumOyunlar.find(o => (o.id || window.tumOyunlar.indexOf(o)) == oyunId);
    if (!oyun) return;

    // Önceki modal varsa kaldır
    const existingModal = document.getElementById('oyun-detay-modal');
    if (existingModal) {
        existingModal.remove();
    }
    const existingFullscreen = document.getElementById('fullscreen-afis-modal');
    if (existingFullscreen) {
        existingFullscreen.remove();
    }


    let modalHtml = `<div id="oyun-detay-modal" class="oyun-modal-overlay">
        <div class="oyun-modal-content">
            <button class="oyun-modal-close-btn">&times;</button>
            <div class="oyun-modal-layout">
                <div class="oyun-modal-afis-container">
                    <img src="${oyun.afis || 'assets/afis-placeholder.png'}" alt="${oyun.ad} Afişi" class="oyun-modal-afis">
                </div>
                <div class="oyun-modal-bilgi">
                    <h2 class="oyun-modal-baslik">${oyun.ad}</h2>
                    ${oyun.yazar ? `<p class="oyun-modal-yazar"><strong>Yazar:</strong> ${oyun.yazar}</p>` : ''}
                    ${oyun.yonetmen ? `<p class="oyun-modal-yonetmen"><strong>Yönetmen:</strong> ${oyun.yonetmen}</p>` : ''}
                    
                    <div class="oyun-modal-detay-grid">
                        ${oyun.tarih ? `<div><i class="fa-regular fa-calendar-days"></i><span>${oyun.tarih}</span></div>` : ''}
                        ${oyun.saat ? `<div><i class="fa-regular fa-clock"></i><span>${oyun.saat}</span></div>` : ''}
                        ${oyun.konum ? `<div><i class="fa-solid fa-location-dot"></i><span>${oyun.konum}</span></div>` : ''}
                        ${oyun.süre ? `<div><i class="fa-solid fa-hourglass-half"></i><span>${oyun.süre}</span></div>` : ''}
                        ${oyun.tur ? `<div><i class="fa-solid fa-masks-theater"></i><span>${oyun.tur}</span></div>` : ''}
                    </div>

                    ${oyun.aciklama ? `<div class="oyun-modal-aciklama"><p>${oyun.aciklama.replace(/\n/g, '<br>')}</p></div>` : ''}

                    ${oyun.bilet ? `<a href="${oyun.bilet}" target="_blank" class="oyun-modal-bilet-btn">Bilet Al</a>` : ''}
                    
                    ${(oyun.oyuncular && oyun.oyuncular.length > 0) ? `
                        <div class="oyun-modal-kadro">
                            <h4>Oyuncu Kadrosu</h4>
                            <ul>
                                ${oyun.oyuncular.map(o => `<li><strong>${o.ad}</strong>${o.karakter ? `: ${o.karakter}` : ''}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('oyun-detay-modal');
    
    // Kapatma fonksiyonları
    const closeModal = () => {
        modal.classList.add('closing');
        setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('.oyun-modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeModal();
        }
    }, { once: true });

    // Afişe tıklayınca tam ekran yapma
    const afisImg = modal.querySelector('.oyun-modal-afis');
    afisImg.addEventListener('click', () => {
        showFullscreenAfis(oyun.afis);
    });
}

function showFullscreenAfis(src) {
    if (!src) return;
    
    const fullscreenHtml = `
        <div id="fullscreen-afis-modal" class="fullscreen-modal">
            <span class="fullscreen-close-btn">&times;</span>
            <img src="${src}" alt="Afiş Tam Ekran">
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', fullscreenHtml);

    const fullscreenModal = document.getElementById('fullscreen-afis-modal');
    
    const closeFullscreen = () => {
        fullscreenModal.remove();
    };

    fullscreenModal.querySelector('.fullscreen-close-btn').addEventListener('click', closeFullscreen);
    fullscreenModal.addEventListener('click', (e) => {
        if (e.target === fullscreenModal) {
            closeFullscreen();
        }
    });
     document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeFullscreen();
        }
    }, { once: true });
}


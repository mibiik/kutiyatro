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

    // --- API'den içerik çekme ---
    async function populateContent() {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('İçerik yüklenemedi.');
            const content = await response.json();

            // Hero
            if (content.hero) {
                document.querySelector('#hero h1').textContent = content.hero.title;
                document.querySelector('#hero .event-highlight p').textContent = content.hero.subtitle;
            }

            // Hakkımızda
            if (content.hakkimizda) {
                document.querySelector('#hakkimizda .hakkimizda-icerik p').textContent = content.hakkimizda.text;
            }
            
            // Ekip
            if (content.ekip) {
                renderEkip(content.ekip);
            }

            // Footer (İletişim)
            if (content.iletisim) {
                const sosyalMedya = document.querySelector('.sosyal-medya');
                if (sosyalMedya) {
                    sosyalMedya.innerHTML = `
                        <a href="${content.iletisim.instagram}" target="_blank">Instagram</a>
                        <a href="${content.iletisim.twitter}" target="_blank">Twitter</a>
                        <a href="${content.iletisim.youtube}" target="_blank">Youtube</a>
                    `;
                }
                const iletisimBilgileri = document.querySelector('.iletisim-bilgileri');
                if (iletisimBilgileri) {
                    iletisimBilgileri.innerHTML = `
                        <p>${content.iletisim.adres.replace(/<br>/g, '<br>')}</p>
                        <p>${content.iletisim.email}</p>
                    `;
                }
            }
            
            // Oyunlar
            if (content.oyunlar) {
                window.tumOyunlar = content.oyunlar;
                renderYaklasanOyunlar(content.oyunlar); // Yaklaşanları render et
                renderOneCikanOyunlar(content.oyunlar);  // Öne Çıkanları (Bitmiş) render et
            }

        } catch (error) {
            console.error('Sayfa içeriği oluşturulurken hata:', error);
        }
    }

    function renderEkip(ekipUyeleri) {
        const yonetimContainer = document.querySelector('.ekip-yonetim');
        const uyelerContainer = document.querySelector('.ekip-uyeler');

        if (!yonetimContainer || !uyelerContainer) return;

        yonetimContainer.innerHTML = '';
        uyelerContainer.innerHTML = '';

        const baskanlar = ekipUyeleri.filter(uye => uye.rol === 'Eş Başkan');
        let digerUyeler = ekipUyeleri.filter(uye => uye.rol !== 'Eş Başkan');
        
        // Can Şahin'i bul ve listenin sonuna taşı
        const canIndex = digerUyeler.findIndex(uye => uye.ad === 'Can Şahin');
        if (canIndex > -1) {
            const can = digerUyeler.splice(canIndex, 1)[0];
            digerUyeler.push(can);
        }

        baskanlar.forEach(uye => {
            yonetimContainer.innerHTML += createEkipKarti(uye, true); // Başkanlar için özel flag
        });

        digerUyeler.forEach(uye => {
            uyelerContainer.innerHTML += createEkipKarti(uye, false);
        });
    }

    function createEkipKarti(uye, isBaskan) {
        // Başkanlar için daha büyük bir kart stili uygulanabilir
        const kartClass = isBaskan ? 'ekip-karti baskan-karti' : 'ekip-karti';
        return `
            <div class="${kartClass}">
                <img src="${uye.img}" alt="${uye.ad}">
                <h3>${uye.ad}</h3>
                <p class="rol">${uye.rol}</p>
                <a href="mailto:${uye.email}" class="ekip-mail">İletişim</a>
            </div>`;
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

        // Ana oyunları öncelikli olarak göster
        let gosterilecekOyunlar = oyunlar
            .filter(oyun => oyun.kategori === 'ana' && oyun.anasayfadaGoster === true)
            .slice(0, 5);

        // Eğer 5 ana oyun yoksa, diğer oyunlardan ekle
        if (gosterilecekOyunlar.length < 5) {
            const digerOyunlar = oyunlar
                .filter(oyun => !(oyun.kategori === 'ana' && oyun.anasayfadaGoster === true))
                .filter(oyun => oyun.durum === 'bitmis')
                .slice(0, 5 - gosterilecekOyunlar.length);
            
            gosterilecekOyunlar = [...gosterilecekOyunlar, ...digerOyunlar];
        }

        if (gosterilecekOyunlar.length === 0) {
            container.innerHTML = '<p style="text-align: center; width: 100%;">Gösterilecek tamamlanmış oyun bulunmuyor.</p>';
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
    populateContent();
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

// Oyun detay modalı fonksiyonu (basit)
window.showOyunModal = function(oyunId) {
    const oyun = window.tumOyunlar?.find(o => o.id === oyunId);
    if (!oyun) return;
    
    let modal = document.getElementById('oyun-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'oyun-modal';
        modal.className = 'oyun-modal';
        document.body.appendChild(modal);
    }

    const oyuncuListesi = (oyun.oyuncular && oyun.oyuncular.length > 0)
        ? oyun.oyuncular.map(o => `<div class="oyuncu-tag">${o.ad}</div>`).join('')
        : '<p>Kadro henüz açıklanmadı.</p>';

    modal.innerHTML = `
        <div class="oyun-modal-icerik">
            <button class="oyun-modal-kapat" onclick="document.getElementById('oyun-modal').style.display='none'">&times;</button>
            <div class="modal-layout">
                <div class="modal-sol-panel">
                    <img src="${oyun.afis || 'assets/afis-placeholder.png'}" alt="${oyun.ad} Afişi" class="modal-afis">
                </div>
                <div class="modal-sag-panel">
                    <h2 class="modal-oyun-adi">${oyun.ad}</h2>
                    <p class="modal-yazar"><strong>Yazar:</strong> ${oyun.yazar || 'Bilinmiyor'}</p>
                    <div class="modal-detay-grid">
                        <div><strong>Yönetmen:</strong> ${oyun.yonetmen || '-'}</div>
                        <div><strong>Yrd. Yönetmen:</strong> ${oyun.yardimci_yonetmen || '-'}</div>
                        <div><strong>Tarih:</strong> ${oyun.tarih || '-'}</div>
                        <div><strong>Mekan:</strong> ${oyun.mekan || '-'}</div>
                        <div><strong>Süre:</strong> ${oyun.sure || '-'}</div>
                        <div><strong>Kategori:</strong> ${oyun.kategori || '-'}</div>
                    </div>
                    <div class="modal-aciklama">
                        <h4>Oyun Hakkında</h4>
                        <p>${oyun.aciklama || 'Açıklama mevcut değil.'}</p>
                    </div>
                    <div class="modal-oyuncular">
                        <h4>Oyuncular</h4>
                        <div class="oyuncu-listesi">${oyuncuListesi}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}
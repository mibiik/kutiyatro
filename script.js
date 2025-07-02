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
                <img src="${uye.img || 'assets/1751453697640-organizator-1881-logo-F1F415.png'}" alt="${uye.ad}" class="person-image">
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

        // Panelde "Öne Çıkar" olarak işaretlenen oyunları filtrele ve sıralamaya göre sırala
        const gosterilecekOyunlar = oyunlar
            .filter(oyun => oyun.oneCikan === true)
            .sort((a, b) => (a.siralama || 999) - (b.siralama || 999))  // Sıralamaya göre sırala
            .slice(0, 5); // En fazla 5 tane göster

        if (gosterilecekOyunlar.length === 0) {
            container.innerHTML = '<p style="text-align: center; width: 100%;">Öne çıkarılan oyun bulunmuyor.</p>';
            return;
        }

        container.innerHTML = '';
        gosterilecekOyunlar.forEach(oyun => {
            const oyunId = oyun.id || oyunlar.indexOf(oyun); // ID yoksa geçici index kullan
            const oyunKartHTML = `
                <div class="oyun-kart-yeni" onclick="oyunDetayAc(${oyunId})">
                    <div class="oyun-kart-yeni-arkaplan" style="background-image: url('${oyun.afis}')"></div>
                    <div class="oyun-kart-yeni-gradient"></div>
                    <div class="oyun-kart-yeni-icerik">
                        <h3 class="oyun-kart-yeni-baslik">${oyun.ad}</h3>
                        <p class="oyun-kart-yeni-yonetmen">Yönetmen: ${oyun.yonetmen}</p>
                        <span class="oyun-kart-yeni-detay-btn">Detayları Gör</span>
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

// Oyun detay sayfası için yönlendirme fonksiyonu
window.oyunDetayAc = function(oyunId) {
    window.location.href = `oyun-detay.html?id=${oyunId}`;
};


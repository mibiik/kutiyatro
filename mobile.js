// ===== YENİ MOBİL MENÜ SİSTEMİ - THEATER İKONLU =====

document.addEventListener('DOMContentLoaded', function() {
    initMobileFeatures();
});

function initMobileFeatures() {
    // Mobil kontrol
    if (window.innerWidth <= 768) {
        // setupNewMobileMenu(); // ESKİ MENÜ KALDIRILDI
        setupTouchOptimizations();
        setupMobileAnimations();
        setupSwipeGestures();
        // Film şeridini hemen başlat
        setTimeout(() => {
            setupMobileAfisGrid();
        }, 100);
    }
}

// Yeni Mobile Menu Sistemi
function setupNewMobileMenu() {
    const header = document.querySelector('header');
    const originalNav = document.querySelector('nav');
    
    // Yeni mobil menü butonu oluştur
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.setAttribute('aria-label', 'Menüyü Aç/Kapat');
    
    // Theater icon ekle
    const theaterIcon = document.createElement('div');
    theaterIcon.className = 'theater-icon';
    menuBtn.appendChild(theaterIcon);
    
    // Mobil menü overlay oluştur
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'mobile-menu-overlay';
    
    // Mobil nav linkleri oluştur
    const mobileNavLinks = document.createElement('ul');
    mobileNavLinks.className = 'mobile-nav-links';
    
    // Orijinal nav linklerini kopyala
    const originalLinks = originalNav.querySelectorAll('a');
    originalLinks.forEach(link => {
        const li = document.createElement('li');
        const newLink = link.cloneNode(true);
        
        // Link click event'i ekle
        newLink.addEventListener('click', function(e) {
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
            
            // Menüyü kapat
            closeMobileMenu();
            
            // Smooth scroll için anchor linkler
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = 70;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    setTimeout(() => {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }, 300); // Menü kapanma animasyonu bittikten sonra
                }
            }
        });
        
        li.appendChild(newLink);
        mobileNavLinks.appendChild(li);
    });
    
    menuOverlay.appendChild(mobileNavLinks);
    
    // Header'a menü butonunu ekle
    header.appendChild(menuBtn);
    
    // Body'ye overlay'i ekle
    document.body.appendChild(menuOverlay);
    
    // Menü butonu click event'i
    menuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        toggleMobileMenu();
    });
    
    // Overlay'e tıklandığında menüyü kapat (sadece overlay'in kendisine)
    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            closeMobileMenu();
        }
    });
    
    // ESC tuşu ile menüyü kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;
    
    const isOpen = menuOverlay.classList.contains('active');
    
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;
    
    menuBtn.classList.add('active');
    menuOverlay.classList.add('active');
    body.classList.add('menu-open');
    
    // ARIA accessibility
    menuBtn.setAttribute('aria-expanded', 'true');
    menuOverlay.setAttribute('aria-hidden', 'false');
}

function closeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;
    
    if (menuBtn && menuOverlay) {
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.classList.remove('menu-open');
        
        // ARIA accessibility
        menuBtn.setAttribute('aria-expanded', 'false');
        menuOverlay.setAttribute('aria-hidden', 'true');
    }
}

// Touch Optimizations
function setupTouchOptimizations() {
    // Touch feedback for cards
    const cards = document.querySelectorAll('.oyun-karti-modern, .ekip-karti');
    
    cards.forEach(card => {
        // Touch start
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        // Touch end
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
            this.style.transition = 'transform 0.3s ease';
        }, { passive: true });
        
        // Touch cancel
        card.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
            this.style.transition = 'transform 0.3s ease';
        }, { passive: true });
    });
}

// Mobile Animations
function setupMobileAnimations() {
    // Basit scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Animate sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Animate cards with delay
    document.querySelectorAll('.oyun-karti-modern').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        observer.observe(card);
    });
}

// Swipe Gestures
function setupSwipeGestures() {
    let startX = null;
    let startY = null;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;
        
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        // Sağa swipe ile menüyü kapat
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
            const menuOverlay = document.querySelector('.mobile-menu-overlay');
            if (menuOverlay && menuOverlay.classList.contains('active') && deltaX > 0) {
                closeMobileMenu();
            }
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function() {
        startX = null;
        startY = null;
    }, { passive: true });
}

// Performance optimizations
function optimizeForMobile() {
    // Disable complex animations on lower-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--reduced-motion', '1');
    }
    
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Resize handler
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
        document.body.classList.remove('menu-open');
    }
});

// Initialize optimizations
optimizeForMobile();

// PWA-like features
function initPWAFeatures() {
    // Service worker for caching (opsiyonel)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Sessizce başarısız ol
        });
    }
    
    // Add to homescreen hint
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
}

function showInstallButton() {
    // Uygulama yükleme önerisi (opsiyonel)
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Uygulamayı Yükle';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bordo);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.remove();
        }
    });
    
    document.body.appendChild(installBtn);
    
    // 10 saniye sonra otomatik gizle
    setTimeout(() => {
        if (installBtn.parentNode) {
            installBtn.remove();
        }
    }, 10000);
}

// Setup Mobile Film Strip
function setupMobileAfisGrid() {
    const afhisMosaic = document.querySelector('.afis-mosaic');
    const afhisImages = document.querySelectorAll('.afis-mosaic-img');
    
    if (afhisMosaic && afhisImages.length > 0) {
        // Mobil için film şeridi class ekle
        afhisMosaic.classList.add('afis-mobile-grid');
        
        // Film şeridi yapısını oluştur
        const filmStrip = document.createElement('div');
        filmStrip.className = 'film-strip';
        
        const filmFrames = document.createElement('div');
        filmFrames.className = 'film-frames';
        
        // Orijinal afişleri temizle
        afhisMosaic.innerHTML = '';
        
        // Orijinal afişleri kullan - çoğaltma yok!
        afhisImages.forEach((img, index) => {
            const clonedImg = img.cloneNode(true);
            filmFrames.appendChild(clonedImg);
        });
        
        // Sonsuz döngü için afişleri duplicate et (sadece görsel döngü için)
        afhisImages.forEach((img, index) => {
            const clonedImg = img.cloneNode(true);
            filmFrames.appendChild(clonedImg);
        });
        
        filmStrip.appendChild(filmFrames);
        afhisMosaic.appendChild(filmStrip);
        
        // Scroll efekti - 60s'den 20s'ye hızlansın
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            // Scroll ile hızlanma
            const scrollSpeed = 1 + (scrolled * 0.003); // Orta düzey etki
            const minDuration = 20; // En hızlı 20 saniye
            const maxDuration = 60; // Başlangıç 60 saniye
            
            let newDuration = maxDuration / scrollSpeed;
            if (newDuration < minDuration) newDuration = minDuration;
            
            if (filmFrames) {
                filmFrames.style.animationDuration = `${newDuration}s`;
            }
        }, { passive: true });
        
        // Sayfa açılır açılmaz direk başlat - sonsuz döngü
        if (filmFrames) {
            // Sonsuz döngü için başlangıç pozisyonu
            filmFrames.style.transform = 'translate3d(0, 0, 0)';
            // Animasyonu başlat
            filmFrames.style.animation = 'verticalFilmRoll 60s linear infinite';
            filmFrames.style.animationPlayState = 'running';
            filmFrames.style.animationDelay = '0s';
            filmFrames.style.animationFillMode = 'both';
        }
        
        // Film şeridinin görünür olmasını sağla
        if (filmStrip) {
            filmStrip.style.opacity = '1';
            filmStrip.style.visibility = 'visible';
        }
    }
}

// Scroll progress indicator
function setupScrollProgress() {
    // Scroll progress bar oluştur
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 70px;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--bordo), #ff6b6b);
        z-index: 1001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    // Scroll olayını dinle
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    }, { passive: true });
}

// Enhanced visual feedback
function setupEnhancedFeedback() {
    // Tüm dokunmatik elementlere enhanced feedback ekle
    const touchElements = document.querySelectorAll('.oyun-karti-modern, .ekip-karti, .sosyal-medya a, .tumunu-gor-btn, .mobile-nav-links a');
    
    touchElements.forEach(element => {
        element.classList.add('touch-feedback');
        
        element.addEventListener('touchstart', function(e) {
            // Haptic feedback simülasyonu
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
            
            // Visual ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.touches[0].clientX - rect.left - size / 2;
            const y = e.touches[0].clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1000;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }, { passive: true });
    });
}

// CSS animasyonu dinamik olarak ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Smooth scroll için */
    html {
        scroll-behavior: smooth;
    }
`;
document.head.appendChild(style);

// Mobil özelliklerini başlat
if (window.innerWidth <= 768) {
    setupScrollProgress();
    setupEnhancedFeedback();
    
    // Film şeridinin kesinlikle başlaması için ek güvence
    window.addEventListener('load', function() {
        setTimeout(() => {
            const filmFrames = document.querySelector('.film-frames');
            if (filmFrames) {
                // Sonsuz döngü için başlangıç pozisyonu
                filmFrames.style.transform = 'translate3d(0, 0, 0)';
                // Animasyonu başlat
                filmFrames.style.animation = 'verticalFilmRoll 60s linear infinite';
                filmFrames.style.animationPlayState = 'running';
                filmFrames.style.animationDelay = '0s';
                filmFrames.style.animationFillMode = 'both';
            }
        }, 200);
    });
}

// Initialize PWA features
initPWAFeatures();

// YENİ, TEMİZ MOBİL NAVBAR JAVASCRIPT'İ
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.new-navbar__menu-btn');
  const overlay = document.querySelector('.new-navbar__overlay');
  const body = document.body;

  if (!menuBtn || !overlay) {
    return;
  }

  const toggleMenu = () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !isExpanded);
    overlay.classList.toggle('active');
    body.classList.toggle('new-navbar--menu-open');
  };

  menuBtn.addEventListener('click', toggleMenu);

  overlay.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      toggleMenu();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      toggleMenu();
    }
  });

  // Mobil menüdeki alt menü (submenu) işlevselliği
  const submenuToggles = document.querySelectorAll('.submenu-toggle');

  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault(); // Sayfanın başına gitmesini engelle
      const parentLi = toggle.parentElement;
      
      // Diğer açık submenu'leri kapat (isteğe bağlı)
      document.querySelectorAll('.has-submenu.active').forEach(openSubmenu => {
        if(openSubmenu !== parentLi) {
          openSubmenu.classList.remove('active');
          openSubmenu.querySelector('.submenu').style.maxHeight = '0px';
          openSubmenu.querySelector('.submenu').style.padding = '0';
        }
      });

      // Tıklanan submenu'yü aç/kapat
      parentLi.classList.toggle('active');
      const submenu = parentLi.querySelector('.submenu');
      if (parentLi.classList.contains('active')) {
        // max-height'i içeriğin gerçek yüksekliğine ayarla
        submenu.style.padding = '10px 0';
        submenu.style.maxHeight = submenu.scrollHeight + "px";
      } else {
        submenu.style.maxHeight = '0px';
        submenu.style.padding = '0';
      }
    });
  });
}); 
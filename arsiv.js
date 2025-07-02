// === ARŞİV SAYFASI JAVASCRIPT ===

document.addEventListener('DOMContentLoaded', () => {
    let siteContent = {};
    
    // Element referansları
    const yearsContainer = document.getElementById('years-container');
    const totalYearsEl = document.getElementById('total-years');
    const totalPlaysEl = document.getElementById('total-plays');
    const totalMediaEl = document.getElementById('total-media');
    const modal = document.getElementById('media-modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    const galleryInfo = document.getElementById('gallery-info');
    
    // Galeri durumu
    let currentGallery = [];
    let currentIndex = 0;

    // Element kontrolü
    if (!yearsContainer) {
        console.error('❌ ARŞİV: years-container elementi bulunamadı!');
        return;
    }
    
    console.log('✅ ARŞİV: DOM elementleri bulundu');
    
    // === ANA FONKSİYON ===
    async function initArchive() {
        console.log('🎭 ARŞİV: Başlangıç...');
        try {
            console.log('🌐 ARŞİV: content.json yükleniyor...');
            const response = await fetch('/content.json');
            if (!response.ok) throw new Error('İçerik yüklenemedi.');
            
            siteContent = await response.json();
            console.log('📊 ARŞİV: content.json yüklendi:', siteContent);
            
            if (!siteContent.arsiv || siteContent.arsiv.length === 0) {
                console.log('⚠️ ARŞİV: Arşiv verisi boş veya yok');
                yearsContainer.innerHTML = '<div class="empty-message">Arşivde henüz içerik bulunmuyor.</div>';
                return;
            }

            console.log('🔄 ARŞİV: Veri işleniyor...');
            processArchiveData();
            console.log('📈 ARŞİV: İstatistikler hesaplanıyor...');
            calculateStats();
            console.log('🏗️ ARŞİV: Year sections render ediliyor...');
            renderYearSections();
            console.log('🎮 ARŞİV: Event listeners kuruluyor...');
            setupEventListeners();
            console.log('📄 ARŞİV: Footer doldruluyor...');
            populateFooter();
            console.log('✅ ARŞİV: Başarıyla yüklendi!');

        } catch (error) {
            console.error('❌ ARŞİV: Yükleme hatası:', error);
            yearsContainer.innerHTML = '<div class="error-message">Arşiv verileri yüklenirken bir hata oluştu.</div>';
        }
    }

    // === VERİ İŞLEME ===
    function processArchiveData() {
        console.log('🔄 VERİ İŞLEME: Arşiv verisi kontrol ediliyor:', siteContent.arsiv);
        
        // Geçerli sezonları filtrele
        const validSeasons = siteContent.arsiv.filter(season => {
            const hasValidSezon = season.sezon && season.sezon.trim() !== '';
            const hasContent = season.icerikler && season.icerikler.length > 0;
            const hasDescription = season.aciklama && season.aciklama.trim() !== '';
            
            console.log(`Sezon kontrol: ${season.sezon}, Geçerli: ${hasValidSezon}, İçerik: ${hasContent}, Açıklama: ${hasDescription}`);
            
            return hasValidSezon && (hasContent || hasDescription);
        });
        
        console.log('✅ Geçerli sezonlar:', validSeasons);
        
        // Sezonları yıllara göre grupla
        const yearGroups = {};
        
        validSeasons.forEach(season => {
            // Sezondan yıl çıkar (örn: "2023-2024" -> "2024")
            const year = extractYearFromSeason(season.sezon);
            console.log(`Sezon: ${season.sezon} -> Yıl: ${year}`);
            
            if (!yearGroups[year]) {
                yearGroups[year] = {
                    year: year,
                    seasons: [],
                    games: [],
                    mediaArchive: {
                        photos: [],
                        videos: [],
                        note: ''
                    }
                };
            }
            
            yearGroups[year].seasons.push(season);
            
            // Her sezonun içeriklerini ayrı ayrı topla
            if (season.icerikler) {
                season.icerikler.forEach(content => {
                    if (content.tip === 'oyun' && content.baslik && content.baslik.trim() !== '') {
                        yearGroups[year].games.push({
                            ...content,
                            seasonId: season.id,
                            seasonName: season.sezon
                        });
                    }
                    
                    // Diğer medyaları arşive ekle
                    if (content.tip === 'galeri' && content.fotograflar && content.fotograflar.length > 0) {
                        yearGroups[year].mediaArchive.photos = yearGroups[year].mediaArchive.photos.concat(
                            content.fotograflar.filter(photo => photo && photo.trim() !== '')
                        );
                    }
                    if (content.tip === 'video' && content.videoUrl && content.videoUrl.trim() !== '') {
                        yearGroups[year].mediaArchive.videos.push(content.videoUrl);
                    }
                });
            }
            
            // Sezon notunu ekle
            if (season.aciklama && season.aciklama.trim() !== '') {
                const seasonNote = `<strong>${season.sezon}:</strong> ${season.aciklama}`;
                yearGroups[year].mediaArchive.note += (yearGroups[year].mediaArchive.note ? '<br><br>' : '') + seasonNote;
            }
        });
        
        console.log('📊 Yıl grupları:', yearGroups);
        
        // Yıllara göre sıralı array'e çevir
        siteContent.processedArchive = Object.values(yearGroups)
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));
            
        console.log('🏗️ İşlenmiş arşiv:', siteContent.processedArchive);
    }

    function extractYearFromSeason(seasonName) {
        // "2023-2024" formatından "2024" çıkar, "2024-2025" den "2025" çıkar
        const match = seasonName.match(/(\d{4})-(\d{4})/);
        if (match) {
            // İkinci yılı al (sezonun bitiş yılı)
            return match[2];
        }
        
        // Tek yıl formatı varsa onu al
        const singleMatch = seasonName.match(/(\d{4})/);
        if (singleMatch) {
            return singleMatch[1];
        }
        
        return seasonName; // Fallback
    }

    // === İSTATİSTİKLER ===
    function calculateStats() {
        const years = siteContent.processedArchive || [];
        let totalPlays = 0;
        let totalMedia = 0;

        years.forEach(year => {
            totalPlays += year.games.length;
            totalMedia += year.mediaArchive.photos.length + year.mediaArchive.videos.length;
        });

        // Animasyonlu sayaç efekti
        animateCounter(totalYearsEl, years.length);
        animateCounter(totalPlaysEl, totalPlays);
        animateCounter(totalMediaEl, totalMedia);
    }

    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 50);
    }

    // === YEAR SECTIONS RENDER ===
    function renderYearSections() {
        yearsContainer.innerHTML = '';
        
        siteContent.processedArchive.forEach((yearData, index) => {
            const yearSection = createYearSection(yearData);
            
            // İlk yıl hariç diğerlerini kapalı başlat
            if (index > 0) {
                yearSection.classList.add('collapsed');
                const icon = yearSection.querySelector('.year-toggle i');
                if (icon) icon.className = 'fas fa-chevron-right';
            }
            
            yearsContainer.appendChild(yearSection);
        });
    }

    // === YEAR SECTION OLUŞTUR ===
    function createYearSection(yearData) {
        const section = document.createElement('div');
        section.className = 'year-section collapsed'; // Varsayılan olarak kapalı
        section.setAttribute('data-year', yearData.year);
        
        // İstatistikleri hesapla
        const totalGames = yearData.games.length;
        const totalPhotos = yearData.mediaArchive.photos.length;
        const totalVideos = yearData.mediaArchive.videos.length;
        
        section.innerHTML = `
            <!-- Year Header (Clickable) -->
            <div class="year-header" onclick="toggleYear('${yearData.year}')">
                <div class="year-header-content">
                    <h2 class="year-title">${yearData.year} Sezonu</h2>
                    <button class="year-toggle">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="year-info">
                    <div class="season-details">
                        <span class="season-name">${yearData.seasons.length > 0 ? yearData.seasons[0].sezon : yearData.year}</span>
                        <span class="season-description">${yearData.seasons.length > 0 && yearData.seasons[0].aciklama ? yearData.seasons[0].aciklama : ''}</span>
                    </div>
                    <div class="year-stats-row">
                        <div class="year-stat">
                            <span class="year-stat-number">${totalGames}</span>
                            <span class="year-stat-label">Oyun</span>
                        </div>
                        <div class="year-stat">
                            <span class="year-stat-number">${totalPhotos}</span>
                            <span class="year-stat-label">Fotoğraf</span>
                        </div>
                        <div class="year-stat">
                            <span class="year-stat-number">${totalVideos}</span>
                            <span class="year-stat-label">Video</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Year Content (Collapsible) -->
            <div class="year-content">
                <!-- Content Navigation -->
                ${createContentNavigation(yearData)}
                
                <!-- Games Section -->
                ${yearData.games.length > 0 ? `
                    <div class="content-section games-section" data-content="games">
                        <h3 class="content-section-title">
                            <i class="fas fa-theater-masks"></i>
                            ${yearData.year} Yılının Oyunları
                        </h3>
                        <div class="game-list">
                            ${yearData.games.map((game, index) => createGameCard(game, yearData.year, index)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Photos Section -->
                ${yearData.mediaArchive.photos.length > 0 ? `
                    <div class="content-section photos-section" data-content="photos">
                        <h3 class="content-section-title">
                            <i class="fas fa-images"></i>
                            ${yearData.year} Yılı Fotoğraf Arşivi
                        </h3>
                        <div class="photo-gallery">
                            ${yearData.mediaArchive.photos.map((photo, index) => `
                                <div class="photo-item" data-type="image" data-src="${photo}">
                                    <img src="${photo}" alt="Arşiv fotoğrafı ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Videos Section -->
                ${yearData.mediaArchive.videos.length > 0 ? `
                    <div class="content-section videos-section" data-content="videos">
                        <h3 class="content-section-title">
                            <i class="fas fa-video"></i>
                            ${yearData.year} Yılı Video Arşivi
                        </h3>
                        <div class="video-embeds">
                            ${yearData.mediaArchive.videos.map(videoUrl => `
                                <div class="video-embed">
                                    <iframe src="${convertToEmbedUrl(videoUrl)}" allowfullscreen></iframe>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Optional Note -->
                ${yearData.mediaArchive.note ? `
                    <div class="content-section note-section" data-content="note">
                        <div class="optional-note">
                            <p>${yearData.mediaArchive.note}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        return section;
    }

    // === İÇERİK TÜRÜ NAVİGASYONU OLUŞTUR ===
    function createContentNavigation(yearData) {
        const totalGames = yearData.games.length;
        const totalPhotos = yearData.mediaArchive.photos.length;
        const totalVideos = yearData.mediaArchive.videos.length;
        const totalContent = totalGames + totalPhotos + totalVideos;
        
        if (totalContent === 0) return '';
        
        return `
            <div class="content-nav">
                <h4 class="content-nav-title">İçerik Filtrele</h4>
                <div class="content-nav-list">
                    <button class="content-nav-item active" data-filter="all" data-year="${yearData.year}">
                        <i class="fas fa-border-all"></i>
                        Tümü
                        <span class="count">${totalContent}</span>
                    </button>
                    ${totalGames > 0 ? `
                        <button class="content-nav-item" data-filter="games" data-year="${yearData.year}">
                            <i class="fas fa-theater-masks"></i>
                            Oyunlar
                            <span class="count">${totalGames}</span>
                        </button>
                    ` : ''}
                    ${totalPhotos > 0 ? `
                        <button class="content-nav-item" data-filter="photos" data-year="${yearData.year}">
                            <i class="fas fa-images"></i>
                            Fotoğraflar
                            <span class="count">${totalPhotos}</span>
                        </button>
                    ` : ''}
                    ${totalVideos > 0 ? `
                        <button class="content-nav-item" data-filter="videos" data-year="${yearData.year}">
                            <i class="fas fa-video"></i>
                            Videolar
                            <span class="count">${totalVideos}</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // === İÇERİK FİLTRELEME FONKSİYONU ===
    function filterContent(yearSection, filter) {
        const contentSections = yearSection.querySelectorAll('.content-section');
        
        contentSections.forEach(section => {
            const contentType = section.dataset.content;
            
            if (filter === 'all') {
                // Tümünü göster
                section.classList.remove('hidden');
            } else if (filter === contentType) {
                // Sadece seçili türü göster
                section.classList.remove('hidden');
            } else {
                // Diğerlerini gizle
                section.classList.add('hidden');
            }
        });
        
        // Smooth scroll efekti için
        setTimeout(() => {
            const firstVisibleSection = yearSection.querySelector('.content-section:not(.hidden)');
            if (firstVisibleSection) {
                firstVisibleSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }

    // === YIL TOGGLE FONKSİYONU ===
    window.toggleYear = function(year) {
        const yearSection = document.querySelector(`[data-year="${year}"]`);
        if (yearSection) {
            yearSection.classList.toggle('collapsed');
            
            // Icon rotation
            const icon = yearSection.querySelector('.year-toggle i');
            if (yearSection.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-right';
            } else {
                icon.className = 'fas fa-chevron-down';
            }
            
            // Smooth scroll animation
            if (!yearSection.classList.contains('collapsed')) {
                setTimeout(() => {
                    yearSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 300);
            }
        }
    };

    // === GAME CARD OLUŞTUR ===
    function createGameCard(game, year, index) {
        const seasonId = game.season ? game.season.replace(/[^a-zA-Z0-9]/g, '-') : `game-${year}-${index}`;
        
        return `
            <div class="game-card" id="season-${seasonId}">
                <!-- Game Header -->
                <div class="game-header">
                    ${game.afis ? `<img src="${game.afis}" alt="${game.baslik}" class="game-poster">` : ''}
                    <div class="game-info">
                        <!-- GameTitle -->
                        <h4 class="game-title">${game.baslik || 'İsimsiz Oyun'}</h4>
                        
                        <!-- GameInfo -->
                        <div class="game-details">
                            ${game.seasonName ? `<div class="game-detail"><strong>Sezon:</strong> ${game.seasonName}</div>` : ''}
                            ${game.yonetmen ? `<div class="game-detail"><strong>Yönetmen:</strong> ${game.yonetmen}</div>` : ''}
                            ${game.yazar ? `<div class="game-detail"><strong>Yazar:</strong> ${game.yazar}</div>` : ''}
                        </div>
                        
                        <!-- Özet -->
                        ${game.ozet ? `<div class="game-summary">${game.ozet}</div>` : ''}
                    </div>
                </div>
                
                <!-- Game Media -->
                <div class="game-media">
                    <!-- Gallery -->
                    ${game.fotograflar && game.fotograflar.length > 0 ? `
                        <div class="media-section">
                            <h5 class="media-title">Galeri</h5>
                            <div class="game-gallery">
                                ${game.fotograflar.map((photo, photoIndex) => `
                                    <div class="gallery-item" data-type="image" data-src="${photo}">
                                        <img src="${photo}" alt="Oyun fotoğrafı ${photoIndex + 1}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- VideoEmbed -->
                    ${game.videoUrl ? `
                        <div class="media-section">
                            <h5 class="media-title">Video</h5>
                            <div class="video-embeds">
                                <div class="video-embed">
                                    <iframe src="${convertToEmbedUrl(game.videoUrl)}" allowfullscreen></iframe>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- CastList -->
                    ${game.oyuncular || game.teknikEkip ? `
                        <div class="media-section">
                            <h5 class="media-title">Kadro & Ekip</h5>
                            <div class="cast-list">
                                ${game.oyuncular ? `
                                    <div class="cast-category">
                                        <div class="cast-category-title">Oyuncular</div>
                                        <div class="cast-members">${Array.isArray(game.oyuncular) ? game.oyuncular.join(', ') : game.oyuncular}</div>
                                    </div>
                                ` : ''}
                                ${game.teknikEkip ? `
                                    <div class="cast-category">
                                        <div class="cast-category-title">Teknik Ekip</div>
                                        <div class="cast-members">${Array.isArray(game.teknikEkip) ? game.teknikEkip.join(', ') : game.teknikEkip}</div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // === MEDIA ARCHIVE OLUŞTUR ===
    function createMediaArchive(mediaArchive, year) {
        if (mediaArchive.photos.length === 0 && mediaArchive.videos.length === 0 && !mediaArchive.note) {
            return '';
        }
        
        return `
            <div class="media-archive">
                <h3 class="media-archive-title">${year} Yılı Medya Arşivi</h3>
                
                <!-- PhotoGallery -->
                ${mediaArchive.photos.length > 0 ? `
                    <div class="media-section">
                        <h5 class="media-title">Fotoğraf Arşivi</h5>
                        <div class="photo-gallery">
                            ${mediaArchive.photos.map((photo, index) => `
                                <div class="photo-item" data-type="image" data-src="${photo}">
                                    <img src="${photo}" alt="Arşiv fotoğrafı ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- VideoEmbed -->
                ${mediaArchive.videos.length > 0 ? `
                    <div class="media-section">
                        <h5 class="media-title">Video Arşivi</h5>
                        <div class="video-embeds">
                            ${mediaArchive.videos.map(videoUrl => `
                                <div class="video-embed">
                                    <iframe src="${convertToEmbedUrl(videoUrl)}" allowfullscreen></iframe>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- OptionalNote -->
                ${mediaArchive.note ? `
                    <div class="optional-note">
                        <p>${mediaArchive.note}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // === GALERI SİSTEMİ ===
    function openGallery(clickedSrc, galleryContainer) {
        console.log('🎭 ARŞİV: Galeri açılıyor...', clickedSrc);
        
        // Aynı konteyner içindeki tüm fotoğrafları topla
        currentGallery = [];
        const photoItems = galleryContainer.querySelectorAll('[data-type="image"]');
        
        photoItems.forEach((item, index) => {
            const src = item.dataset.src;
            if (src) {
                currentGallery.push(src);
                if (src === clickedSrc) {
                    currentIndex = index;
                }
            }
        });
        
        console.log('🎭 ARŞİV: Galeri fotoğrafları:', currentGallery);
        console.log('🎭 ARŞİV: Başlangıç indexi:', currentIndex);
        
        if (currentGallery.length > 0) {
            showCurrentImage();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateGalleryButtons();
        }
    }
    
    function showCurrentImage() {
        if (currentGallery.length > 0 && currentIndex >= 0 && currentIndex < currentGallery.length) {
            const currentSrc = currentGallery[currentIndex];
            modalBody.innerHTML = `<img src="${currentSrc}" alt="Galeri fotoğrafı ${currentIndex + 1}">`;
            
            // Sayaç güncelle
            if (galleryInfo) {
                const counter = galleryInfo.querySelector('.gallery-counter');
                if (counter) {
                    counter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
                }
            }
        }
    }
    
    function updateGalleryButtons() {
        if (galleryPrev && galleryNext) {
            // Tek fotoğraf varsa butonları gizle
            if (currentGallery.length <= 1) {
                galleryPrev.style.display = 'none';
                galleryNext.style.display = 'none';
                galleryInfo.style.display = 'none';
            } else {
                galleryPrev.style.display = 'flex';
                galleryNext.style.display = 'flex';
                galleryInfo.style.display = 'block';
                
                // İlk fotoğraftaysa geri butonu pasif
                galleryPrev.disabled = (currentIndex === 0);
                // Son fotoğraftaysa ileri butonu pasif
                galleryNext.disabled = (currentIndex === currentGallery.length - 1);
            }
        }
    }
    
    function goToPrevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            showCurrentImage();
            updateGalleryButtons();
        }
    }
    
    function goToNextImage() {
        if (currentIndex < currentGallery.length - 1) {
            currentIndex++;
            showCurrentImage();
            updateGalleryButtons();
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentGallery = [];
        currentIndex = 0;
    }

    // === EVENT LİSTENERLAR ===
    function setupEventListeners() {
        // Medya öğelerine tıklama (Galeri sistemi)
        yearsContainer.addEventListener('click', (e) => {
            const mediaItem = e.target.closest('[data-type="image"]');
            if (mediaItem) {
                const src = mediaItem.dataset.src;
                // Hangi galeri konteynerinde olduğunu bul
                const galleryContainer = mediaItem.closest('.photo-gallery, .game-gallery');
                if (galleryContainer && src) {
                    openGallery(src, galleryContainer);
                }
            }
        });

        // İçerik filtreleme
        yearsContainer.addEventListener('click', (e) => {
            const contentNavItem = e.target.closest('.content-nav-item');
            if (contentNavItem) {
                const filter = contentNavItem.dataset.filter;
                const year = contentNavItem.dataset.year;
                const yearSection = document.querySelector(`[data-year="${year}"]`);
                
                if (yearSection) {
                    // Active state güncelle
                    yearSection.querySelectorAll('.content-nav-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    contentNavItem.classList.add('active');
                    
                    // İçerikleri filtrele
                    filterContent(yearSection, filter);
                }
            }
        });

        // Modal kapatma
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
        
        // Galeri navigasyon butonları
        if (galleryPrev) galleryPrev.addEventListener('click', goToPrevImage);
        if (galleryNext) galleryNext.addEventListener('click', goToNextImage);
        
        // Klavye navigasyonu
        document.addEventListener('keydown', (e) => {
            if (modal && modal.classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        closeModal();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        goToPrevImage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        goToNextImage();
                        break;
                }
            }
        });
    }

    // === YARDIMCI FONKSİYONLAR ===
    function convertToEmbedUrl(url) {
        if (!url) return '';
        
        // YouTube URL'sini embed formatına çevir
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&#?]*)/;
        const match = url.match(youtubeRegex);
        
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        
        return url; // Zaten embed formatında ise veya başka platform ise olduğu gibi döndür
    }

    // === FOOTER ===
    function populateFooter() {
        const iletisim = siteContent.iletisim;
        if (!iletisim) return;

        const sosyalMedya = document.querySelector('footer .sosyal-medya');
        const iletisimBilgileri = document.querySelector('footer .iletisim-bilgileri');

        if (sosyalMedya) {
            // Ad blocker kontrolü - Basit test
            let adBlockerDetected = false;
            try {
                const testAd = document.createElement('div');
                testAd.innerHTML = '&nbsp;';
                testAd.className = 'adsbox';
                testAd.style.position = 'absolute';
                testAd.style.left = '-10000px';
                document.body.appendChild(testAd);
                
                setTimeout(() => {
                    if (testAd.offsetHeight === 0) {
                        adBlockerDetected = true;
                    }
                    document.body.removeChild(testAd);
                    
                    // Ad blocker varsa alternatif content göster
                    if (adBlockerDetected) {
                        sosyalMedya.innerHTML = `
                            ${iletisim.instagram ? `<a href="${iletisim.instagram}" target="_blank">Instagram</a>` : ''}
                            ${iletisim.twitter ? `<a href="${iletisim.twitter}" target="_blank">Twitter</a>` : ''}
                            ${iletisim.youtube ? `<a href="${iletisim.youtube}" target="_blank">YouTube</a>` : ''}
                        `;
                    } else {
                        // Normal social media links
                        sosyalMedya.innerHTML = `
                            ${iletisim.instagram ? `<a href="${iletisim.instagram}" target="_blank">Instagram</a>` : ''}
                            ${iletisim.twitter ? `<a href="${iletisim.twitter}" target="_blank">Twitter</a>` : ''}
                            ${iletisim.youtube ? `<a href="${iletisim.youtube}" target="_blank">YouTube</a>` : ''}
                        `;
                    }
                }, 100);
            } catch (e) {
                // Hata durumunda normal linkler göster
        sosyalMedya.innerHTML = `
                    ${iletisim.instagram ? `<a href="${iletisim.instagram}" target="_blank">Instagram</a>` : ''}
                    ${iletisim.twitter ? `<a href="${iletisim.twitter}" target="_blank">Twitter</a>` : ''}
                    ${iletisim.youtube ? `<a href="${iletisim.youtube}" target="_blank">YouTube</a>` : ''}
                `;
            }
        }
        
        if (iletisimBilgileri) {
        iletisimBilgileri.innerHTML = `
             <p>Koç Üniversitesi Tiyatro Kulübü (KUTİY)</p>
                <p>${iletisim.adres ? iletisim.adres.replace(/<br>/g, '<br>') : ''}</p>
                <p>${iletisim.email || ''}</p>
            `;
        }
    }

    // === BAŞLANGIC ===
    initArchive();
    
    // === MOBİL NAVİGASYON ===
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Menü linklerine tıklandığında menüyü kapat
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Menü dışına tıklandığında menüyü kapat
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});
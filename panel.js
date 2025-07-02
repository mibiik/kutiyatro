document.addEventListener('DOMContentLoaded', () => {

    // ----------------- STATE MANAGEMENT -----------------
    let siteContent = {};
    let currentEdit = { type: null, index: -1 };

    // API Base URL - Environment'a göre ayarla
    const getApiBaseUrl = () => {
        // Production (Vercel) ortamı için kontrol
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return window.location.origin; // Vercel URL'i kullan
        }
        // Development ortamı
        return '';
    };

    const API_BASE_URL = getApiBaseUrl();

    // ----------------- ELEMENT SELECTORS -----------------
    // Main Layout
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const contentSections = document.querySelectorAll('.main-content .content-section');

    // Mobile Navigation
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const closeSidebarBtn = document.querySelector('.sidebar .close-sidebar');

    // Overview Cards
    const oyunSayisiEl = document.getElementById('oyun-sayisi');
    const ekipSayisiEl = document.getElementById('ekip-sayisi');
    const oyuncuHavuzuSayisiEl = document.getElementById('oyuncu-havuzu-sayisi');
    const arsivSayisiEl = document.getElementById('arsiv-sayisi');

    // Forms
    const heroForm = document.getElementById('hero-form');
    const heroTitleInput = document.getElementById('hero-title');
    const heroSubtitleInput = document.getElementById('hero-subtitle');
    
    const hakkimizdaForm = document.getElementById('hakkimizda-form');
    const hakkimizdaTextInput = document.getElementById('hakkimizda-text');

    const iletisimForm = document.getElementById('iletisim-form');
    const iletisimInstagramInput = document.getElementById('iletisim-instagram');
    const iletisimTwitterInput = document.getElementById('iletisim-twitter');
    const iletisimYoutubeInput = document.getElementById('iletisim-youtube');
    const iletisimAdresInput = document.getElementById('iletisim-adres');
    const iletisimEmailInput = document.getElementById('iletisim-email');
    
    // Lists
    const oyunlarList = document.getElementById('oyunlar-list');
    const oneCikanOyunlarList = document.getElementById('one-cikan-oyunlar-list');
    const ekipList = document.getElementById('ekip-list');
    const oyuncuHavuzuList = document.getElementById('oyuncu-havuzu-list');

    const arsivList = document.getElementById('arsiv-list');
    const totalSeasonsEl = document.getElementById('total-seasons');
    const totalContentsEl = document.getElementById('total-contents');
    const totalPhotosEl = document.getElementById('total-photos');
    const totalVideosEl = document.getElementById('total-videos');

    // "Add New" Buttons
    const addOyunBtn = document.getElementById('add-oyun-button');
    const addEkipBtn = document.getElementById('add-ekip-button');
    const addOyuncuBtn = document.getElementById('add-oyuncu-button');
    const addSezonBtn = document.getElementById('add-sezon-button');

    // Modal
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const modalFields = document.getElementById('modal-fields');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    // Notification
    const notificationContainer = document.getElementById('notification-container');

    // ----------------- API CALLS -----------------
    const fetchContent = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content`);
            if (!response.ok) throw new Error('İçerik sunucudan alınamadı.');
            siteContent = await response.json();
            
            // Eski tek rol sistemini çoklu rol sistemine dönüştür
            if (siteContent.oyuncu_havuzu) {
                siteContent.oyuncu_havuzu.forEach(oyuncu => {
                    if (oyuncu.tip && !oyuncu.roller) {
                        oyuncu.roller = [oyuncu.tip];
                    }
                });
            }
            
            // VERİ TEMİZLİĞİ: Oyuncu havuzunu düzenle
            cleanupOyuncuHavuzu();
            
            renderAllContent();
        } catch (error) {
            console.error('Failed to fetch content:', error);
            showNotification('İçerik yüklenemedi. Sunucu çalışıyor mu?', 'error');
        }
    };

    // Oyuncu havuzu veri temizliği
    const cleanupOyuncuHavuzu = () => {
        if (!siteContent.oyuncu_havuzu) return;
        
        console.log('Oyuncu havuzu temizliği başlıyor...');
        
        // ID'siz kayıtlara ID ver
        let maxId = 0;
        siteContent.oyuncu_havuzu.forEach(oyuncu => {
            if (oyuncu.id && typeof oyuncu.id === 'number') {
                maxId = Math.max(maxId, oyuncu.id);
            }
        });
        
        siteContent.oyuncu_havuzu.forEach(oyuncu => {
            if (!oyuncu.id) {
                oyuncu.id = ++maxId;
                console.log(`ID eklendi: ${oyuncu.ad} -> ID: ${oyuncu.id}`);
            }
        });
        
        // Duplicate kayıtları temizle (aynı isimde birden fazla kayıt varsa)
        const uniqueNames = new Set();
        const cleanedOyuncuHavuzu = [];
        
        siteContent.oyuncu_havuzu.forEach(oyuncu => {
            if (oyuncu.ad) {
                const normalizedName = oyuncu.ad.trim().toLowerCase();
                if (!uniqueNames.has(normalizedName)) {
                    uniqueNames.add(normalizedName);
                    cleanedOyuncuHavuzu.push(oyuncu);
                } else {
                    console.log(`Duplicate kayıt kaldırıldı: ${oyuncu.ad}`);
                }
            }
        });
        
        const originalLength = siteContent.oyuncu_havuzu.length;
        siteContent.oyuncu_havuzu = cleanedOyuncuHavuzu;
        
        if (originalLength !== cleanedOyuncuHavuzu.length) {
            console.log(`Oyuncu havuzu temizlendi: ${originalLength} -> ${cleanedOyuncuHavuzu.length} kayıt`);
            // Temizlik sonrası otomatik kaydet
            saveContent();
        }
    };

    const saveContent = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteContent, null, 2)
            });
            if (!response.ok) throw new Error('Değişiklikler sunucuya kaydedilemedi.');
            showNotification('Değişiklikler başarıyla kaydedildi!', 'success', 2000);
            await fetchContent(); // Re-fetch for consistency
        } catch (error) {
            console.error('Failed to save content:', error);
            showNotification('Değişiklikler kaydedilemedi.', 'error', 2500);
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Resim yüklenemedi');
            const data = await response.json();
            return data.filePath;
        } catch (error) {
            console.error('Image upload error:', error);
            showNotification('Resim yüklenemedi.', 'error');
            return null;
        }
    };

    // ----------------- RENDER FUNCTIONS -----------------
    const renderAllContent = () => {
        if (!siteContent) return;

        // Overview
        oyunSayisiEl.textContent = siteContent.oyunlar?.length || 0;
        ekipSayisiEl.textContent = siteContent.ekip?.length || 0;
        oyuncuHavuzuSayisiEl.textContent = siteContent.oyuncu_havuzu?.length || 0;
        arsivSayisiEl.textContent = siteContent.arsiv?.length || 0;

        // Forms
        heroTitleInput.value = siteContent.hero?.title || '';
        heroSubtitleInput.value = siteContent.hero?.subtitle || '';
        hakkimizdaTextInput.value = siteContent.hakkimizda?.text || '';
        
        if(siteContent.iletisim) {
            iletisimInstagramInput.value = siteContent.iletisim.instagram || '';
            iletisimTwitterInput.value = siteContent.iletisim.twitter || '';
            iletisimYoutubeInput.value = siteContent.iletisim.youtube || '';
            iletisimAdresInput.value = siteContent.iletisim.adres || '';
            iletisimEmailInput.value = siteContent.iletisim.email || '';
        }

        // Lists
        renderOyunlar();
        renderOneCikanOyunlar();
        renderEkip();
        renderOyuncuHavuzu();
        renderArsiv();

    };

    const renderOyunlar = () => {
        oyunlarList.innerHTML = '';
        
        // Oyunları sıralamaya göre sırala
        const sortedOyunlar = [...(siteContent.oyunlar || [])].sort((a, b) => {
            const siralamaA = a.siralama || 999;
            const siralamaB = b.siralama || 999;
            return siralamaA - siralamaB;
        });
        
        sortedOyunlar.forEach((item) => {
            // Orijinal index'i bul
            const originalIndex = siteContent.oyunlar.findIndex(o => o.id === item.id);
            const itemDiv = createDraggableListItem(item, originalIndex, 'oyun');
            oyunlarList.appendChild(itemDiv);
        });
        addDragAndDropListeners(oyunlarList, 'oyun');
    };

    const renderOneCikanOyunlar = () => {
        if (!oneCikanOyunlarList) return;
        oneCikanOyunlarList.innerHTML = '';
        
        // Öne çıkan oyunları filtrele ve sıralamaya göre sırala
        const oneCikanOyunlar = siteContent.oyunlar?.filter(o => o.oneCikan) || [];
        const sortedOneCikanOyunlar = oneCikanOyunlar.sort((a, b) => {
            const siralamaA = a.siralama || 999;
            const siralamaB = b.siralama || 999;
            return siralamaA - siralamaB;
        });
        
        console.log('Öne çıkan oyunlar (sıralı):', sortedOneCikanOyunlar);
        
        sortedOneCikanOyunlar.forEach(item => {
            // Find the original index to pass to handlers
            const originalIndex = siteContent.oyunlar.findIndex(o => o.id === item.id);
            console.log(`Oyun "${item.ad}" için originalIndex:`, originalIndex);
            if (originalIndex > -1) {
                const itemDiv = createDraggableListItem(item, originalIndex, 'oyun');
                oneCikanOyunlarList.appendChild(itemDiv);
            }
        });
        addDragAndDropListeners(oneCikanOyunlarList, 'oyun');
    };

    const renderEkip = () => {
        ekipList.innerHTML = '';
        siteContent.ekip?.forEach((item, index) => {
            const itemDiv = createDraggableListItem(item, index, 'ekip');
            ekipList.appendChild(itemDiv);
        });
        addDragAndDropListeners(ekipList, 'ekip');
    };

    const renderOyuncuHavuzu = () => {
        oyuncuHavuzuList.innerHTML = '';
        
        // Oyuncuları üçlü kategori sistemiyle sırala
        const sortedOyuncular = [...(siteContent.oyuncu_havuzu || [])].sort((a, b) => {
            const priorityA = getRolPriority(a);
            const priorityB = getRolPriority(b);
            
            // Önce önceliğe göre sırala
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // Aynı kategorideyse alfabetik sırala
            return a.ad.localeCompare(b.ad, 'tr');
        });
        
        sortedOyuncular.forEach((item, index) => {
            // Gerçek index'i bul (sıralanmış listede değil, orijinal listede)
            const originalIndex = siteContent.oyuncu_havuzu.findIndex(o => o.id === item.id);
            const itemDiv = createDraggableListItem(item, originalIndex, 'oyuncu');
            oyuncuHavuzuList.appendChild(itemDiv);
        });
        addDragAndDropListeners(oyuncuHavuzuList, 'oyuncu');
    };
    
    // Üçlü sıralama sistemi: Başkan > Yönetim Kurulu > Aktif Üyeler
    const getRolPriority = (item) => {
        const roller = item.roller || [item.tip]; // Çoklu rol veya eski tek rol sistemi
        
        // Başkan kontrolü (en yüksek öncelik)
        if (roller.includes('baskan')) {
            return 0; // Başkan
        }
        
        // Yönetim Kurulu kontrolü
        const yonetimRolleri = ['baskan_yardimcisi', 'sekreter', 'sayman', 'kurul_uyesi'];
        const hasYonetimRole = roller.some(rol => yonetimRolleri.includes(rol));
        if (hasYonetimRole) {
            // Yönetim kurulunda alt sıralama
            if (roller.includes('baskan_yardimcisi')) return 10;
            if (roller.includes('sekreter')) return 11;
            if (roller.includes('sayman')) return 12;
            if (roller.includes('kurul_uyesi')) return 13;
            return 14; // Diğer yönetim rolleri
        }
        
        // Aktif üye kontrolü
        const aktifRoller = ['yonetmen', 'yardimci_yonetmen', 'oyuncu', 'sahne_direktoru', 
                           'teknik_sorumlu', 'isik_ses', 'sahne_tasarim', 'kostum_makyaj',
                           'sosyal_medya', 'grafik_tasarim', 'web_sorumlu', 'fotografci', 'aktif_uye'];
        const hasAktifRole = roller.some(rol => aktifRoller.includes(rol));
        if (hasAktifRole) {
            return 20; // Aktif üyeler (kendi aralarında alfabetik sıralama)
        }
        
        // Genel üyeler
        return 30;
    };
    
    // Rol ikonu belirleme
    const getRolIcon = (tip) => {
        const icons = {
            // Yönetim Kurulu
            'baskan': '👑',
            'baskan_yardimcisi': '👑',
            'sekreter': '👑',
            'sayman': '👑',
            'kurul_uyesi': '👑',
            
            // Sanatsal Roller
            'yonetmen': '🎬',
            'yardimci_yonetmen': '🎬',
            'oyuncu': '🎭',
            
            // Teknik Ekip
            'sahne_direktoru': '⚙️',
            'teknik_sorumlu': '⚙️',
            'isik_ses': '🎚️',
            'sahne_tasarim': '🎨',
            'kostum_makyaj': '💄',
            
            // Medya & İletişim
            'sosyal_medya': '📱',
            'grafik_tasarim': '🎨',
            'web_sorumlu': '💻',
            'fotografci': '📸',
            
            // Diğer
            'uye': '👤',
            'aday': '👤',
            'teknik': '⚙️' // Eski tip için
        };
        
        return icons[tip] || '👤';
    };
    
    // Rol görünen adı belirleme
    const getRolDisplayName = (tip) => {
        const names = {
            // Yönetim Kurulu
            'baskan': 'Kulüp Başkanı',
            'baskan_yardimcisi': 'Başkan Yardımcısı',
            'sekreter': 'Sekreter',
            'sayman': 'Sayman',
            'kurul_uyesi': 'Kurul Üyesi',
            
            // Sanatsal Roller
            'yonetmen': 'Yönetmen',
            'yardimci_yonetmen': 'Yardımcı Yönetmen',
            'oyuncu': 'Oyuncu',
            
            // Teknik Ekip
            'sahne_direktoru': 'Sahne Direktörü',
            'teknik_sorumlu': 'Teknik Sorumlu',
            'isik_ses': 'Işık & Ses',
            'sahne_tasarim': 'Sahne Tasarımı',
            'kostum_makyaj': 'Kostüm & Makyaj',
            
            // Medya & İletişim
            'sosyal_medya': 'Sosyal Medya',
            'grafik_tasarim': 'Grafik Tasarım',
            'web_sorumlu': 'Web Sorumlusu',
            'fotografci': 'Fotoğrafçı',
            
            // Diğer
            'uye': 'Kulüp Üyesi',
            'aday': 'Üye Adayı',
            'teknik': 'Teknik Ekip' // Eski tip için
        };
        
        return names[tip] || 'Bilinmeyen Rol';
    };



    const createDraggableListItem = (item, index, type) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item draggable';
        itemDiv.dataset.index = index;
        itemDiv.dataset.id = item.id || `item_${index}`;
        itemDiv.draggable = true;

        let previewHtml = '';
        if (type === 'oyun' && item.afis) {
            previewHtml = `<img src="${item.afis}" class="list-item-preview" alt="Önizleme">`;
        } else if ((type === 'ekip' || type === 'oyuncu') && item.img) {
            previewHtml = `<img src="${item.img}" class="list-item-preview" alt="Önizleme">`;
        }


        const roleOrTitle = type === 'ekip' ? item.rol : (type === 'oyun' ? item.yazar : getRolDisplayName(getPrimaryRoleType(item.roller || [])));
        
        itemDiv.innerHTML = `
            <div class="list-item-content">
                 ${previewHtml}
                <div class="list-item-info">
                    <span class="list-item-title">${item.ad || 'İsimsiz'}</span>
                    <span class="list-item-subtitle">${roleOrTitle || ''}</span>
                </div>
            </div>
            <div class="list-item-actions">
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
                 <i class="fas fa-grip-vertical drag-handle"></i>
            </div>
        `;

        // BUTONLARA İŞLEVSELLİK EKLE
        const editBtn = itemDiv.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Sürüklemeyi tetiklemesin
                console.log('Edit butonuna tıklandı:', { type, index, item });
                


                handleOpenModal(type, index)
            });
        }
        
        const deleteBtn = itemDiv.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Sürüklemeyi tetiklemesin
                handleDeleteItem(type, index)
            });
        }


        return itemDiv;
    };

    // ----------------- EVENT HANDLERS -----------------
    const handleNavLinkClick = (e) => {
        const link = e.currentTarget;
        
        // External linkler için özel işlem
        if (link.classList.contains('external')) {
            // Mobil sidebar'ı kapat
            if (window.innerWidth <= 820 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
            
            // href varsa normal tıklama olayını devam ettir
            if (link.href) {
                return; // Browser normal link davranışını yapar
            }
            
            // Logout butonu özel case
            if (link.getAttribute('onclick')) {
                return; // onclick fonksiyonunu çalıştır
            }
            
            return;
        }
        
        // Normal internal navigation
        e.preventDefault();
        const targetId = link.getAttribute('data-target');

        if (window.innerWidth <= 820 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }

        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');

        contentSections.forEach(section => {
            section.style.display = (section.id === targetId) ? 'block' : 'none';
        });
    };
    
    const handleHeroFormSubmit = (e) => {
        e.preventDefault();
        siteContent.hero.title = heroTitleInput.value;
        siteContent.hero.subtitle = heroSubtitleInput.value;
        saveContent();
    };

    const handleHakkimizdaFormSubmit = (e) => {
        e.preventDefault();
        siteContent.hakkimizda.text = hakkimizdaTextInput.value;
        saveContent();
    };

    const handleIletisimFormSubmit = (e) => {
        e.preventDefault();
        siteContent.iletisim.instagram = iletisimInstagramInput.value;
        siteContent.iletisim.twitter = iletisimTwitterInput.value;
        siteContent.iletisim.youtube = iletisimYoutubeInput.value;
        siteContent.iletisim.adres = iletisimAdresInput.value;
        siteContent.iletisim.email = iletisimEmailInput.value;
        saveContent();
    };

    const handleModalFormSubmit = async (e) => {
        e.preventDefault();
        const { type, index } = currentEdit;
        
        // Arşiv özel durumları
        if (type === 'sezon-basic') {
            await handleSeasonBasicSubmit();
            return;
        } else if (type === 'sezon-detail') {
            await handleSeasonContentSubmit();
            return;
        }
        
        const arrayKey = getArrayKeyFromType(type);
        if (!arrayKey) return;

        let itemData = (index > -1) ? { ...siteContent[arrayKey][index] } : {};

        // Formdaki tüm inputları/textarea'ları/select'leri işle
        const inputs = modalFields.querySelectorAll('input, textarea, select');
        for (const input of inputs) {
            // ID'den field adını çıkar ve özel durumları ele al
            let key = input.id.split('-').pop();
            
            // Özel field mapping'leri
            if (input.id === 'modal-tur') key = 'tur';
            if (input.id === 'oyuncu-ad') key = 'ad';
            if (input.id === 'oyuncu-telefon') key = 'telefon';
            if (input.id === 'oyuncu-email') key = 'email';
            if (input.id === 'oyuncu-sinif') key = 'sinif';
            if (input.id === 'oyuncu-bolum') key = 'bolum';
            if (input.id === 'oyuncu-durum') key = 'durum';
            if (input.id === 'oyuncu-katilim') key = 'katilim_tarihi';
            if (input.id === 'oyuncu-ozellikler') key = 'ozellikler';
            if (input.id === 'oyuncu-img') key = 'img';
            
            if (input.type === 'checkbox') {
                if (input.value && ['baskan', 'baskan_yardimcisi', 'sekreter', 'sayman', 'kurul_uyesi', 
                    'yonetmen', 'yardimci_yonetmen', 'oyuncu', 'sahne_direktoru', 'teknik_sorumlu', 
                    'isik_ses', 'sahne_tasarim', 'kostum_makyaj', 'sosyal_medya', 'grafik_tasarim', 
                    'web_sorumlu', 'fotografci', 'aktif_uye', 'uye', 'aday'].includes(input.value)) {
                    // Rol checkbox'ları
                    if (input.checked) {
                        if (!itemData.roller) itemData.roller = [];
                        if (!itemData.roller.includes(input.value)) {
                            itemData.roller.push(input.value);
                        }
                    } else {
                        if (itemData.roller) {
                            itemData.roller = itemData.roller.filter(r => r !== input.value);
                        }
                    }
                } else {
                    // Diğer checkbox'lar
                    itemData[key] = input.checked;
                }
            } else if (input.type === 'file') {
                if (input.files && input.files[0]) {
                    const uploadedPath = await uploadImage(input.files[0]);
                    if (uploadedPath) {
                        itemData[key] = uploadedPath;
                        console.log(`Fotoğraf yüklendi: ${key} = ${uploadedPath}`);
                    }
                }
            } else if (input.tagName.toLowerCase() === 'select' && input.multiple) {
                 itemData[key] = Array.from(input.selectedOptions).map(option => option.value);
            } else {
                // Özellikler için özel işlem
                if (key === 'ozellikler') {
                    itemData[key] = input.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                } else {
                    itemData[key] = input.value;
                }
            }
        }
        
        // Oyuncu kadrosunu işle
        if (type === 'oyun') {
            itemData.oyuncular = [];
            const oyuncuRows = modalFields.querySelectorAll('.oyuncu-row');
            oyuncuRows.forEach(row => {
                const oyuncuAdi = row.querySelector('[data-field="oyuncu-ad"]').value;
                const karakter = row.querySelector('[data-field="karakter"]').value;
                if (oyuncuAdi) { // Sadece oyuncu adının olması yeterli
                    itemData.oyuncular.push({ ad: oyuncuAdi, karakter: karakter || '' }); // Karakter boşsa boş string olarak kaydet
                }
            });
        }

        // ID'si yoksa yeni bir ID oluştur
        if (!itemData.id) {
            itemData.id = `item_${Date.now()}`;
        }

        if (index > -1) {
            siteContent[arrayKey][index] = itemData;
        } else {
            siteContent[arrayKey].push(itemData);
        }

        // Çift yönlü senkronizasyon
        if (type === 'ekip') {
            syncEkipToOyuncuHavuzu(itemData);
        } else if (type === 'oyuncu') {
            syncOyuncuHavuzuToEkip(itemData);
        }

        await saveContent();
        closeModal();
    };

    const handleDeleteItem = (type, index) => {
        const arrayKey = getArrayKeyFromType(type);
        if (!siteContent[arrayKey] || !siteContent[arrayKey][index]) return;

        const itemName = siteContent[arrayKey][index].ad || siteContent[arrayKey][index].sezon || 'Öğe';
        
        if (confirm(`'${itemName}' adlı öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            const itemToDelete = siteContent[arrayKey][index];
            
            siteContent[arrayKey].splice(index, 1);
            
            // Çift yönlü senkronizasyon
            if (type === 'ekip') {
                syncEkipToOyuncuHavuzu(itemToDelete, true); // isDelete = true
            } else if (type === 'oyuncu') {
                syncOyuncuHavuzuToEkip(itemToDelete, true); // isDelete = true
            }
            
            saveContent();
        }
    };
    


    const handleOpenModal = (type, index) => {
        currentEdit = {
            type: type,
            // index, yeni oluşturma sırasında tanımsız olabilir, -1'e ayarlayın
            index: index !== undefined ? index : -1
        };
    
        // Arka plan kaydırmasını engellemek için body'e sınıf ekle
        document.body.classList.add('modal-open');

        // Mevcut öğeyi veya yeni bir boş nesne al
        const arrayKey = getArrayKeyFromType(type);
        const isNew = currentEdit.index === -1;
        const item = isNew ? {} : siteContent[arrayKey]?.[currentEdit.index];
        
        modalTitle.textContent = `${isNew ? 'Yeni Ekle' : 'Düzenle'}: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        modalFields.innerHTML = ''; // Formu temizle

        // Dinamik form oluşturma
        switch (type) {
            case 'oyun':
                const oyuncuKadroHtml = (item.oyuncular || []).map((oyuncu, index) => {
                    return `
                        <div class="oyuncu-row" data-index="${index}">
                            <select data-field="oyuncu-ad">
                                <option value="">Havuzdan Seç</option>
                                ${siteContent.oyuncu_havuzu?.map(p => `<option value="${p.ad}" ${p.ad === oyuncu.ad ? 'selected' : ''}>${p.ad}</option>`).join('')}
                            </select>
                            <input type="text" data-field="karakter" placeholder="Karakter Adı" value="${oyuncu.karakter || ''}">
                            <button type="button" class="remove-oyuncu-btn">Sil</button>
                        </div>
                    `;
                }).join('');

                modalFields.innerHTML = `
                    <label for="modal-ad">Oyun Adı:</label>
                    <input type="text" id="modal-ad" value="${item.ad || ''}" required>
                     <label for="modal-tur">Tür:</label>
                    <select id="modal-tur">
                        <option value="Ana Sahne" ${item.tur === 'Ana Sahne' ? 'selected' : ''}>Ana Sahne Oyunu</option>
                        <option value="Oda Tiyatrosu" ${item.tur === 'Oda Tiyatrosu' ? 'selected' : ''}>Oda Tiyatrosu</option>
                        <option value="Dış Oyun" ${item.tur === 'Dış Oyun' ? 'selected' : ''}>Dış Oyun</option>
                    </select>
                    <label for="modal-yonetmen">Yönetmen:</label>
                    <input type="text" id="modal-yonetmen" value="${item.yonetmen || ''}">
                    <label for="modal-yazar">Yazar:</label>
                    <input type="text" id="modal-yazar" value="${item.yazar || ''}">
                    <label for="modal-aciklama">Açıklama:</label>
                    <textarea id="modal-aciklama" rows="4">${item.aciklama || ''}</textarea>
                    <label for="modal-tarih">Tarih:</label>
                    <input type="date" id="modal-tarih" value="${item.tarih || ''}">
                    <label for="modal-saat">Saat:</label>
                    <input type="time" id="modal-saat" value="${item.saat || ''}">
                    <label for="modal-konum">Konum:</label>
                    <input type="text" id="modal-konum" value="${item.konum || ''}" placeholder="Örn: Koç Üniversitesi Sevgi Gönül Oditoryumu">
                     <label for="modal-bilet">Bilet Linki:</label>
                    <input type="url" id="modal-bilet" value="${item.bilet || ''}" placeholder="https://bilet.ix/link">
                    <label for="modal-afis">Afiş:</label>
                    <input type="file" id="modal-afis" accept="image/*">
                    ${item.afis ? `<img src="${item.afis}" alt="Mevcut Afiş" style="max-width: 100px; margin-top: 10px;">` : ''}
                    <label for="modal-siralama">Sıralama (küçük sayı önce gelir):</label>
                    <input type="number" id="modal-siralama" value="${item.siralama || 1}" min="1" max="999" required>
                    <div class="checkbox-container">
                        <input type="checkbox" id="modal-oneCikan" ${item.oneCikan ? 'checked' : ''}>
                        <label for="modal-oneCikan">Ana Sayfada Öne Çıkar</label>
                    </div>

                    <div class="oyuncu-kadrosu-yonetim">
                        <h4>Oyuncu Kadrosu</h4>
                        <div id="oyuncu-kadrosu-list">
                            ${oyuncuKadroHtml}
                        </div>
                        <button type="button" id="add-oyuncu-row-btn">Oyuncu Ekle</button>
                    </div>
                    <label for="modal-sezon">Sezon:</label>
                    <select id="modal-sezon">
                      <option value="2022-2023">2022-2023</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2024-2025">2024-2025</option>
                    </select>
                `;

                // Add event listeners for dynamic cast rows
                const addBtn = document.getElementById('add-oyuncu-row-btn');
                if (addBtn) {
                    addBtn.addEventListener('click', addOyuncuRow);
                }
                
                modalFields.querySelectorAll('.remove-oyuncu-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        removeOyuncuRow(e.target);
                    });
                });

                break;
            case 'ekip':
                // Find the corresponding player data from the pool, or create an empty object
                const oyuncuData = siteContent.oyuncu_havuzu?.find(p => p.ad === item.ad) || {};

                modalFields.innerHTML = `
                    <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #0066cc;">
                        <h4 style="margin: 0 0 10px 0; color: #0066cc;">💡 Yönetim Kurulu & Oyuncu Havuzu Bağlantılıdır</h4>
                        <p style="margin: 0; color: #333; font-size: 14px;">Yönetim kurulu üyeleri otomatik olarak oyuncu havuzunda da yer alır. Burada yapılan değişiklikler (isim hariç) oyuncu havuzundaki profilini de günceller.</p>
                    </div>
                    
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;">👥 Yönetim Kurulu Bilgileri</h3>
                    <label for="modal-ad">Ad Soyad:</label>
                    <input type="text" id="modal-ad" value="${item.ad || ''}" required>
                    
                    <label for="modal-rol">Görev/Rol:</label>
                    <input type="text" id="modal-rol" value="${item.rol || ''}" required> 
                    
                    <h3 style="color: var(--primary-color); margin: 25px 0 15px 0;">🎭 Oyuncu Havuzu Bilgileri</h3>
                    
                    <label for="modal-email">E-mail:</label>
                    <input type="email" id="modal-email" value="${item.email || oyuncuData.email || ''}">
                    
                    <label for="modal-telefon">Telefon:</label>
                    <input type="tel" id="modal-telefon" value="${oyuncuData.telefon || ''}">
                    
                    <label for="modal-sinif">Sınıf:</label>
                    <select id="modal-sinif">
                        <option value="">Seçiniz...</option>
                        <option value="1. Sınıf" ${oyuncuData.sinif === '1. Sınıf' ? 'selected' : ''}>1. Sınıf</option>
                        <option value="2. Sınıf" ${oyuncuData.sinif === '2. Sınıf' ? 'selected' : ''}>2. Sınıf</option>
                        <option value="3. Sınıf" ${oyuncuData.sinif === '3. Sınıf' ? 'selected' : ''}>3. Sınıf</option>
                        <option value="4. Sınıf" ${oyuncuData.sinif === '4. Sınıf' ? 'selected' : ''}>4. Sınıf</option>
                        <option value="Yüksek Lisans" ${oyuncuData.sinif === 'Yüksek Lisans' ? 'selected' : ''}>Yüksek Lisans</option>
                        <option value="Doktora" ${oyuncuData.sinif === 'Doktora' ? 'selected' : ''}>Doktora</option>
                        <option value="Mezun" ${oyuncuData.sinif === 'Mezun' ? 'selected' : ''}>Mezun</option>
                            </select>
                    
                    <label for="modal-bolum">Bölüm:</label>
                    <input type="text" id="modal-bolum" value="${oyuncuData.bolum || ''}">
                    
                    <label for="modal-img">Fotoğraf:</label>
                    <input type="file" id="modal-img" accept="image/*">
                    ${item.img ? `<img src="${item.img}" alt="Mevcut Fotoğraf" style="max-width: 100px; margin-top: 10px;">` : ''}
                `;
                break;
            case 'oyuncu':
            const previewSrc = item.img && item.img !== 'assets/1751453697640-organizator-1881-logo-F1F415.png' ? item.img : '';
                modalFields.innerHTML = `
                <label for="oyuncu-ad">Ad Soyad:</label>
                <input type="text" id="oyuncu-ad" value="${item.ad || ''}" required>
                
                <label for="oyuncu-telefon">Telefon:</label>
                <input type="tel" id="oyuncu-telefon" value="${item.telefon || ''}">
                
                <label for="oyuncu-email">E-mail:</label>
                <input type="email" id="oyuncu-email" value="${item.email || ''}">
                
                <label for="oyuncu-sinif">Sınıf:</label>
                <select id="oyuncu-sinif">
                    <option value="1. Sınıf" ${item.sinif === '1. Sınıf' ? 'selected' : ''}>1. Sınıf</option>
                    <option value="2. Sınıf" ${item.sinif === '2. Sınıf' ? 'selected' : ''}>2. Sınıf</option>
                    <option value="3. Sınıf" ${item.sinif === '3. Sınıf' ? 'selected' : ''}>3. Sınıf</option>
                    <option value="4. Sınıf" ${item.sinif === '4. Sınıf' ? 'selected' : ''}>4. Sınıf</option>
                    <option value="Yüksek Lisans" ${item.sinif === 'Yüksek Lisans' ? 'selected' : ''}>Yüksek Lisans</option>
                    <option value="Doktora" ${item.sinif === 'Doktora' ? 'selected' : ''}>Doktora</option>
                    <option value="Mezun" ${item.sinif === 'Mezun' ? 'selected' : ''}>Mezun</option>
                </select>
                
                <label for="oyuncu-bolum">Bölüm:</label>
                <input type="text" id="oyuncu-bolum" value="${item.bolum || ''}">
                
                <label for="oyuncu-durum">Durum:</label>
                <select id="oyuncu-durum" required>
                    <option value="aktif" ${item.durum === 'aktif' ? 'selected' : ''}>Aktif</option>
                    <option value="pasif" ${item.durum === 'pasif' ? 'selected' : ''}>Pasif</option>
                    <option value="mezun" ${item.durum === 'mezun' ? 'selected' : ''}>Mezun</option>
                </select>
                
                <label for="oyuncu-roller">Roller (Çoklu seçim yapabilirsiniz):</label>
                <div id="oyuncu-roller-container" style="border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: #f9f9f9; max-height: 300px; overflow-y: auto;">
                    <div style="margin-bottom: 10px; font-weight: bold; color: #8B4513;">🏛️ Yönetim Kurulu</div>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="baskan" ${(item.roller || []).includes('baskan') ? 'checked' : ''}> 👑 Kulüp Başkanı</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="baskan_yardimcisi" ${(item.roller || []).includes('baskan_yardimcisi') ? 'checked' : ''}> 👑 Başkan Yardımcısı</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="sekreter" ${(item.roller || []).includes('sekreter') ? 'checked' : ''}> 👑 Sekreter</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="sayman" ${(item.roller || []).includes('sayman') ? 'checked' : ''}> 👑 Sayman</label>
                    <label style="display: block; margin-bottom: 15px;"><input type="checkbox" value="kurul_uyesi" ${(item.roller || []).includes('kurul_uyesi') ? 'checked' : ''}> 👑 Kurul Üyesi</label>
                    
                    <div style="margin-bottom: 10px; font-weight: bold; color: #8B4513;">🎭 Sanatsal Roller</div>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="yonetmen" ${(item.roller || []).includes('yonetmen') ? 'checked' : ''}> 🎬 Yönetmen</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="yardimci_yonetmen" ${(item.roller || []).includes('yardimci_yonetmen') ? 'checked' : ''}> 🎬 Yardımcı Yönetmen</label>
                    <label style="display: block; margin-bottom: 15px;"><input type="checkbox" value="oyuncu" ${(item.roller || []).includes('oyuncu') ? 'checked' : ''}> 🎭 Oyuncu</label>
                    
                    <div style="margin-bottom: 10px; font-weight: bold; color: #8B4513;">⚙️ Teknik Ekip</div>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="sahne_direktoru" ${(item.roller || []).includes('sahne_direktoru') ? 'checked' : ''}> ⚙️ Sahne Direktörü</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="teknik_sorumlu" ${(item.roller || []).includes('teknik_sorumlu') ? 'checked' : ''}> ⚙️ Teknik Sorumlu</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="isik_ses" ${(item.roller || []).includes('isik_ses') ? 'checked' : ''}> 🎚️ Işık & Ses</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="sahne_tasarim" ${(item.roller || []).includes('sahne_tasarim') ? 'checked' : ''}> 🎨 Sahne Tasarımı</label>
                    <label style="display: block; margin-bottom: 15px;"><input type="checkbox" value="kostum_makyaj" ${(item.roller || []).includes('kostum_makyaj') ? 'checked' : ''}> 💄 Kostüm & Makyaj</label>
                    
                    <div style="margin-bottom: 10px; font-weight: bold; color: #8B4513;">📢 Medya & İletişim</div>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="sosyal_medya" ${(item.roller || []).includes('sosyal_medya') ? 'checked' : ''}> 📱 Sosyal Medya</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="grafik_tasarim" ${(item.roller || []).includes('grafik_tasarim') ? 'checked' : ''}> 🎨 Grafik Tasarım</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="web_sorumlu" ${(item.roller || []).includes('web_sorumlu') ? 'checked' : ''}> 💻 Web Sorumlusu</label>
                    <label style="display: block; margin-bottom: 15px;"><input type="checkbox" value="fotografci" ${(item.roller || []).includes('fotografci') ? 'checked' : ''}> 📸 Fotoğrafçı</label>
                    
                    <div style="margin-bottom: 10px; font-weight: bold; color: #8B4513;">🎪 Genel Üyelik</div>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="aktif_uye" ${(item.roller || []).includes('aktif_uye') ? 'checked' : ''}> 🎭 Aktif Üye</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="uye" ${(item.roller || []).includes('uye') ? 'checked' : ''}> 👤 Kulüp Üyesi</label>
                    <label style="display: block; margin-bottom: 5px;"><input type="checkbox" value="aday" ${(item.roller || []).includes('aday') ? 'checked' : ''}> 👤 Üye Adayı</label>
                </div>
                
                <label for="oyuncu-katilim">Katılım Tarihi:</label>
                <input type="date" id="oyuncu-katilim" value="${item.katilim_tarihi || ''}">
                
                <label for="oyuncu-ozellikler">Özellikler (virgülle ayırın):</label>
                <input type="text" id="oyuncu-ozellikler" value="${(item.ozellikler || []).join(', ')}" placeholder="Sahne deneyimi, Shakespeare, Dram">
                
                <label for="oyuncu-img">Fotoğraf Yükle:</label>
                <input type="file" id="oyuncu-img" accept="image/*">
                <div id="modal-preview-container">
                    ${previewSrc ? `<p>Mevcut Foto:</p><img src="${previewSrc}" alt="Mevcut fotoğraf">` : ''}
                </div>
            `;
                break;
        }
        modal.style.display = 'flex';
    };

    const addOyuncuRow = () => {
        const list = document.getElementById('oyuncu-kadrosu-list');
        if (!list) return;
        
        const newIndex = list.children.length;
        const row = document.createElement('div');
        row.className = 'oyuncu-row';
        row.dataset.index = newIndex;
        row.innerHTML = `
            <select data-field="oyuncu-ad">
                <option value="">Havuzdan Seç</option>
                ${siteContent.oyuncu_havuzu?.map(p => `<option value="${p.ad}">${p.ad}</option>`).join('')}
                </select>
            <input type="text" data-field="karakter" placeholder="Karakter Adı">
            <button type="button" class="remove-oyuncu-btn">Sil</button>
        `;
        
        const removeBtn = row.querySelector('.remove-oyuncu-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => removeOyuncuRow(removeBtn));
        }
        
        list.appendChild(row);
    };

    const removeOyuncuRow = (button) => {
        button.closest('.oyuncu-row').remove();
    };

    const closeModal = () => {
        modal.style.display = 'none';
        modalFields.innerHTML = '';
        // Arka plan kaydırmasını tekrar etkinleştirmek için sınıfı kaldır
        document.body.classList.remove('modal-open');
    };

    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        hamburgerBtn.classList.toggle('active');
    };

    // ----------------- DRAG AND DROP -----------------
    let draggedItem = null;
    const addDragAndDropListeners = (list, type) => {
        let draggedItem = null;

        list.addEventListener('dragstart', e => {
            if (e.target.classList.contains('draggable')) {
                draggedItem = e.target;
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            }
        });

        list.addEventListener('dragend', e => {
            if (draggedItem) {
                setTimeout(() => {
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                }, 0);
            }
        });

        list.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
            }
        });

        list.addEventListener('drop', async e => {
            e.preventDefault();
            if (draggedItem) {
                 updateOrder(list, type);
            }
        });
    };

    const getDragAfterElement = (container, y) => {
        const draggableElements = [...container.querySelectorAll('.list-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };

    const updateOrder = (list, type) => {
        const arrayKey = getArrayKeyFromType(type);
        if (!siteContent[arrayKey]) return;

        const newOrderedIds = Array.from(list.querySelectorAll('.list-item')).map(item => item.dataset.id);
        
        console.log('Yeni sıralama:', newOrderedIds);

        if (arrayKey === 'oyunlar') {
            if (list.id === 'one-cikan-oyunlar-list') {
                // Öne çıkan oyunlar sürüklendiğinde, sadece öne çıkanların sıralamasını güncelle
                newOrderedIds.forEach((id, index) => {
                    const oyun = siteContent.oyunlar.find(item => item.id == id);
                    if (oyun && oyun.oneCikan) {
                        oyun.siralama = index + 1; // 1'den başlayarak sıralama
                        console.log(`Öne çıkan oyun ${oyun.ad} yeni sıralaması: ${oyun.siralama}`);
                    }
                });
            } else {
                // Tüm oyunlar sürüklendiğinde, tüm oyunların sıralamasını güncelle
                newOrderedIds.forEach((id, index) => {
                    const oyun = siteContent.oyunlar.find(item => item.id == id);
                    if (oyun) {
                        oyun.siralama = index + 1; // 1'den başlayarak sıralama
                        console.log(`Oyun ${oyun.ad} yeni sıralaması: ${oyun.siralama}`);
                    }
                });
            }
        } else {
            // Diğer listeler için (ekip, oyuncu havuzu) - mevcut sistem
            const newArray = newOrderedIds.map(id =>
                siteContent[arrayKey].find(item => item.id === id || item.id == id)
            ).filter(Boolean);

            if (newArray.length === siteContent[arrayKey].length) {
                siteContent[arrayKey] = newArray;
            } else {
                showNotification('Sıralama sırasında bir hata oluştu.', 'error');
                return;
            }
        }

        // Drag & drop için minimal feedback
        clearTimeout(window.dragNotificationTimeout);
        
        saveContent().then(() => {
            // Değişiklikten sonra oyun listelerini yeniden render et
            if (arrayKey === 'oyunlar') {
                renderOyunlar();
                renderOneCikanOyunlar();
            } else if (arrayKey === 'ekip') {
                renderEkip();
            } else if (arrayKey === 'oyuncu_havuzu') {
                renderOyuncuHavuzu();
            }
            
            // Küçük visual feedback - sadece son drag işleminden sonra
            window.dragNotificationTimeout = setTimeout(() => {
                showMiniCheck();
            }, 200);
            
        }).catch(error => {
            console.error('Sıralama kaydedilemedi:', error);
            showMiniError();
        });
    };

    // ----------------- HELPERS -----------------
    const getArrayKeyFromType = (type) => {
        if (type === 'oyun') return 'oyunlar';
        if (type === 'ekip') return 'ekip';
        if (type === 'oyuncu') return 'oyuncu_havuzu';
        if (type === 'arsiv') return 'arsiv';
        return null;
    };
    
    // Çoklu rollerden en önemli/ana rolü belirleme
    const getPrimaryRoleType = (roller) => {
        if (!roller || roller.length === 0) return 'uye';
        
        // Öncelik sırası: Başkan > Yönetim Kurulu > Sanatsal > Teknik > Medya > Üye
        const priorityOrder = [
            'baskan', 'baskan_yardimcisi', 'sekreter', 'sayman', 'kurul_uyesi',
            'yonetmen', 'yardimci_yonetmen', 'oyuncu',
            'sahne_direktoru', 'teknik_sorumlu', 'isik_ses', 'sahne_tasarim', 'kostum_makyaj',
            'sosyal_medya', 'grafik_tasarim', 'web_sorumlu', 'fotografci',
            'aktif_uye', 'uye', 'aday'
        ];
        
        for (const priority of priorityOrder) {
            if (roller.includes(priority)) {
                return priority;
            }
        }
        
        return roller[0] || 'uye';
    };
    
    // Yönetim kurulu görevinden oyuncu havuzu tipini belirle
    const determinePlayerType = (rol) => {
        if (!rol) return 'uye';
        
        const rolLower = rol.toLowerCase();
        
        // Yönetim kurulu rolleri
        if (rolLower.includes('başkan') && !rolLower.includes('yardımcı')) {
            return 'baskan';
        } else if (rolLower.includes('başkan') && rolLower.includes('yardımcı')) {
            return 'baskan_yardimcisi';
        } else if (rolLower.includes('sekreter')) {
            return 'sekreter';
        } else if (rolLower.includes('sayman')) {
            return 'sayman';
        } else if (rolLower.includes('kurul') || rolLower.includes('üye')) {
            return 'kurul_uyesi';
        }
        
        // Sanatsal roller
        else if (rolLower.includes('yönetmen')) {
            return 'yonetmen';
        }
        
        // Teknik roller
        else if (rolLower.includes('teknik') || rolLower.includes('sorumlu') || rolLower.includes('direktör')) {
            return 'teknik_sorumlu';
        }
        
        // Varsayılan
        return 'kurul_uyesi';
    };
    
    // Ekip üyesi ve oyuncu havuzu senkronizasyonu
    const syncEkipToOyuncuHavuzu = (ekipUyesi, isDelete = false) => {
        if (!siteContent.oyuncu_havuzu) {
            siteContent.oyuncu_havuzu = [];
        }
        
        // İsim bazlı arama (ID'ler tutarsız olduğu için)
        const existingIndex = siteContent.oyuncu_havuzu.findIndex(oyuncu => 
            oyuncu.ad && ekipUyesi.ad && oyuncu.ad.trim().toLowerCase() === ekipUyesi.ad.trim().toLowerCase()
        );
        
        if (isDelete) {
            // Ekip üyesi silindiğinde oyuncu havuzundan da sil
            if (existingIndex !== -1) {
                siteContent.oyuncu_havuzu.splice(existingIndex, 1);
                console.log(`Oyuncu havuzundan silindi: ${ekipUyesi.ad}`);
            }
        } else {
            // Ekip üyesi eklendiğinde/güncellendiğinde oyuncu havuzunu senkronize et
            
            const oyuncuData = {
                id: existingIndex !== -1 ? 
                    siteContent.oyuncu_havuzu[existingIndex].id : // Mevcut ID'yi koru
                    Date.now(), // Yeni benzersiz ID oluştur
                ad: ekipUyesi.ad,
                img: ekipUyesi.img || 'assets/1751453697640-organizator-1881-logo-F1F415.png',
                telefon: ekipUyesi.telefon || '',
                email: ekipUyesi.email || '',
                sinif: ekipUyesi.sinif || 'Belirtilmemiş',
                bolum: ekipUyesi.bolum || 'Belirtilmemiş',
                ozellikler: ekipUyesi.ozellikler || [ekipUyesi.rol],
                katilim_tarihi: ekipUyesi.katilim_tarihi || new Date().toISOString().split('T')[0],
                durum: 'aktif',
                roller: [determinePlayerType(ekipUyesi.rol)], // Çoklu rol sistemi
                kurul_uyesi: true, // Yönetim kurulu üyesi olduğunu belirtmek için
                sezon: ekipUyesi.sezon || '2024-2025'
            };
            
            if (existingIndex !== -1) {
                // Mevcut oyuncuyu güncelle - mevcut roller ve tip bilgilerini koru
                const existingOyuncu = siteContent.oyuncu_havuzu[existingIndex];
                
                // Rolleri birleştir (ekip rolü + mevcut roller)
                const yeniRol = determinePlayerType(ekipUyesi.rol);
                const mevcutRoller = existingOyuncu.roller || [];
                if (!mevcutRoller.includes(yeniRol)) {
                    mevcutRoller.push(yeniRol);
                }
                oyuncuData.roller = mevcutRoller;
                
                // Tip'i güncelle (en yüksek rol)
                oyuncuData.tip = getPrimaryRoleType(oyuncuData.roller);
                
                // Diğer alanları güncelle
                siteContent.oyuncu_havuzu[existingIndex] = {
                    ...existingOyuncu, // Mevcut verileri koru
                    ...oyuncuData, // Yeni verilerle güncelle
                    id: existingOyuncu.id // ID'yi kesinlikle koru
                };
                
                console.log(`Oyuncu havuzunda güncellendi: ${ekipUyesi.ad}, yeni img: ${ekipUyesi.img}`);
            } else {
                // Yeni oyuncu ekle
                oyuncuData.tip = determinePlayerType(ekipUyesi.rol);
                siteContent.oyuncu_havuzu.push(oyuncuData);
                console.log(`Oyuncu havuzuna eklendi: ${ekipUyesi.ad}`);
            }
        }
    };

    // Oyuncu havuzundan ekibe senkronizasyon (tersine senkronizasyon)
    const syncOyuncuHavuzuToEkip = (oyuncu, isDelete = false) => {
        if (!siteContent.ekip) {
            siteContent.ekip = [];
        }
        
        // İsim bazlı arama
        const existingIndex = siteContent.ekip.findIndex(ekipUyesi => 
            ekipUyesi.ad && oyuncu.ad && ekipUyesi.ad.trim().toLowerCase() === oyuncu.ad.trim().toLowerCase()
        );
        
        if (isDelete) {
            // Oyuncu silindiğinde ekipten de sil (sadece kurul üyesiyse)
            if (existingIndex !== -1 && oyuncu.kurul_uyesi) {
                siteContent.ekip.splice(existingIndex, 1);
                console.log(`Ekipten silindi: ${oyuncu.ad}`);
            }
        } else {
            // Oyuncu güncellendiğinde ekibi de güncelle (sadece kurul üyesiyse)
            if (oyuncu.kurul_uyesi && existingIndex !== -1) {
                const existingEkipUyesi = siteContent.ekip[existingIndex];
                
                // Fotoğraf ve diğer bilgileri güncelle ama rol bilgisini koru
                const updatedEkipUyesi = {
                    ...existingEkipUyesi, // Mevcut verileri koru (özellikle rol)
                    ad: oyuncu.ad,
                    img: oyuncu.img || existingEkipUyesi.img || 'assets/1751453697640-organizator-1881-logo-F1F415.png',
                    telefon: oyuncu.telefon || existingEkipUyesi.telefon || '',
                    email: oyuncu.email || existingEkipUyesi.email || '',
                    sinif: oyuncu.sinif || existingEkipUyesi.sinif || '',
                    bolum: oyuncu.bolum || existingEkipUyesi.bolum || '',
                    sezon: oyuncu.sezon || existingEkipUyesi.sezon || '2024-2025'
                };
                
                siteContent.ekip[existingIndex] = updatedEkipUyesi;
                console.log(`Ekipte güncellendi: ${oyuncu.ad}, yeni img: ${oyuncu.img}`);
            }
        }
    };
    
    const getDurumText = (durum) => {
        const durumlar = {
            'yaklasiyor': 'Yaklaşan',
            'oynaniyor': 'Sahnede',
            'bitmis': 'Tamamlandı'
        };
        return durumlar[durum] || durum || 'Durum belirtilmemiş';
    };

    // ----------------- UTILITIES -----------------
    const showNotification = (message, type = 'success', duration = 3000) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, duration);
    };

    // Mini feedback fonksiyonları - üst üste binmeyen
    const showMiniCheck = () => {
        // Mevcut mini feedback varsa kaldır
        const existing = document.querySelector('.mini-feedback');
        if (existing) existing.remove();
        
        const miniCheck = document.createElement('div');
        miniCheck.className = 'mini-feedback success';
        miniCheck.innerHTML = '✓';
        miniCheck.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            z-index: 10001;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(miniCheck);
        
        // Animasyon
        setTimeout(() => {
            miniCheck.style.opacity = '1';
            miniCheck.style.transform = 'scale(1)';
        }, 10);
        
        // Kaldır
        setTimeout(() => {
            miniCheck.style.opacity = '0';
            miniCheck.style.transform = 'scale(0.5)';
            setTimeout(() => miniCheck.remove(), 300);
        }, 1000);
    };

    const showMiniError = () => {
        // Mevcut mini feedback varsa kaldır
        const existing = document.querySelector('.mini-feedback');
        if (existing) existing.remove();
        
        const miniError = document.createElement('div');
        miniError.className = 'mini-feedback error';
        miniError.innerHTML = '✕';
        miniError.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            z-index: 10001;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(miniError);
        
        // Animasyon
        setTimeout(() => {
            miniError.style.opacity = '1';
            miniError.style.transform = 'scale(1)';
        }, 10);
        
        // Kaldır
        setTimeout(() => {
            miniError.style.opacity = '0';
            miniError.style.transform = 'scale(0.5)';
            setTimeout(() => miniError.remove(), 300);
        }, 1500);
    };

    // ----------------- EVENT LISTENERS SETUP -----------------
    heroForm.addEventListener('submit', handleHeroFormSubmit);
    hakkimizdaForm.addEventListener('submit', handleHakkimizdaFormSubmit);
    iletisimForm.addEventListener('submit', handleIletisimFormSubmit);
    modalForm.addEventListener('submit', handleModalFormSubmit);

    addOyunBtn.addEventListener('click', () => handleOpenModal('oyun', -1));
    addEkipBtn.addEventListener('click', () => handleOpenModal('ekip', -1));
    addOyuncuBtn.addEventListener('click', () => handleOpenModal('oyuncu', -1));
    addSezonBtn.addEventListener('click', () => handleAddSezon());

    navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));
    
    hamburgerBtn.addEventListener('click', toggleSidebar);
    
    // Mobil kapatma butonu için daha güvenli seçici
    const mobileCloseBtn = document.querySelector('.close-sidebar');
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', toggleSidebar);
    }
    
    mainContent.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Modal kapatma butonları için daha güvenli event listener
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', (e) => {
            console.log('Modal kapatma butonuna tıklandı');
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
        
        // Touch events için de ekle
        modalCloseBtn.addEventListener('touchend', (e) => {
            console.log('Modal kapatma butonuna dokunuldu');
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }
    
    // Modal dışına tıklayarak kapatma
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // ----------------- INITIALIZATION -----------------
    fetchContent();
    
    // === ARŞİV YÖNETİMİ FONKSİYONLARI ===
    const renderArsiv = () => {
        if (!arsivList) return;
        
        arsivList.innerHTML = '';
        
        // İstatistikleri güncelle
        updateArsivStats();
        
        if (!siteContent.arsiv || siteContent.arsiv.length === 0) {
            arsivList.innerHTML = '<div class="empty-message">Henüz arşivlenmiş sezon yok. Yeni sezon ekleyerek başlayın!</div>';
            return;
        }

        // Sezonları tarih sırasına göre sırala (en yeni önce)
        const sortedSeasons = [...siteContent.arsiv].sort((a, b) => {
            const yearA = extractYearFromSeason(a.sezon);
            const yearB = extractYearFromSeason(b.sezon);
            return parseInt(yearB) - parseInt(yearA);
        });

        sortedSeasons.forEach((sezon, index) => {
            const seasonCard = createSeasonCard(sezon, index);
            arsivList.appendChild(seasonCard);
        });
    };

    const updateArsivStats = () => {
        if (!siteContent.arsiv) {
            updateStatElement(totalSeasonsEl, 0);
            updateStatElement(totalContentsEl, 0);
            updateStatElement(totalPhotosEl, 0);
            updateStatElement(totalVideosEl, 0);
            return;
        }

        let totalContents = 0;
        let totalPhotos = 0;
        let totalVideos = 0;

        siteContent.arsiv.forEach(sezon => {
            if (sezon.icerikler) {
                totalContents += sezon.icerikler.length;
                
                sezon.icerikler.forEach(icerik => {
                    if (icerik.tip === 'galeri' && icerik.fotograflar) {
                        totalPhotos += icerik.fotograflar.length;
                    }
                    if (icerik.tip === 'video') {
                        totalVideos += 1;
                    }
                });
            }
        });

        updateStatElement(totalSeasonsEl, siteContent.arsiv.length);
        updateStatElement(totalContentsEl, totalContents);
        updateStatElement(totalPhotosEl, totalPhotos);
        updateStatElement(totalVideosEl, totalVideos);
    };

    const updateStatElement = (element, value) => {
        if (element) {
            element.textContent = value;
        }
    };

    const extractYearFromSeason = (seasonName) => {
        const match = seasonName.match(/(\d{4})/g);
        if (match && match.length > 1) {
            return match[1]; // İkinci yıl
        } else if (match && match.length === 1) {
            return match[0]; // Tek yıl
        }
        return seasonName;
    };

    const createSeasonCard = (sezon, index) => {
        const card = document.createElement('div');
        card.className = 'season-card';
        
        const contentCount = sezon.icerikler ? sezon.icerikler.length : 0;
        const photoCount = sezon.icerikler ? 
            sezon.icerikler.reduce((count, icerik) => {
                return count + (icerik.tip === 'galeri' && icerik.fotograflar ? icerik.fotograflar.length : 0);
            }, 0) : 0;
        const videoCount = sezon.icerikler ? 
            sezon.icerikler.filter(icerik => icerik.tip === 'video').length : 0;

        card.innerHTML = `
            <div class="season-header">
                ${sezon.afis ? `<img src="${sezon.afis}" alt="${sezon.sezon}" class="season-poster">` : '<div class="season-poster-placeholder"><i class="fas fa-image"></i></div>'}
                <div class="season-info">
                    <h4 class="season-title">${sezon.sezon}</h4>
                    <p class="season-description">${sezon.aciklama || 'Açıklama eklenmemiş'}</p>
                    <div class="season-stats">
                        <span class="stat-item">
                            <i class="fas fa-list"></i> ${contentCount} İçerik
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-images"></i> ${photoCount} Fotoğraf
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-video"></i> ${videoCount} Video
                        </span>
                    </div>
                </div>
            </div>
            <div class="season-actions">
                <button class="btn-primary" onclick="openSeasonDetailModal('${sezon.id}')">
                    <i class="fas fa-edit"></i> İçerikleri Yönet
                </button>
                <button class="btn-secondary" onclick="editSeasonBasics('${sezon.id}')">
                    <i class="fas fa-cog"></i> Sezon Ayarları
                </button>
                <button class="btn-danger" onclick="deleteSeason('${sezon.id}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        `;

        return card;
    };

    const handleAddSezon = () => {
        const newSezonId = `sezon_${Date.now()}`;
        const newSezon = {
            id: newSezonId,
            sezon: '',
            aciklama: '',
            afis: '',
            icerikler: []
        };

        if (!siteContent.arsiv) siteContent.arsiv = [];
        siteContent.arsiv.push(newSezon);
        
        saveContent().then(() => {
            renderArsiv();
            editSeasonBasics(newSezonId);
        });
    };

    // Global fonksiyonlar (window'a eklenecek)
    window.openSeasonDetailModal = (seasonId) => {
        const season = siteContent.arsiv.find(s => s.id === seasonId);
        if (!season) return;

        currentEdit = { type: 'sezon-detail', index: siteContent.arsiv.findIndex(s => s.id === seasonId) };
        
        modalTitle.textContent = `${season.sezon} - İçerik Yönetimi`;
        modalFields.innerHTML = createSeasonDetailForm(season);
        
        document.body.classList.add('modal-open');
        modal.style.display = 'flex';
        
        setupSeasonDetailEventListeners();
    };

    window.editSeasonBasics = (seasonId) => {
        const season = siteContent.arsiv.find(s => s.id === seasonId);
        if (!season) return;

        currentEdit = { type: 'sezon-basic', index: siteContent.arsiv.findIndex(s => s.id === seasonId) };
        
        modalTitle.textContent = `${season.sezon || 'Yeni Sezon'} - Temel Bilgiler`;
        modalFields.innerHTML = `
            <label for="season-name">Sezon Adı:</label>
            <input type="text" id="season-name" value="${season.sezon}" placeholder="Örn: 2024-2025" required>
            
            <label for="season-description">Sezon Açıklaması:</label>
            <textarea id="season-description" rows="4" placeholder="Bu sezon hakkında kısa açıklama...">${season.aciklama}</textarea>
            
            <label for="season-poster">Sezon Afişi:</label>
            <input type="file" id="season-poster" accept="image/*">
            ${season.afis ? `<img src="${season.afis}" alt="Mevcut Afiş" style="max-width: 200px; margin-top: 10px;">` : ''}
        `;
        
        document.body.classList.add('modal-open');
        modal.style.display = 'flex';
    };

    window.deleteSeason = (seasonId) => {
        const season = siteContent.arsiv.find(s => s.id === seasonId);
        if (!season) return;

        const contentCount = season.icerikler ? season.icerikler.length : 0;
        const confirmMessage = contentCount > 0 
            ? `'${season.sezon}' sezonunu ve ${contentCount} içeriğini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : `'${season.sezon}' sezonunu silmek istediğinize emin misiniz?`;

        if (confirm(confirmMessage)) {
            const seasonIndex = siteContent.arsiv.findIndex(s => s.id === seasonId);
            siteContent.arsiv.splice(seasonIndex, 1);
            saveContent().then(() => {
                renderArsiv();
                showNotification('Sezon başarıyla silindi.', 'success');
            });
        }
    };

    const createSeasonDetailForm = (season) => {
        const contents = season.icerikler || [];
        
        return `
            <div class="season-detail-form">
                <!-- İçerik Ekleme Butonları -->
                <div class="content-type-buttons" style="margin-bottom: 25px;">
                    <h4>Yeni İçerik Ekle:</h4>
                    <div class="button-group">
                        <button type="button" class="btn-add-content" data-type="oyun">
                            <i class="fas fa-theater-masks"></i> Oyun Ekle
                        </button>
                        <button type="button" class="btn-add-content" data-type="galeri">
                            <i class="fas fa-images"></i> Fotoğraf Galerisi
                        </button>
                        <button type="button" class="btn-add-content" data-type="video">
                            <i class="fas fa-video"></i> Video Ekle
                        </button>
                        <button type="button" class="btn-add-content" data-type="metin">
                            <i class="fas fa-align-left"></i> Metin İçeriği
                        </button>
                    </div>
                </div>

                <!-- Mevcut İçerikler -->
                <div class="existing-contents">
                    <h4>Mevcut İçerikler (${contents.length}):</h4>
                    <div id="contents-list">
                        ${contents.map((content, index) => createContentItem(content, index)).join('')}
                    </div>
                </div>
            </div>
        `;
    };

    const createContentItem = (content, index) => {
        const typeIcons = {
            'oyun': 'fas fa-theater-masks',
            'galeri': 'fas fa-images',
            'video': 'fas fa-video',
            'metin': 'fas fa-align-left'
        };

        const typeNames = {
            'oyun': 'Oyun',
            'galeri': 'Fotoğraf Galerisi',
            'video': 'Video',
            'metin': 'Metin İçeriği'
        };

        return `
            <div class="content-item" data-index="${index}">
                <div class="content-info">
                    <i class="${typeIcons[content.tip] || 'fas fa-file'}"></i>
                    <div class="content-details">
                        <strong>${content.baslik || 'İsimsiz İçerik'}</strong>
                        <span class="content-type">${typeNames[content.tip] || content.tip}</span>
                        ${content.tip === 'galeri' && content.fotograflar ? 
                            `<span class="content-meta">${content.fotograflar.length} fotoğraf</span>` : ''}
                    </div>
                </div>
                <div class="content-actions">
                    <button type="button" class="btn-edit-content" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn-delete-content" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    };

    const setupSeasonDetailEventListeners = () => {
        // İçerik ekleme butonları
        modalFields.querySelectorAll('.btn-add-content').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contentType = e.currentTarget.dataset.type;
                addNewContent(contentType);
            });
        });

        // İçerik düzenleme butonları
        modalFields.querySelectorAll('.btn-edit-content').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contentIndex = parseInt(e.currentTarget.dataset.index);
                editContent(contentIndex);
            });
        });

        // İçerik silme butonları
        modalFields.querySelectorAll('.btn-delete-content').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contentIndex = parseInt(e.currentTarget.dataset.index);
                deleteContent(contentIndex);
            });
        });
    };

    const addNewContent = (contentType) => {
        const season = siteContent.arsiv[currentEdit.index];
        if (!season) return;

        const newContent = {
            tip: contentType,
            baslik: '',
            ...(contentType === 'galeri' && { fotograflar: [] }),
            ...(contentType === 'video' && { videoUrl: '' }),
            ...(contentType === 'metin' && { metin: '' }),
            ...(contentType === 'oyun' && { 
                yonetmen: '',
                yazar: '',
                oyuncular: [],
                teknikEkip: [],
                afis: '',
                ozet: ''
            })
        };

        if (!season.icerikler) season.icerikler = [];
        season.icerikler.push(newContent);

        const contentIndex = season.icerikler.length - 1;
        editContent(contentIndex);
    };

    const editContent = (contentIndex) => {
        const season = siteContent.arsiv[currentEdit.index];
        const content = season.icerikler[contentIndex];
        
        currentEdit.contentIndex = contentIndex;
        
        modalTitle.textContent = `${content.baslik || 'İçerik'} - Düzenle`;
        modalFields.innerHTML = createContentEditForm(content);
        
        setupContentEditEventListeners(content);
    };

    const createContentEditForm = (content) => {
        switch (content.tip) {
            case 'oyun':
                return `
                    <label for="content-title">Oyun Adı:</label>
                    <input type="text" id="content-title" value="${content.baslik}" required>
                    
                    <label for="content-director">Yönetmen:</label>
                    <input type="text" id="content-director" value="${content.yonetmen || ''}">
                    
                    <label for="content-writer">Yazar:</label>
                    <input type="text" id="content-writer" value="${content.yazar || ''}">
                    
                    <label for="content-summary">Özet:</label>
                    <textarea id="content-summary" rows="4">${content.ozet || ''}</textarea>
                    
                    <label for="content-poster">Oyun Afişi:</label>
                    <input type="file" id="content-poster" accept="image/*">
                    ${content.afis ? `<img src="${content.afis}" alt="Afiş" style="max-width: 150px; margin-top: 10px;">` : ''}
                    
                    <label for="content-cast">Oyuncular (virgülle ayırın):</label>
                    <textarea id="content-cast" rows="3" placeholder="Oyuncu 1, Oyuncu 2, Oyuncu 3...">${Array.isArray(content.oyuncular) ? content.oyuncular.join(', ') : content.oyuncular || ''}</textarea>
                    
                    <label for="content-crew">Teknik Ekip (virgülle ayırın):</label>
                    <textarea id="content-crew" rows="3" placeholder="Işık: Ad Soyad, Ses: Ad Soyad...">${Array.isArray(content.teknikEkip) ? content.teknikEkip.join(', ') : content.teknikEkip || ''}</textarea>
                `;
                
            case 'galeri':
                return `
                    <label for="content-title">Galeri Başlığı:</label>
                    <input type="text" id="content-title" value="${content.baslik}" required>
                    
                    <label for="content-photos">Fotoğraflar:</label>
                    <input type="file" id="content-photos" accept="image/*" multiple>
                    
                    <div class="current-photos">
                        <h5>Mevcut Fotoğraflar (${content.fotograflar ? content.fotograflar.length : 0}):</h5>
                        <div class="photo-grid">
                            ${content.fotograflar ? content.fotograflar.map((photo, index) => `
                                <div class="photo-item">
                                    <img src="${photo}" alt="Fotoğraf ${index + 1}">
                                    <button type="button" class="remove-photo" data-index="${index}">×</button>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                `;
                
            case 'video':
                return `
                    <label for="content-title">Video Başlığı:</label>
                    <input type="text" id="content-title" value="${content.baslik}" required>
                    
                    <label for="content-video-url">Video URL (YouTube, Vimeo vb.):</label>
                    <input type="url" id="content-video-url" value="${content.videoUrl || ''}" placeholder="https://www.youtube.com/watch?v=...">
                `;
                
            case 'metin':
                return `
                    <label for="content-title">Başlık:</label>
                    <input type="text" id="content-title" value="${content.baslik}" required>
                    
                    <label for="content-text">Metin İçeriği:</label>
                    <textarea id="content-text" rows="8">${content.metin || ''}</textarea>
                `;
                
            default:
                return `<p>Bilinmeyen içerik tipi: ${content.tip}</p>`;
        }
    };

    const setupContentEditEventListeners = (content) => {
        // Fotoğraf silme butonları
        if (content.tip === 'galeri') {
            modalFields.querySelectorAll('.remove-photo').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const photoIndex = parseInt(e.currentTarget.dataset.index);
                    removePhoto(photoIndex);
                });
            });
        }
    };

    const removePhoto = (photoIndex) => {
        const season = siteContent.arsiv[currentEdit.index];
        const content = season.icerikler[currentEdit.contentIndex];
        
        if (content.fotograflar && content.fotograflar[photoIndex]) {
            content.fotograflar.splice(photoIndex, 1);
            modalFields.innerHTML = createContentEditForm(content);
            setupContentEditEventListeners(content);
        }
    };

    const deleteContent = (contentIndex) => {
        const season = siteContent.arsiv[currentEdit.index];
        const content = season.icerikler[contentIndex];
        
        if (confirm(`'${content.baslik || 'Bu içeriği'}' silmek istediğinize emin misiniz?`)) {
            season.icerikler.splice(contentIndex, 1);
            
            saveContent().then(() => {
                // Modal'ı yeniden yükle
                window.openSeasonDetailModal(season.id);
                showNotification('İçerik silindi.', 'success');
            });
        }
    };
    
    // Arşiv için özel submit fonksiyonları
    const handleSeasonBasicSubmit = async () => {
        const season = siteContent.arsiv[currentEdit.index];
        if (!season) return;

        const seasonName = document.getElementById('season-name').value;
        const seasonDescription = document.getElementById('season-description').value;
        const seasonPosterInput = document.getElementById('season-poster');

        season.sezon = seasonName;
        season.aciklama = seasonDescription;

        if (seasonPosterInput.files && seasonPosterInput.files[0]) {
            const uploadedPath = await uploadImage(seasonPosterInput.files[0]);
            if (uploadedPath) {
                season.afis = uploadedPath;
            }
        }

        await saveContent();
        renderArsiv();
        closeModal();
        showNotification('Sezon bilgileri güncellendi!', 'success');
    };

    const handleSeasonContentSubmit = async () => {
        const season = siteContent.arsiv[currentEdit.index];
        const content = season.icerikler[currentEdit.contentIndex];
        if (!season || !content) return;

        const titleInput = document.getElementById('content-title');
        if (titleInput) {
            content.baslik = titleInput.value;
        }

        switch (content.tip) {
            case 'oyun':
                const directorInput = document.getElementById('content-director');
                const writerInput = document.getElementById('content-writer');
                const summaryInput = document.getElementById('content-summary');
                const posterInput = document.getElementById('content-poster');
                const castInput = document.getElementById('content-cast');
                const crewInput = document.getElementById('content-crew');

                if (directorInput) content.yonetmen = directorInput.value;
                if (writerInput) content.yazar = writerInput.value;
                if (summaryInput) content.ozet = summaryInput.value;
                if (castInput) {
                    content.oyuncular = castInput.value.split(',').map(s => s.trim()).filter(s => s);
                }
                if (crewInput) {
                    content.teknikEkip = crewInput.value.split(',').map(s => s.trim()).filter(s => s);
                }

                if (posterInput && posterInput.files && posterInput.files[0]) {
                    const uploadedPath = await uploadImage(posterInput.files[0]);
                    if (uploadedPath) {
                        content.afis = uploadedPath;
                    }
                }
                break;

            case 'galeri':
                const photosInput = document.getElementById('content-photos');
                if (photosInput && photosInput.files && photosInput.files.length > 0) {
                    if (!content.fotograflar) content.fotograflar = [];
                    
                    for (const file of photosInput.files) {
                        const uploadedPath = await uploadImage(file);
                        if (uploadedPath) {
                            // Duplikasyon kontrolü - aynı fotoğraf daha önce eklenmişse tekrar ekleme
                            if (!content.fotograflar.includes(uploadedPath)) {
                                content.fotograflar.push(uploadedPath);
                            }
                        }
                    }
                }
                break;

            case 'video':
                const videoUrlInput = document.getElementById('content-video-url');
                if (videoUrlInput) content.videoUrl = videoUrlInput.value;
                break;

            case 'metin':
                const textInput = document.getElementById('content-text');
                if (textInput) content.metin = textInput.value;
                break;
        }

        await saveContent();
        window.openSeasonDetailModal(season.id);
        showNotification('İçerik güncellendi!', 'success');
    };
});
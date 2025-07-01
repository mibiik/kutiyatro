document.addEventListener('DOMContentLoaded', () => {

    // ----------------- STATE MANAGEMENT -----------------
    let siteContent = {};
    let currentEdit = { type: null, index: -1 };

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
    const ekipList = document.getElementById('ekip-list');
    const oyuncuHavuzuList = document.getElementById('oyuncu-havuzu-list');
    const arsivList = document.getElementById('arsiv-list');

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
            const response = await fetch('/api/content');
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
            
            renderAllContent();
        } catch (error) {
            console.error('Failed to fetch content:', error);
            showNotification('İçerik yüklenemedi. Sunucu çalışıyor mu?', 'error');
        }
    };

    const saveContent = async () => {
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteContent, null, 2)
            });
            if (!response.ok) throw new Error('Değişiklikler sunucuya kaydedilemedi.');
            showNotification('Değişiklikler başarıyla kaydedildi!', 'success');
            await fetchContent(); // Re-fetch for consistency
        } catch (error) {
            console.error('Failed to save content:', error);
            showNotification('Değişiklikler kaydedilemedi.', 'error');
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch('/api/upload', {
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
        renderEkip();
        renderOyuncuHavuzu();
        renderArsiv();
    };

    const renderOyunlar = () => {
        oyunlarList.innerHTML = '';
        siteContent.oyunlar?.forEach((item, index) => {
            const itemDiv = createDraggableListItem(item, index, 'oyun');
            itemDiv.querySelector('.edit-btn').addEventListener('click', () => handleOpenModal('oyun', index));
            itemDiv.querySelector('.delete-btn').addEventListener('click', () => handleDeleteItem('oyun', index));
            oyunlarList.appendChild(itemDiv);
        });
        addDragAndDropListeners(oyunlarList, 'oyun');
    };

    const renderEkip = () => {
        ekipList.innerHTML = '';
        siteContent.ekip?.forEach((item, index) => {
            const itemDiv = createDraggableListItem(item, index, 'ekip');
            itemDiv.querySelector('.edit-btn').addEventListener('click', () => handleOpenModal('ekip', index));
            itemDiv.querySelector('.delete-btn').addEventListener('click', () => handleDeleteItem('ekip', index));
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
            itemDiv.querySelector('.edit-btn').addEventListener('click', () => handleOpenModal('oyuncu', originalIndex));
            itemDiv.querySelector('.delete-btn').addEventListener('click', () => handleDeleteItem('oyuncu', originalIndex));
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

    const renderArsiv = () => {
        arsivList.innerHTML = '';
        siteContent.arsiv?.forEach((item, index) => {
            const itemDiv = createListItem(item, 'arsiv');
            itemDiv.querySelector('.edit-btn').addEventListener('click', () => {
                window.location.href = `sezon-detay.html?sezon=${index}`;
            });
            itemDiv.querySelector('.delete-btn').addEventListener('click', () => handleDeleteItem('arsiv', index));
            arsivList.appendChild(itemDiv);
        });
    };

    const createListItem = (item, type) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';

        let contentHtml = '';
        let previewHtml = '';

        // Ekip ve oyuncu için önizleme resmi oluştur
        if ((type === 'ekip' || type === 'oyuncu') && item.img) {
            previewHtml = `<img src="${item.img}" alt="${item.ad}" class="list-item-preview">`;
        }

        // Metin içeriğini oluştur
        if (type === 'oyun') {
            const kategoriText = item.kategori === 'oda' ? 'Oda Tiyatrosu' : 'Ana Oyun';
            const durumText = getDurumText(item.durum);
            contentHtml = `<div><strong>${item.ad}</strong><br>${item.yazar || 'Yazar belirtilmemiş'} - ${kategoriText}<br>${item.tarih || 'Tarih TBA'} - ${durumText}</div>`;
        } else if (type === 'ekip') {
            contentHtml = `<div><strong>${item.ad}</strong><br>${item.rol}</div>`;
        } else if (type === 'oyuncu') {
            const durumBadge = item.durum === 'aktif' ? '🟢' : item.durum === 'pasif' ? '🟡' : '🔴';
            const roller = item.roller || [item.tip]; // Çoklu rol veya eski sistem
            
            // Ana kategori belirle
            let kategoriLabel = '';
            if (roller.includes('baskan')) {
                kategoriLabel = '🏛️ BAŞKAN';
            } else if (roller.some(rol => ['baskan_yardimcisi', 'sekreter', 'sayman', 'kurul_uyesi'].includes(rol))) {
                kategoriLabel = '👑 YÖNETİM KURULU';
            } else if (roller.some(rol => ['yonetmen', 'yardimci_yonetmen', 'oyuncu', 'sahne_direktoru', 'teknik_sorumlu', 'isik_ses', 'sahne_tasarim', 'kostum_makyaj', 'sosyal_medya', 'grafik_tasarim', 'web_sorumlu', 'fotografci', 'aktif_uye'].includes(rol))) {
                kategoriLabel = '🎭 AKTİF ÜYE';
            } else {
                kategoriLabel = '👤 ÜYE';
            }
            
            // Rollerin görünen adlarını birleştir
            const rolAdlari = roller.map(rol => getRolDisplayName(rol)).join(', ');
            
            contentHtml = `<div><strong>${item.ad}</strong><br><span style="font-weight: bold; color: #8B4513;">${kategoriLabel}</span><br>${rolAdlari}<br>${item.sinif} - ${item.bolum}<br>${durumBadge} ${item.durum.charAt(0).toUpperCase() + item.durum.slice(1)}</div>`;
        } else if (type === 'arsiv') {
             contentHtml = `<div><strong>${item.sezon}</strong><br>${item.oyunlar.length} oyun, ${item.fotograflar.length} fotoğraf</div>`;
        }
        
        itemDiv.innerHTML = `
            <div class="list-item-content">${previewHtml}${contentHtml}</div>
            <div class="list-item-actions">
                <button class="edit-btn">Düzenle</button>
                <button class="delete-btn">Sil</button>
            </div>
        `;
        return itemDiv;
    };
    
    const createDraggableListItem = (item, index, type) => {
        const itemDiv = createListItem(item, type);
        itemDiv.setAttribute('draggable', 'true');
        itemDiv.dataset.index = index;
        itemDiv.dataset.type = type;
        return itemDiv;
    };

    // ----------------- EVENT HANDLERS -----------------
    const handleNavLinkClick = (e) => {
        e.preventDefault();
        const link = e.currentTarget;
        if (link.classList.contains('external')) return;
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
        const isNew = index === -1;
        const arrayKey = getArrayKeyFromType(type);
        if (!arrayKey) return;

        let itemToUpdate;

        if (isNew) {
            itemToUpdate = {};
        } else {
            itemToUpdate = siteContent[arrayKey][index];
        }

        if (type === 'oyun') {
            itemToUpdate.ad = document.getElementById('oyun-ad').value;
            itemToUpdate.yazar = document.getElementById('oyun-yazar').value;
            itemToUpdate.yonetmen = document.getElementById('oyun-yonetmen').value;
            itemToUpdate.yardimci_yonetmen = document.getElementById('oyun-yardimci-yonetmen').value;
            itemToUpdate.kategori = document.getElementById('oyun-kategori').value;
            itemToUpdate.tarih = document.getElementById('oyun-tarih').value;
            itemToUpdate.mekan = document.getElementById('oyun-mekan').value;
            itemToUpdate.sure = document.getElementById('oyun-sure').value;
            itemToUpdate.durum = document.getElementById('oyun-durum').value;
            itemToUpdate.aciklama = document.getElementById('oyun-aciklama').value;
            itemToUpdate.bilet = document.getElementById('oyun-bilet').value;
            itemToUpdate.anasayfadaGoster = document.getElementById('oyun-anasayfada-goster').checked;

            const afisInput = document.getElementById('oyun-afis');
            if (afisInput.files.length > 0) {
                const newPath = await uploadImage(afisInput.files[0]);
                if (newPath) itemToUpdate.afis = newPath;
            }

            const oyuncuRows = document.querySelectorAll('.oyuncu-row');
            itemToUpdate.oyuncular = [];
            oyuncuRows.forEach(row => {
                const selectElement = row.querySelector('[data-field="oyuncu-select"]');
                const adInput = row.querySelector('[data-field="ad"]');
                const karakterInput = row.querySelector('[data-field="karakter"]');
                
                let oyuncuAdi = '';
                if (selectElement && selectElement.value && selectElement.value !== 'manuel') {
                    oyuncuAdi = selectElement.value;
                } else if (adInput && adInput.value.trim()) {
                    oyuncuAdi = adInput.value.trim();
                }
                
                if (oyuncuAdi && karakterInput && karakterInput.value.trim()) {
                    itemToUpdate.oyuncular.push({
                        ad: oyuncuAdi,
                        karakter: karakterInput.value.trim()
                    });
                }
            });

            if (isNew) {
                itemToUpdate.id = Date.now();
                itemToUpdate.fotograflar = [];
            }
        } else if (type === 'oyuncu') {
            itemToUpdate.ad = document.getElementById('oyuncu-ad').value;
            itemToUpdate.telefon = document.getElementById('oyuncu-telefon').value;
            itemToUpdate.email = document.getElementById('oyuncu-email').value;
            itemToUpdate.sinif = document.getElementById('oyuncu-sinif').value;
            itemToUpdate.bolum = document.getElementById('oyuncu-bolum').value;
            itemToUpdate.durum = document.getElementById('oyuncu-durum').value;
            itemToUpdate.katilim_tarihi = document.getElementById('oyuncu-katilim').value;
            
            const selectedRoller = [];
            const checkboxes = document.querySelectorAll('#oyuncu-roller-container input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                selectedRoller.push(checkbox.value);
            });
            itemToUpdate.roller = selectedRoller;
            
            itemToUpdate.tip = getPrimaryRoleType(selectedRoller);
            
            const ozelliklerText = document.getElementById('oyuncu-ozellikler').value;
            itemToUpdate.ozellikler = ozelliklerText ? ozelliklerText.split(',').map(s => s.trim()).filter(s => s) : [];
            
            const fileInput = document.getElementById('oyuncu-foto');
            if (fileInput.files.length > 0) {
                const newPath = await uploadImage(fileInput.files[0]);
                if (newPath) itemToUpdate.img = newPath;
            } else if (isNew) {
                itemToUpdate.img = 'assets/pngegg.png';
            }
            
            if (isNew) {
                itemToUpdate.id = Date.now();
            }
        } else if (type === 'ekip') {
            itemToUpdate.ad = document.getElementById('ekip-ad').value;
            itemToUpdate.rol = document.getElementById('ekip-gorev').value;
            itemToUpdate.email = document.getElementById('ekip-email').value;
            
            itemToUpdate.telefon = document.getElementById('ekip-telefon').value;
            itemToUpdate.sinif = document.getElementById('ekip-sinif').value;
            itemToUpdate.bolum = document.getElementById('ekip-bolum').value;
            itemToUpdate.katilim_tarihi = document.getElementById('ekip-katilim').value;
            
            const ozelliklerText = document.getElementById('ekip-ozellikler').value;
            itemToUpdate.ozellikler = ozelliklerText ? ozelliklerText.split(',').map(s => s.trim()).filter(s => s) : [itemToUpdate.rol];
            
            const fileInput = document.getElementById('ekip-foto');
            if (fileInput.files.length > 0) {
                const newPath = await uploadImage(fileInput.files[0]);
                if (newPath) itemToUpdate.img = newPath;
            } else if (isNew) {
                itemToUpdate.img = 'assets/pngegg.png';
            }
            
            if (isNew) {
                itemToUpdate.id = Date.now();
            }
        }

        if (isNew) {
            if (!siteContent[arrayKey]) {
                siteContent[arrayKey] = [];
            }
            siteContent[arrayKey].push(itemToUpdate);
        }

        await saveContent();
        closeModal();
    };

    const handleDeleteItem = (type, index) => {
        const itemArrayKey = getArrayKeyFromType(type);
        if (!itemArrayKey) return;
        const itemData = siteContent[itemArrayKey][index];
        const itemName = itemData.ad || itemData.sezon;
        if (confirm(`'${itemName}' adlı öğeyi silmek istediğinizden emin misiniz?`)) {
            siteContent[itemArrayKey].splice(index, 1);
            saveContent();
        }
    };
    
    const handleAddSezon = () => {
        const newSezonName = prompt("Yeni sezon için bir isim girin (örn: 2023-2024):");
        if (newSezonName) {
            siteContent.arsiv = siteContent.arsiv || [];
            siteContent.arsiv.push({ sezon: newSezonName, oyunlar: [], fotograflar: [] });
            saveContent();
        }
    };

    const handleOpenModal = (type, index) => {
        currentEdit = { type, index };
        const isNew = index === -1;
        const arrayKey = getArrayKeyFromType(type);
        if (!arrayKey) return;

        const item = isNew ? {} : siteContent[arrayKey][index];
        
        const typeNames = {
            'oyun': 'Oyun',
            'ekip': 'Kurul Üyesi', 
            'oyuncu': 'Oyuncu',
            'arsiv': 'Arşiv'
        };
        modalTitle.textContent = `${isNew ? 'Yeni Ekle' : 'Düzenle'}: ${typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1)}`;
        modalFields.innerHTML = ''; 

        let fieldsHtml = '';
        if (type === 'oyun') {
            const afisPreview = item.afis ? `<p>Mevcut Afiş:</p><img src="${item.afis}" alt="Mevcut afiş" style="max-width: 100px;">` : '';
            fieldsHtml = `
                <label for="oyun-ad">Oyun Adı:</label>
                <input type="text" id="oyun-ad" value="${item.ad || ''}" required>
                
                <label for="oyun-yazar">Yazar:</label>
                <input type="text" id="oyun-yazar" value="${item.yazar || ''}" required>
                
                <label for="oyun-yonetmen">Yönetmen:</label>
                <input type="text" id="oyun-yonetmen" value="${item.yonetmen || ''}" required>
                
                <label for="oyun-yardimci-yonetmen">Yardımcı Yönetmen (Opsiyonel):</label>
                <input type="text" id="oyun-yardimci-yonetmen" value="${item.yardimci_yonetmen || ''}">
                
                <label for="oyun-kategori">Kategori:</label>
                <select id="oyun-kategori" required>
                    <option value="ana" ${item.kategori === 'ana' ? 'selected' : ''}>Ana Oyun</option>
                    <option value="oda" ${item.kategori === 'oda' ? 'selected' : ''}>Oda Tiyatrosu</option>
                </select>
                
                <label for="oyun-tarih">Tarih:</label>
                <input type="text" id="oyun-tarih" value="${item.tarih || ''}">
                
                <label for="oyun-mekan">Mekan:</label>
                <input type="text" id="oyun-mekan" value="${item.mekan || ''}">
                
                <label for="oyun-sure">Süre (örn: 120 dakika):</label>
                <input type="text" id="oyun-sure" value="${item.sure || ''}">
                
                <label for="oyun-durum">Durum:</label>
                <select id="oyun-durum" required>
                    <option value="yaklasiyor" ${item.durum === 'yaklasiyor' ? 'selected' : ''}>Yaklaşan</option>
                    <option value="oynaniyor" ${item.durum === 'oynaniyor' ? 'selected' : ''}>Sahnede</option>
                    <option value="bitmis" ${item.durum === 'bitmis' ? 'selected' : ''}>Tamamlandı</option>
                </select>
                
                <label for="oyun-aciklama">Açıklama:</label>
                <textarea id="oyun-aciklama" rows="4">${item.aciklama || ''}</textarea>
                
                <label for="oyun-afis">Afiş Yükle:</label>
                <input type="file" id="oyun-afis" accept="image/*">
                <div id="afis-preview-container">${afisPreview}</div>
                
                <label for="oyun-bilet">Bilet Linki (Opsiyonel):</label>
                <input type="url" id="oyun-bilet" value="${item.bilet || ''}">
                
                <div style="margin-top: 15px; padding: 10px; background-color: #f0f8ff; border-radius: 5px;">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="oyun-anasayfada-goster" ${item.anasayfadaGoster ? 'checked' : ''} style="width: 20px; height: 20px;">
                        <strong>Bu oyunu anasayfada "Oyunlarımız" bölümünde göster</strong>
                    </label>
                </div>
                
                <label>Oyuncu Kadrosu:</label>
                <div id="oyuncular-container" style="border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: #f9f9f9;">
                    ${(item.oyuncular || []).map((oyuncu, i) => `
                        <div class="oyuncu-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center; background: white; padding: 10px; border-radius: 5px; border: 1px solid #eee;">
                            <select data-field="oyuncu-select" data-index="${i}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" onchange="updateOyuncuAd(${i})">
                                <option value="">Oyuncu Havuzundan Seç</option>
                                ${siteContent.oyuncu_havuzu?.filter(p => p.durum === 'aktif').map(player => 
                                    `<option value="${player.ad}" ${player.ad === oyuncu.ad ? 'selected' : ''}>${player.ad} (${player.sinif} - ${player.bolum})</option>`
                                ).join('')}
                                <option value="manuel" ${!siteContent.oyuncu_havuzu?.find(p => p.ad === oyuncu.ad) && oyuncu.ad ? 'selected' : ''}>Manuel Giriş</option>
                            </select>
                            <input type="text" placeholder="Oyuncu Adı" value="${oyuncu.ad || ''}" data-field="ad" data-index="${i}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px; ${siteContent.oyuncu_havuzu?.find(p => p.ad === oyuncu.ad) ? 'display: none;' : ''}">
                            <input type="text" placeholder="Karakter Adı" value="${oyuncu.karakter || ''}" data-field="karakter" data-index="${i}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <button type="button" onclick="removeOyuncu(${i})" style="padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Sil</button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" onclick="addOyuncu()" style="margin-top: 10px; padding: 10px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">+ Oyuncu Ekle</button>
            `;
        } else if (type === 'oyuncu') {
            const previewSrc = item.img && item.img !== 'assets/pngegg.png' ? item.img : '';
            fieldsHtml = `
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
                
                <label for="oyuncu-foto">Fotoğraf Yükle:</label>
                <input type="file" id="oyuncu-foto" accept="image/*">
                <div id="modal-preview-container">
                    ${previewSrc ? `<p>Mevcut Foto:</p><img src="${previewSrc}" alt="Mevcut fotoğraf">` : ''}
                </div>
            `;
        } else if (type === 'ekip') {
            const previewSrc = item.img && item.img !== 'assets/pngegg.png' ? item.img : '';
            const oyuncuData = siteContent.oyuncu_havuzu?.find(oyuncu => oyuncu.ad === item.ad) || {};
            
            fieldsHtml = `
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #0066cc;">
                    <h4 style="margin: 0 0 10px 0; color: #0066cc;">💡 Bu kişi aynı zamanda oyuncu havuzuna da eklenecek</h4>
                    <p style="margin: 0; color: #333; font-size: 14px;">Yönetim kurulu üyeleri otomatik olarak oyuncu havuzunda da yer alır ve oyunlarda oynayabilir.</p>
                </div>
                
                <h3 style="color: var(--primary-color); margin-bottom: 15px;">👥 Yönetim Kurulu Bilgileri</h3>
                <label for="ekip-ad">Ad Soyad:</label>
                <input type="text" id="ekip-ad" value="${item.ad || ''}" required>
                
                <label for="ekip-gorev">Görev/Rol:</label>
                <input type="text" id="ekip-gorev" value="${item.rol || ''}" required> 
                
                <label for="ekip-email">E-mail:</label>
                <input type="email" id="ekip-email" value="${item.email || oyuncuData.email || ''}">
                
                <h3 style="color: var(--primary-color); margin: 25px 0 15px 0;">🎭 Oyuncu Havuzu Bilgileri</h3>
                <label for="ekip-telefon">Telefon:</label>
                <input type="tel" id="ekip-telefon" value="${oyuncuData.telefon || ''}">
                
                <label for="ekip-sinif">Sınıf:</label>
                <select id="ekip-sinif">
                    <option value="1. Sınıf" ${oyuncuData.sinif === '1. Sınıf' ? 'selected' : ''}>1. Sınıf</option>
                    <option value="2. Sınıf" ${oyuncuData.sinif === '2. Sınıf' ? 'selected' : ''}>2. Sınıf</option>
                    <option value="3. Sınıf" ${oyuncuData.sinif === '3. Sınıf' ? 'selected' : ''}>3. Sınıf</option>
                    <option value="4. Sınıf" ${oyuncuData.sinif === '4. Sınıf' ? 'selected' : ''}>4. Sınıf</option>
                    <option value="Yüksek Lisans" ${oyuncuData.sinif === 'Yüksek Lisans' ? 'selected' : ''}>Yüksek Lisans</option>
                    <option value="Doktora" ${oyuncuData.sinif === 'Doktora' ? 'selected' : ''}>Doktora</option>
                    <option value="Mezun" ${oyuncuData.sinif === 'Mezun' ? 'selected' : ''}>Mezun</option>
                </select>
                
                <label for="ekip-bolum">Bölüm:</label>
                <input type="text" id="ekip-bolum" value="${oyuncuData.bolum || ''}">
                
                <label for="ekip-katilim">Katılım Tarihi:</label>
                <input type="date" id="ekip-katilim" value="${oyuncuData.katilim_tarihi || ''}">
                
                <label for="ekip-ozellikler">Özellikler/Yetenekler (virgülle ayırın):</label>
                <input type="text" id="ekip-ozellikler" value="${(oyuncuData.ozellikler || []).join(', ')}" placeholder="Yönetmenlik, Oyunculuk, Liderlik">
                
                <label for="ekip-foto">Fotoğraf Yükle:</label>
                <input type="file" id="ekip-foto" accept="image/*">
                <div id="modal-preview-container">
                    ${previewSrc ? `<p>Mevcut Foto:</p><img src="${previewSrc}" alt="Mevcut fotoğraf">` : ''}
                </div>
            `;
        }
        modalFields.innerHTML = fieldsHtml;
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        hamburgerBtn.classList.toggle('active');
    };

    // ----------------- DRAG AND DROP -----------------
    let draggedItem = null;
    const addDragAndDropListeners = (list, type) => {
        list.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('list-item')) {
                draggedItem = e.target;
                setTimeout(() => e.target.classList.add('dragging'), 0);
            }
        });
        list.addEventListener('dragend', () => {
            if (draggedItem) {
                setTimeout(() => {
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                    updateOrder(list, type);
                }, 0);
            }
        });
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
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
        if (!arrayKey) return;
        const reorderedArray = [];
        list.querySelectorAll('.list-item').forEach(item => {
            const originalIndex = parseInt(item.dataset.index);
            reorderedArray.push(siteContent[arrayKey][originalIndex]);
        });
        siteContent[arrayKey] = reorderedArray;
        saveContent();
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
        
        const existingIndex = siteContent.oyuncu_havuzu.findIndex(oyuncu => oyuncu.ad === ekipUyesi.ad);
        
        if (isDelete) {
            // Ekip üyesi silindiğinde oyuncu havuzundan da sil
            if (existingIndex !== -1) {
                siteContent.oyuncu_havuzu.splice(existingIndex, 1);
            }
        } else {
            // Ekip üyesi eklendiğinde/güncellendiğinde oyuncu havuzunu senkronize et
            
            // Mevcut oyuncu havuzundaki en büyük ID'yi bul
            const maxOyuncuId = siteContent.oyuncu_havuzu.length > 0 ? 
                Math.max(...siteContent.oyuncu_havuzu.map(o => o.id)) : 0;
            
            const oyuncuData = {
                id: existingIndex !== -1 ? 
                    siteContent.oyuncu_havuzu[existingIndex].id : // Mevcut ID'yi koru
                    maxOyuncuId + 1, // Yeni ID oluştur
                ad: ekipUyesi.ad,
                img: ekipUyesi.img || 'assets/pngegg.png',
                telefon: ekipUyesi.telefon || '',
                email: ekipUyesi.email || '',
                sinif: ekipUyesi.sinif || 'Belirtilmemiş',
                bolum: ekipUyesi.bolum || 'Belirtilmemiş',
                ozellikler: ekipUyesi.ozellikler || [ekipUyesi.rol],
                katilim_tarihi: ekipUyesi.katilim_tarihi || new Date().toISOString().split('T')[0],
                durum: 'aktif',
                tip: determinePlayerType(ekipUyesi.rol),
                kurul_uyesi: true // Yönetim kurulu üyesi olduğunu belirtmek için
            };
            
            if (existingIndex !== -1) {
                // Mevcut oyuncuyu güncelle
                siteContent.oyuncu_havuzu[existingIndex] = oyuncuData;
            } else {
                // Yeni oyuncu ekle
                siteContent.oyuncu_havuzu.push(oyuncuData);
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
    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    };

    // ----------------- EVENT LISTENERS SETUP -----------------
    heroForm.addEventListener('submit', handleHeroFormSubmit);
    hakkimizdaForm.addEventListener('submit', handleHakkimizdaFormSubmit);
    iletisimForm.addEventListener('submit', handleIletisimFormSubmit);
    modalForm.addEventListener('submit', handleModalFormSubmit);

    addOyunBtn.addEventListener('click', () => handleOpenModal('oyun', -1));
    addEkipBtn.addEventListener('click', () => handleOpenModal('ekip', -1));
    addOyuncuBtn.addEventListener('click', () => handleOpenModal('oyuncu', -1));
    addSezonBtn.addEventListener('click', handleAddSezon);

    navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));
    
    hamburgerBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', toggleSidebar);
    mainContent.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ----------------- INITIALIZATION -----------------
    fetchContent();
    
    // Global functions for dynamic oyuncu management
    window.addOyuncu = () => {
        const container = document.getElementById('oyuncular-container');
        const newIndex = container.children.length;
        const newRow = document.createElement('div');
        newRow.className = 'oyuncu-row';
        newRow.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center; background: white; padding: 10px; border-radius: 5px; border: 1px solid #eee;';
        
        const oyuncuHavuzuOptions = siteContent.oyuncu_havuzu?.filter(p => p.durum === 'aktif').map(player => 
            `<option value="${player.ad}">${player.ad} (${player.sinif} - ${player.bolum})</option>`
        ).join('') || '';
        
        newRow.innerHTML = `
            <select data-field="oyuncu-select" data-index="${newIndex}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" onchange="updateOyuncuAd(${newIndex})">
                <option value="">Oyuncu Havuzundan Seç</option>
                ${oyuncuHavuzuOptions}
                <option value="manuel">Manuel Giriş</option>
            </select>
            <input type="text" placeholder="Oyuncu Adı" value="" data-field="ad" data-index="${newIndex}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px; display: none;">
            <input type="text" placeholder="Karakter Adı" value="" data-field="karakter" data-index="${newIndex}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="button" onclick="removeOyuncu(${newIndex})" style="padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Sil</button>
        `;
        container.appendChild(newRow);
    };
    
    window.removeOyuncu = (index) => {
        const rows = document.querySelectorAll('.oyuncu-row');
        if (rows[index]) {
            rows[index].remove();
            // Indexleri yeniden düzenle
            updateOyuncuIndexes();
        }
    };
    
    window.updateOyuncuAd = (index) => {
        const selectElement = document.querySelector(`[data-field="oyuncu-select"][data-index="${index}"]`);
        const inputElement = document.querySelector(`[data-field="ad"][data-index="${index}"]`);
        
        if (selectElement && inputElement) {
            const selectedValue = selectElement.value;
            
            if (selectedValue === 'manuel') {
                inputElement.style.display = 'block';
                inputElement.value = '';
                selectElement.style.flex = '1';
            } else if (selectedValue === '') {
                inputElement.style.display = 'none';
                inputElement.value = '';
                selectElement.style.flex = '2';
            } else {
                inputElement.style.display = 'none';
                inputElement.value = selectedValue;
                selectElement.style.flex = '2';
            }
        }
    };
    
    const updateOyuncuIndexes = () => {
        const rows = document.querySelectorAll('.oyuncu-row');
        rows.forEach((row, newIndex) => {
            const select = row.querySelector('[data-field="oyuncu-select"]');
            const adInput = row.querySelector('[data-field="ad"]');
            const karakterInput = row.querySelector('[data-field="karakter"]');
            const removeBtn = row.querySelector('button');
            
            if (select) select.setAttribute('data-index', newIndex);
            if (adInput) adInput.setAttribute('data-index', newIndex);
            if (karakterInput) karakterInput.setAttribute('data-index', newIndex);
            if (removeBtn) removeBtn.setAttribute('onclick', `removeOyuncu(${newIndex})`);
            if (select) select.setAttribute('onchange', `updateOyuncuAd(${newIndex})`);
        });
    };
});
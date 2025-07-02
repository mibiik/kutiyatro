document.addEventListener('DOMContentLoaded', () => {

    // Yeni Mobil Menü İşlevselliği
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileSidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');

    const closeMenu = () => {
        mobileSidebar.classList.remove('active');
        overlay.classList.add('hidden');
    };

    if (menuBtn && mobileSidebar && overlay) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileSidebar.classList.toggle('active');
            overlay.classList.toggle('hidden');
        });

        overlay.addEventListener('click', closeMenu);

        document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });
    }

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
    const closeSidebarBtn = document.querySelector('.close-sidebar');

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
            showMiniCheck();
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
        renderOneCikanOyunlar();
        renderEkip();
        renderOyuncuHavuzu();
        renderArsiv();
    };

    const renderOyunlar = () => {
        oyunlarList.innerHTML = '';
        siteContent.oyunlar?.forEach((item, index) => {
            const itemDiv = createDraggableListItem(item, index, 'oyun');
            oyunlarList.appendChild(itemDiv);
        });
        addDragAndDropListeners(oyunlarList, 'oyun');
    };

    const renderOneCikanOyunlar = () => {
        if (!oneCikanOyunlarList) return;
        oneCikanOyunlarList.innerHTML = '';
        const oneCikanOyunlar = siteContent.oyunlar?.filter(o => o.oneCikan) || [];
        
        oneCikanOyunlar.forEach(item => {
            // Find the original index to pass to handlers
            const originalIndex = siteContent.oyunlar.findIndex(o => o.id === item.id);
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

    const renderArsiv = () => {
        arsivList.innerHTML = '';
        siteContent.arsiv?.forEach((item, index) => {
            const itemDiv = createDraggableListItem(item, index, 'arsiv');
            arsivList.appendChild(itemDiv);
        });
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
                
                // Arşiv düzenlemesi için yeni sayfaya yönlendir
                if (type === 'arsiv') {
                    const sezonId = siteContent.arsiv[index]?.id;
                    if(sezonId) {
                        window.location.href = `sezon-detay.html?id=${sezonId}`;
                    }
                    return; // Modal açmayı engelle
                }

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
        const arrayKey = getArrayKeyFromType(type);
        if (!arrayKey) return;

        let itemData = (index > -1) ? { ...siteContent[arrayKey][index] } : {};

        // Formdaki tüm inputları/textarea'ları/select'leri işle
        const inputs = modalFields.querySelectorAll('input, textarea, select');
        for (const input of inputs) {
            const key = input.id.split('-').pop();
            if (input.type === 'checkbox') {
                if (key === 'roller') {
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
                     itemData[key] = input.checked;
                }
            } else if (input.type === 'file') {
                if (input.files && input.files[0]) {
                    const uploadedPath = await uploadImage(input.files[0]);
                    if (uploadedPath) {
                        itemData[key] = uploadedPath;
                    }
                }
            } else if (input.tagName.toLowerCase() === 'select' && input.multiple) {
                 itemData[key] = Array.from(input.selectedOptions).map(option => option.value);
            }
            else {
                // 'id'si 'modal-tur' olanı 'tur' olarak kaydet
                const finalKey = input.id === 'modal-tur' ? 'tur' : key;
                itemData[finalKey] = input.value;
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
            if (!siteContent[arrayKey]) siteContent[arrayKey] = [];
            siteContent[arrayKey].push(itemData);
        }

        if (type === 'ekip') {
             syncEkipToOyuncuHavuzu(itemData);
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
            
            if (type === 'ekip') {
                syncEkipToOyuncuHavuzu(itemToDelete, true); // isDelete = true
            }
            
            saveContent();
        }
    };
    
    const handleAddSezon = () => {
        const sezonAdi = prompt("Yeni sezonun adını girin (Örn: 2023-2024):");
        if (sezonAdi && sezonAdi.trim() !== '') {
            const newSezon = {
                id: `sezon_${Date.now()}`,
                sezon: sezonAdi.trim(),
                aciklama: "",
                icerikler: [] // Yeni esnek içerik dizisi
            };

            if (!siteContent.arsiv) {
                siteContent.arsiv = [];
            }
            siteContent.arsiv.unshift(newSezon); // Yeni sezonu başa ekle
            saveContent();
        }
    };

    const handleOpenModal = (type, index) => {
        currentEdit = { type, index };
        const isNew = index === -1;
        const item = isNew ? {} : siteContent[getArrayKeyFromType(type)][index];
        
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
                    <input type="text" id="modal-tarih" value="${item.tarih || ''}" placeholder="Örn: 1-2 Ocak 2024">
                     <label for="modal-saat">Saat:</label>
                    <input type="text" id="modal-saat" value="${item.saat || ''}" placeholder="Örn: 20:00">
                    <label for="modal-konum">Konum:</label>
                    <input type="text" id="modal-konum" value="${item.konum || ''}" placeholder="Örn: Koç Üniversitesi Sevgi Gönül Oditoryumu">
                     <label for="modal-bilet">Bilet Linki:</label>
                    <input type="url" id="modal-bilet" value="${item.bilet || ''}" placeholder="https://bilet.ix/link">
                    <label for="modal-afis">Afiş:</label>
                    <input type="file" id="modal-afis" accept="image/*">
                    ${item.afis ? `<img src="${item.afis}" alt="Mevcut Afiş" style="max-width: 100px; margin-top: 10px;">` : ''}
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
                `;

                // Add event listeners for dynamic cast rows
                document.getElementById('add-oyuncu-row-btn').addEventListener('click', addOyuncuRow);
                modalFields.querySelectorAll('.remove-oyuncu-btn').forEach(btn => btn.addEventListener('click', (e) => removeOyuncuRow(e.target)));

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
                
                <label for="oyuncu-foto">Fotoğraf Yükle:</label>
                <input type="file" id="oyuncu-foto" accept="image/*">
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
        row.querySelector('.remove-oyuncu-btn').addEventListener('click', (e) => removeOyuncuRow(e.target));
        list.appendChild(row);
    }

    const removeOyuncuRow = (button) => {
        button.closest('.oyuncu-row').remove();
    }

    const closeModal = () => {
        modal.style.display = 'none';
        modalFields.innerHTML = '';
    };

    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        hamburgerBtn.classList.toggle('active');
    };

    // ----------------- DRAG AND DROP -----------------
    let draggedItem = null;
    const addDragAndDropListeners = (list, type) => {
        let draggedItem = null;
        let touchStartY = 0;
        let touchCurrentY = 0;
        let touchItem = null;
        let placeholder = null;

        // Mouse/Desktop drag events
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

        // Touch/Mobile drag events
        list.addEventListener('touchstart', e => {
            if (e.target.closest('.draggable')) {
                // Tüm varsayılan davranışları engelle
                e.preventDefault();
                e.stopPropagation();
                
                touchItem = e.target.closest('.draggable');
                touchStartY = e.touches[0].clientY;
                
                // Context menu ve selection'ı engelle
                touchItem.style.webkitUserSelect = 'none';
                touchItem.style.userSelect = 'none';
                touchItem.style.webkitTouchCallout = 'none';
                
                // Placeholder oluştur
                placeholder = document.createElement('div');
                placeholder.className = 'drag-placeholder';
                placeholder.style.cssText = `
                    height: ${touchItem.offsetHeight}px;
                    background: rgba(128, 0, 32, 0.1);
                    border: 2px dashed var(--bordo);
                    border-radius: 8px;
                    margin: 5px 0;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                `;
                
                // Long press algılama için timer (daha kısa süre)
                touchItem.touchTimer = setTimeout(() => {
                    // Touch item'ı dragging durumuna al
                    touchItem.classList.add('dragging');
                    touchItem.style.position = 'fixed';
                    touchItem.style.zIndex = '1000';
                    touchItem.style.opacity = '0.8';
                    touchItem.style.transform = 'rotate(3deg)';
                    touchItem.style.pointerEvents = 'none';
                    touchItem.style.width = (touchItem.offsetWidth - 20) + 'px'; // Biraz daralt
                    
                    // Placeholder'ı göster
                    list.insertBefore(placeholder, touchItem);
                    placeholder.style.opacity = '1';
                    
                    draggedItem = touchItem;
                    
                    // Haptic feedback (varsa)
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }, 300); // 300ms long press (daha hızlı)
            }
        }, { passive: false });

        list.addEventListener('touchmove', e => {
            // Dragging modunda değilse normal scroll'a izin ver
            if (!draggedItem) {
                return;
            }
            
            if (draggedItem && touchItem) {
                e.preventDefault();
                e.stopPropagation();
                
                touchCurrentY = e.touches[0].clientY;
                
                // Touch item'ı parmağı takip ettir - daha smooth
                const rect = list.getBoundingClientRect();
                draggedItem.style.top = (touchCurrentY - 40) + 'px';
                draggedItem.style.left = (rect.left + 5) + 'px';
                draggedItem.style.right = 'auto';
                
                // Placeholder'ın konumunu güncelle
                const afterElement = getDragAfterElement(list, touchCurrentY);
                if (afterElement == null) {
                    list.appendChild(placeholder);
                } else {
                    list.insertBefore(placeholder, afterElement);
                }
            }
        }, { passive: false });

        list.addEventListener('touchend', e => {
            if (touchItem) {
                e.preventDefault();
                e.stopPropagation();
                
                clearTimeout(touchItem.touchTimer);
                
                if (draggedItem) {
                    // Dragging durumunu temizle
                    draggedItem.classList.remove('dragging');
                    draggedItem.style.position = '';
                    draggedItem.style.zIndex = '';
                    draggedItem.style.opacity = '';
                    draggedItem.style.transform = '';
                    draggedItem.style.pointerEvents = '';
                    draggedItem.style.top = '';
                    draggedItem.style.left = '';
                    draggedItem.style.right = '';
                    draggedItem.style.width = '';
                    draggedItem.style.webkitUserSelect = '';
                    draggedItem.style.userSelect = '';
                    draggedItem.style.webkitTouchCallout = '';
                    
                    // Placeholder'ın yerine gerçek item'ı koy
                    if (placeholder && placeholder.parentNode) {
                        placeholder.parentNode.insertBefore(draggedItem, placeholder);
                        placeholder.remove();
                    }
                    
                    // Sıralamayı güncelle
                    updateOrder(list, type);
                    
                    draggedItem = null;
                }
                
                // Placeholder'ı temizle
                if (placeholder && placeholder.parentNode) {
                    placeholder.remove();
                }
                
                // Touch durumunu temizle
                touchItem = null;
                placeholder = null;
                touchStartY = 0;
                touchCurrentY = 0;
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

        if (list.id === 'one-cikan-oyunlar-list') {
            // "Öne Çıkanlar" listesi güncellendiğinde, tüm oyunlar listesini yeniden sırala.
            // Önce sürüklenen öne çıkanları al, sonra geri kalanları (öne çıkan ama sürüklenmeyenler + öne çıkmayanlar)
            const allOtherItemIds = siteContent.oyunlar
                .map(item => item.id)
                .filter(id => !newOrderedIds.includes(id));
            
            const finalOrderedIds = [...newOrderedIds, ...allOtherItemIds];
            
            const newArray = finalOrderedIds.map(id => 
                siteContent.oyunlar.find(item => item.id === id)
            ).filter(Boolean);

            if (newArray.length === siteContent.oyunlar.length) {
                siteContent.oyunlar = newArray;
            } else {
                showNotification('Öne çıkanlar sıralanırken bir hata oluştu.', 'error');
                return; // Kaydetme ve yeniden render etme.
            }

        } else { 
            // "Tüm Oyunlar" veya "Ekip" gibi tam bir liste güncellendiğinde
            const newArray = newOrderedIds.map(id =>
                siteContent[arrayKey].find(item => item.id === id)
            ).filter(Boolean);

            if (newArray.length === siteContent[arrayKey].length) {
                siteContent[arrayKey] = newArray;
            } else {
                showNotification('Genel sıralama sırasında bir hata oluştu.', 'error');
                return; // Kaydetme ve yeniden render etme.
            }
        }

        saveContent().then(() => {
            // Değişiklikten sonra her iki oyun listesini de senkronize etmek için yeniden render et
            if (arrayKey === 'oyunlar') {
                renderOyunlar();
                renderOneCikanOyunlar();
            }
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
                img: ekipUyesi.img || 'assets/1751453697640-organizator-1881-logo-F1F415.png',
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
});
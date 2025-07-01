document.addEventListener('DOMContentLoaded', () => {
    let siteContent = {};
    let activeSection = 'anasayfa';

    // --- TEMEL İŞLEVSELLİK ---

    const init = async () => {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('Veri çekilemedi.');
            siteContent = await response.json();
            
            setupNavigation();
            // Diğer render fonksiyonları bir sonraki adımda eklenecek
            
        } catch (error) {
            console.error("Panel başlatılırken hata:", error);
            document.body.innerHTML = '<div class="error-screen"><h1>Panel Yüklenemedi</h1><p>Veri çekilirken bir sorun oluştu. Lütfen sunucunun çalıştığından emin olun ve sayfayı yenileyin.</p></div>';
        }
    };

    const setupNavigation = () => {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = e.currentTarget.dataset.target;

                // Zaten aktifse bir şey yapma
                if (e.currentTarget.classList.contains('active') && activeSection === targetId) return;

                activeSection = targetId;

                // Bütün linklerden active sınıfını kaldır
                navLinks.forEach(l => l.classList.remove('active'));

                // Tıklananla aynı hedefi paylaşan tüm linklere active sınıfını ekle
                document.querySelectorAll(`[data-target="${targetId}"]`).forEach(l => l.classList.add('active'));

                // İlgili bölümü göster
                document.querySelectorAll('.panel-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(targetId)?.classList.add('active');
            });
        });
    };

    // --- VERİ DOLDURMA (POPULATE) VE RENDER FONKSİYONLARI (İSKELET) ---
    // Bu fonksiyonların içini bir sonraki adımda dolduracağız.

    const populateAnasayfa = () => {
        const { hero, hakkimizda, iletisim } = siteContent;
        if (hero) {
            document.getElementById('hero-title').value = hero.title || '';
            document.getElementById('hero-subtitle').value = hero.subtitle || '';
        }
        if (hakkimizda) {
            document.getElementById('hakkimizda-text').value = hakkimizda.text || '';
        }
        if (iletisim) {
            document.getElementById('iletisim-instagram').value = iletisim.instagram || '';
            document.getElementById('iletisim-twitter').value = iletisim.twitter || '';
            document.getElementById('iletisim-youtube').value = iletisim.youtube || '';
            document.getElementById('iletisim-adres').value = iletisim.adres || '';
            document.getElementById('iletisim-email').value = iletisim.email || '';
        }
    };
    
    // --- LİSTE OLUŞTURMA ---

    const createListItemHTML = (item, type) => {
        let title = 'Başlık Yok';
        let subtitle = 'Açıklama Yok';
        let imgSrc = 'assets/logo.png';
        let id = item.id;

        switch(type) {
            case 'oyun':
                title = item.ad || title;
                subtitle = item.yonetmen || 'Yönetmen belirtilmemiş';
                imgSrc = item.afis || imgSrc;
                break;
            case 'ekip':
                title = item.ad || title;
                let statuText = '';
                if (item.statu) {
                    statuText = ` (${{aktif: 'Aktif', pasif: 'Pasif', mezun: 'Mezun'}[item.statu] || ''})`;
                }
                subtitle = (item.rol || 'Rol belirtilmemiş') + statuText;
                imgSrc = item.img || imgSrc;
                break;
            case 'arsiv':
                title = `${item.sezon || 'Bilinmeyen'} Sezonu`;
                subtitle = `${item.icerikler?.length || 0} içerik`;
                imgSrc = 'assets/theater.png';
                break;
        }

        return `
            <div class="list-item" data-id="${id}" data-type="${type}">
                <div class="drag-handle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </div>
                <img src="${imgSrc}" class="list-item-preview" alt="preview" onerror="this.src='assets/logo.png';">
                <div class="list-item-info">
                    <span class="list-item-title">${title}</span>
                    <span class="list-item-subtitle">${subtitle}</span>
                </div>
                <div class="list-item-actions">
                    <button class="btn-icon edit-btn" title="Düzenle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="btn-icon delete-btn" title="Sil"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
            </div>
        `;
    };
    
    const renderOyunListeleri = () => {
        const tumOyunlarListesi = document.getElementById('tum-oyunlar-listesi');
        const anasayfaOyunlarListesi = document.getElementById('anasayfa-oyunlar-listesi');
        if (!tumOyunlarListesi || !anasayfaOyunlarListesi || !siteContent.oyunlar) return;

        const anasayfaOyunIdleri = new Set(siteContent.oyunlar.filter(o => o.anasayfadaGoster).map(o => o.id));
        
        tumOyunlarListesi.innerHTML = siteContent.oyunlar
            .filter(oyun => !anasayfaOyunIdleri.has(oyun.id))
            .map(oyun => createListItemHTML(oyun, 'oyun'))
            .join('');

        anasayfaOyunlarListesi.innerHTML = siteContent.oyunlar
            .filter(oyun => anasayfaOyunIdleri.has(oyun.id))
            .sort((a,b) => (siteContent.oyunlar.find(o => o.id === a.id)?.sira || 0) - (siteContent.oyunlar.find(o => o.id === b.id)?.sira || 0)) // Sıralamayı koru
            .map(oyun => createListItemHTML(oyun, 'oyun'))
            .join('');
    };

    const renderEkipListesi = () => {
        const ekipListesi = document.getElementById('ekip-listesi');
        if (!ekipListesi || !siteContent.ekip) return;
        ekipListesi.innerHTML = [...siteContent.ekip]
            .sort((a,b) => (a.sira || 0) - (b.sira || 0)) // Sıralamayı koru
            .map(uye => createListItemHTML(uye, 'ekip'))
            .join('');
    };
    
    const renderArsivListesi = () => {
        const arsivListesi = document.getElementById('arsiv-listesi');
        if (!arsivListesi || !siteContent.arsiv) return;
        arsivListesi.innerHTML = [...siteContent.arsiv]
            .sort((a,b) => (a.sira || 0) - (b.sira || 0)) // Sıralamayı koru
            .map(sezon => createListItemHTML(sezon, 'arsiv'))
            .join('');
    };

    const setupSortableLists = () => {
        const oyunlarOptions = {
            group: 'oyunlar',
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'dragging-ghost',
        };
        new Sortable(document.getElementById('tum-oyunlar-listesi'), oyunlarOptions);
        new Sortable(document.getElementById('anasayfa-oyunlar-listesi'), oyunlarOptions);

        const listOptions = {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'dragging-ghost',
        };
        new Sortable(document.getElementById('ekip-listesi'), listOptions);
        new Sortable(document.getElementById('arsiv-listesi'), listOptions);
    };

    // --- Başlatıcı ---
    init().then(() => {
        setupSortableLists();
        setupActionButtons(); // Event listener'ları başlat
    });

    // --- MODAL VE AKSİYON BUTONLARI ---

    let currentEditInfo = null; // Hangi öğenin düzenlendiğini tutar

    const setupActionButtons = () => {
        // Yeni Ekle Butonları
        document.getElementById('yeni-oyun-btn').addEventListener('click', () => openModal('oyun'));
        document.getElementById('yeni-ekip-uyesi-btn').addEventListener('click', () => openModal('ekip'));
        document.getElementById('yeni-sezon-btn').addEventListener('click', () => openModal('arsiv'));

        // Liste içindeki butonlar (event delegation)
        document.querySelector('.panel-main').addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (editBtn) {
                const listItem = editBtn.closest('.list-item');
                const id = listItem.dataset.id;
                const type = listItem.dataset.type;
                if (type === 'arsiv') {
                    showArsivEditor(id); // Arşiv için yeni editörü aç
                } else {
                    openModal(type, id); // Diğerleri için modal aç
                }
            }
            if (deleteBtn) {
                const listItem = deleteBtn.closest('.list-item');
                const id = listItem.dataset.id;
                const type = listItem.dataset.type;
                handleDeleteItem(type, id, listItem);
            }
        });
        
        // Modal kapatma
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
        document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
        document.getElementById('panel-modal').addEventListener('click', (e) => {
            if (e.target.id === 'panel-modal') {
                closeModal();
            }
        });

        // Modal Kaydet
        document.getElementById('modal-save-btn').addEventListener('click', handleSaveModal);

        // Genel Kaydet
        document.getElementById('save-all-button').addEventListener('click', handleSaveAll);

        // Modal içindeki dinamik butonlar için event delegation
        document.getElementById('modal-body').addEventListener('click', e => {
            if (e.target.id === 'yeni-kadro-ekle-btn') {
                const list = document.getElementById('kadro-listesi');
                list.insertAdjacentHTML('beforeend', createKadroRowHTML({}, list.children.length));
            }
            if (e.target.classList.contains('remove-kadro-btn')) {
                e.target.closest('.kadro-row').remove();
            }
        });

        // Arşiv Editörü Butonları
        document.getElementById('arsiv-editor-geri-btn').addEventListener('click', hideArsivEditor);
        document.getElementById('arsiv-editor-kaydet-btn').addEventListener('click', handleArsivEditorSave);

        // Arşiv editörü içerik ekleme butonları
        document.getElementById('add-metin-btn').addEventListener('click', () => addArsivBlok('metin'));
        document.getElementById('add-galeri-btn').addEventListener('click', () => addArsivBlok('galeri'));
        document.getElementById('add-video-btn').addEventListener('click', () => addArsivBlok('video'));

        // Arşiv editörü içindeki silme butonları
        document.getElementById('arsiv-icerik-listesi').addEventListener('click', e => {
            if (e.target.classList.contains('delete-blok-btn')) {
                e.target.closest('.arsiv-blok').remove();
            }
        });
    };

    const openModal = (type, id = null) => {
        const modal = document.getElementById('panel-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        currentEditInfo = { type, id };
        
        const isNew = id === null;
        let itemData = {};

        // Başlığı ayarla
        const typeName = {
            oyun: 'Oyun',
            ekip: 'Ekip Üyesi',
            arsiv: 'Sezon'
        }[type];
        modalTitle.textContent = `${isNew ? 'Yeni' : 'Düzenle'}: ${typeName}`;

        // Form alanlarını oluştur (bu kısım daha sonra detaylanacak)
        modalBody.innerHTML = createFormFields(type, id);

        modal.style.display = 'flex';
    };

    const closeModal = () => {
        document.getElementById('panel-modal').style.display = 'none';
        currentEditInfo = null;
    };

    const getSourceArrayAndName = (type) => {
        const nameMap = {
            oyun: 'oyunlar',
            ekip: 'ekip',
            arsiv: 'arsiv'
        };
        const arrayName = nameMap[type];
        return {
            name: arrayName,
            array: siteContent[arrayName]
        };
    };

    const handleDeleteItem = (type, id, listItemElement) => {
        if (confirm('Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            const { array: sourceArray } = getSourceArrayAndName(type);
            if (!sourceArray) {
                showNotification('Geçersiz öğe türü.', 'error');
                return;
            }
            const numericId = isNaN(parseInt(id, 10)) ? id : parseInt(id, 10);
            
            const itemIndex = sourceArray.findIndex(item => item.id === numericId);
            if (itemIndex > -1) {
                sourceArray.splice(itemIndex, 1);
                listItemElement.remove();
                showNotification('Öğe başarıyla silindi.', 'success');
            } else {
                showNotification('Öğe bulunamadı ve silinemedi.', 'error');
            }
        }
    };

    const handleSaveModal = async () => {
        const { type, id } = currentEditInfo;
        const isNew = id === null;

        let itemData = {};
        const { array: sourceArray } = getSourceArrayAndName(type);
        if (!sourceArray) {
            showNotification('Geçersiz öğe türü.', 'error');
            return;
        }
        
        if (!isNew) {
            const numericId = isNaN(parseInt(id, 10)) ? id : parseInt(id, 10);
            itemData = sourceArray.find(item => item.id === numericId);
        } else {
            itemData.id = Date.now();
        }

        // Formdan verileri topla
        switch(type) {
            case 'oyun':
                itemData.ad = document.getElementById('modal-ad').value;
                itemData.yonetmen = document.getElementById('modal-yonetmen').value;
                itemData.yazar = document.getElementById('modal-yazar').value;
                itemData.durum = document.getElementById('modal-durum').value;
                itemData.anasayfadaGoster = document.getElementById('modal-anasayfa').checked;
                
                const afisFile = document.getElementById('modal-afis').files[0];
                if (afisFile) {
                    itemData.afis = await uploadImage(afisFile);
                }

                // Kadroyu kaydet
                const kadroRows = document.querySelectorAll('.kadro-row');
                itemData.kadro = Array.from(kadroRows).map(row => ({
                    oyuncuId: parseInt(row.querySelector('.kadro-oyuncu').value, 10),
                    rol: row.querySelector('.kadro-rol').value
                }));
                break;
            case 'ekip':
                itemData.ad = document.getElementById('modal-ad').value;
                itemData.rol = document.getElementById('modal-rol').value;
                itemData.statu = document.getElementById('modal-statu').value;
                
                const imgFile = document.getElementById('modal-img').files[0];
                if (imgFile) {
                    itemData.img = await uploadImage(imgFile);
                }
                break;
            case 'arsiv':
                itemData.sezon = document.getElementById('modal-sezon').value;
                if(isNew) itemData.icerikler = [];
                break;
        }

        if (isNew) {
            sourceArray.push(itemData);
        }

        closeModal();
        rerenderActiveSection();
        showNotification('Öğe başarıyla kaydedildi!', 'success');
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Resim yüklenemedi.');
            const result = await response.json();
            return result.filePath;
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            showNotification('Resim yüklenemedi.', 'error');
            return null;
        }
    };
    
    const handleSaveAll = async () => {
        // Sıralama verilerini güncelle
        updateSortingOrder();

        showNotification('Değişiklikler kaydediliyor...', 'info');
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteContent, null, 2)
            });
            if (!response.ok) throw new Error('Sunucuya kaydedilemedi.');
            showNotification('Tüm değişiklikler başarıyla kaydedildi!', 'success');
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            showNotification('Değişiklikler kaydedilemedi.', 'error');
        }
    };

    const updateSortingOrder = () => {
        // Her liste için sıralamayı güncelle
        document.querySelectorAll('.sortable-list').forEach(list => {
            const type = list.id.includes('oyun') ? 'oyun' : (list.id.includes('ekip') ? 'ekip' : 'arsiv');
            const { name: sourceArrayName, array: sourceArray } = getSourceArrayAndName(type);
            if (!sourceArray) return;
            
            Array.from(list.children).forEach((item, index) => {
                const id = isNaN(parseInt(item.dataset.id, 10)) ? item.dataset.id : parseInt(item.dataset.id, 10);
                const dataItem = sourceArray.find(d => d.id === id);
                if(dataItem) dataItem.sira = index;
            });
        });

        // Oyunlar için anasayfa durumunu güncelle
        const anasayfaOyunIds = new Set(Array.from(document.getElementById('anasayfa-oyunlar-listesi').children).map(item => item.dataset.id));
        siteContent.oyunlar.forEach(oyun => {
            oyun.anasayfadaGoster = anasayfaOyunIds.has(oyun.id.toString());
        });
    };

    const rerenderActiveSection = () => {
        switch(activeSection) {
            case 'oyunlar': renderOyunListeleri(); break;
            case 'ekip': renderEkipListesi(); break;
            case 'arsiv': renderArsivListesi(); break;
        }
    };

    const showNotification = (message, type = 'info') => {
        // Basit bir bildirim mekanizması. Daha sonra CSS ile güzelleştirilebilir.
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    const createFormFields = (type, id) => {
        const isNew = id === null;
        let data = {};
        if (!isNew) {
            // Mevcut veriyi bul
            const { array: sourceArray } = getSourceArrayAndName(type);
            if (sourceArray) {
                const numericId = isNaN(parseInt(id, 10)) ? id : parseInt(id, 10);
                data = sourceArray.find(item => item.id === numericId) || {};
            }
        }

        let fieldsHTML = '';
        const commonFields = `
            <div class="form-group">
                <label for="modal-ad">Ad / Başlık</label>
                <input type="text" id="modal-ad" class="form-control" value="${data.ad || ''}">
            </div>
        `;

        switch(type) {
            case 'oyun':
                const kadroHTML = (data.kadro || []).map((uye, index) => createKadroRowHTML(uye, index)).join('');
                
                fieldsHTML = `
                    ${commonFields}
                    <div class="form-group">
                        <label for="modal-yonetmen">Yönetmen</label>
                        <input type="text" id="modal-yonetmen" class="form-control" value="${data.yonetmen || ''}">
                    </div>
                    <div class="form-group">
                        <label for="modal-yazar">Yazar</label>
                        <input type="text" id="modal-yazar" class="form-control" value="${data.yazar || ''}">
                    </div>
                    <div class="form-group">
                        <label for="modal-afis">Afiş Yükle (Değiştirmek için)</label>
                        <input type="file" id="modal-afis" class="form-control" accept="image/*">
                        ${data.afis ? `<img src="${data.afis}" class="modal-preview-img">` : ''}
                    </div>
                    <div class="form-group">
                        <label for="modal-durum">Durum</label>
                        <select id="modal-durum" class="form-control">
                            <option value="yaklasan" ${data.durum === 'yaklasan' ? 'selected' : ''}>Yaklaşan</option>
                            <option value="bitmis" ${data.durum === 'bitmis' ? 'selected' : ''}>Bitmiş / Oynanmış</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="modal-anasayfa" ${data.anasayfadaGoster ? 'checked' : ''}>
                            Ana Sayfada Öne Çıkar
                        </label>
                    </div>
                    <div class="form-group">
                        <h4>Oyuncu Kadrosu</h4>
                        <div id="kadro-listesi">
                            ${kadroHTML}
                        </div>
                        <button type="button" id="yeni-kadro-ekle-btn" class="btn btn-secondary">Yeni Oyuncu Ekle</button>
                    </div>
                `;
                break;
            case 'ekip':
                fieldsHTML = `
                    ${commonFields}
                    <div class="form-group">
                        <label for="modal-rol">Rol / Görev</label>
                        <input type="text" id="modal-rol" class="form-control" value="${data.rol || ''}">
                    </div>
                    <div class="form-group">
                        <label for="modal-img">Fotoğraf Yükle (Değiştirmek için)</label>
                        <input type="file" id="modal-img" class="form-control" accept="image/*">
                         ${data.img ? `<img src="${data.img}" class="modal-preview-img">` : ''}
                    </div>
                    <div class="form-group">
                        <label for="modal-statu">Statü</label>
                        <select id="modal-statu" class="form-control">
                            <option value="aktif" ${data.statu === 'aktif' ? 'selected' : ''}>Aktif Üye</option>
                            <option value="pasif" ${data.statu === 'pasif' ? 'selected' : ''}>Pasif Üye</option>
                            <option value="mezun" ${data.statu === 'mezun' ? 'selected' : ''}>Mezun</option>
                        </select>
                    </div>
                `;
                break;
            case 'arsiv':
                 fieldsHTML = `
                    <div class="form-group">
                        <label for="modal-sezon">Sezon Adı</label>
                        <input type="text" id="modal-sezon" class="form-control" value="${data.sezon || 'örn: 2023-2024'}">
                    </div>
                `;
                break;
        }
        return fieldsHTML;
    };

    const createKadroRowHTML = (uye = {}, index) => {
        const oyuncularOptions = siteContent.ekip.map(p => 
            `<option value="${p.id}" ${uye.oyuncuId === p.id ? 'selected' : ''}>${p.ad}</option>`
        ).join('');

        return `
            <div class="kadro-row" data-index="${index}">
                <select class="form-control kadro-oyuncu">${oyuncularOptions}</select>
                <input type="text" class="form-control kadro-rol" placeholder="Karakter Adı" value="${uye.rol || ''}">
                <button type="button" class="btn btn-danger remove-kadro-btn">&times;</button>
            </div>
        `;
    };

    // --- ARŞİV EDİTÖRÜ FONKSİYONLARI ---
    let currentArsivId = null;

    const showArsivEditor = (id) => {
        currentArsivId = id;
        document.querySelector('.panel-main').style.display = 'none';
        const editor = document.getElementById('arsiv-detay-editoru');
        editor.style.display = 'block';

        const numericId = isNaN(parseInt(id, 10)) ? id : parseInt(id, 10);
        const sezonData = siteContent.arsiv.find(s => s.id === numericId);
        
        document.getElementById('arsiv-editor-baslik').textContent = `${sezonData.sezon} Sezonu İçerikleri`;
        renderArsivIcerikleri(sezonData.icerikler || []);
    };

    const hideArsivEditor = () => {
        currentArsivId = null;
        document.querySelector('.panel-main').style.display = 'block';
        document.getElementById('arsiv-detay-editoru').style.display = 'none';
        renderArsivListesi(); // Ana listeyi yenile
    };

    const renderArsivIcerikleri = (icerikler) => {
        const liste = document.getElementById('arsiv-icerik-listesi');
        liste.innerHTML = icerikler.map((icerik, index) => {
            switch(icerik.tip) {
                case 'metin': return createMetinBlokHTML(icerik, index);
                case 'video': return createVideoBlokHTML(icerik, index);
                case 'galeri': return createGaleriBlokHTML(icerik, index);
                default: return '';
            }
        }).join('');
    };

    const createMetinBlokHTML = (icerik, index) => {
        return `
            <div class="arsiv-blok" data-index="${index}" data-tip="metin">
                <div class="blok-header">
                    <strong>Metin Bloğu</strong>
                    <button class="btn-icon delete-blok-btn">&times;</button>
                </div>
                <textarea class="form-control" rows="5">${icerik.icerik || ''}</textarea>
            </div>
        `;
    };

    const createVideoBlokHTML = (icerik, index) => {
        return `
            <div class="arsiv-blok" data-index="${index}" data-tip="video">
                <div class="blok-header"><strong>Video Bloğu</strong><button class="btn-icon delete-blok-btn">&times;</button></div>
                <input type="url" class="form-control" placeholder="Youtube veya Vimeo linki" value="${icerik.url || ''}">
            </div>
        `;
    };

    const createGaleriBlokHTML = (icerik, index) => {
        const mevcutResimlerHTML = (icerik.resimler || []).map(r => `
            <div class="galeri-resim-onizleme">
                <img src="${r}" alt="önizleme">
                <button class="delete-resim-btn" data-path="${r}">&times;</button>
            </div>
        `).join('');

        return `
            <div class="arsiv-blok" data-index="${index}" data-tip="galeri">
                <div class="blok-header"><strong>Galeri Bloğu</strong><button class="btn-icon delete-blok-btn">&times;</button></div>
                <div class="galeri-mevcut-resimler">${mevcutResimlerHTML}</div>
                <label>Yeni Resim Ekle:</label>
                <input type="file" class="form-control" multiple accept="image/*">
            </div>
        `;
    };

    const handleArsivEditorSave = async () => {
        const numericId = isNaN(parseInt(currentArsivId, 10)) ? currentArsivId : parseInt(currentArsivId, 10);
        const sezonData = siteContent.arsiv.find(s => s.id === numericId);
        if (!sezonData) return;

        const icerikBloklari = document.querySelectorAll('#arsiv-icerik-listesi .arsiv-blok');
        const yeniIcerikler = [];

        for (const blok of icerikBloklari) {
            const tip = blok.dataset.tip;
            let icerikData = { tip };
            if (tip === 'metin') {
                icerikData.icerik = blok.querySelector('textarea').value;
            } else if (tip === 'video') {
                icerikData.url = blok.querySelector('input').value;
            } else if (tip === 'galeri') {
                const mevcutResimler = sezonData.icerikler[blok.dataset.index]?.resimler || [];
                const yeniResimDosyalari = blok.querySelector('input[type="file"]').files;
                let yuklenenResimYollari = [];

                if (yeniResimDosyalari.length > 0) {
                    for (const file of yeniResimDosyalari) {
                        const path = await uploadImage(file);
                        if(path) yuklenenResimYollari.push(path);
                    }
                }
                icerikData.resimler = [...mevcutResimler, ...yuklenenResimYollari];
            }
            yeniIcerikler.push(icerikData);
        }

        sezonData.icerikler = yeniIcerikler;
        showNotification('Sezon başarıyla kaydedildi!', 'success');
    };

    const addArsivBlok = (tip) => {
        const liste = document.getElementById('arsiv-icerik-listesi');
        let html = '';
        if (tip === 'metin') html = createMetinBlokHTML({}, liste.children.length);
        if (tip === 'video') html = createVideoBlokHTML({}, liste.children.length);
        if (tip === 'galeri') html = createGaleriBlokHTML({}, liste.children.length);
        liste.insertAdjacentHTML('beforeend', html);
    };

});

// CSS'e eklenecekler:
// .notification { position: fixed; bottom: 20px; right: 20px; padding: 15px; border-radius: 8px; color: white; z-index: 9999; }
// .notification.info { background-color: #0d6efd; }
// .notification.success { background-color: #198754; }
// .notification.error { background-color: #dc3545; }
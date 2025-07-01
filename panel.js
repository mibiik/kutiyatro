// Yeni, modern ve temiz panel.js içeriği buraya gelecek. 

document.addEventListener('DOMContentLoaded', () => {
    let siteContent = {};
    let oyunlarList, anasayfaOyunlarList, ekipList; // SortableJS instance'ları

    // --- SEKMELİ NAVİGASYON ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const mainHeader = document.querySelector('.main-header h1');

    const switchSection = (targetId = 'genel-section') => {
        navLinks.forEach(l => l.classList.remove('active'));
        contentSections.forEach(s => s.classList.remove('active'));

        const targetLink = document.querySelector(`.nav-link[data-section="${targetId}"]`);
        const targetSection = document.getElementById(targetId);

        if (targetLink && targetSection) {
            targetLink.classList.add('active');
            targetSection.classList.add('active');
            mainHeader.textContent = targetLink.textContent;
        } else {
            // Eğer hedef bulunamazsa varsayılan olarak ilk sekmeyi göster
            navLinks[0].classList.add('active');
            contentSections[0].classList.add('active');
            mainHeader.textContent = navLinks[0].textContent;
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('data-section');
            window.location.hash = targetSectionId.replace('-section', '');
            switchSection(targetSectionId);
        });
    });

    const loadSectionFromHash = () => {
        const hash = window.location.hash.substring(1);
        const sectionId = hash ? `${hash}-section` : 'genel-section';
        switchSection(sectionId);
    };


    // --- VERİ YÜKLEME VE KAYDETME ---
    const fetchContent = async () => {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('Sunucudan veri alınamadı.');
            siteContent = await response.json();
            populateAllSections();
        } catch (error) {
            console.error("Panel içeriği yüklenirken hata:", error);
            showNotification('Panel verileri yüklenemedi.', 'error');
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
            showNotification('Tüm değişiklikler başarıyla kaydedildi!', 'success');
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            showNotification(`Kaydetme başarısız: ${error.message}`, 'error');
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


    // --- BÖLÜMLERİ DOLDURAN FONKSİYONLAR ---
    const populateAllSections = () => {
        populateIletisim();
        populateAnasayfa();
        renderOyunList();
        renderEkipList();
        renderArsivList();
        initializeSortables();
    };

    const populateIletisim = () => {
        const iletisim = siteContent.iletisim || {};
        document.getElementById('iletisim-instagram').value = iletisim.instagram || '';
        document.getElementById('iletisim-twitter').value = iletisim.twitter || '';
        document.getElementById('iletisim-youtube').value = iletisim.youtube || '';
        document.getElementById('iletisim-email').value = iletisim.email || '';
        document.getElementById('iletisim-adres').value = iletisim.adres || '';
    };

    const populateAnasayfa = () => {
        const hero = siteContent.hero || {};
        const hakkimizda = siteContent.hakkimizda || {};
        document.getElementById('hero-title').value = hero.title || '';
        document.getElementById('hero-subtitle').value = hero.subtitle || '';
        document.getElementById('hakkimizda-text').value = hakkimizda.text || '';
    };

    const renderOyunList = () => {
        const oyunListContainer = document.getElementById('oyun-listesi-yonetim');
        const anasayfaOyunListContainer = document.getElementById('anasayfa-oyun-listesi');
        
        oyunListContainer.innerHTML = '';
        anasayfaOyunListContainer.innerHTML = '';

        (siteContent.oyunlar || []).forEach(oyun => {
            oyunListContainer.innerHTML += createListItemHTML(oyun, 'oyun');
        });

        const anasayfaSiralamasi = siteContent.anasayfa_oyunlar_siralamasi || [];
        const siraliAnasayfaOyunlari = anasayfaSiralamasi
            .map(id => (siteContent.oyunlar || []).find(oyun => oyun.id === id))
            .filter(Boolean);

        const kalanAnasayfaOyunlari = (siteContent.oyunlar || []).filter(oyun => 
            oyun.anasayfadaGoster && oyun.durum === 'bitmis' && !anasayfaSiralamasi.includes(oyun.id)
        );
        
        const tumAnasayfaOyunlari = [...siraliAnasayfaOyunlari, ...kalanAnasayfaOyunlari];
        
        tumAnasayfaOyunlari.forEach(oyun => {
            anasayfaOyunListContainer.innerHTML += createListItemHTML(oyun, 'oyun-anasayfa');
        });
    };
    
    const renderEkipList = () => {
        const ekipListContainer = document.getElementById('ekip-listesi-yonetim');
        ekipListContainer.innerHTML = '';
        (siteContent.ekip || []).forEach(uye => {
            ekipListContainer.innerHTML += createListItemHTML(uye, 'ekip');
        });
    };
    
    const renderArsivList = () => {
        const arsivContainer = document.getElementById('arsiv-listesi-yonetim');
        arsivContainer.innerHTML = (siteContent.arsiv || []).map(sezon => `
            <div class="list-item">
                <div class="item-info">
                    <div class="item-title">${sezon.sezon} Sezonu</div>
                    <div class="item-subtitle">${sezon.aciklama || 'Açıklama yok'}</div>
                </div>
                <div class="item-actions">
                    <a href="sezon-detay.html?id=${sezon.id}" class="edit-btn" style="color:white; background-color:#3b82f6; text-decoration:none; padding:8px 12px; border-radius:6px;">Düzenle</a>
                </div>
            </div>
        `).join('');
    };

    const createListItemHTML = (item, type) => {
        const isAnasayfa = type === 'oyun-anasayfa';
        const title = item.ad || 'İsimsiz';
        const subtitle = item.rol || item.yonetmen || 'Detay Yok';
        const previewImg = item.img || item.afis || 'assets/logo.png';
        const id = item.id;

        return `
            <div class="list-item" data-id="${id}">
                <span class="item-handle">☰</span>
                <img src="${previewImg}" alt="${title}" class="item-preview" onerror="this.src='assets/logo.png'">
                <div class="item-info">
                    <div class="item-title">${title}</div>
                    <div class="item-subtitle">${subtitle}</div>
                </div>
                ${!isAnasayfa ? `
                <div class="item-actions">
                    <button class="edit-btn" onclick="openEditModal('${type}', ${id})">Düzenle</button>
                    <button class="delete-btn" onclick="deleteItem('${type}', ${id})">Sil</button>
                </div>` : ''}
            </div>
        `;
    };


    // --- SIRALAMA (SORTABLEJS) ---
    const initializeSortables = () => {
        if (oyunlarList) oyunlarList.destroy();
        if (anasayfaOyunlarList) anasayfaOyunlarList.destroy();
        if (ekipList) ekipList.destroy();

        const oyunListEl = document.getElementById('oyun-listesi-yonetim');
        oyunlarList = new Sortable(oyunListEl, {
            animation: 150, handle: '.item-handle', onEnd: () => {
                const newOrder = Array.from(oyunListEl.children).map(el => parseInt(el.dataset.id));
                siteContent.oyunlar.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
                showNotification('Oyun sıralaması güncellendi.', 'success');
            }
        });

        const anasayfaListEl = document.getElementById('anasayfa-oyun-listesi');
        anasayfaOyunlarList = new Sortable(anasayfaListEl, {
            animation: 150, handle: '.item-handle', onEnd: () => {
                const newOrder = Array.from(anasayfaListEl.children).map(el => parseInt(el.dataset.id));
                siteContent.anasayfa_oyunlar_siralamasi = newOrder;
                showNotification('Ana sayfa oyun sıralaması güncellendi.', 'success');
            }
        });

        const ekipListEl = document.getElementById('ekip-listesi-yonetim');
        ekipList = new Sortable(ekipListEl, {
            animation: 150, handle: '.item-handle', onEnd: () => {
                const newOrder = Array.from(ekipListEl.children).map(el => parseInt(el.dataset.id));
                siteContent.ekip.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
                showNotification('Ekip sıralaması güncellendi.', 'success');
            }
        });
    };
    
    
    // --- GENEL OLAY DİNLEYİCİLERİ ---
    document.getElementById('save-all-button').addEventListener('click', async () => {
        const iletisim = siteContent.iletisim || {};
        iletisim.instagram = document.getElementById('iletisim-instagram').value;
        iletisim.twitter = document.getElementById('iletisim-twitter').value;
        iletisim.youtube = document.getElementById('iletisim-youtube').value;
        iletisim.email = document.getElementById('iletisim-email').value;
        iletisim.adres = document.getElementById('iletisim-adres').value;
        siteContent.iletisim = iletisim;

        const hero = siteContent.hero || {};
        hero.title = document.getElementById('hero-title').value;
        hero.subtitle = document.getElementById('hero-subtitle').value;
        siteContent.hero = hero;
        
        const hakkimizda = siteContent.hakkimizda || {};
        hakkimizda.text = document.getElementById('hakkimizda-text').value;
        siteContent.hakkimizda = hakkimizda;

        await saveContent();
    });

    document.getElementById('add-member-button').addEventListener('click', async () => {
        const ad = document.getElementById('ekip-ad').value;
        const rol = document.getElementById('ekip-rol').value;
        const imgFile = document.getElementById('ekip-img').files[0];

        if (!ad) {
            showNotification('Ekip üyesi adı boş bırakılamaz.', 'error');
            return;
        }

        let imgPath = 'assets/pngegg.png';
        if (imgFile) {
            const uploadedPath = await uploadImage(imgFile);
            if (uploadedPath) imgPath = uploadedPath;
        }

        const yeniUye = { id: Date.now(), ad, rol, img: imgPath };
        if (!siteContent.ekip) siteContent.ekip = [];
        siteContent.ekip.push(yeniUye);
        await saveContent();
        renderEkipList();
        document.getElementById('yeni-ekip-form').reset();
    });

    // --- YARDIMCI FONKSİYONLAR ---
    window.showNotification = (message, type) => {
        const notification = document.getElementById('notification');
        if (!notification) return;
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => notification.classList.remove('show'), 3000);
    };

    window.openEditModal = (type, id) => {
        console.log(`Düzenleme isteniyor: ${type} - ${id}`);
        showNotification('Düzenleme fonksiyonu henüz tamamlanmadı.', 'error');
    };

    window.deleteItem = async (type, id) => {
        if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
        
        if (type === 'ekip') {
            siteContent.ekip = siteContent.ekip.filter(item => item.id !== id);
            renderEkipList();
        } else if (type === 'oyun') {
            siteContent.oyunlar = siteContent.oyunlar.filter(item => item.id !== id);
            renderOyunList();
        }
        await saveContent();
        showNotification('Öğe başarıyla silindi.', 'success');
    };

    // --- BAŞLATMA ---
    fetchContent();
    loadSectionFromHash();
}); 
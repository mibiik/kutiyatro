document.addEventListener('DOMContentLoaded', () => {

    // --- Global Değişkenler ---
    let siteContent = {};
    let currentSeasonId = null;
    let currentSeason = null;
    let currentEdit = { type: null, index: -1 };

    // --- Element Referansları ---
    const seasonTitleEl = document.getElementById('sezon-baslik');
    const contentBlocksContainer = document.getElementById('content-blocks-container');
    const addContentBlockBtn = document.getElementById('add-content-block-btn');
    
    const sezonDetayBaslik = document.getElementById('sezon-detay-baslik');
    const sezonInfoForm = document.getElementById('sezon-info-form');
    const sezonBaslikInput = document.getElementById('sezon-baslik-input');
    const sezonAciklamaInput = document.getElementById('sezon-aciklama-input');
    
    const sezonOyunlarList = document.getElementById('sezon-oyunlar-list');
    const addPlayButton = document.getElementById('add-play-button');

    const sezonFotografGalerisi = document.getElementById('sezon-fotograf-galerisi');
    const addPhotosInput = document.getElementById('add-photos-input');
    const uploadPhotosButton = document.getElementById('upload-photos-button');

    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const modalFields = document.getElementById('modal-fields');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const notificationContainer = document.getElementById('notification-container');

    // --- Bildirim Fonksiyonu ---
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // --- API & Veri İşlemleri ---
    const init = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        currentSeasonId = urlParams.get('id');

        if (!currentSeasonId) {
            seasonTitleEl.textContent = 'HATA: Sezon ID\'si bulunamadı.';
            return;
        }
        
        await fetchContent();
    };

    const fetchContent = async () => {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('İçerik sunucudan alınamadı.');
            siteContent = await response.json();
            
            currentSeason = siteContent.arsiv.find(s => s.id === currentSeasonId);

            if (!currentSeason) {
                seasonTitleEl.textContent = `HATA: ${currentSeasonId} ID'li sezon bulunamadı.`;
                return;
            }

            renderPage();
        } catch (error) {
            console.error('Failed to fetch content:', error);
            showNotification('İçerik yüklenemedi.', 'error');
        }
    };

    const saveContent = async () => {
        // Find the index of the current season in the main content and update it
        const seasonIndex = siteContent.arsiv.findIndex(s => s.id === currentSeasonId);
        if (seasonIndex > -1) {
            siteContent.arsiv[seasonIndex] = currentSeason;
        } else {
             showNotification('Sezon kaydedilirken bir hata oluştu.', 'error');
             return;
        }

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

    // --- Render Fonksiyonları ---
    const renderPage = () => {
        seasonTitleEl.textContent = `${currentSeason.sezon} Sezonu`;
        sezonDetayBaslik.textContent = currentSeason.sezon;
        sezonBaslikInput.value = currentSeason.sezon;
        sezonAciklamaInput.value = currentSeason.aciklama;
        renderContentBlocks();
        renderOyunlar();
        renderFotograflar();
    };
    
    const renderContentBlocks = () => {
        contentBlocksContainer.innerHTML = '';
        if (!currentSeason.icerikler || currentSeason.icerikler.length === 0) {
            contentBlocksContainer.innerHTML = '<p class="empty-state">Bu sezona henüz içerik eklenmemiş.</p>';
            return;
        }

        currentSeason.icerikler.forEach((block, index) => {
            const blockEl = createContentBlockElement(block, index);
            contentBlocksContainer.appendChild(blockEl);
        });
    };

    const createContentBlockElement = (block, index) => {
        const div = document.createElement('div');
        div.className = 'content-block-item'; // Add styling for this class
        div.dataset.index = index;

        let contentHtml = `<h4>${block.baslik || 'Başlıksız'} <span class="block-type-badge">${block.tip}</span></h4>`;
        
        switch(block.tip) {
            case 'oyun':
                contentHtml += `<p><strong>Yönetmen:</strong> ${block.yonetmen || '-'}</p>`;
                break;
            case 'galeri':
                 contentHtml += `<p>${block.fotograflar?.length || 0} fotoğraf</p>`;
                break;
            case 'video':
                contentHtml += `<p><a href="${block.videoUrl}" target="_blank">${block.videoUrl}</a></p>`;
                break;
            case 'metin':
                contentHtml += `<p>${block.metin?.substring(0, 100) || ''}...</p>`;
                break;
        }

        div.innerHTML = `
            <div class="block-info">${contentHtml}</div>
            <div class="block-actions">
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
                <i class="fas fa-grip-vertical drag-handle"></i>
            </div>
        `;

        div.querySelector('.edit-btn').addEventListener('click', () => handleOpenModal(block.tip, index));
        div.querySelector('.delete-btn').addEventListener('click', () => handleDeleteBlock(index));

        return div;
    };

    function renderOyunlar() {
        sezonOyunlarList.innerHTML = '';
        currentSeason.oyunlar.forEach(oyun => {
            const item = document.createElement('div');
            item.className = 'play-list-item';
            item.innerHTML = `
                <img src="../${oyun.img}" alt="${oyun.ad}">
                <div class="play-info">
                    <strong>${oyun.ad}</strong><br>
                    <small>${oyun.yazar || ''}</small>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${oyun.id}">Düzenle</button>
                    <button class="delete-btn" data-id="${oyun.id}">Sil</button>
                </div>`;
            sezonOyunlarList.appendChild(item);
        });
    }

    function renderFotograflar() {
        sezonFotografGalerisi.innerHTML = '';
        currentSeason.fotograflar.forEach((photoPath, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-gallery-item';
            photoItem.innerHTML = `
                <img src="${photoPath}" alt="Önizleme" class="photo-preview">
                <span class="photo-path">${photoPath}</span>
                <button class="delete-photo-btn" data-index="${index}">&times;</button>
            `;
            sezonFotografGalerisi.appendChild(photoItem);
        });
    }

    // --- Modal ve Form İşlemleri ---
    const handleOpenModal = (type, index) => {
        // This will be complex and will be implemented in the next steps
        showNotification('Düzenleme fonksiyonu yakında eklenecektir.', 'info');
    };
    
    addContentBlockBtn.addEventListener('click', () => {
        // This will also be implemented
         showNotification('Yeni blok ekleme fonksiyonu yakında eklenecektir.', 'info');
    });

    const handleDeleteBlock = (index) => {
        if(confirm('Bu içerik bloğunu silmek istediğinizden emin misiniz?')) {
            currentSeason.icerikler.splice(index, 1);
            saveContent();
        }
    };

    // --- Olay Dinleyicileri ---
    sezonInfoForm.addEventListener('submit', e => {
        e.preventDefault();
        currentSeason.sezon = sezonBaslikInput.value;
        currentSeason.aciklama = sezonAciklamaInput.value;
        seasonTitleEl.textContent = `${currentSeason.sezon} Sezonu`;
        saveContent();
    });

    uploadPhotosButton.addEventListener('click', async () => {
        const files = addPhotosInput.files;
        if (files.length === 0) return showNotification('Lütfen önce dosya seçin.', 'error');
        
        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const response = await fetch('/api/upload', { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Resim yüklenemedi.');
                currentSeason.fotograflar.push(result.filePath);
            } catch (error) {
                showNotification(`Hata: ${error.message}`, 'error');
            }
        }
        addPhotosInput.value = ''; // Input'u temizle
        renderFotograflar();
        saveContent();
    });

    sezonFotografGalerisi.addEventListener('click', e => {
        if (e.target.classList.contains('delete-photo-btn')) {
            const index = parseInt(e.target.dataset.index);
            currentSeason.fotograflar.splice(index, 1);
            renderFotograflar();
            saveContent();
        }
    });

    addPlayButton.addEventListener('click', () => openOyunModal());
    modalCloseBtn.addEventListener('click', closeModal);
    modalForm.addEventListener('submit', (e) => { e.preventDefault(); handleModalSave(); });
    
    sezonOyunlarList.addEventListener('click', e => {
        const target = e.target;
        if(target.classList.contains('edit-btn')) {
            const oyunId = parseInt(target.dataset.id);
            openOyunModal(oyunId);
        } else if (target.classList.contains('delete-btn')) {
            const oyunId = parseInt(target.dataset.id);
            currentSeason.oyunlar = currentSeason.oyunlar.filter(o => o.id !== oyunId);
            renderOyunlar();
            saveContent();
        }
    });

    // --- Başlangıç ---
    init();
}); 
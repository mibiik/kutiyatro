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

    // --- Render Fonksiyonları ---
    const renderPage = () => {
        if (!currentSeason) {
            console.error("Render edilecek sezon bulunamadı.");
            return;
        }
        seasonTitleEl.textContent = `${currentSeason.sezon} Sezonu`;
        sezonBaslikInput.value = currentSeason.sezon;
        sezonAciklamaInput.value = currentSeason.aciklama;
        renderContentBlocks();
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

    // --- MODAL VE FORM HANDLING ---
    const handleOpenModal = (type, index = -1) => {
        currentEdit = { type, index };
        const isNew = index === -1;
        const item = isNew ? {} : currentSeason.icerikler[index];

        modalTitle.textContent = `${isNew ? 'Yeni' : 'Düzenle'}: ${type.charAt(0).toUpperCase() + type.slice(1)} Bloğu`;
        let fieldsHtml = `<label for="modal-baslik">Blok Başlığı:</label><input type="text" id="modal-baslik" value="${item.baslik || ''}" required>`;
        
        switch(type) {
            case 'oyun':
                fieldsHtml += `
                    <label for="modal-yonetmen">Yönetmen:</label>
                    <input type="text" id="modal-yonetmen" value="${item.yonetmen || ''}">
                    <label for="modal-yazar">Yazar:</label>
                    <input type="text" id="modal-yazar" value="${item.yazar || ''}">
                    <label for="modal-afis">Afiş:</label>
                    <input type="file" id="modal-afis" accept="image/*">
                    ${item.afis ? `<img src="${item.afis}" alt="Mevcut Afiş" style="max-width: 100px; margin-top: 10px;">` : ''}
                `;
                break;
            case 'galeri':
                fieldsHtml += `
                    <label for="modal-fotograflar">Yeni Fotoğraflar Yükle (mevcutları korur):</label>
                    <input type="file" id="modal-fotograflar" accept="image/*" multiple>
                    <label>Mevcut Fotoğraflar:</label>
                    <div class="gallery-preview">
                        ${(item.fotograflar || []).map(p => `<div class="gallery-preview-item"><img src="${p}" alt="Galeri fotoğrafı"></div>`).join('')}
                    </div>
                `;
                break;
            case 'video':
                 fieldsHtml += `<label for="modal-videoUrl">YouTube Video URL:</label><input type="url" id="modal-videoUrl" value="${item.videoUrl || ''}" placeholder="https://www.youtube.com/watch?v=...">`;
                break;
            case 'metin':
                fieldsHtml += `<label for="modal-metin">Metin İçeriği:</label><textarea id="modal-metin" rows="8">${item.metin || ''}</textarea>`;
                break;
        }

        modalFields.innerHTML = fieldsHtml;
        modal.style.display = 'flex';
    };
    
    const promptBlockType = () => {
        modalTitle.textContent = "Yeni İçerik Bloğu Türü Seçin";
        modalFields.innerHTML = `
            <div class="block-type-selection">
                <button data-type="oyun"><i class="fas fa-theater-masks"></i> Oyun</button>
                <button data-type="galeri"><i class="fas fa-images"></i> Fotoğraf Galerisi</button>
                <button data-type="video"><i class="fab fa-youtube"></i> Video</button>
                <button data-type="metin"><i class="fas fa-align-left"></i> Metin</button>
            </div>
        `;
        modalForm.querySelector('.modal-actions').style.display = 'none';
        modal.style.display = 'flex';

        document.querySelectorAll('.block-type-selection button').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                modalForm.querySelector('.modal-actions').style.display = 'flex';
                handleOpenModal(type);
            }, { once: true });
        });
    };

    const handleDeleteBlock = (index) => {
        if (!currentSeason || !currentSeason.icerikler) return;

        const block = currentSeason.icerikler[index];
        if (confirm(`'${block.baslik || 'Başlıksız'}' bloğunu silmek istediğinizden emin misiniz?`)) {
            currentSeason.icerikler.splice(index, 1);
            saveContent();
        }
    };

    // --- EVENT LISTENERS ---

    // Sezon başlığını ve açıklamasını kaydetmek için
    sezonInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentSeason) {
            showNotification('Kaydedilecek sezon bulunamadı. Sayfayı yenileyin.', 'error');
            return;
        }
        currentSeason.sezon = sezonBaslikInput.value;
        currentSeason.aciklama = sezonAciklamaInput.value;
        saveContent();
    });

    // Modal formunu kaydetmek için
    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentSeason) {
            showNotification('Kaydedilecek sezon bulunamadı. Sayfayı yenileyin.', 'error');
            return;
        }

        const { type, index } = currentEdit;
        const isNew = index === -1;
        let itemData = isNew ? { tip: type } : { ...currentSeason.icerikler[index] };

        // Form alanlarını işle
        itemData.baslik = modalFields.querySelector('#modal-baslik')?.value || '';
        
        switch (type) {
            case 'oyun':
                itemData.yonetmen = modalFields.querySelector('#modal-yonetmen')?.value || '';
                itemData.yazar = modalFields.querySelector('#modal-yazar')?.value || '';
                const afisInput = modalFields.querySelector('#modal-afis');
                if (afisInput && afisInput.files[0]) {
                    const uploadedPath = await uploadImage(afisInput.files[0]);
                    if (uploadedPath) itemData.afis = uploadedPath;
                }
                break;
            case 'galeri':
                 const fotoInput = modalFields.querySelector('#modal-fotograflar');
                 if (fotoInput && fotoInput.files.length > 0) {
                     if (!itemData.fotograflar) itemData.fotograflar = [];
                     for (const file of fotoInput.files) {
                         const uploadedPath = await uploadImage(file);
                         if (uploadedPath) itemData.fotograflar.push(uploadedPath);
                     }
                 }
                break;
            case 'video':
                itemData.videoUrl = modalFields.querySelector('#modal-videoUrl')?.value || '';
                break;
            case 'metin':
                itemData.metin = modalFields.querySelector('#modal-metin')?.value || '';
                break;
        }

        if (isNew) {
            if (!currentSeason.icerikler) currentSeason.icerikler = [];
            currentSeason.icerikler.push(itemData);
        } else {
            currentSeason.icerikler[index] = itemData;
        }

        await saveContent();
        closeModal();
    });
    
    // Yeni içerik bloğu ekleme butonuna tıklama
    if (addContentBlockBtn) {
        addContentBlockBtn.addEventListener('click', promptBlockType);
    }
    
    // Modal kapatma
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Başlangıç ---
    init();
}); 
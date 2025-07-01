document.addEventListener('DOMContentLoaded', () => {

    // --- Global Değişkenler ---
    let siteContent = {};
    let currentSezon = null;
    let currentSezonId = null;
    let activeModal = { type: null, id: null };

    // --- Element Referansları ---
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
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // --- API & Veri İşlemleri ---
    async function fetchDataAndRender() {
        const params = new URLSearchParams(window.location.search);
        currentSezonId = parseInt(params.get('id'));
        if (!currentSezonId) {
            document.body.innerHTML = '<h1>Geçersiz Sezon ID</h1><a href="panel.html">Panele Geri Dön</a>';
            return;
        }

        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('Veri çekilemedi!');
            siteContent = await response.json();
            currentSezon = siteContent.arsiv.find(s => s.id === currentSezonId);
            if (!currentSezon) throw new Error('Sezon bulunamadı!');
            renderPage();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    async function saveContent() {
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteContent)
            });
            if (!response.ok) throw new Error('Değişiklikler kaydedilemedi!');
            showNotification('Değişiklikler başarıyla kaydedildi!');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    // --- Render Fonksiyonları ---
    function renderPage() {
        sezonDetayBaslik.textContent = currentSezon.sezon;
        sezonBaslikInput.value = currentSezon.sezon;
        sezonAciklamaInput.value = currentSezon.aciklama;
        renderOyunlar();
        renderFotograflar();
    }

    function renderOyunlar() {
        sezonOyunlarList.innerHTML = '';
        currentSezon.oyunlar.forEach(oyun => {
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
        currentSezon.fotograflar.forEach((photoPath, index) => {
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

    function openOyunModal(oyunId = null) {
        const oyun = oyunId ? currentSezon.oyunlar.find(o => o.id === oyunId) : { id: null, ad: '', yazar: '', img: '' };
        activeModal = { type: 'oyun', id: oyunId };

        modalTitle.textContent = oyunId ? 'Oyunu Düzenle' : 'Yeni Oyun Ekle';
        modalFields.innerHTML = `
            <label>Oyun Adı:</label><input type="text" id="modal-oyun-ad" value="${oyun.ad}" required>
            <label>Yazar:</label><input type="text" id="modal-oyun-yazar" value="${oyun.yazar}">
            <label>Afiş Resmi:</label>
            <img src="../${oyun.img || 'assets/logo-placeholder.png'}" style="max-width: 100px; display: block; margin-bottom: 10px;">
            <input type="hidden" id="modal-oyun-img" value="${oyun.img}">
            <input type="file" id="modal-image-upload" accept="image/*">
        `;
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }
    
    async function handleModalSave() {
        const { id } = activeModal;
        let imageUrl = document.getElementById('modal-oyun-img').value;
        const imageFile = document.getElementById('modal-image-upload').files[0];

        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            try {
                const response = await fetch('/api/upload', { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Resim yüklenemedi.');
                imageUrl = result.filePath;
            } catch (error) {
                return showNotification(`Hata: ${error.message}`, 'error');
            }
        }
        
        const updatedOyun = {
            id: id || (currentSezon.oyunlar.length > 0 ? Math.max(...currentSezon.oyunlar.map(o => o.id)) + 1 : 1),
            ad: document.getElementById('modal-oyun-ad').value,
            yazar: document.getElementById('modal-oyun-yazar').value,
            img: imageUrl
        };
        
        if (id) { // Düzenleme
            const index = currentSezon.oyunlar.findIndex(o => o.id === id);
            currentSezon.oyunlar[index] = updatedOyun;
        } else { // Ekleme
            currentSezon.oyunlar.push(updatedOyun);
        }
        
        renderOyunlar();
        await saveContent();
        closeModal();
    }

    // --- Olay Dinleyicileri ---
    sezonInfoForm.addEventListener('submit', e => {
        e.preventDefault();
        currentSezon.sezon = sezonBaslikInput.value;
        currentSezon.aciklama = sezonAciklamaInput.value;
        sezonDetayBaslik.textContent = currentSezon.sezon;
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
                currentSezon.fotograflar.push(result.filePath);
            } catch (error) {
                showNotification(`Hata: ${error.message}`, 'error');
            }
        }
        addPhotosInput.value = ''; // Input'u temizle
        renderFotograflar();
        await saveContent();
    });

    sezonFotografGalerisi.addEventListener('click', e => {
        if (e.target.classList.contains('delete-photo-btn')) {
            const index = parseInt(e.target.dataset.index);
            currentSezon.fotograflar.splice(index, 1);
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
            currentSezon.oyunlar = currentSezon.oyunlar.filter(o => o.id !== oyunId);
            renderOyunlar();
            saveContent();
        }
    });

    // --- Başlangıç ---
    fetchDataAndRender();
}); 
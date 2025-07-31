// Profil sayfası JavaScript

let currentUser = null;

// Kullanıcı profilini yükle
function loadUserProfile() {
    try {
        const session = kutiyCheckSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
        currentUser = users.find(u => u.username === session.username);
        
        if (!currentUser) {
            alert('Kullanıcı bulunamadı!');
            window.location.href = 'login.html';
            return;
        }

        // Header bilgilerini doldur
        document.getElementById('profile-name').textContent = currentUser.ad || 'Kullanıcı';
        document.getElementById('profile-role').textContent = currentUser.rol || 'Rol Belirtilmemiş';
        document.getElementById('profile-username').textContent = '@' + (currentUser.username || 'username');

        // Profil fotoğrafı
        if (currentUser.profilePicture && currentUser.profilePicture !== 'assets/1751453697640-organizator-1881-logo-F1F415.png') {
            document.getElementById('profile-picture').src = currentUser.profilePicture;
            document.getElementById('profile-picture').style.display = 'block';
            document.getElementById('profile-avatar-icon').style.display = 'none';
        }

        // Kişisel bilgileri doldur
        document.getElementById('info-name').textContent = currentUser.ad || 'Belirtilmemiş';
        document.getElementById('info-role').textContent = currentUser.rol || 'Belirtilmemiş';
        document.getElementById('info-username').textContent = currentUser.username || 'Belirtilmemiş';
        document.getElementById('info-department').textContent = currentUser.department || 'Belirtilmemiş';
        document.getElementById('info-experience').textContent = currentUser.experience || 'Belirtilmemiş';

        // Tarih bilgileri
        if (currentUser.joinDate) {
            const joinDate = new Date(currentUser.joinDate).toLocaleDateString('tr-TR');
            document.getElementById('info-join-date').textContent = joinDate;
        }
        if (currentUser.birthDate) {
            const birthDate = new Date(currentUser.birthDate).toLocaleDateString('tr-TR');
            document.getElementById('info-birth-date').textContent = birthDate;
        }

        // Biyografi
        if (currentUser.bio && currentUser.bio.trim()) {
            document.getElementById('info-bio').textContent = currentUser.bio;
        }

        // İletişim bilgileri
        document.getElementById('info-email').textContent = currentUser.email || 'Belirtilmemiş';
        document.getElementById('info-phone').textContent = currentUser.telefon || 'Belirtilmemiş';

        // Sosyal medya bilgileri
        if (currentUser.socialMedia) {
            document.getElementById('info-instagram').textContent = currentUser.socialMedia.instagram || 'Belirtilmemiş';
            document.getElementById('info-linkedin').textContent = currentUser.socialMedia.linkedin || 'Belirtilmemiş';
            document.getElementById('info-twitter').textContent = currentUser.socialMedia.twitter || 'Belirtilmemiş';
        }

        // Oturum bilgilerini doldur
        const loginTime = new Date(session.loginTime);
        document.getElementById('info-login-time').textContent = loginTime.toLocaleString('tr-TR');
        
        const activeTime = calculateActiveTime(session.loginTime);
        document.getElementById('info-active-time').textContent = activeTime;
        
        const passwordStatus = currentUser.mustChangePassword ? 'Değiştirilmeli' : 'Güncel';
        document.getElementById('info-password-status').textContent = passwordStatus;

        // İzinleri yükle
        loadUserPermissions(currentUser);

        console.log('Profil yüklendi:', currentUser);
        
    } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        window.location.href = 'login.html';
        return;
    }
}

// Aktif süreyi hesapla
function calculateActiveTime(loginTime) {
    const now = new Date();
    const login = new Date(loginTime);
    const diffMs = now - login;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} saat ${minutes} dakika`;
}

// Kullanıcı izinlerini yükle
function loadUserPermissions(user) {
    const permissionsGrid = document.getElementById('permissions-grid');
    
    // Tüm olası izinler
    const allPermissions = [
        { id: 'read_plays', name: 'Oyunları Görüntüle', icon: 'fas fa-eye' },
        { id: 'edit_plays', name: 'Oyunları Düzenle', icon: 'fas fa-edit' },
        { id: 'delete_plays', name: 'Oyunları Sil', icon: 'fas fa-trash' },
        { id: 'manage_actors', name: 'Oyuncu Yönetimi', icon: 'fas fa-users' },
        { id: 'manage_board', name: 'Yönetim Kurulu', icon: 'fas fa-user-tie' },
        { id: 'upload_media', name: 'Medya Yükleme', icon: 'fas fa-upload' },
        { id: 'view_analytics', name: 'İstatistikleri Görüntüle', icon: 'fas fa-chart-bar' },
        { id: 'manage_users', name: 'Kullanıcı Yönetimi', icon: 'fas fa-user-cog' },
        { id: 'system_settings', name: 'Sistem Ayarları', icon: 'fas fa-cogs' }
    ];

    permissionsGrid.innerHTML = '';

    allPermissions.forEach(permission => {
        const hasPermission = user.permissions && user.permissions.includes(permission.id);
        
        const card = document.createElement('div');
        card.className = `permission-card ${hasPermission ? 'active' : 'inactive'}`;
        
        card.innerHTML = `
            <div class="permission-icon">
                <i class="${permission.icon}"></i>
            </div>
            <div class="permission-title">${permission.name}</div>
            <div class="permission-status">${hasPermission ? 'Aktif' : 'Pasif'}</div>
        `;
        
        permissionsGrid.appendChild(card);
    });
}

// Kişisel bilgileri düzenle
function editPersonalInfo() {
    const modal = createModal('Kişisel Bilgileri Düzenle', `
        <div class="form-grid">
            <div class="form-group">
                <label for="edit-name">Ad Soyad</label>
                <input type="text" id="edit-name" value="${currentUser.ad || ''}" placeholder="Ad Soyad">
            </div>
            <div class="form-group">
                <label for="edit-department">Bölüm</label>
                <input type="text" id="edit-department" value="${currentUser.department || ''}" placeholder="Üniversite Bölümü">
            </div>
            <div class="form-group">
                <label for="edit-birth-date">Doğum Tarihi</label>
                <input type="date" id="edit-birth-date" value="${currentUser.birthDate || ''}">
            </div>
            <div class="form-group">
                <label for="edit-join-date">Katılım Tarihi</label>
                <input type="date" id="edit-join-date" value="${currentUser.joinDate || ''}">
            </div>
            <div class="form-group">
                <label for="edit-experience">Deneyim</label>
                <input type="text" id="edit-experience" value="${currentUser.experience || ''}" placeholder="Tiyatro deneyimi">
            </div>
            <div class="form-group full-width">
                <label for="edit-bio">Hakkımda</label>
                <textarea id="edit-bio" placeholder="Kendiniz hakkında kısa bilgi...">${currentUser.bio || ''}</textarea>
            </div>
        </div>
    `);

    modal.querySelector('.btn-save').onclick = () => savePersonalInfo(modal);
}

// İletişim bilgilerini düzenle
function editContactInfo() {
    const modal = createModal('İletişim Bilgilerini Düzenle', `
        <div class="form-grid">
            <div class="form-group">
                <label for="edit-email">E-posta</label>
                <input type="email" id="edit-email" value="${currentUser.email || ''}" placeholder="ornek@ku.edu.tr">
            </div>
            <div class="form-group">
                <label for="edit-phone">Telefon</label>
                <input type="tel" id="edit-phone" value="${currentUser.telefon || ''}" placeholder="+90 555 123 4567">
            </div>
        </div>
    `);

    modal.querySelector('.btn-save').onclick = () => saveContactInfo(modal);
}

// Sosyal medya bilgilerini düzenle
function editSocialMedia() {
    const socialMedia = currentUser.socialMedia || {};
    const modal = createModal('Sosyal Medya Hesaplarını Düzenle', `
        <div class="form-grid">
            <div class="form-group">
                <label for="edit-instagram">Instagram</label>
                <input type="text" id="edit-instagram" value="${socialMedia.instagram || ''}" placeholder="@kullanici_adi">
            </div>
            <div class="form-group">
                <label for="edit-linkedin">LinkedIn</label>
                <input type="text" id="edit-linkedin" value="${socialMedia.linkedin || ''}" placeholder="linkedin.com/in/kullanici">
            </div>
            <div class="form-group">
                <label for="edit-twitter">Twitter</label>
                <input type="text" id="edit-twitter" value="${socialMedia.twitter || ''}" placeholder="@kullanici_adi">
            </div>
        </div>
    `);

    modal.querySelector('.btn-save').onclick = () => saveSocialMedia(modal);
}

// Tüm profili düzenle
function editProfile() {
    const socialMedia = currentUser.socialMedia || {};
    const modal = createModal('Profili Düzenle', `
        <div class="form-grid">
            <div class="form-group">
                <label for="edit-name-full">Ad Soyad</label>
                <input type="text" id="edit-name-full" value="${currentUser.ad || ''}" placeholder="Ad Soyad">
            </div>
            <div class="form-group">
                <label for="edit-department-full">Bölüm</label>
                <input type="text" id="edit-department-full" value="${currentUser.department || ''}" placeholder="Üniversite Bölümü">
            </div>
            <div class="form-group">
                <label for="edit-email-full">E-posta</label>
                <input type="email" id="edit-email-full" value="${currentUser.email || ''}" placeholder="ornek@ku.edu.tr">
            </div>
            <div class="form-group">
                <label for="edit-phone-full">Telefon</label>
                <input type="tel" id="edit-phone-full" value="${currentUser.telefon || ''}" placeholder="+90 555 123 4567">
            </div>
            <div class="form-group">
                <label for="edit-birth-date-full">Doğum Tarihi</label>
                <input type="date" id="edit-birth-date-full" value="${currentUser.birthDate || ''}">
            </div>
            <div class="form-group">
                <label for="edit-join-date-full">Katılım Tarihi</label>
                <input type="date" id="edit-join-date-full" value="${currentUser.joinDate || ''}">
            </div>
            <div class="form-group">
                <label for="edit-experience-full">Deneyim</label>
                <input type="text" id="edit-experience-full" value="${currentUser.experience || ''}" placeholder="Tiyatro deneyimi">
            </div>
            <div class="form-group">
                <label for="edit-instagram-full">Instagram</label>
                <input type="text" id="edit-instagram-full" value="${socialMedia.instagram || ''}" placeholder="@kullanici_adi">
            </div>
            <div class="form-group">
                <label for="edit-linkedin-full">LinkedIn</label>
                <input type="text" id="edit-linkedin-full" value="${socialMedia.linkedin || ''}" placeholder="linkedin.com/in/kullanici">
            </div>
            <div class="form-group">
                <label for="edit-twitter-full">Twitter</label>
                <input type="text" id="edit-twitter-full" value="${socialMedia.twitter || ''}" placeholder="@kullanici_adi">
            </div>
            <div class="form-group full-width">
                <label for="edit-bio-full">Hakkımda</label>
                <textarea id="edit-bio-full" placeholder="Kendiniz hakkında kısa bilgi...">${currentUser.bio || ''}</textarea>
            </div>
        </div>
    `);

    modal.querySelector('.btn-save').onclick = () => saveFullProfile(modal);
}

// Şifre değiştir
function changePassword() {
    const modal = createModal('Şifre Değiştir', `
        <div class="form-grid">
            <div class="form-group">
                <label for="current-password">Mevcut Şifre</label>
                <input type="password" id="current-password" required>
            </div>
            <div class="form-group">
                <label for="new-password">Yeni Şifre</label>
                <input type="password" id="new-password" required minlength="6">
            </div>
            <div class="form-group">
                <label for="confirm-password">Yeni Şifre (Tekrar)</label>
                <input type="password" id="confirm-password" required minlength="6">
            </div>
        </div>
        <div id="password-error" class="error-message"></div>
    `);

    modal.querySelector('.btn-save').onclick = () => savePassword(modal);
}

// Modal oluştur
function createModal(title, content) {
    // Varolan modalı kaldır
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close-btn" onclick="closeModal()">&times;</button>
            <h2 class="modal-title">${title}</h2>
            ${content}
            <div class="modal-buttons">
                <button class="modal-btn btn-save">Kaydet</button>
                <button class="modal-btn btn-cancel" onclick="closeModal()">İptal</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

// Modal kapat
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Kişisel bilgileri kaydet
function savePersonalInfo(modal) {
    try {
        const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);

        if (userIndex !== -1) {
            users[userIndex].ad = modal.querySelector('#edit-name').value;
            users[userIndex].department = modal.querySelector('#edit-department').value;
            users[userIndex].birthDate = modal.querySelector('#edit-birth-date').value;
            users[userIndex].joinDate = modal.querySelector('#edit-join-date').value;
            users[userIndex].experience = modal.querySelector('#edit-experience').value;
            users[userIndex].bio = modal.querySelector('#edit-bio').value;

            localStorage.setItem('kutiy_users', JSON.stringify(users));
            showSuccess('Kişisel bilgiler güncellendi!');
            closeModal();
            loadUserProfile();
        }
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showError('Bilgiler kaydedilemedi!');
    }
}

// İletişim bilgilerini kaydet
function saveContactInfo(modal) {
    try {
        const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);

        if (userIndex !== -1) {
            users[userIndex].email = modal.querySelector('#edit-email').value;
            users[userIndex].telefon = modal.querySelector('#edit-phone').value;

            localStorage.setItem('kutiy_users', JSON.stringify(users));
            showSuccess('İletişim bilgileri güncellendi!');
            closeModal();
            loadUserProfile();
        }
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showError('Bilgiler kaydedilemedi!');
    }
}

// Sosyal medya bilgilerini kaydet
function saveSocialMedia(modal) {
    try {
        const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);

        if (userIndex !== -1) {
            if (!users[userIndex].socialMedia) {
                users[userIndex].socialMedia = {};
            }
            
            users[userIndex].socialMedia.instagram = modal.querySelector('#edit-instagram').value;
            users[userIndex].socialMedia.linkedin = modal.querySelector('#edit-linkedin').value;
            users[userIndex].socialMedia.twitter = modal.querySelector('#edit-twitter').value;

            localStorage.setItem('kutiy_users', JSON.stringify(users));
            showSuccess('Sosyal medya hesapları güncellendi!');
            closeModal();
            loadUserProfile();
        }
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showError('Bilgiler kaydedilemedi!');
    }
}

// Tüm profili kaydet
function saveFullProfile(modal) {
    try {
        const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);

        if (userIndex !== -1) {
            // Kişisel bilgiler
            users[userIndex].ad = modal.querySelector('#edit-name-full').value;
            users[userIndex].department = modal.querySelector('#edit-department-full').value;
            users[userIndex].email = modal.querySelector('#edit-email-full').value;
            users[userIndex].telefon = modal.querySelector('#edit-phone-full').value;
            users[userIndex].birthDate = modal.querySelector('#edit-birth-date-full').value;
            users[userIndex].joinDate = modal.querySelector('#edit-join-date-full').value;
            users[userIndex].experience = modal.querySelector('#edit-experience-full').value;
            users[userIndex].bio = modal.querySelector('#edit-bio-full').value;

            // Sosyal medya
            if (!users[userIndex].socialMedia) {
                users[userIndex].socialMedia = {};
            }
            users[userIndex].socialMedia.instagram = modal.querySelector('#edit-instagram-full').value;
            users[userIndex].socialMedia.linkedin = modal.querySelector('#edit-linkedin-full').value;
            users[userIndex].socialMedia.twitter = modal.querySelector('#edit-twitter-full').value;

            localStorage.setItem('kutiy_users', JSON.stringify(users));
            showSuccess('Profil tamamen güncellendi!');
            closeModal();
            loadUserProfile();
        }
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showError('Profil kaydedilemedi!');
    }
}

// Şifre kaydet
function savePassword(modal) {
    try {
        const currentPassword = modal.querySelector('#current-password').value;
        const newPassword = modal.querySelector('#new-password').value;
        const confirmPassword = modal.querySelector('#confirm-password').value;
        const errorDiv = modal.querySelector('#password-error');

        // Validasyonlar
        if (currentUser.password !== btoa(currentPassword)) {
            errorDiv.textContent = 'Mevcut şifre hatalı!';
            errorDiv.style.display = 'block';
            return;
        }

        if (newPassword.length < 6) {
            errorDiv.textContent = 'Yeni şifre en az 6 karakter olmalıdır!';
            errorDiv.style.display = 'block';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorDiv.textContent = 'Yeni şifreler eşleşmiyor!';
            errorDiv.style.display = 'block';
            return;
        }

        // Şifre güncelle
        const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);

        if (userIndex !== -1) {
            users[userIndex].password = btoa(newPassword);
            users[userIndex].mustChangePassword = false;
            localStorage.setItem('kutiy_users', JSON.stringify(users));
            
            showSuccess('Şifre başarıyla değiştirildi!');
            closeModal();
            loadUserProfile();
        }
    } catch (error) {
        console.error('Şifre kaydetme hatası:', error);
        showError('Şifre değiştirilemedi!');
    }
}

// Profil fotoğrafını düzenle
function editProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Burada normalde dosyayı sunucuya yüklersiniz
                // Şimdilik base64 olarak kaydediyoruz (gerçek projede önerilmez)
                const imageData = e.target.result;
                
                try {
                    const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
                    const userIndex = users.findIndex(u => u.username === currentUser.username);

                    if (userIndex !== -1) {
                        users[userIndex].profilePicture = imageData;
                        localStorage.setItem('kutiy_users', JSON.stringify(users));
                        showSuccess('Profil fotoğrafı güncellendi!');
                        loadUserProfile();
                    }
                } catch (error) {
                    console.error('Profil fotoğrafı kaydetme hatası:', error);
                    showError('Profil fotoğrafı kaydedilemedi!');
                }
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Başarı mesajı göster
function showSuccess(message) {
    showNotification(message, 'success');
}

// Hata mesajı göster
function showError(message) {
    showNotification(message, 'error');
}

// Bildirim göster
function showNotification(message, type = 'success') {
    // Varolan bildirimi kaldır
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animasyon
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Otomatik kaldır
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
} 
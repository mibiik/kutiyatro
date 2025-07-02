// Profil sayfası JavaScript

// Kullanıcı profilini yükle
function loadUserProfile() {
    let currentUser;
    
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

        // Kişisel bilgileri doldur
        document.getElementById('info-name').textContent = currentUser.ad || 'Belirtilmemiş';
        document.getElementById('info-role').textContent = currentUser.rol || 'Belirtilmemiş';
        document.getElementById('info-username').textContent = currentUser.username || 'Belirtilmemiş';
        document.getElementById('info-email').textContent = currentUser.email || 'Belirtilmemiş';
        document.getElementById('info-phone').textContent = currentUser.telefon || 'Belirtilmemiş';

        // Ek profil bilgilerini doldur (eğer varsa)
        if (document.getElementById('info-bio')) {
            document.getElementById('info-bio').textContent = currentUser.bio || 'Biyografi belirtilmemiş';
        }
        if (document.getElementById('info-department')) {
            document.getElementById('info-department').textContent = currentUser.department || 'Bölüm belirtilmemiş';
        }
        if (document.getElementById('info-experience')) {
            document.getElementById('info-experience').textContent = currentUser.experience || 'Deneyim belirtilmemiş';
        }
        if (document.getElementById('info-join-date')) {
            const joinDate = currentUser.joinDate ? new Date(currentUser.joinDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş';
            document.getElementById('info-join-date').textContent = joinDate;
        }
        if (document.getElementById('info-birth-date')) {
            const birthDate = currentUser.birthDate ? new Date(currentUser.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş';
            document.getElementById('info-birth-date').textContent = birthDate;
        }

        // Sosyal medya bilgileri
        if (currentUser.socialMedia) {
            if (document.getElementById('info-instagram')) {
                document.getElementById('info-instagram').textContent = currentUser.socialMedia.instagram || 'Belirtilmemiş';
            }
            if (document.getElementById('info-linkedin')) {
                document.getElementById('info-linkedin').textContent = currentUser.socialMedia.linkedin || 'Belirtilmemiş';
            }
            if (document.getElementById('info-twitter')) {
                document.getElementById('info-twitter').textContent = currentUser.socialMedia.twitter || 'Belirtilmemiş';
            }
        }

        // Profil fotoğrafı
        if (document.getElementById('profile-picture') && currentUser.profilePicture) {
            document.getElementById('profile-picture').src = currentUser.profilePicture;
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
        console.log('Kullanıcı verisi:', currentUser);
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
            <h4>${permission.name}</h4>
            <p style="margin: 5px 0 0 0; font-size: 0.9rem;">
                ${hasPermission ? 'Aktif' : 'Pasif'}
            </p>
        `;
        
        permissionsGrid.appendChild(card);
    });
}

// Profil düzenleme modal'ını aç
function editProfile() {
    const session = kutiyCheckSession();
    if (!session) return;

    const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
    const currentUser = users.find(u => u.username === session.username);
    
    if (!currentUser) return;

    // Mevcut bilgileri forma doldur
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-phone').value = currentUser.telefon || '';
    document.getElementById('edit-bio').value = currentUser.bio || '';

    document.getElementById('profile-edit-modal').style.display = 'flex';
}

// Profil düzenleme modal'ını kapat
function closeEditModal() {
    document.getElementById('profile-edit-modal').style.display = 'none';
}

// Şifre değiştirme modal'ını aç
function changePassword() {
    document.getElementById('password-change-modal').style.display = 'flex';
    document.getElementById('password-change-form').reset();
    document.getElementById('password-error').style.display = 'none';
}

// Şifre değiştirme modal'ını kapat
function closePasswordModal() {
    document.getElementById('password-change-modal').style.display = 'none';
}

// Profil düzenleme form submit
document.addEventListener('DOMContentLoaded', function() {
    const profileEditForm = document.getElementById('profile-edit-form');
    const passwordChangeForm = document.getElementById('password-change-form');

    if (profileEditForm) {
        profileEditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const session = kutiyCheckSession();
            if (!session) return;

            const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
            const userIndex = users.findIndex(u => u.username === session.username);
            
            if (userIndex === -1) return;

            // Form verilerini al
            const formData = new FormData(profileEditForm);
            
            // Kullanıcı bilgilerini güncelle
            users[userIndex].email = formData.get('email');
            users[userIndex].telefon = formData.get('phone');
            users[userIndex].bio = formData.get('bio');

            // Kaydet
            localStorage.setItem('kutiy_users', JSON.stringify(users));
            
            // Sayfayı yenile
            loadUserProfile();
            closeEditModal();
            
            // Başarı mesajı
            showMiniNotification('Profil güncellendi!', 'success');
        });
    }

    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const session = kutiyCheckSession();
            if (!session) return;

            const users = JSON.parse(localStorage.getItem('kutiy_users') || '[]');
            const userIndex = users.findIndex(u => u.username === session.username);
            
            if (userIndex === -1) return;

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            const errorDiv = document.getElementById('password-error');

            // Mevcut şifre kontrolü
            if (users[userIndex].password !== btoa(currentPassword)) {
                errorDiv.textContent = 'Mevcut şifre hatalı!';
                errorDiv.style.display = 'block';
                return;
            }

            // Yeni şifre kontrolü
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

            // Şifreyi güncelle
            users[userIndex].password = btoa(newPassword);
            users[userIndex].mustChangePassword = false;

            // Kaydet
            localStorage.setItem('kutiy_users', JSON.stringify(users));
            
            // Modal'ı kapat
            closePasswordModal();
            
            // Sayfayı yenile
            loadUserProfile();
            
            // Başarı mesajı
            showMiniNotification('Şifre başarıyla değiştirildi!', 'success');
        });
    }
});

// Mini bildirim göster
function showMiniNotification(message, type = 'success') {
    // Varolan bildirimi kaldır
    const existing = document.querySelector('.mini-notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'mini-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
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
// Login sistemi için JavaScript

// Yönetim kurulu üyelerinin otomatik kullanıcı adları ve geçici şifreleri
const defaultUsers = {
    'selen.gurdal': {
        name: 'Selen Gürdal',
        role: 'Eş Başkan',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'ugur.bayrak': {
        name: 'Uğur Bayrak',
        role: 'Eş Başkan',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'selen.sariklic': {
        name: 'Selen Nehir Sarıkılıç',
        role: 'Festival Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'tuana.elmas': {
        name: 'Tuana Elmas',
        role: 'Festival Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'melek.yucel': {
        name: 'Melek Yücel',
        role: 'Genel Sekreter',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'kadir.erbas': {
        name: 'Kadir Kaan Erbaş',
        role: 'Mali Koordinatör ve Lojistik Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'sena.eliri': {
        name: 'Sena Eliri',
        role: 'Oda Tiyatrosu Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'tunahan.saygili': {
        name: 'Tunahan Saygılı',
        role: 'Organizasyon Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'can.sahin': {
        name: 'Can Şahin',
        role: 'Sosyal Medya Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'asli.hurma': {
        name: 'Aslı Hurma',
        role: 'Sponsorluk Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'simge.dere': {
        name: 'Simge Dere',
        role: 'Sponsorluk Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'gul.kal': {
        name: 'Gül Deniz Kal',
        role: 'Tasarım Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'mehmet.usta': {
        name: 'Mehmet Güray Usta',
        role: 'Teknik Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'merve.konuk': {
        name: 'Merve Makbule Konuk',
        role: 'Turne Sorumlusu',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    },
    'ecem.kaynar': {
        name: 'Ecem Naz Kaynar',
        role: 'Kurul Üyesi',
        defaultPassword: 'kutiy2025',
        needsPasswordChange: true
    }
};

// Kullanıcı verilerini localStorage'dan yükle
function loadUserData() {
    const savedUsers = localStorage.getItem('kutiy_users');
    if (savedUsers) {
        try {
            const users = JSON.parse(savedUsers);
            
            // Eğer zaten array formatında ise, direkt döndür
            if (Array.isArray(users) && users.length > 0 && users[0].username) {
                return users;
            }
            
            // Eski format ise dönüştür ve kaydet
            const convertedUsers = convertToNewFormat(users);
            saveUserData(convertedUsers);
            return convertedUsers;
        } catch (e) {
            console.error('Kullanıcı verileri yüklenirken hata:', e);
            // Hata durumunda varsayılan kullanıcıları oluştur
            const newUsers = convertToNewFormat(defaultUsers);
            saveUserData(newUsers);
            return newUsers;
        }
    }
    
    // İlk kez çalışıyorsa, default kullanıcıları kaydet
    const newUsers = convertToNewFormat(defaultUsers);
    saveUserData(newUsers);
    return newUsers;
}

// Eski formatı yeni formata dönüştür
function convertToNewFormat(users) {
    // Eğer zaten array formatında ise, direkt döndür
    if (Array.isArray(users)) {
        return users;
    }
    
    // Object formatından array formatına dönüştür
    const convertedUsers = [];
    
    for (const [username, userData] of Object.entries(users)) {
        // Yeni format: array of objects
        const userObj = {
            username: username,
            ad: userData.name,
            rol: userData.role,
            password: userData.defaultPassword ? btoa(userData.defaultPassword) : btoa('kutiy2025'),
            mustChangePassword: userData.needsPasswordChange || false,
            active: true,
            email: '',
            telefon: '',
            permissions: getDefaultPermissions(userData.role)
        };
        
        convertedUsers.push(userObj);
    }
    
    return convertedUsers;
}

// Role göre varsayılan izinleri belirle
function getDefaultPermissions(role) {
    const adminRoles = ['Eş Başkan', 'Genel Sekreter'];
    const editorRoles = ['Festival Sorumlusu', 'Mali Koordinatör ve Lojistik Sorumlusu', 'Organizasyon Sorumlusu', 'Sosyal Medya Sorumlusu'];
    const managerRoles = ['Tasarım Sorumlusu', 'Teknik Sorumlusu', 'Turne Sorumlusu', 'Oda Tiyatrosu Sorumlusu'];
    
    if (adminRoles.includes(role)) {
        // Eş başkanlar ve genel sekreter - tüm izinler
        return [
            'read_plays', 'edit_plays', 'delete_plays', 
            'manage_actors', 'manage_board', 'upload_media', 
            'view_analytics', 'manage_users', 'system_settings'
        ];
    } else if (editorRoles.includes(role)) {
        // Sorumlu pozisyonları - editör seviyesi
        return [
            'read_plays', 'edit_plays', 'manage_actors', 
            'manage_board', 'upload_media', 'view_analytics'
        ];
    } else if (managerRoles.includes(role)) {
        // Özel sorumluluk alanları
        return [
            'read_plays', 'edit_plays', 'manage_actors', 
            'upload_media', 'view_analytics'
        ];
    } else {
        // Diğer kurul üyeleri - temel izinler
        return ['read_plays', 'manage_actors', 'upload_media'];
    }
}

// Kullanıcı verilerini localStorage'a kaydet
function saveUserData(users) {
    localStorage.setItem('kutiy_users', JSON.stringify(users));
}

// Mevcut oturumu kaydet
function saveSession(username) {
    const sessionData = {
        username: username,
        loginTime: Date.now()
    };
    sessionStorage.setItem('kutiy_session', JSON.stringify(sessionData));
}

// Oturum kontrolü
function checkSession() {
    try {
        const sessionData = sessionStorage.getItem('kutiy_session');
        
        if (!sessionData) {
            return null;
        }

        const session = JSON.parse(sessionData);
        
        // Session verilerinin geçerliliğini kontrol et
        if (!session.username || !session.loginTime) {
            sessionStorage.removeItem('kutiy_session');
            return null;
        }
        
        const timeDiff = Date.now() - session.loginTime;
        // 8 saat = 8 * 60 * 60 * 1000
        if (timeDiff < 8 * 60 * 60 * 1000) {
            return session;
        } else {
            // Session süresi dolmuş
            sessionStorage.removeItem('kutiy_session');
            return null;
        }
    } catch (e) {
        console.error('Session kontrolünde hata:', e);
        // Hatalı session verisi var, temizle
        sessionStorage.removeItem('kutiy_session');
        return null;
    }
}

// Oturumu sonlandır
function logout() {
    sessionStorage.removeItem('kutiy_session');
    window.location.href = 'login.html';
}

// Hata mesajı göster
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    successDiv.style.display = 'none';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Başarı mesajı göster
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    errorDiv.style.display = 'none';
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// Şifre değiştirme modalını göster
function showPasswordChangeModal(username) {
    const modal = document.getElementById('passwordChangeModal');
    modal.style.display = 'flex';
    
    // Form submit event listener
    const form = document.getElementById('passwordChangeForm');
    form.addEventListener('submit', (e) => handlePasswordChange(e, username));
}

// Şifre değiştirme modalını gizle
function hidePasswordChangeModal() {
    const modal = document.getElementById('passwordChangeModal');
    modal.style.display = 'none';
}

// Şifre değiştirme işlemi
function handlePasswordChange(event, username) {
    event.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordErrorMessage');
    
    // Şifre kontrolü
    if (newPassword.length < 6) {
        errorDiv.textContent = 'Şifre en az 6 karakter olmalıdır.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Şifreler eşleşmiyor. Lütfen tekrar deneyin.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Şifreyi güncelle
    const users = loadUserData();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        users[userIndex].password = btoa(newPassword);
        users[userIndex].mustChangePassword = false;
        saveUserData(users);
        
        hidePasswordChangeModal();
        showSuccess('Şifreniz başarıyla güncellendi! Panel\'e yönlendiriliyorsunuz...');
        
        // Oturumu başlat ve panele yönlendir
        saveSession(username);
        setTimeout(() => {
            window.location.href = 'panel.html';
        }, 2000);
    }
}

// Login form işlemi
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!username || !password) {
        showError('Lütfen kullanıcı adı ve şifrenizi girin.');
        return;
    }
    
    // Loading durumu
    loginBtn.disabled = true;
    loginBtn.textContent = 'Giriş yapılıyor...';
    document.querySelector('.login-container').classList.add('loading');
    
    // Simulated delay for better UX
    setTimeout(() => {
        const users = loadUserData();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            showError('Kullanıcı adı bulunamadı.');
            resetLoginButton();
            return;
        }
        
        // Şifre kontrolü (base64 decode gerekiyor)
        const storedPassword = atob(user.password);
        if (storedPassword !== password) {
            showError('Hatalı şifre. Lütfen tekrar deneyin.');
            resetLoginButton();
            return;
        }
        
        // Başarılı giriş
        if (user.mustChangePassword) {
            // İlk giriş - şifre değiştirmesi gerekli
            showSuccess('Giriş başarılı! Yeni şifrenizi belirleyin.');
            resetLoginButton();
            setTimeout(() => {
                showPasswordChangeModal(username);
            }, 1000);
        } else {
            // Normal giriş
            showSuccess('Giriş başarılı! Panel\'e yönlendiriliyorsunuz...');
            saveSession(username);
            setTimeout(() => {
                window.location.href = 'panel.html';
            }, 1500);
        }
    }, 1000);
}

// Login butonunu resetle
function resetLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Giriş Yap';
    document.querySelector('.login-container').classList.remove('loading');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Sadece login.html sayfasında session kontrolü yap
    if (window.location.pathname.includes('login.html')) {
        try {
            const currentSession = checkSession();
            if (currentSession) {
                // Kullanıcı verilerini kontrol et
                const user = window.kutiyGetCurrentUser();
                if (user) {
                    console.log('Mevcut session bulundu, panel\'e yönlendiriliyor...');
                    window.location.href = 'panel.html';
                    return;
                }
            }
        } catch (error) {
            console.error('Session kontrolünde hata:', error);
            // Hata durumunda session'ı temizle
            sessionStorage.removeItem('kutiy_session');
        }
    }
    
    // Login form event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Enter tuşu ile şifre değiştirme modalında submit
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && document.getElementById('passwordChangeModal') && document.getElementById('passwordChangeModal').style.display === 'flex') {
            const activeUsername = document.getElementById('username').value.trim();
            if (activeUsername) {
                handlePasswordChange(e, activeUsername);
            }
        }
    });
});

// Tarayıcı verilerini temizle
function clearBrowserData() {
    if (confirm('Bu işlem tüm giriş verilerini silecek ve sistemi baştan başlatacak. Emin misiniz?')) {
        localStorage.clear();
        sessionStorage.clear();
        alert('Tarayıcı verileri temizlendi! Sayfa yeniden yüklenecek.');
        window.location.reload();
    }
}

// Global fonksiyonlar
window.kutiyLogout = logout;
window.kutiyCheckSession = checkSession;
window.kutiyGetCurrentUser = function() {
    try {
        const session = checkSession();
        if (!session || !session.username) {
            return null;
        }
        
        const users = loadUserData();
        if (!Array.isArray(users)) {
            console.error('Kullanıcı verileri array formatında değil');
            return null;
        }
        
        const user = users.find(u => u && u.username === session.username);
        return user || null;
    } catch (error) {
        console.error('getCurrentUser hatası:', error);
        return null;
    }
};
window.clearBrowserData = clearBrowserData; 
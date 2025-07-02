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
                // Eksik profil bilgilerini tamamla
                const updatedUsers = updateProfilesIfNeeded(users);
                if (updatedUsers !== users) {
                    saveUserData(updatedUsers);
                    return updatedUsers;
                }
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

// Mevcut kullanıcılara eksik profil bilgilerini ekle
function updateProfilesIfNeeded(users) {
    let updated = false;
    
    const updatedUsers = users.map(user => {
        let userNeedsUpdate = false;
        
        // Eğer kullanıcının detaylı profil bilgileri eksikse, ekle
        if (!user.bio || !user.department || !user.experience) {
            userNeedsUpdate = true;
            updated = true;
            const profileData = getDetailedProfileData(user.username, {
                name: user.ad,
                role: user.rol
            });
            
            return {
                ...user,
                bio: user.bio || profileData.bio,
                department: user.department || profileData.department,
                experience: user.experience || profileData.experience,
                birthDate: user.birthDate || profileData.birthDate,
                joinDate: user.joinDate || profileData.joinDate,
                socialMedia: user.socialMedia || profileData.socialMedia,
                profilePicture: user.profilePicture || profileData.profilePicture,
                // Şifre değiştirme durumunu koruma - mevcut değeri aynen koru
                mustChangePassword: user.mustChangePassword !== undefined ? user.mustChangePassword : true
            };
        }
        
        // Sadece şifre değiştirme durumunu kontrol et
        if (user.mustChangePassword === undefined || user.mustChangePassword === null) {
            updated = true;
            return {
                ...user,
                mustChangePassword: true
            };
        }
        
        return user;
    });
    
    return updated ? updatedUsers : users;
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
        // Kullanıcı adına göre detaylı profil bilgileri
        const profileData = getDetailedProfileData(username, userData);
        
        // Yeni format: array of objects
        const userObj = {
            username: username,
            ad: profileData.ad,
            rol: profileData.rol,
            password: userData.defaultPassword ? btoa(userData.defaultPassword) : btoa('kutiy2025'),
            mustChangePassword: userData.needsPasswordChange !== false,
            active: true,
            email: profileData.email,
            telefon: profileData.telefon,
            bio: profileData.bio,
            joinDate: profileData.joinDate,
            birthDate: profileData.birthDate,
            department: profileData.department,
            experience: profileData.experience,
            socialMedia: profileData.socialMedia,
            profilePicture: profileData.profilePicture,
            permissions: getDefaultPermissions(userData.role)
        };
        
        convertedUsers.push(userObj);
    }
    
    return convertedUsers;
}

// Kullanıcı adına göre detaylı profil verileri
function getDetailedProfileData(username, userData) {
    const profileData = {
        ad: userData.name,
        rol: userData.role,
        email: '',
        telefon: '',
        bio: '',
        joinDate: '',
        birthDate: '',
        department: '',
        experience: '',
        socialMedia: {
            instagram: '',
            linkedin: '',
            twitter: ''
        },
        profilePicture: 'assets/1751453697640-organizator-1881-logo-F1F415.png'
    };

    // Tüm kullanıcılar için sadece isim ve görev bırakıyoruz
    // Diğer tüm bilgiler boş kalacak ve kullanıcılar kendileri dolduracak

    return profileData;
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

// Gizli debug sistemi için değişkenler
let logoClickCount = 0;
let logoClickTimer = null;

// Logo tıklama sistemi - 5 kez arka arkaya tıklanınca debug butonları görünür
function initLogoClickSystem() {
    const logo = document.getElementById('kutiyLogo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            logoClickCount++;
            
            // Timer varsa temizle
            if (logoClickTimer) {
                clearTimeout(logoClickTimer);
            }
            
            // 2 saniye içinde 5 tıklama olmazsa counter sıfırlanır
            logoClickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 2000);
            
            // 5 tıklama yapıldığında debug butonlarını göster
            if (logoClickCount >= 5) {
                showDebugButtons();
                logoClickCount = 0; // Counter'ı sıfırla
                clearTimeout(logoClickTimer);
            }
            
            // Görsel geri bildirim
            if (logoClickCount > 0) {
                logo.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    logo.style.transform = 'scale(1)';
                }, 100);
            }
        });
    }
}

// Debug butonlarını göster/gizle
function showDebugButtons() {
    const debugButtons = document.getElementById('debugButtons');
    if (debugButtons) {
        if (debugButtons.style.display === 'none' || debugButtons.style.display === '') {
            // Göster
            debugButtons.style.display = 'block';
            debugButtons.style.animation = 'fadeIn 0.5s ease-in';
            
            // Başarı mesajı göster
            showSuccess('🛠️ Debug modu aktif! Admin araçları görünür hale geldi.');
            
            console.log('🔧 Debug butonları aktif edildi!');
        } else {
            // Gizle
            debugButtons.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                debugButtons.style.display = 'none';
            }, 300);
            
            showSuccess('🔒 Debug modu kapatıldı. Admin araçları gizlendi.');
            
            console.log('🔒 Debug butonları gizlendi!');
        }
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // KALDIRILAN: checkAndUpdateExistingUsers() - Bu fonksiyon kullanıcıların şifre değiştirme durumunu zorla true yapıyordu
    
    // Gizli debug sistemini başlat
    initLogoClickSystem();
    
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
window.resetAllPasswordsToDefault = resetAllPasswordsToDefault;
window.resetAllUserPasswords = resetAllUserPasswords;
window.checkAndUpdateExistingUsers = checkAndUpdateExistingUsers;
window.clearUserProfileData = clearUserProfileData;
window.checkUserPasswordStatus = checkUserPasswordStatus;

// Tüm kullanıcıları şifre değiştirme durumuna sıfırla (admin fonksiyonu)
function resetAllPasswordsToDefault() {
    const users = loadUserData();
    const resetUsers = users.map(user => ({
        ...user,
        password: btoa('kutiy2025'),
        mustChangePassword: true
    }));
    
    saveUserData(resetUsers);
    console.log('Tüm kullanıcılar varsayılan şifreye (kutiy2025) sıfırlandı ve şifre değiştirme zorunlu hale getirildi.');
    return resetUsers;
}

// Kullanıcı dostu şifre sıfırlama fonksiyonu
function resetAllUserPasswords() {
    if (confirm('⚠️ DİKKAT!\n\nBu işlem tüm kullanıcıların şifrelerini "kutiy2025" olarak sıfırlayacak ve herkesin tekrar şifre değiştirmesini zorunlu hale getirecek.\n\nBu işlemi yapmak istediğinizden emin misiniz?')) {
        try {
            resetAllPasswordsToDefault();
            alert('✅ Başarılı!\n\nTüm kullanıcı şifreleri sıfırlandı.\n\n• Varsayılan şifre: kutiy2025\n• Herkes ilk girişte yeni şifre belirlemek zorunda\n\nSayfa yeniden yüklenecek.');
            window.location.reload();
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            alert('❌ Hata!\n\nŞifre sıfırlama işlemi başarısız oldu. Konsolu kontrol edin.');
        }
    }
}

// Kullanıcı profil bilgilerini temizle (sadece isim ve görev kalsın)
function clearUserProfileData() {
    try {
        const users = loadUserData();
        
        const cleanedUsers = users.map(user => ({
            ...user,
            email: '',
            telefon: '',
            bio: '',
            joinDate: '',
            birthDate: '',
            department: '',
            experience: '',
            socialMedia: {
                instagram: '',
                linkedin: '',
                twitter: ''
            }
            // profilePicture ve diğer temel bilgiler aynen kalır
        }));
        
        saveUserData(cleanedUsers);
        console.log('✅ Tüm kullanıcı profil bilgileri temizlendi.');
        alert('✅ Başarılı!\n\nTüm kullanıcı profil bilgileri temizlendi.\n\n• İsimler ve görevler korundu\n• Diğer tüm bilgiler silindi\n• Kullanıcılar kendi bilgilerini girebilir\n\nSayfa yeniden yüklenecek.');
        window.location.reload();
    } catch (error) {
        console.error('Profil temizleme hatası:', error);
        alert('❌ Hata!\n\nProfil temizleme işlemi başarısız oldu. Konsolu kontrol edin.');
    }
}

// Kullanıcıların şifre durumlarını kontrol et (debug amaçlı)
function checkUserPasswordStatus() {
    try {
        const users = loadUserData();
        let statusReport = '📊 Kullanıcı Şifre Durumları:\n\n';
        
        let needsPasswordChange = 0;
        let passwordChanged = 0;
        
        users.forEach(user => {
            const status = user.mustChangePassword ? '🔴 Şifre değiştirmeli' : '🟢 Şifre değiştirildi';
            statusReport += `${user.ad} (${user.username}): ${status}\n`;
            
            if (user.mustChangePassword) {
                needsPasswordChange++;
            } else {
                passwordChanged++;
            }
        });
        
        statusReport += `\n📈 Özet:\n`;
        statusReport += `• Şifre değiştirmesi gerekenler: ${needsPasswordChange}\n`;
        statusReport += `• Şifresi değiştirilmiş olanlar: ${passwordChanged}\n`;
        statusReport += `• Toplam kullanıcı: ${users.length}`;
        
        console.log(statusReport);
        alert(statusReport);
        
    } catch (error) {
        console.error('Şifre durumu kontrolünde hata:', error);
        alert('❌ Hata!\n\nŞifre durumu kontrolü başarısız oldu. Konsolu kontrol edin.');
    }
}

// Manuel admin fonksiyonu: Mevcut kullanıcıları kontrol et ve güncelle
function checkAndUpdateExistingUsers() {
    try {
        const users = loadUserData();
        let needsUpdate = false;
        
        // Sadece mustChangePassword alanı eksik olan (undefined/null) kullanıcıları güncelle
        const updatedUsers = users.map(user => {
            // Eğer kullanıcının mustChangePassword alanı eksikse (undefined/null), true yap
            if (user.mustChangePassword === undefined || user.mustChangePassword === null) {
                needsUpdate = true;
                console.log(`${user.username} kullanıcısına mustChangePassword alanı eklendi`);
                return {
                    ...user,
                    mustChangePassword: true
                };
            }
            return user;
        });
        
        if (needsUpdate) {
            saveUserData(updatedUsers);
            console.log('Eksik mustChangePassword alanları tamamlandı');
            return true;
        } else {
            console.log('Tüm kullanıcıların mustChangePassword alanı zaten mevcut');
            return false;
        }
    } catch (error) {
        console.error('Kullanıcı güncelleme hatası:', error);
        return false;
    }
} 
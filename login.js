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
                // Şifre değiştirme durumunu kontrol et - eğer undefined ise true yap
                mustChangePassword: user.mustChangePassword !== false
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
        joinDate: '2024-09-01',
        birthDate: '',
        department: 'Koç Üniversitesi',
        experience: '',
        socialMedia: {
            instagram: '',
            linkedin: '',
            twitter: ''
        },
        profilePicture: 'assets/1751453697640-organizator-1881-logo-F1F415.png'
    };

    switch(username) {
        case 'selen.gurdal':
            profileData.email = 'selen.gurdal@ku.edu.tr';
            profileData.telefon = '+90 555 123 4501';
            profileData.bio = 'KUTİY Eş Başkanı olarak kulübümüzün stratejik yönetiminden sorumludur. Tiyatro sanatına olan tutkusu ve liderlik yetenekleriyle ekibimizi yönlendirir.';
            profileData.birthDate = '2003-03-15';
            profileData.department = 'Koç Üniversitesi - İşletme';
            profileData.experience = '3 yıl tiyatro deneyimi, 2 yıl yönetim deneyimi';
            profileData.socialMedia.instagram = '@selen.gurdal';
            break;

        case 'ugur.bayrak':
            profileData.email = 'ugur.bayrak@ku.edu.tr';
            profileData.telefon = '+90 555 123 4502';
            profileData.bio = 'KUTİY Eş Başkanı olarak kulübün vizyonunu belirlemede aktif rol alır. Yaratıcı düşünce yapısı ve organizasyon becerileriyle öne çıkar.';
            profileData.birthDate = '2002-07-22';
            profileData.department = 'Koç Üniversitesi - Mühendislik';
            profileData.experience = '4 yıl tiyatro deneyimi, 2 yıl yönetim deneyimi';
            profileData.socialMedia.instagram = '@ugur.bayrak';
            break;

        case 'selen.sariklic':
            profileData.email = 'selen.sariklic@ku.edu.tr';
            profileData.telefon = '+90 555 123 4503';
            profileData.bio = 'Festival Sorumlusu olarak KÜTFEST organizasyonundan sorumludur. Event management konusunda uzmanlaşmış, detaylı planlama yeteneğine sahiptir.';
            profileData.birthDate = '2003-11-08';
            profileData.department = 'Koç Üniversitesi - İletişim';
            profileData.experience = '2 yıl festival organizasyonu, 3 yıl tiyatro deneyimi';
            profileData.socialMedia.instagram = '@selen.nehir';
            break;

        case 'tuana.elmas':
            profileData.email = 'tuana.elmas@ku.edu.tr';
            profileData.telefon = '+90 555 123 4504';
            profileData.bio = 'Festival Sorumlusu olarak KÜTFEST\'in yaratıcı içeriklerinden ve sanatsal yönünden sorumludur. Sanat yönetmeni kimliğiyle festivali şekillendirir.';
            profileData.birthDate = '2003-01-20';
            profileData.department = 'Koç Üniversitesi - Sanat Tarihi';
            profileData.experience = '3 yıl sanat yönetimi, 4 yıl tiyatro deneyimi';
            profileData.socialMedia.instagram = '@tuana.elmas';
            break;

        case 'melek.yucel':
            profileData.email = 'melek.yucel@ku.edu.tr';
            profileData.telefon = '+90 555 123 4505';
            profileData.bio = 'Genel Sekreter olarak kulübün tüm idari işlerinden, toplantı organizasyonundan ve dokümantasyonundan sorumludur. Titiz çalışma prensipleriyle öne çıkar.';
            profileData.birthDate = '2002-12-03';
            profileData.department = 'Koç Üniversitesi - Hukuk';
            profileData.experience = '2 yıl idari yönetim, 3 yıl tiyatro deneyimi';
            profileData.socialMedia.instagram = '@melek.yucel';
            break;

        case 'kadir.erbas':
            profileData.email = 'kadir.erbas@ku.edu.tr';
            profileData.telefon = '+90 555 123 4506';
            profileData.bio = 'Mali Koordinatör ve Lojistik Sorumlusu olarak kulübün finansal yönetimi ve etkinlik lojistiğinden sorumludur. Analitik düşünce yapısına sahiptir.';
            profileData.birthDate = '2003-06-14';
            profileData.department = 'Koç Üniversitesi - Ekonomi';
            profileData.experience = '2 yıl mali yönetim, 1 yıl lojistik, 3 yıl tiyatro';
            profileData.socialMedia.instagram = '@kadir.kaan';
            break;

        case 'sena.eliri':
            profileData.email = 'sena.eliri@ku.edu.tr';
            profileData.telefon = '+90 555 123 4507';
            profileData.bio = 'Oda Tiyatrosu Sorumlusu olarak küçük ölçekli ve deneysel oyun projelerinden sorumludur. Alternatif tiyatro formlarına odaklanır.';
            profileData.birthDate = '2003-09-25';
            profileData.department = 'Koç Üniversitesi - Psikoloji';
            profileData.experience = '3 yıl oda tiyatrosu, 4 yıl oyunculuk deneyimi';
            profileData.socialMedia.instagram = '@sena.eliri';
            break;

        case 'tunahan.saygili':
            profileData.email = 'tunahan.saygili@ku.edu.tr';
            profileData.telefon = '+90 555 123 4508';
            profileData.bio = 'Organizasyon Sorumlusu olarak etkinlik planlaması, sahne düzenlemeleri ve teknik koordinasyondan sorumludur. Problem çözme konusunda yeteneklidir.';
            profileData.birthDate = '2002-04-11';
            profileData.department = 'Koç Üniversitesi - Endüstri Mühendisliği';
            profileData.experience = '3 yıl etkinlik organizasyonu, 2 yıl teknik koordinasyon';
            profileData.socialMedia.instagram = '@tunahan.saygili';
            break;

        case 'can.sahin':
            profileData.email = 'can.sahin@ku.edu.tr';
            profileData.telefon = '+90 555 123 4509';
            profileData.bio = 'Sosyal Medya Sorumlusu olarak kulübün dijital varlığı, içerik üretimi ve online tanıtım stratejilerinden sorumludur. Yaratıcı içerik üreticisidir.';
            profileData.birthDate = '2003-08-17';
            profileData.department = 'Koç Üniversitesi - Medya ve Görsel Sanatlar';
            profileData.experience = '2 yıl sosyal medya yönetimi, 3 yıl içerik üretimi';
            profileData.socialMedia.instagram = '@can.sahin';
            break;

        case 'asli.hurma':
            profileData.email = 'asli.hurma@ku.edu.tr';
            profileData.telefon = '+90 555 123 4510';
            profileData.bio = 'Sponsorluk Sorumlusu olarak kurumsal iletişim, sponsor bulma ve ortaklık anlaşmalarından sorumludur. İletişim becerileri güçlüdür.';
            profileData.birthDate = '2003-02-28';
            profileData.department = 'Koç Üniversitesi - Uluslararası İlişkiler';
            profileData.experience = '2 yıl kurumsal iletişim, 1 yıl sponsorluk yönetimi';
            profileData.socialMedia.instagram = '@asli.hurma';
            break;

        case 'simge.dere':
            profileData.email = 'simge.dere@ku.edu.tr';
            profileData.telefon = '+90 555 123 4511';
            profileData.bio = 'Sponsorluk Sorumlusu olarak marka ortaklıkları ve finansal destekçi bulma konularında uzmanlaşmıştır. Negotiation yetenekleri gelişmiştir.';
            profileData.birthDate = '2002-10-05';
            profileData.department = 'Koç Üniversitesi - İşletme';
            profileData.experience = '2 yıl marka ortaklıkları, 3 yıl proje yönetimi';
            profileData.socialMedia.instagram = '@simge.dere';
            break;

        case 'gul.kal':
            profileData.email = 'gul.kal@ku.edu.tr';
            profileData.telefon = '+90 555 123 4512';
            profileData.bio = 'Tasarım Sorumlusu olarak görsel kimlik, poster tasarımları, sahne dekorları ve tüm yaratıcı tasarım süreçlerinden sorumludur.';
            profileData.birthDate = '2003-05-12';
            profileData.department = 'Koç Üniversitesi - Grafik Tasarım';
            profileData.experience = '3 yıl grafik tasarım, 2 yıl sahne tasarımı deneyimi';
            profileData.socialMedia.instagram = '@gul.deniz';
            break;

        case 'mehmet.usta':
            profileData.email = 'mehmet.usta@ku.edu.tr';
            profileData.telefon = '+90 555 123 4513';
            profileData.bio = 'Teknik Sorumlusu olarak sahne teknolojileri, ses-ışık sistemleri ve teknik altyapıdan sorumludur. Mühendislik yaklaşımını tiyatroya adapte eder.';
            profileData.birthDate = '2002-09-30';
            profileData.department = 'Koç Üniversitesi - Elektrik-Elektronik Mühendisliği';
            profileData.experience = '3 yıl teknik yönetim, 2 yıl ses-ışık teknolojileri';
            profileData.socialMedia.instagram = '@mehmet.guray';
            break;

        case 'merve.konuk':
            profileData.email = 'merve.konuk@ku.edu.tr';
            profileData.telefon = '+90 555 123 4514';
            profileData.bio = 'Turne Sorumlusu olarak oyunların farklı şehirlerdeki temsillerinden, seyahat organizasyonundan ve dış etkinliklerden sorumludur.';
            profileData.birthDate = '2003-07-07';
            profileData.department = 'Koç Üniversitesi - Turizm İşletmeciliği';
            profileData.experience = '2 yıl turne organizasyonu, 3 yıl etkinlik yönetimi';
            profileData.socialMedia.instagram = '@merve.makbule';
            break;

        case 'ecem.kaynar':
            profileData.email = 'ecem.kaynar@ku.edu.tr';
            profileData.telefon = '+90 555 123 4515';
            profileData.bio = 'Kurul Üyesi olarak çeşitli projelerde aktif rol alır ve kulübün genel faaliyetlerine katkı sağlar. Genç ve dinamik yaklaşımıyla öne çıkar.';
            profileData.birthDate = '2004-01-18';
            profileData.department = 'Koç Üniversitesi - Sosyoloji';
            profileData.experience = '1 yıl kurul üyeliği, 2 yıl oyunculuk deneyimi';
            profileData.socialMedia.instagram = '@ecem.naz';
            break;
    }

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

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklenirken mevcut kullanıcıları kontrol et ve güncelle
    checkAndUpdateExistingUsers();
    
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

// Test için: Mevcut kullanıcıları kontrol et ve güncelle
function checkAndUpdateExistingUsers() {
    try {
        const users = loadUserData();
        let needsUpdate = false;
        
        const updatedUsers = users.map(user => {
            // Eğer kullanıcının mustChangePassword alanı false ise, true yap
            if (user.mustChangePassword === false) {
                needsUpdate = true;
                console.log(`${user.username} kullanıcısının şifre değiştirme durumu true yapıldı`);
                return {
                    ...user,
                    mustChangePassword: true
                };
            }
            return user;
        });
        
        if (needsUpdate) {
            saveUserData(updatedUsers);
            console.log('Mevcut kullanıcılar güncellendi - hepsi şifre değiştirmek zorunda');
            return true;
        } else {
            console.log('Tüm kullanıcılar zaten şifre değiştirme durumunda');
            return false;
        }
    } catch (error) {
        console.error('Kullanıcı güncelleme hatası:', error);
        return false;
    }
} 
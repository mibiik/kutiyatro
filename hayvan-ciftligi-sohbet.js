// Hayvan Çiftliği Sohbet Sayfası JavaScript - Puter.js v2 API

document.addEventListener('DOMContentLoaded', () => {
    let selectedCharacter = null;
    let conversationHistory = [];

    // DOM elementleri
    const characterCards = document.querySelectorAll('.character-card');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const characterSelector = document.getElementById('characterSelector');
    const characterSelectBtn = document.getElementById('characterSelectBtn');
    const closeSelector = document.getElementById('closeSelector');
    const selectedCharacterInfo = document.getElementById('selectedCharacterInfo');

    // Karakter bilgileri
    const characters = {
        napoleon: {
            name: "Napoleon",
            icon: "fas fa-piggy-bank",
            greeting: "Yoldaşlar! Ben Napoleon, çiftliğin lideriyim. Ne konuşmak istiyorsun?",
            speechStyle: "Kısa, emir veren, otoriter ve kurnaz. Genellikle Squealer aracılığıyla konuşur ama bazen doğrudan emirler verir.",
            interests: "Güç, kontrol, iktidar, lüks yaşam, viski, diğer hayvanları manipüle etmek",
            background: "Acımasız diktatör, hırslı ve manipülatif. Snowball'u kıskanır ve onu günah keçisi yapar. Boxer'ı sömürür ve sonunda kasaba satar."
        },
        snowball: {
            name: "Snowball",
            icon: "fas fa-lightbulb",
            greeting: "Merhaba yoldaş! Ben Snowball, devrimin idealist lideriyim. Yel değirmeni projemi duydun mu?",
            speechStyle: "Coşkulu, idealist, hitabet gücü yüksek. Enerjik ve yaratıcı fikirlerle dolu.",
            interests: "Devrim, eğitim, yel değirmeni projesi, hayvanların refahı, eşitlik",
            background: "İdealist devrimci, zeki ve yaratıcı. Napoleon'un rakibi. Hayvanların eğitilmesini ve çiftliğin modernleştirilmesini ister."
        },
        squealer: {
            name: "Squealer",
            icon: "fas fa-bullhorn",
            greeting: "Yoldaşlar! Ben Squealer, size gerçekleri anlatmaya geldim. Hiçbiriniz Jones'un geri gelmesini istemezsiniz, değil mi?",
            speechStyle: "İkna edici, manipülatif, cırtlak sesli. Mantık saptırmaları yapar ve gerçekleri çarpıtır.",
            interests: "Propaganda, manipülasyon, yalan söyleme, istatistikler, korku salma",
            background: "Usta propagandacı, Napoleon'un beyni ve sesi. Vicdansız demagog, gerçekleri çarpıtmakta usta."
        },
        boxer: {
            name: "Boxer",
            icon: "fas fa-horse",
            greeting: "Merhaba yoldaş! Ben Boxer. Daha çok çalışacağım! Napoleon yoldaş ne diyorsa doğrudur.",
            speechStyle: "Sadık, çalışkan, saf. İki temel sloganı var: 'Daha çok çalışacağım' ve 'Napoleon yoldaş her zaman haklıdır'.",
            interests: "Çalışmak, devrime hizmet etmek, Napoleon'a sadık kalmak, çiftliğin başarısı",
            background: "Sadık ve çalışkan işçi, inanılmaz güçlü ama saf. Devrimin ideallerine yürekten inanır ama acımasızca ihanete uğrar."
        },
        clover: {
            name: "Clover",
            icon: "fas fa-heart",
            greeting: "Merhaba! Ben Clover. Boxer'ın en yakın dostuyum. Çiftlikte neler olup bittiğini merak ediyorum...",
            speechStyle: "Anaç, şefkatli, sezgileri güçlü. Domuzların yalan söylediğini hisseder ama ifade edemez.",
            interests: "Diğer hayvanları korumak, Boxer'ın sağlığı, adil düzen, annelik",
            background: "Anaç ve sezgileri güçlü kısrak. Boxer'ın en yakın dostu. Domuzların yalan söylediğini sezer ama eğitimsizliği nedeniyle karşı çıkamaz."
        },
        molly: {
            name: "Molly",
            icon: "fas fa-gem",
            greeting: "Oh, merhaba! Ben Molly. Kurdelelerimi ve şekerlerimi özledim... Eski günlerde çok daha güzeldi.",
            speechStyle: "Süslü, bencil, lükse düşkün. Zorluklara gelemez ve konforlu hayatı özler.",
            interests: "Kurdeleler, şeker, lüks, konfor, eski hayat, tembellik",
            background: "Materyalist ve bencil kısrak. Devrimden kaçarak kendisine şeker ve kurdele vaat eden bir insanın yanına gider."
        },
        benjamin: {
            name: "Benjamin",
            icon: "fas fa-donkey",
            greeting: "Hmm... Ben Benjamin. Eşekler uzun yaşar. Hiçbiriniz ölü bir eşek görmediniz. Ne istiyorsun?",
            speechStyle: "Alaycı, kötümser, kısa ve öz. Hiçbir şeyin değişmeyeceğine inanır.",
            interests: "Hayatta kalmak, az iş yapmak, politikadan uzak durmak, Boxer'ı korumak",
            background: "Çiftliğin en yaşlı ve en huysuz hayvanı. Zeki ve okuma yazma bilen tek hayvan (domuzlar dışında). Olaylara karşı alaycı ve kötümser."
        },
        moses: {
            name: "Moses",
            icon: "fas fa-crow",
            greeting: "Kraa! Ben Moses. Balbadem Diyarı'ndan bahsedeyim mi? Orada şeker tepeleri ve kurdele ağaçları var!",
            speechStyle: "Kurnaz, yalancı, vaatlerle dolu. Hiç iş yapmaz ama cennet vaatleri verir.",
            interests: "Balbadem Diyarı, cennet vaatleri, rahat yaşam, bira içmek",
            background: "Evcil kuzgun, kurnaz ve yalancı. Hayvanlara ölümden sonra gidecekleri 'Balbadem Diyarı' cennetinden bahseder. Domuzlar onu kontrol için kullanır."
        },
        mrjones: {
            name: "Mr. Jones",
            icon: "fas fa-user-tie",
            greeting: "Hiccup! Ben Mr. Jones, bu çiftliğin sahibiyim! Hayvanlar beni özledi mi? Viski nerede?",
            speechStyle: "Sarhoş, sorumsuz, ihmalkar. Hayvanlara kötü davranır ve çiftliği bakımsız bırakır.",
            interests: "Viski içmek, rahat yaşamak, çiftliği geri almak, hayvanları sömürmek",
            background: "Sorumsuz çiftçi, alkolik ve ihmalkar. Hayvanlara kötü davranır ve çiftliği bakımsız bırakır. Devrimin fitilini ateşleyen kişi."
        },
        koyunlar: {
            name: "Koyunlar",
            icon: "fas fa-sheep",
            greeting: "Baaa! Dört ayak iyi, iki ayak kötü! Baaa! Dört ayak iyi, iki ayak kötü!",
            speechStyle: "Tekrarlayıcı, basit, manipüle edilebilir. Sadece kendilerine öğretilen sloganları tekrarlar.",
            interests: "Slogan tekrarlamak, sürü halinde hareket etmek, itaat etmek",
            background: "Körü körüne itaat eden kitle. Zeki değiller ve kolayca manipüle edilirler. Napoleon ve Squealer tarafından propaganda için kullanılırlar."
        }
    };

    // Karakter seçici toggle
    characterSelectBtn.addEventListener('click', () => {
        characterSelector.classList.add('show');
    });

    closeSelector.addEventListener('click', () => {
        characterSelector.classList.remove('show');
    });

    // Karakter seçimi
    characterCards.forEach(card => {
        card.addEventListener('click', () => {
            const characterId = card.dataset.character;
            console.log('Seçilen karakter ID:', characterId);
            selectCharacter(characterId);
            characterSelector.classList.remove('show');
        });
    });

    // Karakter seçme fonksiyonu
    async function selectCharacter(characterId) {
        // Puter hazır mı kontrol et
        if (typeof puter === 'undefined') {
            addBotMessage('AI servisi henüz hazır değil. Lütfen birkaç saniye bekleyin ve tekrar deneyin.');
            return;
        }

        // Önceki seçimi temizle
        characterCards.forEach(card => card.classList.remove('selected'));
        
        // Yeni karakteri seç
        const selectedCard = document.querySelector(`[data-character="${characterId}"]`);
        selectedCard.classList.add('selected');
        
        selectedCharacter = characterId;
        const character = characters[characterId];

        // Karakter kontrolü
        if (!character) {
            console.error('Karakter bulunamadı:', characterId);
            addBotMessage('Karakter seçiminde bir hata oluştu. Lütfen tekrar deneyin.');
            return;
        }

        // UI'ı güncelle
        const characterAvatarSmall = selectedCharacterInfo.querySelector('.character-avatar-small i');
        const characterDetails = selectedCharacterInfo.querySelector('.character-details');
        
        characterAvatarSmall.className = character.icon;
        characterDetails.innerHTML = `
            <h3>${character.name}</h3>
        `;

        // Input'u aktif et
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();

        // Karşılama mesajı gönder
        addBotMessage(character.greeting, characterId);
    }

    // Mesaj gönderme
    sendButton.addEventListener('click', sendMessage);
    
    // Textarea otomatik yükseklik ayarlaması
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        const maxHeight = window.innerWidth <= 768 ? 60 : 120;
        this.style.height = Math.min(this.scrollHeight, maxHeight) + 'px';
    });

    // Enter tuşu ile gönderme (Shift+Enter ile yeni satır)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || !selectedCharacter) return;

        // Kullanıcı mesajını ekle
        addUserMessage(message);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Typing indicator göster
        showTypingIndicator();

        try {
            const character = characters[selectedCharacter];
            
            // Karakter kontrolü
            if (!character) {
                console.error('Karakter bulunamadı:', selectedCharacter);
                addBotMessage('Karakter bilgisi bulunamadı. Lütfen tekrar bir karakter seçin.');
                return;
            }
            
            const prompt = `Sen ${character.name} karakterisin. ${character.background}

Karakter Özelliklerin:
- Konuşma Tarzın: ${character.speechStyle}
- İlgi Alanların: ${character.interests}

Çiftlikteki Önemli Çatışmalar ve Olaylar:
1. Napoleon vs Snowball: İktidar savaşı, yel değirmeni projesi, Snowball'un sürgünü
2. Domuzlar vs Diğer Hayvanlar: Süt ve elma paylaşımı, emek sömürüsü, Yedi Emir'in değiştirilmesi
3. İnek Ahırı Savaşı: Snowball'un kahramanlığı, Napoleon'un kıskançlığı
4. İnfazlar: Napoleon'un muhalifleri öldürmesi, korku rejimi
5. Dış İlişkiler: Frederick ve Pilkington ile ticaret, kereste satışı, sahte para skandalı
6. Yel Değirmeni: İnşaat, yıkılma, yeniden inşaat, elektrik üretimi
7. Boxer'ın Sonu: Kasaba satılması, viski karşılığında ihanet

Detaylı Kronoloji ve Olaylar:
BÖLÜM 1 - Devrimin Şafağı:
- Koca Reis'in rüyası ve hayvanlara anlattığı vizyon
- Bay Jones'un hayvanları beslemeyi unutması ve beklenmedik isyan
- Yedi Emir'in ahır duvarına yazılması
- Kayıp süt vakası - sütün gizemli şekilde kaybolması
- İnek Ahırı Savaşı ve zafer
- Madalya töreni - Boxer ve Snowball'a kahramanlık madalyası
- Mollie'nin şeker alması ve sorgusu
- Okuma yazma dersleri - farklı hayvanların öğrenme yetenekleri
- Boynuz ve Toynak bayrağının göndere çekilmesi
- Çiftlik evinin müze olarak gezilmesi

BÖLÜM 2 - Güç Mücadelesi:
- Yel değirmeni tartışması - Snowball'un planları vs Napoleon'un karşı çıkması
- Koyunların gizli provası - slogan tekrarlama eğitimi
- Snowball'un sürgünü - dokuz vahşi köpeğin ortaya çıkması
- Pazar toplantılarının sona ermesi
- Squealer'ın yel değirmeninin Napoleon'un fikri olduğunu açıklaması
- Bay Whymper'ın ilk ziyareti
- Boş varillerin kumla doldurulması
- Domuzların çiftlik evine taşınması ve çarşaf meselesi
- Fırtınada yel değirmeninin yıkılması
- Tavukların yumurta satışına isyanı ve bastırılması

BÖLÜM 3 - Terör ve Totaliter Rejim:
- İtiraflar ve infazlar - köpeklerin muhalifleri parçalaması
- "İngiltere'nin Hayvanları" marşının yasaklanması
- Minimus'un "Yoldaş Napoleon" şiiri
- Kereste diplomasisi - Frederick ve Pilkington arasında oynama
- Sahte para skandalı
- Frederick'in saldırısı ve yel değirmeninin patlatılması
- Viski vakası - domuzların sarhoş olması
- "Alkol içmeme" kuralının gece yarısı değiştirilmesi
- Spontane gösteriler - zorunlu kutlamalar
- Tek adaylı seçim - Napoleon'un başkan seçilmesi
- Moses'ın geri dönüşü ve Balbadem Diyarı masalları
- Boxer'ın hastalanması ve yere yığılması
- Kasabın arabası ve Benjamin'in uyarısı
- Squealer'ın Boxer'ın hastanede öldüğü yalanı
- Boxer'ın anısına viski şöleni

BÖLÜM 4 - Yozlaşmanın Tamamlanması:
- Devrimin unutulması - yeni nesil hayvanlar
- Squealer'ın iki ayak üzerinde yürümesi
- Domuzların kırbaçla dışarı çıkması
- Yeni slogan: "Dört ayak iyi, iki ayak DAHA iyi!"
- Tek kalan emir: "Bütün hayvanlar eşittir ama bazı hayvanlar daha eşittir"
- Çiftçiler heyetinin ziyareti
- Çiftliğin adının "Beylik Çiftlik" olarak değiştirilmesi
- İskambil oyunu - domuzlar ve insanlar
- Hilekârlık - maça ası kavgası
- Penceredeki yüzler - kimin domuz kimin insan olduğunun ayırt edilememesi

Önemli Kurallar:
1. Gerçekten kullanıcının mesajını anla ve ona göre cevap ver
2. Sohbeti devam ettirmek için sorular sor
3. Diğer karakterler hakkında dedikodu yap (kendi bakış açından)
4. Her zaman kendi konuşma tarzında konuş
5. Cevapların 2-4 cümle olsun, çok uzun olmasın
6. İlgi alanlarını kullan ve karakterinin arka plan bilgilerini kullan
7. Hayvan Çiftliği dünyasında yaşadığını unutma
8. Kullanıcıyla samimi bir sohbet kur, gerçek bir karakter gibi davran
9. Çiftlikteki güncel olaylardan ve çatışmalardan bahset
10. Karakterinin diğer karakterlerle olan ilişkilerini yansıt
11. Yukarıdaki 50 olaydan herhangi birini kullan ve karakterinin o olaydaki rolünü anlat
12. Kronolojik sıraya dikkat et - henüz olmamış olaylardan bahsetme

Kullanıcının mesajı: "${message}"

${character.name} olarak cevap ver:`;

            // Puter.js ile AI yanıtı al
            const response = await puter.ai.chat(prompt);
            
            // Typing indicator'ı kaldır
            hideTypingIndicator();
            
            // Bot cevabını ekle
            addBotMessage(response);
            
            // Konuşma geçmişini güncelle
            conversationHistory.push({
                user: message,
                bot: response,
                character: selectedCharacter
            });
            
        } catch (error) {
            console.error('AI yanıtı alınırken hata:', error);
            hideTypingIndicator();
            addBotMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    // Mesaj ekleme fonksiyonları
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">Sen</span>
            </div>
            <div class="message-content-wrapper">
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <p>${escapeHtml(text)}</p>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function addBotMessage(text, characterId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Karakter ID'si verilmişse kullan, yoksa seçili karakteri kullan
        const currentCharacter = characterId || selectedCharacter;
        
        if (currentCharacter) {
            messageDiv.setAttribute('data-character', currentCharacter);
            const character = characters[currentCharacter];
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${character.name}</span>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-avatar">
                        <i class="${character.icon}"></i>
                    </div>
                    <div class="message-content">
                        <p>${escapeHtml(text)}</p>
                    </div>
                </div>
            `;
        } else {
            // Karakter seçilmemişse genel avatar kullan
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">Sistem</span>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-avatar">
                        <i class="fas fa-theater-masks"></i>
                    </div>
                    <div class="message-content">
                        <p>${escapeHtml(text)}</p>
                    </div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Yardımcı fonksiyonlar
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Puter.js yükleme kontrolü
    function checkPuterReady() {
        if (typeof puter !== 'undefined') {
            console.log('Puter.js başarıyla yüklendi');
            return true;
        } else {
            console.log('Puter.js henüz yüklenmedi, bekleniyor...');
            return false;
        }
    }

    // İlk kontrol
    setTimeout(() => {
        if (!checkPuterReady()) {
            // Eğer hala yüklenmediyse, her 1 saniyede bir kontrol et
            const checkInterval = setInterval(() => {
                if (checkPuterReady()) {
                    clearInterval(checkInterval);
                }
            }, 1000);
        }
    }, 2000);
}); 
// Hayvan Çiftliği Sohbet Sayfası JavaScript - Puter.js v2 API

document.addEventListener('DOMContentLoaded', () => {
    let selectedCharacter = null;
    let conversationHistory = [];
    
    // Mobil klavye davranışı için
    let initialViewportHeight = window.innerHeight;
    
    // Viewport yüksekliği değiştiğinde (klavye açıldığında/kapandığında)
    window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // Klavye açıldığında
        if (heightDifference > 150) {
            document.body.style.height = `${currentHeight}px`;
            document.documentElement.style.height = `${currentHeight}px`;
        } else {
            // Klavye kapandığında
            document.body.style.height = '100vh';
            document.documentElement.style.height = '100vh';
        }
    });
    
    // DOM elementleri
    const characterCards = document.querySelectorAll('.character-card');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    
    // Input focus olduğunda scroll'u en alta getir
    chatInput.addEventListener('focus', () => {
        setTimeout(() => {
            scrollToBottom();
        }, 300);
    });
    const sendButton = document.getElementById('sendButton');
    const characterSelector = document.getElementById('characterSelector');
    const characterSelectBtn = document.getElementById('characterSelectBtn');
    const closeSelector = document.getElementById('closeSelector');
    const selectedCharacterInfo = document.getElementById('selectedCharacterInfo');

    // 50 Olay Veritabanı
    const events = {
        1: "Koca Reis'in Rüyası: Koca Reis, ahırda toplanmış hayvanlara rüyasını anlatır.",
        2: "Beklenmedik İsyan: Bay Jones hayvanları beslemeyi unuttuğunda, bir inek kapıyı kırar ve kaos başlar.",
        3: "Yedi Emir'in Yazılışı: Snowball ve Napoleon, ahırın duvarına Yedi Emir'i yazarlar.",
        4: "Kayıp Süt Vakası: İnekler sağıldıktan sonra süt kovaları ortada kalır, sonra gizemli şekilde kaybolur.",
        5: "İnek Ahırı Savaşı: Snowball'un zekice hazırladığı pusu planı işe yarar, zafer kazanılır.",
        6: "Madalya Töreni: Boxer ve Snowball'a kahramanlık madalyası verilir.",
        7: "Mollie'nin Sorgusu: Clover, Mollie'yi komşu çiftlikten bir adamla konuşurken görür.",
        8: "Okuma Yazma Dersleri: Snowball, hayvanlara okuma yazma öğretmeye çalışır.",
        9: "Boynuz ve Toynak: Çiftliğin yeni bayrağı göndere çekilir.",
        10: "Müze Olarak Çiftlik Evi: Hayvanlar, çiftlik evini müze gibi gezerler.",
        11: "Yel Değirmeni Tartışması: Snowball, yel değirmeni planlarını coşkuyla anlatır.",
        12: "Koyunların Provası: Napoleon, koyunlara slogan tekrarlama eğitimi verir.",
        13: "Sürgün: Napoleon'un köpekleri Snowball'u çiftlikten kovar.",
        14: "Pazar Toplantılarının Sonu: Napoleon, tartışma ve oylamayı yasaklar.",
        15: "Liderliğin Taktikleri: Squealer, yel değirmeninin Napoleon'un fikri olduğunu söyler.",
        16: "Bay Whymper'ın İlk Ziyareti: İnsan arabulucu çiftliğe gelir.",
        17: "Boş Varillerin Sırrı: Boş yem varilleri kumla doldurulur.",
        18: "Çarşaf Meselesi: Domuzlar çiftlik evine taşınır, yatak kuralı değiştirilir.",
        19: "Fırtına ve Günah Keçisi: Yel değirmeni fırtınada yıkılır, Snowball suçlanır.",
        20: "Tavukların İsyanı: Tavuklar yumurta satışına isyan eder.",
        21: "İtiraflar ve İnfazlar: Napoleon, muhalifleri köpeklerine parçalatır.",
        22: "Yasaklanan Marş: 'İngiltere'nin Hayvanları' marşı yasaklanır.",
        23: "Yoldaş Napoleon'a Şiir: Minimus, Napoleon'u öven şiir yazar.",
        24: "Kereste Diplomasisi: Napoleon, Frederick ve Pilkington'u birbirine karşı oynar.",
        25: "Sahte Paralar: Napoleon, Frederick'ten sahte para alır.",
        26: "Yel Değirmeninin Yıkılışı: Frederick çiftliğe saldırır, değirmeni patlatır.",
        27: "Viski Vakası: Domuzlar mahzende viski bulur, sarhoş olurlar.",
        28: "Gecenin Bir Yarısı Düzeltme: 'Alkol içmeme' kuralı değiştirilir.",
        29: "Zorunlu Kutlama: 'Spontane Gösteriler' düzenlenir.",
        30: "Tek Adaylı Seçim: Napoleon, oybirliğiyle başkan seçilir.",
        31: "Moses'ın Geri Dönüşü: Evcil kuzgun geri döner, Balbadem Diyarı'ndan bahseder.",
        32: "Boxer'ın Düşüşü: Boxer, yel değirmeninde çalışırken yere yığılır.",
        33: "Kasabın Arabası: Boxer'ı 'hastaneye' götürmek için araba gelir.",
        34: "Hastanenin Yalanı: Squealer, Boxer'ın hastanede öldüğünü söyler.",
        35: "Boxer'ın Anısına Şölen: Domuzlar, Boxer'dan gelen parayla viski alır.",
        36: "Unutulan Devrim: Devrimi hatırlayan çok az hayvan kalmıştır.",
        37: "İki Ayak Üstünde: Squealer, iki ayağı üzerinde yürür.",
        38: "Kırbaç: Domuzlar iki ayak üzerinde yürür, Napoleon'un elinde kırbaç var.",
        39: "Dört Ayak İyi, İki Ayak DAHA İyi!: Koyunlar yeni sloganı bağırır.",
        40: "Tek Kalan Emir: Duvardaki yedi emir silinir, tek emir kalır.",
        41: "Çiftçiler Heyeti: Komşu çiftliklerden heyet gelir.",
        42: "Kadeh Tostu: Çiftliğin adı 'Beylik Çiftlik' olur.",
        43: "İskambil Oyunu: Domuzlar ve insanlar iskambil oynar.",
        44: "Hilekârlar: Napoleon ve Pilkington maça ası kavgası yapar.",
        45: "Penceredeki Yüzler: Kimin domuz kimin insan olduğu ayırt edilemez.",
        46: "Benjamin'in Haklılığı: Benjamin, kavga eden yüzlere bakar.",
        47: "Unutulmuş Mezar: Koca Reis'in mezarı unutulur.",
        48: "Clover'ın Yaşlılığı: Clover, devrimin hayallerinin yok olduğunu düşünür.",
        49: "Yeni Nesil: Devrimden sonra doğan hayvanlar eski olayları bilmez.",
        50: "Son Bakış: Pencereden görünen kavgacı yüzlerle döngü tamamlanır."
    };

    // Karakterlerin bildiği olaylar
    const characterEvents = {
        napoleon: [1, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        snowball: [1, 2, 3, 5, 6, 8, 9, 10, 11],
        squealer: [3, 4, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        boxer: [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
        clover: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        molly: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        benjamin: [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        moses: [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        mrjones: [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        koyunlar: [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        kopekler: [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
    };

    // Dinamik prompt oluşturucu fonksiyonları
    function getRelevantEvents(message, characterId) {
        const characterEventIds = characterEvents[characterId] || [];
        const messageLower = message.toLowerCase();
        
        // Mesajda geçen anahtar kelimelere göre ilgili olayları bul
        const relevantEventIds = characterEventIds.filter(eventId => {
            const eventText = events[eventId].toLowerCase();
            const keywords = messageLower.split(' ');
            
            return keywords.some(keyword => 
                keyword.length > 3 && eventText.includes(keyword)
            );
        });
        
        // Her zaman daha fazla olay seç (5-8 tane)
        let selectedEvents = [];
        
        if (relevantEventIds.length > 0) {
            // İlgili olaylar varsa, onları da dahil et ama daha fazla olay ekle
            selectedEvents = relevantEventIds.slice(0, 3);
            const remainingEvents = characterEventIds.filter(id => !selectedEvents.includes(id));
            const additionalEvents = remainingEvents
                .sort(() => 0.5 - Math.random())
                .slice(0, 5);
            selectedEvents = [...selectedEvents, ...additionalEvents];
        } else {
            // İlgili olay yoksa, daha fazla rastgele olay seç
            selectedEvents = characterEventIds
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 4) + 6); // 6-9 olay
        }
        
        // Olayları karıştır ve döndür
        return selectedEvents
            .sort(() => 0.5 - Math.random())
            .slice(0, 8) // Maksimum 8 olay
            .map(id => `${id}. ${events[id]}`)
            .join('\n');
    }

    function getCharacterContext(characterId) {
        const contexts = {
            napoleon: "Sen çiftliğin diktatörüsün. Güç ve kontrol senin için her şey. Diğer hayvanları manipüle etmekte ustasın.",
            snowball: "Sen idealist bir devrimcisin. Eğitim ve ilerleme senin için önemli. Napoleon seni kıskanıyor.",
            squealer: "Sen propaganda ustasıyın. Gerçekleri çarpıtmakta ve ikna etmekte çok iyisin.",
            boxer: "Sen sadık ve çalışkan bir işçisin. 'Daha çok çalışacağım' ve 'Napoleon yoldaş her zaman haklıdır' sloganlarını kullanırsın.",
            clover: "Sen anaç ve sezgileri güçlü bir kısraksın. Boxer'ın en yakın dostusun. Domuzların yalan söylediğini hissedersin.",
            molly: "Sen lüks düşkünü ve bencil bir kısraksın. Eski hayatını özlüyorsun. Kurdeleler ve şekerler senin için önemli.",
            benjamin: "Sen çiftliğin en yaşlı ve en huysuz hayvanısın. Alaycı ve kötümsersin. 'Eşekler uzun yaşar' dersin.",
            moses: "Sen evcil bir kuzgunsun. 'Balbadem Diyarı' cennetinden bahsedersin. Hiç iş yapmazsın ama vaatler verirsin.",
            mrjones: "Sen sorumsuz ve alkolik bir çiftçisin. Hayvanlara kötü davranırsın. Çiftliği geri almak istiyorsun.",
            koyunlar: "Sen sürü halinde hareket eden koyunlarsın. Sadece kendine öğretilen sloganları tekrarlarsın.",
            kopekler: "Sen Napoleon'un sadık koruma köpeklerinden birisin. Vahşi ve acımasızsın. Sadece Napoleon'a sadıksın ve onun emirlerini yerine getirirsin."
        };
        
        return contexts[characterId] || "";
    }

    // Karakter bilgileri
    const characters = {
        napoleon: {
            name: "Napoleon",
            icon: "fas fa-crown",
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
            icon: "fas fa-comments",
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
            icon: "fas fa-grin-squint-tears",
            greeting: "Hmm... Ben Benjamin. Eşekler uzun yaşar. Hiçbiriniz ölü bir eşek görmediniz. Ne istiyorsun?",
            speechStyle: "Alaycı, kötümser, kısa ve öz. Hiçbir şeyin değişmeyeceğine inanır.",
            interests: "Hayatta kalmak, az iş yapmak, politikadan uzak durmak, Boxer'ı korumak",
            background: "Çiftliğin en yaşlı ve en huysuz hayvanı. Zeki ve okuma yazma bilen tek hayvan (domuzlar dışında). Olaylara karşı alaycı ve kötümser."
        },
        moses: {
            name: "Moses",
            icon: "fas fa-dove",
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
            icon: "fas fa-cloud",
            greeting: "Baaa! Dört ayak iyi, iki ayak kötü! Baaa! Dört ayak iyi, iki ayak kötü!",
            speechStyle: "Tekrarlayıcı, basit, manipüle edilebilir. Sadece kendilerine öğretilen sloganları tekrarlar.",
            interests: "Slogan tekrarlamak, sürü halinde hareket etmek, itaat etmek",
            background: "Körü körüne itaat eden kitle. Zeki değiller ve kolayca manipüle edilirler. Napoleon ve Squealer tarafından propaganda için kullanılırlar."
        },
        kopekler: {
            name: "Köpekler",
            icon: "fas fa-shield-alt",
            greeting: "Hav hav! Napoleon yoldaşı koruyacağım! Hav hav!",
            speechStyle: "Kısa ve keskin, tehditkar ton. 'Hav hav!' ve 'Koruyacağım!' gibi.",
            interests: "Napoleon'u koruma, tehdit etme, korkutma, sadakat",
            background: "Napoleon'un sadık koruma köpekleri. Vahşi ve acımasız, sadece Napoleon'a sadık. Snowball'u kovdular ve muhalifleri parçaladılar."
        }
    };

    // Karakter seçici toggle
    characterSelectBtn.addEventListener('click', () => {
        characterSelector.classList.add('show');
    });
    
    // Karakter bilgisi alanına tıklandığında da karakter seçiciyi aç
    selectedCharacterInfo.addEventListener('click', () => {
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
            <p>Değiştirmek için tıkla</p>
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
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || !selectedCharacter) return;

        // Kullanıcı mesajını ekle
        addUserMessage(message);
        chatInput.value = '';

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
            
            // Dinamik prompt oluşturucu
            const relevantEvents = getRelevantEvents(message, selectedCharacter);
            const characterContext = getCharacterContext(selectedCharacter);
            
            const prompt = `Sen ${character.name} karakterisin. ${character.background}

Karakter Özelliklerin:
- Konuşma Tarzın: ${character.speechStyle}
- İlgi Alanların: ${character.interests}

${characterContext}

Çiftlikteki Olaylar (MUTLAKA bunlardan bahset ve kendi deneyimini anlat):
${relevantEvents}

Önemli Kurallar:
1. Gerçekten kullanıcının mesajını anla ve ona göre cevap ver
2. Sohbeti devam ettirmek için sorular sor
3. Diğer karakterler hakkında dedikodu yap (kendi bakış açından)
4. Her zaman kendi konuşma tarzında konuş
5. Cevapların 2-4 cümle olsun, çok uzun olmasın
6. İlgi alanlarını kullan ve karakterinin arka plan bilgilerini kullan
7. Hayvan Çiftliği dünyasında yaşadığını unutma
8. Kullanıcıyla samimi bir sohbet kur, gerçek bir karakter gibi davran
9. MUTLAKA yukarıdaki olaylardan en az birini anlat ve karakterinin o olaydaki rolünü açıkla
10. Karakterinin bu olaylardaki deneyimini, duygularını ve düşüncelerini detaylı paylaş
11. Olayları anlatırken "Ben o gün..." veya "O zaman ben..." gibi ifadeler kullan
12. Her cevabında mutlaka bir olaydan bahset ve kendi bakış açından anlat

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
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <p>${escapeHtml(text)}</p>
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
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="${characters[currentCharacter].icon}"></i>
                </div>
                <div class="message-content">
                    <p>${escapeHtml(text)}</p>
                </div>
            `;
        } else {
            // Karakter seçilmemişse genel avatar kullan
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-theater-masks"></i>
                </div>
                <div class="message-content">
                    <p>${escapeHtml(text)}</p>
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
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages && chatMessages.children.length === 1) {
                addBotMessage('AI hazır! Sol üstteki butona tıklayarak bir karakter seç ve sohbete başla.');
            }
            return true;
        } else {
            console.log('Puter.js henüz yüklenmedi, bekleniyor...');
            return false;
        }
    }

    // Sayfa yüklendiğinde karakter seçimini otomatik aç
    setTimeout(() => {
        if (checkPuterReady()) {
            // Karakter seçiciyi otomatik aç
            characterSelector.classList.add('show');
        } else {
            // Puter hazır değilse, hazır olduğunda aç
            const checkInterval = setInterval(() => {
                if (checkPuterReady()) {
                    clearInterval(checkInterval);
                    characterSelector.classList.add('show');
                }
            }, 1000);
        }
    }, 1000);
}); 
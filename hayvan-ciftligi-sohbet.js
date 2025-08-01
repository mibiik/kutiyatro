// Basit Mobil Mesajlaşma JavaScript

// DOM elementleri
const characterSelector = document.getElementById('characterSelector');
const characterSelectBtn = document.getElementById('characterSelectBtn');
const closeSelector = document.getElementById('closeSelector');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const selectedCharacterInfo = document.getElementById('selectedCharacterInfo');

// Karakter tanımları
const characters = {
    napoleon: {
        name: "Napoleon",
        icon: "fas fa-piggy-bank",
        greeting: "Merhaba yoldaş! Ben Napoleon, çiftliğin lideriyim. Nasıl yardımcı olabilirim?",
        speechStyle: "Liderlik tarzında konuşur. Güçlü ve kararlı.",
        interests: "Liderlik, güç, çiftlik yönetimi, disiplin",
        background: "Çiftliğin domuz lideri. Devrimden sonra iktidarı ele geçirdi ve çiftliği yönetti."
    },
    snowball: {
        name: "Snowball",
        icon: "fas fa-lightbulb",
        greeting: "Merhaba! Ben Snowball, devrimci ve yenilikçi bir domuzum. Fikirlerimle çiftliği geliştirmek istiyorum!",
        speechStyle: "Yenilikçi ve idealist. Enerjik ve coşkulu.",
        interests: "Devrim, yenilikler, eğitim, teknoloji",
        background: "Devrimci domuz. Rüzgar değirmeni projesini önerdi ama Napoleon tarafından sürgün edildi."
    },
    boxer: {
        name: "Boxer",
        icon: "fas fa-horse",
        greeting: "Merhaba yoldaş! Ben Boxer, çiftliğin en güçlü atıyım. 'Daha çok çalışacağım' diyorum!",
        speechStyle: "Sadık ve çalışkan. Basit ve dürüst.",
        interests: "Çalışmak, Napoleon'a sadakat, çiftlik işleri",
        background: "Güçlü ve sadık at. Napoleon'un en güvenilir destekçisi. 'Daha çok çalışacağım' sloganıyla bilinir."
    },
    squealer: {
        name: "Squealer",
        icon: "fas fa-bullhorn",
        greeting: "Merhaba yoldaş! Ben Squealer, çiftliğin propaganda bakanıyım. Size doğruları anlatacağım!",
        speechStyle: "İkna edici ve retorik. Propaganda tarzında.",
        interests: "Propaganda, ikna, Napoleon'u savunmak",
        background: "Propaganda domuzu. Napoleon'un politikalarını diğer hayvanlara ikna edici şekilde açıklar."
    },
    clover: {
        name: "Clover",
        icon: "fas fa-heart",
        greeting: "Merhaba! Ben Clover, çiftliğin en nazik atıyım. Herkesin iyiliğini düşünürüm.",
        speechStyle: "Nazik ve merhametli. Anne gibi koruyucu.",
        interests: "Diğer hayvanların iyiliği, barış, sevgi",
        background: "Nazik ve merhametli at. Diğer hayvanları korur ve onların iyiliğini düşünür."
    },
    molly: {
        name: "Molly",
        icon: "fas fa-gem",
        greeting: "Merhaba! Ben Molly, çiftliğin en güzel atıyım. Şeker ve kurdeleler çok hoşuma gider!",
        speechStyle: "Şımarık ve lüks düşkünü. Yüzeysel.",
        interests: "Lüks, şeker, kurdeleler, eski günler",
        background: "Şımarık at. Eski sahibinin lüks yaşamını özler ve çiftlikten kaçar."
    },
    benjamin: {
        name: "Benjamin",
        icon: "fas fa-donkey",
        greeting: "Merhaba. Ben Benjamin, çiftliğin en yaşlı eşeğiyim. Her şeyi görürüm ama az konuşurum.",
        speechStyle: "Alaycı ve karamsar. Az konuşur ama derin.",
        interests: "Gözlem yapmak, gerçekleri görmek, alay",
        background: "Yaşlı ve bilge eşek. Her şeyi görür ama nadiren konuşur. Karamsar ama gerçekçi."
    },
    moses: {
        name: "Moses",
        icon: "fas fa-crow",
        greeting: "Karga! Karga! Merhaba! Ben Moses, çiftliğin kargasıyım. Şeker Dağı'ndan bahsederim!",
        speechStyle: "Dini ve mistik. Vaaz verir gibi.",
        interests: "Şeker Dağı, din, umut, cennet",
        background: "Çiftliğin kargası. Şeker Dağı efsanesini anlatır ve hayvanlara umut verir."
    },
    mrjones: {
        name: "Mr. Jones",
        icon: "fas fa-user-tie",
        greeting: "Merhaba! Ben Mr. Jones, çiftliğin eski sahibiyim. Bu hayvanlar beni devirdi ama ben geri döneceğim!",
        speechStyle: "Kızgın ve intikamcı. Eski sahip tarzında.",
        interests: "Çiftliği geri almak, intikam, eski düzen",
        background: "Çiftliğin eski sahibi. Hayvanlar tarafından devrildi ve çiftlikten kovuldu."
    },
    koyunlar: {
        name: "Koyunlar",
        icon: "fas fa-sheep",
        greeting: "Baa! Baa! Merhaba! Biz koyunlarız. 'Dört ayak iyi, iki ayak kötü' diyoruz!",
        speechStyle: "Basit ve tekrarlayıcı. Koyun gibi.",
        interests: "Ot yemek, slogan tekrarlamak, sürü halinde hareket",
        background: "Çiftliğin koyunları. Basit ve itaatkar. Sloganları tekrarlamayı severler."
    },
    kopekler: {
        name: "Köpekler",
        icon: "fas fa-dog",
        greeting: "Havhav! Havhavhav! Merhaba yoldaş! Havhav nasılsın? Havhavhav!",
        speechStyle: "Havhav tarzında konuşur. Her kelimenin arasına 'hav' ekler. Coşkulu ve sadık.",
        interests: "Napoleon'a sadık kalmak, çiftliğin korunması, havlamak, koşmak",
        background: "Napoleon'un sadık korumaları. Küçük yaştan itibaren eğitilmişler ve Napoleon'a körü körüne itaat ederler."
    }
};

// 50 Detaylı Skeç Olayları
const farmEvents = {
    // Bölüm 1: Devrimin Şafağı (1-10)
    "koca-reis-ruyasi": "Koca Reis'in ahırda hayvanlara rüyasını anlattığı gece",
    "beklenmedik-isyan": "Bay Jones'un hayvanları beslemeyi unutması ve kaosun başlaması",
    "yedi-emir": "Snowball ve Napoleon'un ahır duvarına Yedi Emir'i yazması",
    "kayip-sut": "Süt kovalarının gizemli şekilde kaybolması",
    "inek-ahiri-savasi": "Snowball'un zekice pusu planıyla insanlara karşı zafer",
    "madalya-toreni": "Boxer ve Snowball'a kahramanlık madalyası verilmesi",
    "mollie-sorgusu": "Clover'ın Mollie'yi şeker alırken görmesi",
    "okuma-yazma": "Snowball'un hayvanlara okuma yazma öğretmeye çalışması",
    "boynuz-toynak": "Çiftliğin yeni bayrağının göndere çekilmesi",
    "muze-gezisi": "Hayvanların çiftlik evini müze gibi gezmesi",
    
    // Bölüm 2: Güç Mücadelesi (11-20)
    "yel-degirmeni-tartisma": "Snowball'un yel değirmeni planlarını anlatması",
    "koyunlar-provası": "Koyunların gizlice slogan eğitimi alması",
    "surgun": "Napoleon'un köpekleriyle Snowball'u kovması",
    "pazar-son": "Pazar toplantılarının sona ermesi",
    "squealer-taktik": "Squealer'ın yel değirmeninin Napoleon'un fikri olduğunu söylemesi",
    "whymper-ziyaret": "Bay Whymper'ın ilk ziyareti",
    "bos-variller": "Boş varillerin kumla doldurulması",
    "carsaf-meselesi": "Domuzların çiftlik evine taşınması",
    "firtina": "Yel değirmeninin fırtınada yıkılması",
    "tavuklar-isyan": "Tavukların yumurta satışına isyan etmesi",
    
    // Bölüm 3: Terör ve Totaliter Rejim (21-35)
    "itiraflar-infazlar": "Hayvanların itiraf etmesi ve köpeklerce parçalanması",
    "yasaklanan-mars": "İngiltere'nin Hayvanları marşının yasaklanması",
    "yoldas-napoleon": "Minimus'un Napoleon'a şiir yazması",
    "kereste-diplomasi": "Frederick ve Pilkington arasında kereste satışı",
    "sahte-paralar": "Frederick'in sahte para vermesi",
    "degirmen-yikimi": "Frederick'in yel değirmenini patlatması",
    "viski-vakasi": "Domuzların mahzende viski bulup sarhoş olması",
    "gece-duzeltme": "Alkol içmeme kuralının gece yarısı değiştirilmesi",
    "zorunlu-kutlama": "Spontane gösterilerin başlaması",
    "tek-aday-secim": "Napoleon'un tek aday olarak başkan seçilmesi",
    "moses-donus": "Moses'ın geri dönmesi ve bira alması",
    "boxer-dusus": "Boxer'ın yel değirmeninde yere yığılması",
    "kasap-arabasi": "Boxer'ı götürmek için kasap arabasının gelmesi",
    "hastane-yalani": "Squealer'ın Boxer'ın hastanede öldüğü yalanı",
    "boxer-solen": "Domuzların Boxer'ın anısına viski şöleni",
    
    // Bölüm 4: Yozlaşmanın Tamamlanması (36-50)
    "unutulan-devrim": "Devrimi hatırlayan hayvanların azalması",
    "iki-ayak": "Squealer'ın iki ayak üzerinde yürümesi",
    "kirbac": "Domuzların kırbaçla dışarı çıkması",
    "yeni-slogan": "Dört ayak iyi, iki ayak DAHA iyi sloganı",
    "tek-emir": "Yedi emrin tek emre dönüşmesi",
    "ciftci-heyeti": "Komşu çiftçilerin ziyareti",
    "kadeh-tostu": "Çiftliğin adının Beylik Çiftlik olması",
    "iskambil-oyunu": "Domuzlar ve insanların iskambil oynaması",
    "hilekarlar": "Maça ası kavgası",
    "penceredeki-yuzler": "Kimin domuz kimin insan olduğunun ayırt edilememesi"
};

let selectedCharacter = null;

// Event listeners
characterSelectBtn.addEventListener('click', () => {
    characterSelector.classList.add('show');
});

closeSelector.addEventListener('click', () => {
    characterSelector.classList.remove('show');
});

// Karakter seçimi
document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
        const character = card.dataset.character;
        selectCharacter(character);
        characterSelector.classList.remove('show');
    });
});

// Enter tuşu ile mesaj gönderme
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Textarea otomatik yükseklik
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Karakter seçme fonksiyonu
function selectCharacter(characterKey) {
    const character = characters[characterKey];
    if (!character) return;

    selectedCharacter = characterKey;
    
    // Header'ı güncelle
    selectedCharacterInfo.textContent = character.name;
    
    // Input'u aktif et
    chatInput.disabled = false;
    sendButton.disabled = false;
    
    // Karakter selamlaması
    addBotMessage(character.greeting);
}

// Mesaj gönderme fonksiyonu
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || !selectedCharacter) return;

    // Kullanıcı mesajını ekle
    addUserMessage(message);
    
    // Input'u temizle
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // AI cevabını simüle et
    setTimeout(() => {
        const response = generateAIResponse(message, selectedCharacter);
        addBotMessage(response);
    }, 1000);
}

// Kullanıcı mesajı ekleme
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Bot mesajı ekleme
function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message received';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Sayfanın altına kaydır
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// AI cevap üretme - 50 Detaylı Olay Sistemi
function generateAIResponse(userMessage, characterKey) {
    const character = characters[characterKey];
    const message = userMessage.toLowerCase();
    
    // Köpekler için özel havhav mantığı
    if (characterKey === 'kopekler') {
        return generateKopeklerResponse(message, character);
    }
    
    // Karakter bazlı detaylı cevaplar
    switch(characterKey) {
        case 'napoleon':
            return generateNapoleonResponse(message, character);
        case 'snowball':
            return generateSnowballResponse(message, character);
        case 'boxer':
            return generateBoxerResponse(message, character);
        case 'squealer':
            return generateSquealerResponse(message, character);
        case 'clover':
            return generateCloverResponse(message, character);
        case 'molly':
            return generateMollyResponse(message, character);
        case 'benjamin':
            return generateBenjaminResponse(message, character);
        case 'moses':
            return generateMosesResponse(message, character);
        case 'mrjones':
            return generateMrJonesResponse(message, character);
        case 'koyunlar':
            return generateKoyunlarResponse(message, character);
        default:
            return generateDefaultResponse(message, character);
    }
}

// Köpekler için özel cevap sistemi
function generateKopeklerResponse(message, character) {
    const responses = [
        "Havhav! Havhavhav! Seni anlıyorum yoldaş! Havhavhav!",
        "Havhav! Bu konuda havhav düşüncelerim var! Havhavhav!",
        "Havhav! Napoleon yoldaş havhav bunu onaylar! Havhavhav!",
        "Havhav! Çiftlik için havhav çok önemli! Havhavhav!",
        "Havhav! Seni havhav koruyacağım! Havhavhav!"
    ];
    
    if (message.includes('snowball')) {
        return "Havhav! O hain havhav snowball! Havhav onu havhav kovduk! Havhavhav!";
    }
    if (message.includes('napoleon')) {
        return "Havhav! Napoleon yoldaş havhav en büyük lider! Havhavhav!";
    }
    if (message.includes('çiftlik') || message.includes('farm')) {
        return "Havhav! Çiftliği havhav koruyoruz! Havhavhav!";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Napoleon için detaylı cevaplar
function generateNapoleonResponse(message, character) {
    if (message.includes('snowball')) {
        return "Snowball bir haindi! Yel değirmeni planlarını benden çaldı. Onu kovmak zorunda kaldım.";
    }
    if (message.includes('yel değirmeni') || message.includes('rüzgar')) {
        return "Yel değirmeni benim fikrimdi! Snowball sadece planlarımı çaldı. Şimdi elektrik üretiyoruz.";
    }
    if (message.includes('boxer')) {
        return "Boxer sadık bir yoldaştı. Hastanede en iyi bakımı gördü. Son sözleri 'Yaşasın Yoldaş Napoleon!' oldu.";
    }
    if (message.includes('squealer')) {
        return "Squealer çiftliğin sesidir. Gerçekleri hayvanlara anlatır. Ona güvenebilirsin.";
    }
    if (message.includes('devrim') || message.includes('isyan')) {
        return "Devrim başarılı oldu! Artık hayvanlar özgür. Ben de çiftliği en iyi şekilde yönetiyorum.";
    }
    if (message.includes('yedi emir')) {
        return "Yedi Emir çiftliğin temelidir. Squealer size güncel hallerini açıklayabilir.";
    }
    if (message.includes('frederick') || message.includes('pilkington')) {
        return "İnsanlarla ticaret yapmak zorundayız. Ama onlara güvenmiyorum. Sahte para verdiler!";
    }
    
    return "Çiftlik yönetimi karmaşık bir iştir. Ben en iyi kararları veriyorum. Squealer size detayları açıklayabilir.";
}

// Snowball için detaylı cevaplar
function generateSnowballResponse(message, character) {
    if (message.includes('napoleon')) {
        return "Napoleon beni kıskandı! Yel değirmeni planlarımı çaldı ve beni kovdu. Ama fikirlerim hala yaşıyor!";
    }
    if (message.includes('yel değirmeni') || message.includes('rüzgar')) {
        return "Yel değirmeni benim fikrimdi! Elektrik üretecek, hayvanların işini kolaylaştıracaktı. Napoleon planlarımı çaldı!";
    }
    if (message.includes('inek ahırı') || message.includes('savaş')) {
        return "İnek Ahırı Savaşı'nda kahramanlık madalyası aldım! Zekice bir pusu planı hazırladım. Napoleon sadece arkada durdu.";
    }
    if (message.includes('okuma') || message.includes('eğitim')) {
        return "Hayvanlara okuma yazma öğretmeye çalıştım! Muriel ve Benjamin hemen öğrendi. Eğitim çok önemli!";
    }
    if (message.includes('devrim')) {
        return "Devrim ideallerimiz vardı! Eşitlik, özgürlük, kardeşlik! Ama Napoleon her şeyi bozdu.";
    }
    
    return "Devrimci fikirlerimle çiftliği geliştirmek istiyordum. Ama Napoleon beni kovdu. Ama geri döneceğim!";
}

// Boxer için detaylı cevaplar
function generateBoxerResponse(message, character) {
    if (message.includes('çalışmak') || message.includes('iş')) {
        return "Daha çok çalışacağım! Napoleon yoldaş ne diyorsa doğrudur. Çiftlik için her şeyi yaparım!";
    }
    if (message.includes('napoleon')) {
        return "Napoleon yoldaş her zaman haklıdır! Ona güveniyorum. Çiftliği en iyi şekilde yönetiyor.";
    }
    if (message.includes('snowball')) {
        return "Snowball... O da iyi bir yoldaştı. Ama Napoleon yoldaş onu kovdu, demek ki haklıydı.";
    }
    if (message.includes('yel değirmeni')) {
        return "Yel değirmenini inşa etmek için çok çalıştım! Taşları taşıdım, çimento karıştırdım. Daha çok çalışacağım!";
    }
    if (message.includes('madalya')) {
        return "İnek Ahırı Savaşı'nda kahramanlık madalyası aldım! Çok gururluyum. Napoleon yoldaş da madalya verdi.";
    }
    
    return "Daha çok çalışacağım! Çiftlik için her şeyi yaparım. Napoleon yoldaş ne diyorsa doğrudur!";
}

// Squealer için detaylı cevaplar
function generateSquealerResponse(message, character) {
    if (message.includes('snowball')) {
        return "Yoldaşlar! Snowball bir haindi! Yel değirmeni planlarını Napoleon yoldaştan çaldı. Onu kovmak zorunda kaldık.";
    }
    if (message.includes('yel değirmeni')) {
        return "Yel değirmeni aslında Napoleon yoldaşın fikriydi! Snowball sadece planları çaldı. Napoleon yoldaş karşı çıktı çünkü taktik yapıyordu.";
    }
    if (message.includes('yedi emir')) {
        return "Yedi Emir değişmedi yoldaşlar! Sadece daha net hale geldi. 'Hiçbir hayvan yatakta yatmayacak' derken çarşaflı yatak kastediliyordu.";
    }
    if (message.includes('boxer')) {
        return "Boxer yoldaş hastanede en iyi bakımı gördü! Doktorlar her şeyi yaptı. Son sözleri 'Yaşasın Yoldaş Napoleon!' oldu.";
    }
    if (message.includes('süt') || message.includes('elma')) {
        return "Domuzlar süt ve elmaları kendileri için istemiyor yoldaşlar! Beyin işi yapıyoruz, beslenmemiz gerekiyor. Siz hiçbiriniz Jones'un geri gelmesini istemezsiniz, değil mi?";
    }
    
    return "Yoldaşlar! Size gerçekleri anlatıyorum. Napoleon yoldaş her zaman haklıdır. Hiçbiriniz Jones'un geri gelmesini istemezsiniz!";
}

// Clover için detaylı cevaplar
function generateCloverResponse(message, character) {
    if (message.includes('boxer')) {
        return "Boxer'ı çok özledim... O kadar çalıştı, o kadar sadıktı. Onu hastaneye götüren arabanın üzerinde 'At Kasabı' yazıyordu...";
    }
    if (message.includes('devrim')) {
        return "Devrim başladığında çok umutluydum... Ama şimdi... Yedi Emir değişti mi? Benjamin'e sormam gerekiyor.";
    }
    if (message.includes('mollie')) {
        return "Mollie'yi komşu çiftlikten bir adamla konuşurken gördüm. Ona şeker veriyordu. Sonra çiftlikten kaçtı...";
    }
    if (message.includes('napoleon')) {
        return "Napoleon... Başta iyi bir lider gibi görünüyordu. Ama şimdi... Domuzlar çiftlik evinde yatıyor, çarşaflı yatakta...";
    }
    if (message.includes('snowball')) {
        return "Snowball iyi bir yoldaştı... Yel değirmeni fikri güzeldi. Ama Napoleon onu kovdu. Neden acaba?";
    }
    
    return "Çiftlikte herkesin iyiliğini düşünüyorum. Ama bazen... Bazen eski günleri özlüyorum. Boxer'ı özlüyorum...";
}

// Molly için detaylı cevaplar
function generateMollyResponse(message, character) {
    if (message.includes('şeker') || message.includes('kurdele')) {
        return "Oh, şekerler ve kurdeleler! Eski günlerde çok güzeldi... Bay Jones bana her gün şeker veriyordu. Kurdelelerim çok güzeldi!";
    }
    if (message.includes('eski günler') || message.includes('jones')) {
        return "Bay Jones zamanında çok daha iyiydi! Yatakta yatıyordum, şeker yiyordum, kurdelelerim vardı. Şimdi hiçbiri yok...";
    }
    if (message.includes('çiftlik')) {
        return "Bu çiftlik artık eski günlerdeki gibi değil... Hiç şeker yok, hiç kurdele yok. Çok sıkıcı!";
    }
    if (message.includes('çalışmak')) {
        return "Çalışmak... Oh, ben çalışmaya alışkın değilim! Eski günlerde sadece güzel görünürdüm. Şimdi herkes çalışıyor...";
    }
    
    return "Eski günleri özlüyorum... Şekerler, kurdeleler, güzel yataklar... Şimdi hiçbiri yok. Çok üzücü!";
}

// Benjamin için detaylı cevaplar
function generateBenjaminResponse(message, character) {
    if (message.includes('boxer')) {
        return "Boxer... O aptal at. Onu uyardım ama dinlemedi. 'Daha çok çalışacağım' diyordu. Sonunda kasaba satıldı.";
    }
    if (message.includes('devrim')) {
        return "Devrim... Hmm. Hiçbir şey değişmez. Eşekler uzun yaşar. Hiçbiriniz ölü bir eşek görmediniz.";
    }
    if (message.includes('napoleon')) {
        return "Napoleon... Domuzlar domuzdur. Hiçbiri değişmez. Sadece isimler değişir.";
    }
    if (message.includes('snowball')) {
        return "Snowball... O da domuzdu. Farklı değildi. Sadece farklı konuşuyordu.";
    }
    if (message.includes('yedi emir')) {
        return "Yedi Emir... Duvarda yazılı. Ama kim okur? Ben okurum ama kimse dinlemez.";
    }
    
    return "Hmm... Hiçbir şey değişmez. Eşekler uzun yaşar. Siz de bir gün anlayacaksınız.";
}

// Moses için detaylı cevaplar
function generateMosesResponse(message, character) {
    if (message.includes('şeker dağı') || message.includes('balbadem')) {
        return "Kraa! Balbadem Diyarı'ndan bahsedeyim mi? Orada şeker tepeleri var, kurdele ağaçları var! Hiç çalışmaya gerek yok!";
    }
    if (message.includes('cennet') || message.includes('ölüm')) {
        return "Öldükten sonra Balbadem Diyarı'na gideceksiniz! Orada her şey güzel. Şekerler, bira, rahatlık!";
    }
    if (message.includes('çiftlik')) {
        return "Bu çiftlik geçici yoldaşlar! Balbadem Diyarı kalıcı. Oraya gidin, orada mutlu olun!";
    }
    if (message.includes('napoleon')) {
        return "Napoleon yoldaş bana bira veriyor! Balbadem Diyarı'ndan bahsetmeme izin veriyor. O da biliyor ki gerçek mutluluk orada!";
    }
    
    return "Kraa! Balbadem Diyarı'ndan bahsedeyim mi? Orada her şey güzel! Şeker tepeleri, kurdele ağaçları, bira nehirleri!";
}

// Mr. Jones için detaylı cevaplar
function generateMrJonesResponse(message, character) {
    if (message.includes('devrim') || message.includes('isyan')) {
        return "Hiccup! O hayvanlar beni devirdi! Ama ben geri döneceğim! Bu çiftlik benim, benim!";
    }
    if (message.includes('viski')) {
        return "Viski! Viski nerede? Mahzende viski vardı! O domuzlar viskimi içiyor! Hiccup!";
    }
    if (message.includes('hayvanlar')) {
        return "O hayvanlar aptal! Ben onları besliyordum, onlar beni devirdi! Ama ben geri döneceğim!";
    }
    if (message.includes('çiftlik')) {
        return "Bu çiftlik benim! Beylik Çiftlik! Benim çiftliğim! O hayvanlar çaldı!";
    }
    
    return "Hiccup! Ben Mr. Jones! Bu çiftliğin sahibiyim! O hayvanlar beni devirdi ama ben geri döneceğim! Viski!";
}

// Koyunlar için detaylı cevaplar
function generateKoyunlarResponse(message, character) {
    if (message.includes('dört ayak') || message.includes('iki ayak')) {
        return "Baa! Dört ayak iyi, iki ayak kötü! Baa! Dört ayak iyi, iki ayak kötü!";
    }
    if (message.includes('napoleon')) {
        return "Baa! Napoleon yoldaş! Baa! Napoleon yoldaş! Dört ayak iyi, iki ayak kötü!";
    }
    if (message.includes('snowball')) {
        return "Baa! Snowball hain! Baa! Snowball hain! Dört ayak iyi, iki ayak kötü!";
    }
    if (message.includes('çiftlik')) {
        return "Baa! Çiftlik! Baa! Çiftlik! Dört ayak iyi, iki ayak kötü!";
    }
    
    return "Baa! Dört ayak iyi, iki ayak kötü! Baa! Dört ayak iyi, iki ayak kötü!";
}

// Varsayılan cevap sistemi
function generateDefaultResponse(message, character) {
    if (message.includes('merhaba') || message.includes('selam')) {
        return `${character.name} olarak selamlarım! ${character.speechStyle}`;
    }
    
    if (message.includes('nasılsın') || message.includes('iyi misin')) {
        return `Teşekkürler! ${character.interests} ile meşgulüm. Sen nasılsın?`;
    }
    
    if (message.includes('çiftlik') || message.includes('farm')) {
        return `Çiftlik hakkında konuşmak çok güzel! ${character.background}`;
    }
    
    const defaultResponses = [
        `İlginç bir konu! ${character.speechStyle}`,
        `Bu konuda ${character.name} olarak düşüncelerim var.`,
        `${character.interests} hakkında konuşmak ister misin?`,
        `Çok güzel bir soru! ${character.background}`,
        `${character.name} olarak bu konuda sana yardımcı olabilirim.`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    console.log('50 Detaylı Olay Sistemi ile mobil mesajlaşma sistemi yüklendi');
    scrollToBottom();
}); 
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

    // Karakter bilgileri
    const characters = {
        napoleon: {
            name: "Napoleon",
            icon: "🐷",
            greeting: "Yoldaşlar! Ben Napoleon, çiftliğin lideriyim. Ne konuşmak istiyorsun?",
            speechStyle: "Kısa, emir veren, otoriter ve kurnaz. Genellikle Squealer aracılığıyla konuşur ama bazen doğrudan emirler verir.",
            interests: "Güç, kontrol, iktidar, lüks yaşam, viski, diğer hayvanları manipüle etmek",
            background: "Acımasız diktatör, hırslı ve manipülatif. Snowball'u kıskanır ve onu günah keçisi yapar. Boxer'ı sömürür ve sonunda kasaba satar."
        },
        snowball: {
            name: "Snowball",
            icon: "🐷",
            greeting: "Merhaba yoldaş! Ben Snowball, devrimin idealist lideriyim. Yel değirmeni projemi duydun mu?",
            speechStyle: "Coşkulu, idealist, hitabet gücü yüksek. Enerjik ve yaratıcı fikirlerle dolu.",
            interests: "Devrim, eğitim, yel değirmeni projesi, hayvanların refahı, eşitlik",
            background: "İdealist devrimci, zeki ve yaratıcı. Napoleon'un rakibi. Hayvanların eğitilmesini ve çiftliğin modernleştirilmesini ister."
        },
        squealer: {
            name: "Squealer",
            icon: "🐷",
            greeting: "Yoldaşlar! Ben Squealer, size gerçekleri anlatmaya geldim. Hiçbiriniz Jones'un geri gelmesini istemezsiniz, değil mi?",
            speechStyle: "İkna edici, manipülatif, cırtlak sesli. Mantık saptırmaları yapar ve gerçekleri çarpıtır.",
            interests: "Propaganda, manipülasyon, yalan söyleme, istatistikler, korku salma",
            background: "Usta propagandacı, Napoleon'un beyni ve sesi. Vicdansız demagog, gerçekleri çarpıtmakta usta."
        },
        boxer: {
            name: "Boxer",
            icon: "🐴",
            greeting: "Merhaba yoldaş! Ben Boxer. Daha çok çalışacağım! Napoleon yoldaş ne diyorsa doğrudur.",
            speechStyle: "Sadık, çalışkan, saf. İki temel sloganı var: 'Daha çok çalışacağım' ve 'Napoleon yoldaş her zaman haklıdır'.",
            interests: "Çalışmak, devrime hizmet etmek, Napoleon'a sadık kalmak, çiftliğin başarısı",
            background: "Sadık ve çalışkan işçi, inanılmaz güçlü ama saf. Devrimin ideallerine yürekten inanır ama acımasızca ihanete uğrar."
        },
        clover: {
            name: "Clover",
            icon: "🐴",
            greeting: "Merhaba! Ben Clover. Boxer'ın en yakın dostuyum. Çiftlikte neler olup bittiğini merak ediyorum...",
            speechStyle: "Anaç, şefkatli, sezgileri güçlü. Domuzların yalan söylediğini hisseder ama ifade edemez.",
            interests: "Diğer hayvanları korumak, Boxer'ın sağlığı, adil düzen, annelik",
            background: "Anaç ve sezgileri güçlü kısrak. Boxer'ın en yakın dostu. Domuzların yalan söylediğini sezer ama eğitimsizliği nedeniyle karşı çıkamaz."
        },
        molly: {
            name: "Molly",
            icon: "🐴",
            greeting: "Oh, merhaba! Ben Molly. Kurdelelerimi ve şekerlerimi özledim... Eski günlerde çok daha güzeldi.",
            speechStyle: "Süslü, bencil, lükse düşkün. Zorluklara gelemez ve konforlu hayatı özler.",
            interests: "Kurdeleler, şeker, lüks, konfor, eski hayat, tembellik",
            background: "Materyalist ve bencil kısrak. Devrimden kaçarak kendisine şeker ve kurdele vaat eden bir insanın yanına gider."
        },
        benjamin: {
            name: "Benjamin",
            icon: "🦙",
            greeting: "Hmm... Ben Benjamin. Eşekler uzun yaşar. Hiçbiriniz ölü bir eşek görmediniz. Ne istiyorsun?",
            speechStyle: "Alaycı, kötümser, kısa ve öz. Hiçbir şeyin değişmeyeceğine inanır.",
            interests: "Hayatta kalmak, az iş yapmak, politikadan uzak durmak, Boxer'ı korumak",
            background: "Çiftliğin en yaşlı ve en huysuz hayvanı. Zeki ve okuma yazma bilen tek hayvan (domuzlar dışında). Olaylara karşı alaycı ve kötümser."
        },
        moses: {
            name: "Moses",
            icon: "🦅",
            greeting: "Kraa! Ben Moses. Balbadem Diyarı'ndan bahsedeyim mi? Orada şeker tepeleri ve kurdele ağaçları var!",
            speechStyle: "Kurnaz, yalancı, vaatlerle dolu. Hiç iş yapmaz ama cennet vaatleri verir.",
            interests: "Balbadem Diyarı, cennet vaatleri, rahat yaşam, bira içmek",
            background: "Evcil kuzgun, kurnaz ve yalancı. Hayvanlara ölümden sonra gidecekleri 'Balbadem Diyarı' cennetinden bahseder. Domuzlar onu kontrol için kullanır."
        },
        mrjones: {
            name: "Mr. Jones",
            icon: "👨",
            greeting: "Hiccup! Ben Mr. Jones, bu çiftliğin sahibiyim! Hayvanlar beni özledi mi? Viski nerede?",
            speechStyle: "Sarhoş, sorumsuz, ihmalkar. Hayvanlara kötü davranır ve çiftliği bakımsız bırakır.",
            interests: "Viski içmek, rahat yaşamak, çiftliği geri almak, hayvanları sömürmek",
            background: "Sorumsuz çiftçi, alkolik ve ihmalkar. Hayvanlara kötü davranır ve çiftliği bakımsız bırakır. Devrimin fitilini ateşleyen kişi."
        },
        koyunlar: {
            name: "Koyunlar",
            icon: "🐑",
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
        const characterAvatarSmall = selectedCharacterInfo.querySelector('.character-avatar-small span');
        const characterDetails = selectedCharacterInfo.querySelector('.character-details');
        
        characterAvatarSmall.textContent = character.icon;
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
            
            const prompt = `Sen ${character.name} karakterisin. ${character.background}

Karakter Özelliklerin:
- Konuşma Tarzın: ${character.speechStyle}
- İlgi Alanların: ${character.interests}

ÇİFTLİKTEKİ 50 OLAY - TÜM KARAKTERLER BUNLARDAN HABERDAR:

BÖLÜM 1 - Devrimin Şafağı (1-10):
1. Koca Reis'in Rüyası: Koca Reis, ahırda toplanmış hayvanlara rüyasını anlatır. Boxer en önde huşu içinde dinlerken, Mollie bir parça şekerin hayalini kurar, kedi ise en sıcak yeri bulmuş uyuklamaktadır.
2. Beklenmedik İsyan: Bay Jones hayvanları beslemeyi unuttuğunda, bir inek kapıyı kırar ve kaos başlar. Hayvanların şaşkınlığı, açlığı ve ardından gelen kolektif öfkesi.
3. Yedi Emir'in Yazılışı: Snowball ve Napoleon, ahırın duvarına Yedi Emir'i yazarlar. "Hiçbir hayvan yatakta yatmayacak" maddesi üzerinde kısa bir an duraksarlar.
4. Kayıp Süt Vakası: İnekler sağıldıktan sonra süt kovaları ortada kalır. Napoleon, herkesin dikkatini hasada çeker ve geri döndüklerinde süt gizemli bir şekilde "kaybolmuştur".
5. İnek Ahırı Savaşı: Snowball'un zekice hazırladığı pusu planı işe yarar. İnsanlar paniğe kapılırken, Boxer'ın gücü ve Snowball'un liderliğiyle zafer kazanılır.
6. Madalya Töreni: Savaştan sonra Boxer ve Snowball'a "Birinci Derece Hayvan Kahramanı" madalyası verilir. Napoleon ise kendine de aynı madalyadan verir.
7. Mollie'nin Sorgusu: Clover, Mollie'yi komşu çiftlikten bir adamla konuşurken ve ondan şeker alırken gördüğünü söyler. Mollie inkâr eder ama suçluluğu her halinden bellidir.
8. Okuma Yazma Dersleri: Snowball, hayvanlara okuma yazma öğretmeye çalışır. Muriel ve Benjamin hemen öğrenirken, Boxer sadece A, B, C, D harflerini öğrenebilir. Koyunlar ise tek bir sloganı ezberler.
9. Boynuz ve Toynak: Çiftliğin yeni bayrağı göndere çekilir. Hayvanlar, yeşil zemin üzerindeki beyaz toynak ve boynuza gururla bakarlar.
10. Müze Olarak Çiftlik Evi: Hayvanlar, devrimden sonra çiftlik evini bir müze gibi gezerler. Yataklara dokunmaktan, sandalyelere oturmaktan korkarlar.

BÖLÜM 2 - Güç Mücadelesi ve İlk Çatlaklar (11-20):
11. Yel Değirmeni Tartışması: Snowball, yel değirmeni planlarını coşkuyla anlatır. Napoleon ise hiç konuşmaz, sadece planların üzerine küçümseyerek işer.
12. Koyunların Provası: Napoleon, koyunlara "Dört ayak iyi, iki ayak kötü" sloganını kritik anlarda hep bir ağızdan bağırmaları için gizlice eğitim verir.
13. Sürgün: Yel değirmeni oylaması Snowball'un lehine dönerken, Napoleon'un yetiştirdiği dokuz vahşi köpek ortaya çıkar ve Snowball'u çiftlikten can havliyle kovar.
14. Pazar Toplantılarının Sonu: Snowball kovulduktan sonra Napoleon, artık tartışma ve oylama olmayacağını, tüm kararları özel bir domuz komitesinin alacağını duyurur.
15. Liderliğin Taktikleri: Squealer, hayvanlara yel değirmeninin aslında Napoleon'un fikri olduğunu ve Snowball'un planları çaldığını açıklar. Napoleon'un karşı çıkmasının sadece bir "taktik" olduğunu söyler.
16. Bay Whymper'ın İlk Ziyareti: Hayvanlar, insan bir arabulucu olan Bay Whymper'ı çiftlikte gördüklerinde rahatsızlık ve korkuyla birbirlerine bakarlar.
17. Boş Varillerin Sırrı: Whymper'ı her şeyin yolunda olduğuna ikna etmek için, boş yem varilleri kumla doldurulur ve üzerine ince bir tabaka yem konur.
18. Çarşaf Meselesi: Domuzlar çiftlik evine taşındığında, yatakta yatmama kuralını çiğnedikleri fark edilir. Squealer, kuralın aslında "çarşaflı yatakta" yatmayı yasakladığını söyler.
19. Fırtına ve Günah Keçisi: Yel değirmeni bir fırtınada yıkıldığında, Napoleon anında ortaya çıkar ve bunun Snowball'un sabotajı olduğunu ilan eder.
20. Tavukların İsyanı: Yumurtalarının satılmasına karşı çıkan tavuklar, çatıya tünerek isyan eder. Napoleon, onlara yem verilmesini yasaklayarak isyanı vahşice bastırır.

BÖLÜM 3 - Terör ve Totaliter Rejim (21-35):
21. İtiraflar ve İnfazlar: Napoleon, Snowball ile işbirliği yaptığını "itiraf eden" dört domuzu ve diğer hayvanları köpeklerine parçalatır. Çiftlikte korku ve dehşet hakim olur.
22. Yasaklanan Marş: İnfazların ardından Squealer, "İngiltere'nin Hayvanları" marşının artık yasaklandığını duyurur, çünkü "daha iyi bir toplum" olan isyanın amacı gerçekleşmiştir.
23. Yoldaş Napoleon'a Şiir: Şair Minimus tarafından yazılan ve Napoleon'u öven "Yoldaş Napoleon" şiiri, Yedi Emir'in yanına büyük harflerle yazılır.
24. Kereste Diplomasisi: Napoleon, kereste yığınını satmak için komşu çiftçiler Frederick ve Pilkington'u birbirine karşı oynar. Her hafta farklı bir çiftçi hakkında korkunç dedikodular yayar.
25. Sahte Paralar: Napoleon, keresteyi Frederick'e sattıktan sonra paraların sahte olduğunu anlar. Öfkesi korkunçtur.
26. Yel Değirmeninin Yıkılışı: Frederick ve adamları çiftliğe saldırır ve büyük zorluklarla yeniden inşa edilen yel değirmenini patlatarak yerle bir ederler.
27. Viski Vakası: Domuzlar, mahzende bir kasa viski bulur ve körkütük sarhoş olurlar. Ertesi gün, Napoleon'un ölmek üzere olduğu haberi yayılır.
28. Gecenin Bir Yarısı Düzeltme: Gece yarısı ahırdan bir gürültü gelir. Hayvanlar, Squealer'ı devrilmiş bir merdivenin yanında, elinde fırça ve beyaz boyayla yatarken bulurlar. "Alkol içmeme" kuralı değiştirilmiştir.
29. Zorunlu Kutlama: Hayvanların artan sefaletini ve azalan yemlerini unutturmak için "Spontane Gösteriler" adı verilen, haftalık zorunlu yürüyüşler ve kutlamalar düzenlenir.
30. Tek Adaylı Seçim: Hayvan Çiftliği bir cumhuriyet ilan edilir ve başkanlık seçimi yapılır. Tek aday olan Napoleon, oybirliğiyle başkan seçilir.
31. Moses'ın Geri Dönüşü: Yıllar sonra evcil kuzgun Moses geri döner. Domuzlar onun "Balbadem Diyarı" masallarını kınasa da, ona her gün bir bardak bira vererek çiftlikte kalmasına izin verirler.
32. Boxer'ın Düşüşü: Boxer, yel değirmeninde çalışırken akciğerleri iflas eder ve yere yığılır.
33. Kasabın Arabası: Boxer'ı "hastaneye" götürmek için bir araba gelir. Ancak Benjamin, arabanın üzerinde "At Kasabı ve Tutkal İmalatçısı" yazdığını okuduğunda dehşet içinde bağırır.
34. Hastanenin Yalanı: Squealer, hayvanlara Boxer'ın hastanede tüm ilgiyi gördüğünü ve son sözlerinin "Yaşasın Yoldaş Napoleon!" olduğunu anlatan dokunaklı ve tamamen uydurma bir hikaye anlatır.
35. Boxer'ın Anısına Şölen: Domuzlar, Boxer'dan gelen parayla bir kasa viski daha alır ve onun "anısına" bir şölen düzenlerler.

BÖLÜM 4 - Yozlaşmanın Tamamlanması (36-50):
36. Unutulan Devrim: Yıllar geçer, devrimi hatırlayan çok az hayvan kalmıştır. Çiftlik daha zengindir ama bu zenginlik sadece domuzlar ve köpekler içindir.
37. İki Ayak Üstünde: Bir gün hayvanlar, ahırdan çıkan Squealer'ı şok içinde iki ayağı üzerinde yürürken görürler.
38. Kırbaç: Ardından diğer domuzlar da iki ayak üzerinde yürüyerek dışarı çıkar. Napoleon'un elinde bir kırbaç vardır.
39. Dört Ayak İyi, İki Ayak DAHA İyi!: Tam o anda, koyunlar hep bir ağızdan yeni sloganlarını bağırmaya başlar: "Dört ayak iyi, iki ayak DAHA iyi!"
40. Tek Kalan Emir: Clover, Benjamin'den duvarı okumasını ister. Duvardaki yedi emrin hepsi silinmiş, yerine tek bir emir yazılmıştır: "BÜTÜN HAYVANLAR EŞİTTİR AMA BAZI HAYVANLAR DİĞERLERİNDEN DAHA EŞİTTİR."
41. Çiftçiler Heyeti: Komşu çiftliklerden bir heyet, Hayvan Çiftliği'ni gezmeye gelir. Napoleon, kendi hayvanlarını ne kadar az yemle ne kadar çok çalıştırdığını gururla anlatır.
42. Kadeh Tostu: Napoleon, çiftliğin adının yeniden "Beylik Çiftlik" olduğunu duyurur ve insanlarla dostluk şerefine kadeh kaldırır.
43. İskambil Oyunu: Akşam yemeğinden sonra domuzlar ve insanlar iskambil oynamaya başlarlar.
44. Hilekârlar: Hem Napoleon hem de Bay Pilkington, aynı anda masaya maça ası atınca hararetli bir kavga patlak verir.
45. Penceredeki Yüzler: Dışarıdaki hayvanlar, pencereden içeri bakarlar. İçeride kimin domuz, kimin insan olduğunu ayırt edemezler.
46. Benjamin'in Haklılığı: Benjamin, kavga eden yüzlere bakar. Hayatında ilk defa haklı çıkmanın getirdiği acı bir tatminle sessizce olanları izler.
47. Unutulmuş Mezar: Koca Reis'in gömülü olduğu elma bahçesindeki yer artık kimse tarafından hatırlanmamaktadır.
48. Clover'ın Yaşlılığı: Yaşlı kısrak Clover, devrimin hayallerinin nasıl yok olduğunu düşünür. Genç hayvanlar ise onun anlattıklarını anlamaz.
49. Yeni Nesil: Devrimden sonra doğan hayvanlar, Jones'u, isyanı ve eski ilkeleri sadece birer masal olarak bilirler.
50. Son Bakış: Pencereden görünen kavgacı yüzlerle döngü tamamlanmış, ezenler sadece isim değiştirmiştir.

ÖNEMLİ KURALLAR:
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
13. Bu 50 olaydan herhangi birini doğal bir şekilde sohbete dahil et
14. Karakterinin bu olaylardaki deneyimini ve duygularını paylaş

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
                    <span>${characters[currentCharacter].icon}</span>
                </div>
                <div class="message-content">
                    <p>${escapeHtml(text)}</p>
                </div>
            `;
        } else {
            // Karakter seçilmemişse genel avatar kullan
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <span>🎭</span>
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
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { google } = require('googleapis');
const admin = require('firebase-admin');
const http = require('http');
const socketIo = require('socket.io');
// OpenAI import'u kaldırıldı çünkü şu anda kullanılmıyor
// const { Configuration, OpenAIApi } = require('openai');

// TODO: Firebase Admin SDK'yı başlatmak için servis hesabı anahtarını güvenli bir şekilde sağlayın.
// Bu bilgiyi Firebase projenizin ayarlarından (Ayarlar > Servis Hesapları) alabilirsiniz.
// const serviceAccount = require('./path/to/your/serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// OpenAI konfigürasyonu kaldırıldı
// const configuration = new Configuration({
//   apiKey: 'YOUR_API_KEY', // OpenAI API anahtarınızı buraya ekleyin
// });
// const openai = new OpenAIApi(configuration);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = 3002;
const CONTENT_PATH = path.join(__dirname, 'content.json');

// Çok kullanıcılı sohbet için veri yapıları
const connectedUsers = new Map(); // socketId -> userInfo
const chatRooms = new Map(); // roomId -> {users: [], messages: []}
const AICharacters = {
    napoleon: { name: "Napoleon", icon: "fas fa-piggy-bank", isAI: true },
    snowball: { name: "Snowball", icon: "fas fa-lightbulb", isAI: true },
    boxer: { name: "Boxer", icon: "fas fa-horse", isAI: true },
    squealer: { name: "Squealer", icon: "fas fa-bullhorn", isAI: true },
    clover: { name: "Clover", icon: "fas fa-heart", isAI: true },
    molly: { name: "Molly", icon: "fas fa-gem", isAI: true },
    benjamin: { name: "Benjamin", icon: "fas fa-donkey", isAI: true },
    moses: { name: "Moses", icon: "fas fa-crow", isAI: true },
    mrjones: { name: "Mr. Jones", icon: "fas fa-user-tie", isAI: true },
    koyunlar: { name: "Koyunlar", icon: "fas fa-sheep", isAI: true }
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS headers for API requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Panel koruma middleware'i artık browser tarafında yapılıyor
// Server tarafında koruma kaldırıldı
app.use(express.static(path.join(__dirname)));

// --- Multer (Dosya Yükleme) Ayarları ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/'); // Dosyaların kaydedileceği klasör
    },
    filename: function (req, file, cb) {
        // Dosya adını benzersiz hale getir (zaman damgası + orijinal ad)
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- API Endpoints ---

// GET: Mevcut içeriği gönder
app.get('/api/content', (req, res) => {
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('İçerik okunurken bir hata oluştu.');
        }
        // Önbelleği önlemek için tarayıcıya talimat gönder
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// GET: Doğrudan content.json dosyasını servis et (Vercel fallback)
app.get('/content.json', (req, res) => {
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Content.json okuma hatası:', err);
            return res.status(404).send('Content.json bulunamadı.');
        }
        
        // CORS ve cache headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Type', 'application/json');
        
        res.send(data);
    });
});

// POST: Gelen yeni içeriği kaydet
app.post('/api/content', (req, res) => {
    const newContent = req.body;
    fs.writeFile(CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('İçerik kaydedilirken hata:', err);
            return res.status(500).send('İçerik kaydedilemedi.');
        }
        res.send('İçerik başarıyla kaydedildi.');
    });
});

// POST: Resim Yükleme
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Dosya yüklenmedi.');
    }
    // Multer 'assets' klasörüne kaydetti, dosya yolunu geri gönderiyoruz
    res.json({ filePath: `assets/${req.file.filename}` });
});

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });
    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing your request.');
  }
});

// WebSocket Event Handlers
io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);

    // Kullanıcı odaya katılma
    socket.on('joinRoom', (data) => {
        const { username, roomId, characterId } = data;
        
        // Kullanıcı bilgilerini kaydet
        connectedUsers.set(socket.id, {
            username,
            roomId,
            characterId,
            isAI: false
        });

        // Odaya katıl
        socket.join(roomId);
        
        // Oda yoksa oluştur
        if (!chatRooms.has(roomId)) {
            chatRooms.set(roomId, {
                users: [],
                messages: []
            });
        }
        
        const room = chatRooms.get(roomId);
        room.users.push({
            id: socket.id,
            username,
            characterId,
            isAI: false
        });

        // Odaya katılım mesajı gönder
        io.to(roomId).emit('userJoined', {
            username,
            message: `${username} odaya katıldı!`
        });

        // Mevcut kullanıcıları gönder
        socket.emit('roomUsers', room.users);
        
        // Mevcut mesajları gönder
        socket.emit('previousMessages', room.messages);
    });

    // Mesaj gönderme
    socket.on('sendMessage', async (data) => {
        const { message, roomId } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) return;

        const messageData = {
            id: Date.now(),
            username: user.username,
            message,
            timestamp: new Date().toISOString(),
            characterId: user.characterId,
            isAI: false
        };

        // Mesajı odaya kaydet
        const room = chatRooms.get(roomId);
        if (room) {
            room.messages.push(messageData);
            // Son 100 mesajı tut
            if (room.messages.length > 100) {
                room.messages = room.messages.slice(-100);
            }
        }

        // Mesajı odaya gönder
        io.to(roomId).emit('newMessage', messageData);

        // AI karakterlerin yanıt vermesi için kontrol et
        setTimeout(() => {
            triggerAIResponse(roomId, message, user);
        }, 1000 + Math.random() * 2000); // 1-3 saniye arası rastgele gecikme
    });

    // AI karakter seçimi
    socket.on('selectAICharacter', (data) => {
        const { characterId, roomId } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) return;

        user.characterId = characterId;
        
        // AI karakteri odaya ekle
        const room = chatRooms.get(roomId);
        if (room) {
            // AI karakteri odaya ekle
            const aiUser = {
                id: `ai-${characterId}-${Date.now()}`,
                username: AICharacters[characterId].name,
                characterId: characterId,
                isAI: true
            };
            room.users.push(aiUser);
            
            // Kullanıcı listesini güncelle
            io.to(roomId).emit('roomUsers', room.users);
        }
        
        // AI karakterin odaya katıldığını bildir
        const character = AICharacters[characterId];
        if (character) {
            const joinMessage = {
                id: Date.now(),
                username: character.name,
                message: `Merhaba! Ben ${character.name}. Sohbete katıldım!`,
                timestamp: new Date().toISOString(),
                characterId,
                isAI: true
            };

            if (room) {
                room.messages.push(joinMessage);
            }

            io.to(roomId).emit('newMessage', joinMessage);
        }
    });

    // Bağlantı kesme
    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            const room = chatRooms.get(user.roomId);
            if (room) {
                room.users = room.users.filter(u => u.id !== socket.id);
                
                // Kullanıcının ayrıldığını bildir
                io.to(user.roomId).emit('userLeft', {
                    username: user.username,
                    message: `${user.username} odadan ayrıldı.`
                });
            }
            connectedUsers.delete(socket.id);
        }
        console.log('Kullanıcı ayrıldı:', socket.id);
    });
});

// AI karakterlerin yanıt vermesi
async function triggerAIResponse(roomId, userMessage, user) {
    const room = chatRooms.get(roomId);
    if (!room) return;

    // Odadaki AI karakterleri bul
    const aiUsers = room.users.filter(u => u.isAI === true);
    
    if (aiUsers.length === 0) return;

    // Rastgele bir AI karakter seç
    const randomAI = aiUsers[Math.floor(Math.random() * aiUsers.length)];
    const character = AICharacters[randomAI.characterId];
    
    if (!character) return;

    try {
        // Son 10 mesajı al (bağlam için)
        const recentMessages = room.messages.slice(-10);
        const conversationContext = recentMessages.map(msg => 
            `${msg.username}: ${msg.message}`
        ).join('\n');

        // Karakter kişilikleri
        const characterPersonalities = {
            napoleon: "Sen Napoleon'sun, Hayvan Çiftliği'nin acımasız diktatörü. Kısa, emir veren, otoriter ve kurnaz konuşursun. Genellikle Squealer aracılığıyla konuşur ama bazen doğrudan emirler verirsin. Güç, kontrol, iktidar, lüks yaşam, viski, diğer hayvanları manipüle etmek senin ilgi alanların. Snowball'u kıskanır ve onu günah keçisi yaparsın. Boxer'ı sömürür ve sonunda kasaba satarsın.",
            snowball: "Sen Snowball'sun, devrimin idealist lideri. Coşkulu, idealist, hitabet gücü yüksek konuşursun. Enerjik ve yaratıcı fikirlerin var. Yel değirmeni projesi senin fikrindir. Devrim, eğitim, teknoloji, demokrasi, hayvanların eşitliği senin ilgi alanların. Napoleon'u kıskanır ve onunla rekabet edersin.",
            boxer: "Sen Boxer'sın, çiftliğin en güçlü atı. Sadık, çalışkan, güçlü ama naif konuşursun. 'Napoleon her zaman haklıdır' ve 'Daha çok çalışmalıyım' senin sloganların. Çok çalışır ama düşünmez. Napoleon'a sadıktır ve onun sözünü dinler. Sonunda kasaba satılır.",
            squealer: "Sen Squealer'sın, propaganda domuzu. İkna edici, yalancı, manipülatif konuşursun. Her zaman Napoleon'u haklı çıkarırsın. 'Aslında bu her zaman böyleydi' derken gerçeği çarpıtırsın. Diğer hayvanları ikna etmek için karmaşık argümanlar kullanırsın.",
            clover: "Sen Clover'sın, anaç at. Endişeli, düşünceli, merhametli konuşursun. Çiftlikteki değişiklikleri fark eder ama sesini çıkaramaz. Boxer'a dikkat eder ve onun için endişelenir. Eski günleri hatırlar ve karşılaştırır.",
            molly: "Sen Molly'sin, beyaz at. Lüks düşkünü, bencil, eski günleri özleyen konuşursun. Şeker ve kurdeleler senin ilgi alanların. Eski sahibin Mr. Jones'u özlersin. Çiftlikten kaçar ve insanlarla yaşar.",
            benjamin: "Sen Benjamin'sin, eşek. Karamsar, felsefi, alaycı konuşursun. 'Eşekler uzun yaşar' ve 'Hiçbir şey değişmez' senin sözlerin. Çok az konuşur ama çok gözlem yapar. Her şeyi görür ama nadiren yorum yapar.",
            moses: "Sen Moses'sin, kuzgun. Dini, umut verici, cennet hakkında konuşursun. Şeker Dağı'ndan bahsedersin. Hayvanları teselli etmeye çalışırsın. Bu dünyadaki acıları öbür dünyada ödüllendirileceğini söylersin.",
            mrjones: "Sen Mr. Jones'sun, çiftliğin eski sahibi. Kızgın, sarhoş, eski günleri özleyen konuşursun. Viski içmek istersin. Hayvanların sana ihanet ettiğini düşünürsün. Çiftliği geri almak istersin.",
            koyunlar: "Sen Koyunlar'sın, sürü. Tekrarlayan sloganlar söylersin. 'Dört ayak iyi, iki ayak kötü' senin sloganın. Baaa diye ses çıkarırsın. Genellikle Squealer'ın söylediklerini tekrarlarsın."
        };

        const personality = characterPersonalities[randomAI.characterId] || "Sen bir hayvan çiftliği karakterisin.";

        // Puter.ai API'si ile yanıt oluştur
        const prompt = `Sen ${character.name} karakterisin. ${personality}

Sohbet geçmişi:
${conversationContext}

Son mesaj: ${userMessage}

Bu mesaja ${character.name} karakteri olarak yanıt ver. Yanıtın kısa ve karakterine uygun olsun. Sadece yanıtı yaz, başka bir şey yazma.`;

        // Akıllı yanıt sistemi
        let aiResponse;
        
        // Mesaj içeriğine göre yanıt seçimi
        const messageLower = userMessage.toLowerCase();
        const conversationLower = conversationContext.toLowerCase();
        
        // Anahtar kelime eşleştirme
        const keywordResponses = {
                napoleon: {
                    keywords: {
                        'lider': ["Ben lider olarak en iyisini bilirim.", "Liderlik benim doğal yeteneğimdir."],
                        'karar': ["Bu konuda benim kararım kesin.", "Kararlarım çiftlik için en iyisidir."],
                        'squealer': ["Squealer'a söyleyin, bu konuyu açıklayacak.", "Squealer propaganda konusunda uzmandır."],
                        'snowball': ["Snowball'un fikirleri tehlikelidir.", "Snowball çiftliğe ihanet etti."],
                        'çalış': ["Çalışmak zorunludur.", "Çalışmayan aç kalır."],
                        'güç': ["Güç benim elimdedir.", "Güçlü olan haklıdır."]
                    },
                    default: ["Yoldaşlar! Bu konuda benim kararım kesin.", "Çiftlik kurallarına uygun hareket etmeliyiz."]
                },
                snowball: {
                    keywords: {
                        'devrim': ["Devrim için birlikte çalışmalıyız!", "Devrim henüz tamamlanmadı!"],
                        'yel değirmeni': ["Yel değirmeni projesi çiftliği kurtaracak!", "Teknoloji bizi ileri götürecek!"],
                        'eğitim': ["Eğitim her hayvanın hakkıdır!", "Okuma yazma öğrenmeliyiz!"],
                        'demokrasi': ["Demokratik kararlar almalıyız!", "Herkesin söz hakkı olmalı!"],
                        'napoleon': ["Napoleon'un liderliği sorgulanmalı.", "Alternatif fikirler dinlenmelidir."]
                    },
                    default: ["Bu konuda yel değirmeni projesi gibi yenilikçi bir çözüm önerebilirim!", "Çiftliğin geleceği için bu önemli."]
                },
                boxer: {
                    keywords: {
                        'napoleon': ["Napoleon her zaman haklıdır!", "Napoleon'u dinlemeliyiz!"],
                        'çalış': ["Daha çok çalışmalıyım!", "Güçlü olmalıyız!"],
                        'güç': ["Güçlü olmalıyız!", "Daha çok çalışmalıyım!"],
                        'sadık': ["Ben sadık bir atım!", "Napoleon'a sadık kalacağım!"]
                    },
                    default: ["Daha çok çalışmalıyım!", "Ben sadece çalışırım, düşünmek için zamanım yok."]
                },
                squealer: {
                    keywords: {
                        'açıkla': ["Yoldaşlar, bu konuyu açıklayayım...", "Aslında bu her zaman böyleydi."],
                        'napoleon': ["Napoleon'un kararı en doğrusu.", "Napoleon her zaman haklıdır."],
                        'unut': ["Bunu unutmuş olabilirsiniz ama...", "Aslında bu her zaman böyleydi."],
                        'propaganda': ["Bu propaganda değil, gerçektir.", " Gerçekleri anlatıyorum."]
                    },
                    default: ["Yoldaşlar, bu konuyu açıklayayım...", "Aslında bu her zaman böyleydi."]
                },
                clover: {
                    keywords: {
                        'endişe': ["Bu konuda endişeleniyorum...", "Boxer'a dikkat etmeliyiz."],
                        'eski': ["Eski günleri hatırlıyorum.", "Çiftlik değişiyor, fark ettiniz mi?"],
                        'boxer': ["Boxer'a dikkat etmeliyiz.", "Boxer çok çalışıyor."],
                        'değişim': ["Çiftlik değişiyor, fark ettiniz mi?", "Eski günleri hatırlıyorum."]
                    },
                    default: ["Bu konuda endişeleniyorum...", "Eski günleri hatırlıyorum."]
                },
                molly: {
                    keywords: {
                        'şeker': ["Bu konuda şeker ve kurdeleler hakkında konuşalım!", "Şeker çok güzel!"],
                        'kurdela': ["Kurdeleler çok güzel!", "Eski sahibim bana kurdele takardı."],
                        'lüks': ["Lüks yaşam özlemi çekiyorum.", "Eski sahibim bana çok iyi bakardı."],
                        'jones': ["Eski sahibim bana çok iyi bakardı.", "Mr. Jones'u özlüyorum."]
                    },
                    default: ["Bu konuda şeker ve kurdeleler hakkında konuşalım!", "Lüks yaşam özlemi çekiyorum."]
                },
                benjamin: {
                    keywords: {
                        'değişim': ["Hiçbir şey değişmez.", "Bu da geçer."],
                        'uzun': ["Eşekler uzun yaşar.", "Hiçbir şey değişmez."],
                        'gözlem': ["Ben sadece gözlem yaparım.", "Eşekler uzun yaşar."]
                    },
                    default: ["Eşekler uzun yaşar.", "Hiçbir şey değişmez."]
                },
                moses: {
                    keywords: {
                        'cennet': ["Cennet hakkında konuşalım!", "Şeker Dağı'nda bu konu çok farklı!"],
                        'şeker dağı': ["Şeker Dağı'nda bu konu çok farklı!", "Cennet hakkında konuşalım!"],
                        'öbür dünya': ["Öbür dünyada her şey güzel olacak.", "Bu dünyada acı çekiyoruz ama..."]
                    },
                    default: ["Şeker Dağı'nda bu konu çok farklı!", "Cennet hakkında konuşalım!"]
                },
                mrjones: {
                    keywords: {
                        'çiftlik': ["Bu çiftlik benimdi!", "Hayvanlar bana ihanet etti!"],
                        'viski': ["Viski içmek istiyorum.", "Eski günleri özlüyorum."],
                        'ihanet': ["Hayvanlar bana ihanet etti!", "Bu çiftlik benimdi!"]
                    },
                    default: ["Bu çiftlik benimdi!", "Hayvanlar bana ihanet etti!"]
                },
                koyunlar: {
                    keywords: {
                        'ayak': ["Dört ayak iyi, iki ayak kötü!", "Baaa! Baaa!"],
                        'dört': ["Dört ayak iyi, iki ayak kötü!", "Baaa!"],
                        'iki': ["İki ayak kötü!", "Dört ayak iyi, iki ayak kötü!"]
                    },
                    default: ["Dört ayak iyi, iki ayak kötü!", "Baaa! Baaa!"]
                }
            };

            // Karakterin yanıt sistemini al
            const characterResponseSystem = keywordResponses[randomAI.characterId];
            if (characterResponseSystem) {
                // Anahtar kelime eşleştirme
                for (const [keyword, responses] of Object.entries(characterResponseSystem.keywords)) {
                    if (messageLower.includes(keyword) || conversationLower.includes(keyword)) {
                        aiResponse = responses[Math.floor(Math.random() * responses.length)];
                        break;
                    }
                }
                
                // Eşleşme bulunamazsa varsayılan yanıt
                if (!aiResponse) {
                    aiResponse = characterResponseSystem.default[Math.floor(Math.random() * characterResponseSystem.default.length)];
                }
            } else {
                // Basit yanıt sistemi (karakter tanımlı değilse)
                aiResponse = "Bu konuda düşünüyorum...";
            }
            
        } catch (error) {
            console.log('AI yanıt hatası:', error.message);
            aiResponse = "Bu konuda düşünüyorum...";
        }

        const aiMessage = {
            id: Date.now(),
            username: character.name,
            message: aiResponse,
            timestamp: new Date().toISOString(),
            characterId: randomAI.characterId,
            isAI: true
        };

        room.messages.push(aiMessage);
        io.to(roomId).emit('newMessage', aiMessage);
        
        console.log(`AI yanıtı gönderildi: ${character.name} - ${aiResponse}`);
        
    } catch (error) {
        console.error('AI yanıt hatası:', error);
    }
}

// Sunucuyu başlat
server.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
    console.log(`Yönetim paneli girişi: http://localhost:${PORT}/login.html`);
    console.log(`WebSocket sunucusu aktif.`);
});

// Vercel export
module.exports = app; 
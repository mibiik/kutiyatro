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

    // Mesaj içeriğine göre yanıt seçimi
    const messageLower = userMessage.toLowerCase();
    
    // Karakter bazlı akıllı yanıtlar
    let aiResponse = "";
    
    if (randomAI.characterId === 'napoleon') {
        if (messageLower.includes('lider') || messageLower.includes('karar')) {
            aiResponse = "Ben lider olarak en iyisini bilirim.";
        } else if (messageLower.includes('snowball')) {
            aiResponse = "Snowball'un fikirleri tehlikelidir.";
        } else if (messageLower.includes('çalış')) {
            aiResponse = "Çalışmak zorunludur.";
        } else {
            aiResponse = "Yoldaşlar! Bu konuda benim kararım kesin.";
        }
    } else if (randomAI.characterId === 'snowball') {
        if (messageLower.includes('devrim')) {
            aiResponse = "Devrim için birlikte çalışmalıyız!";
        } else if (messageLower.includes('yel değirmeni')) {
            aiResponse = "Yel değirmeni projesi çiftliği kurtaracak!";
        } else if (messageLower.includes('napoleon')) {
            aiResponse = "Napoleon'un liderliği sorgulanmalı.";
        } else {
            aiResponse = "Bu konuda yel değirmeni projesi gibi yenilikçi bir çözüm önerebilirim!";
        }
    } else if (randomAI.characterId === 'boxer') {
        if (messageLower.includes('napoleon')) {
            aiResponse = "Napoleon her zaman haklıdır!";
        } else if (messageLower.includes('çalış')) {
            aiResponse = "Daha çok çalışmalıyım!";
        } else {
            aiResponse = "Daha çok çalışmalıyım!";
        }
    } else if (randomAI.characterId === 'squealer') {
        if (messageLower.includes('açıkla')) {
            aiResponse = "Yoldaşlar, bu konuyu açıklayayım...";
        } else if (messageLower.includes('napoleon')) {
            aiResponse = "Napoleon'un kararı en doğrusu.";
        } else {
            aiResponse = "Aslında bu her zaman böyleydi.";
        }
    } else if (randomAI.characterId === 'clover') {
        if (messageLower.includes('endişe') || messageLower.includes('boxer')) {
            aiResponse = "Boxer'a dikkat etmeliyiz.";
        } else if (messageLower.includes('eski')) {
            aiResponse = "Eski günleri hatırlıyorum.";
        } else {
            aiResponse = "Bu konuda endişeleniyorum...";
        }
    } else if (randomAI.characterId === 'molly') {
        if (messageLower.includes('şeker') || messageLower.includes('kurdela')) {
            aiResponse = "Bu konuda şeker ve kurdeleler hakkında konuşalım!";
        } else if (messageLower.includes('lüks') || messageLower.includes('jones')) {
            aiResponse = "Eski sahibim bana çok iyi bakardı.";
        } else {
            aiResponse = "Lüks yaşam özlemi çekiyorum.";
        }
    } else if (randomAI.characterId === 'benjamin') {
        if (messageLower.includes('değişim')) {
            aiResponse = "Hiçbir şey değişmez.";
        } else if (messageLower.includes('uzun')) {
            aiResponse = "Eşekler uzun yaşar.";
        } else {
            aiResponse = "Eşekler uzun yaşar.";
        }
    } else if (randomAI.characterId === 'moses') {
        if (messageLower.includes('cennet') || messageLower.includes('şeker dağı')) {
            aiResponse = "Şeker Dağı'nda bu konu çok farklı!";
        } else {
            aiResponse = "Cennet hakkında konuşalım!";
        }
    } else if (randomAI.characterId === 'mrjones') {
        if (messageLower.includes('çiftlik') || messageLower.includes('ihanet')) {
            aiResponse = "Bu çiftlik benimdi!";
        } else if (messageLower.includes('viski')) {
            aiResponse = "Viski içmek istiyorum.";
        } else {
            aiResponse = "Hayvanlar bana ihanet etti!";
        }
    } else if (randomAI.characterId === 'koyunlar') {
        if (messageLower.includes('ayak') || messageLower.includes('dört') || messageLower.includes('iki')) {
            aiResponse = "Dört ayak iyi, iki ayak kötü!";
        } else {
            aiResponse = "Baaa! Baaa!";
        }
    } else {
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
}

// Sunucuyu başlat
server.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
    console.log(`Yönetim paneli girişi: http://localhost:${PORT}/login.html`);
    console.log(`WebSocket sunucusu aktif.`);
});

// Vercel export
module.exports = app; 
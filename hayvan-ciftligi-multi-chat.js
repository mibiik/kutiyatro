// Socket.io bağlantısı
const socket = io();

// DOM elementleri
const loginScreen = document.getElementById('loginScreen');
const chatInterface = document.getElementById('chatInterface');
const usernameInput = document.getElementById('username');
const roomIdInput = document.getElementById('roomId');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const characterSelectBtn = document.getElementById('characterSelectBtn');
const characterSelector = document.getElementById('characterSelector');
const closeSelector = document.getElementById('closeSelector');
const leaveBtn = document.getElementById('leaveBtn');
const roomTitle = document.getElementById('roomTitle');
const onlineCount = document.getElementById('onlineCount');
const usersList = document.getElementById('usersList');

// Kullanıcı bilgileri
let currentUser = {
    username: '',
    roomId: '',
    characterId: null
};

// AI karakter ikonları
const characterIcons = {
    napoleon: 'fas fa-piggy-bank',
    snowball: 'fas fa-lightbulb',
    boxer: 'fas fa-horse',
    squealer: 'fas fa-bullhorn',
    clover: 'fas fa-heart',
    molly: 'fas fa-gem',
    benjamin: 'fas fa-donkey',
    moses: 'fas fa-crow',
    mrjones: 'fas fa-user-tie',
    koyunlar: 'fas fa-sheep'
};

// Event Listeners
joinRoomBtn.addEventListener('click', joinRoom);
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
characterSelectBtn.addEventListener('click', () => {
    characterSelector.classList.add('active');
});
closeSelector.addEventListener('click', () => {
    characterSelector.classList.remove('active');
});
leaveBtn.addEventListener('click', leaveRoom);

// Karakter seçimi
document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
        const characterId = card.dataset.character;
        selectAICharacter(characterId);
        characterSelector.classList.remove('active');
    });
});

// Odaya katılma
function joinRoom() {
    const username = usernameInput.value.trim();
    const roomId = roomIdInput.value.trim();
    
    if (!username || !roomId) {
        alert('Lütfen kullanıcı adı ve oda ID girin!');
        return;
    }
    
    if (username.length > 20) {
        alert('Kullanıcı adı 20 karakterden uzun olamaz!');
        return;
    }
    
    currentUser.username = username;
    currentUser.roomId = roomId;
    
    // Socket.io ile odaya katıl
    socket.emit('joinRoom', {
        username: username,
        roomId: roomId,
        characterId: null
    });
    
    // UI'ı güncelle
    loginScreen.style.display = 'none';
    chatInterface.style.display = 'flex';
    roomTitle.textContent = `${roomId} Odası`;
    
    // Hoş geldin mesajı
    addSystemMessage(`${username} olarak odaya katıldınız!`);
}

// Mesaj gönderme
function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Socket.io ile mesaj gönder
    socket.emit('sendMessage', {
        message: message,
        roomId: currentUser.roomId
    });
    
    // Input'u temizle
    chatInput.value = '';
}

// AI karakter seçimi
function selectAICharacter(characterId) {
    socket.emit('selectAICharacter', {
        characterId: characterId,
        roomId: currentUser.roomId
    });
}

// Odadan ayrılma
function leaveRoom() {
    socket.disconnect();
    window.location.reload();
}

// Mesaj ekleme
function addMessage(messageData) {
    const messageDiv = document.createElement('div');
    const isCurrentUser = messageData.username === currentUser.username;
    const isAI = messageData.isAI;
    
    let messageClass = 'message';
    if (isCurrentUser) {
        messageClass += ' user-message';
    } else if (isAI) {
        messageClass += ' ai-message';
    } else {
        messageClass += ' bot-message';
    }
    
    messageDiv.className = messageClass;
    
    const icon = isAI ? characterIcons[messageData.characterId] : 'fas fa-user';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${messageData.username}</span>
        </div>
        <div class="message-content-wrapper">
            <div class="message-avatar">
                <i class="${icon}"></i>
            </div>
            <div class="message-content">
                <p>${escapeHtml(messageData.message)}</p>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Sistem mesajı ekleme
function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Kullanıcı listesini güncelleme
function updateUsersList(users) {
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userBadge = document.createElement('div');
        userBadge.className = `user-badge ${user.isAI ? 'ai' : ''}`;
        
        const icon = user.isAI ? characterIcons[user.characterId] : 'fas fa-user';
        
        userBadge.innerHTML = `
            <i class="${icon}"></i>
            <span>${user.username}</span>
        `;
        
        usersList.appendChild(userBadge);
    });
    
    onlineCount.textContent = `${users.length} kullanıcı online`;
}

// Mesajları en alta kaydırma
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// HTML escape fonksiyonu
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Socket.io event listeners
socket.on('connect', () => {
    console.log('Socket.io bağlantısı kuruldu');
});

socket.on('userJoined', (data) => {
    addSystemMessage(data.message);
});

socket.on('userLeft', (data) => {
    addSystemMessage(data.message);
});

socket.on('newMessage', (messageData) => {
    addMessage(messageData);
});

socket.on('roomUsers', (users) => {
    updateUsersList(users);
});

socket.on('previousMessages', (messages) => {
    messages.forEach(message => {
        addMessage(message);
    });
});

socket.on('disconnect', () => {
    addSystemMessage('Sunucu bağlantısı kesildi. Sayfa yenileniyor...');
    setTimeout(() => {
        window.location.reload();
    }, 3000);
});

// Sayfa yüklendiğinde input'a odaklan
window.addEventListener('load', () => {
    usernameInput.focus();
});

// Enter tuşu ile giriş
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        roomIdInput.focus();
    }
});

roomIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoom();
    }
}); 
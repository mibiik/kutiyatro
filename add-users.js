// Bu betik, Firebase Authentication'a yeni kullanıcılar eklemek için kullanılır.
// Tek seferlik çalıştırmak için tasarlanmıştır.

const admin = require('firebase-admin');

// TODO: Firebase Admin SDK'yı başlatmak için servis hesabı anahtarını güvenli bir şekilde sağlayın.
// Bu bilgiyi Firebase projenizin ayarlarından (Ayarlar > Servis Hesapları) alabilirsiniz.
// const serviceAccount = require('./path/to/your/serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// TODO: Eklenecek kullanıcıların listesini buraya girin.
// Örnek:
// const usersToAdd = [
//   {
//     email: 'uye1@example.com',
//     password: 'strongPassword123',
//     displayName: 'Yönetim Kurulu Üyesi 1',
//   },
//   {
//     email: 'uye2@example.com',
//     password: 'anotherStrongPassword456',
//     displayName: 'Yönetim Kurulu Üyesi 2',
//   },
// ];

async function createUsers(users) {
  for (const user of users) {
    try {
      const userRecord = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true, // E-postayı doğrulanmış olarak ayarlayabilirsiniz
        disabled: false,
      });
      console.log(`Başarıyla yeni kullanıcı oluşturuldu: ${userRecord.uid} (${user.email})`);
    } catch (error) {
      console.error(`Hata oluştu - kullanıcı oluşturulamadı (${user.email}):`, error);
    }
  }
}

// // Betiği çalıştırmak için aşağıdaki satırın yorumunu kaldırın:
// createUsers(usersToAdd); 
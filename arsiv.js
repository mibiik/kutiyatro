document.addEventListener('DOMContentLoaded', () => {

    async function populateArchive() {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('İçerik yüklenemedi.');
            const content = await response.json();

            const archiveContainer = document.getElementById('archive-container');
            archiveContainer.innerHTML = ''; // Konteyneri temizle

            content.arsiv.forEach(sezon => {
                const sezonKarti = document.createElement('div');
                sezonKarti.className = 'sezon-kart';
                sezonKarti.dataset.year = sezon.sezon.split(' ')[0]; // '2023-2024 Sezonu' -> '2023-2024'
                const oyunlarHTML = sezon.oyunlar.map(oyun => `
                    <div class="oyun-karti">
                        <img src="${oyun.img}" alt="${oyun.ad} afişi">
                        <strong>${oyun.ad}</strong>
                    </div>
                `).join('');

                const fotograflarHTML = sezon.fotograflar.map(foto => `
                    <img src="${foto}" alt="Sezon fotoğrafı">
                `).join('');

                sezonKarti.innerHTML = `
                    <h2 class="sezon-baslik">${sezon.sezon}</h2>
                    <p class="sezon-aciklama">${sezon.aciklama}</p>
                    
                    <h4>Oyunlar</h4>
                    <div class="sezon-oyunlar">${oyunlarHTML}</div>
                    
                    <h4>Fotoğraflar</h4>
                    <div class="sezon-fotograflar">${fotograflarHTML}</div>
                `;
                archiveContainer.appendChild(sezonKarti);
            });
            
            // Footer'ı doldur
            const sosyalMedya = document.querySelector('.sosyal-medya');
            sosyalMedya.innerHTML = `
                <a href="${content.iletisim.instagram}" target="_blank">Instagram</a>
                <a href="${content.iletisim.twitter}" target="_blank">Twitter</a>
                <a href="${content.iletisim.youtube}" target="_blank">Youtube</a>
            `;
            const iletisimBilgileri = document.querySelector('.iletisim-bilgileri');
            iletisimBilgileri.innerHTML = `
                 <p>Koç Üniversitesi Tiyatro Kulübü (KUTİY)</p>
                 <p>${content.iletisim.adres.replace(/<br>/g, '<br>')}</p>
                 <p>${content.iletisim.email}</p>
            `;

        } catch (error) {
            console.error('Arşiv içeriği oluşturulurken hata:', error);
            document.getElementById('archive-container').innerHTML = '<p style="text-align: center; color: red;">Arşiv verileri yüklenirken bir hata oluştu.</p>';
        }
    }

    // Eski hamburger menü işlevselliği kaldırıldı - yeni navbar kullanılıyor
    // Yeni navbar mobile.js tarafından yönetiliyor

    function setupYearFilters() {
        const filterContainer = document.querySelector('.year-filter-container');
        const archiveContainer = document.getElementById('archive-container');

        if (!filterContainer) return;

        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('year-filter-btn')) {
                // Buton aktif durumunu güncelle
                filterContainer.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');

                const selectedYear = e.target.dataset.year;
                const sezonKartlari = archiveContainer.querySelectorAll('.sezon-kart');

                sezonKartlari.forEach(kart => {
                    if (selectedYear === 'all' || kart.dataset.year === selectedYear) {
                        kart.style.display = 'block';
                    } else {
                        kart.style.display = 'none';
                    }
                });
            }
        });
    }

    populateArchive().then(() => {
        setupYearFilters();
    });
});
document.addEventListener('DOMContentLoaded', () => {

    let allContent = {};

    async function populateArchive() {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('İçerik yüklenemedi.');
            allContent = await response.json();

            renderFilterButtons();
            renderAllSeasons();
            setupYearFilters();
            populateFooter();

        } catch (error) {
            console.error('Arşiv içeriği oluşturulurken hata:', error);
            document.getElementById('archive-container').innerHTML = '<p style="text-align: center; color: red;">Arşiv verileri yüklenirken bir hata oluştu.</p>';
        }
    }

    function renderFilterButtons() {
        const filterContainer = document.querySelector('.year-filter-container');
        filterContainer.innerHTML = '<button class="year-filter-btn active" data-year="all">Tümü</button>';
        allContent.arsiv?.forEach(sezon => {
            const year = sezon.sezon;
            const button = `<button class="year-filter-btn" data-year="${year}">${year}</button>`;
            filterContainer.innerHTML += button;
        });
    }

    function renderAllSeasons() {
        const archiveContainer = document.getElementById('archive-container');
        archiveContainer.innerHTML = ''; // Konteyneri temizle

        allContent.arsiv?.forEach(sezon => {
            const sezonWrapper = document.createElement('div');
            sezonWrapper.className = 'sezon-wrapper';
            sezonWrapper.dataset.year = sezon.sezon;

            let sezonHtml = `<h2 class="sezon-baslik">${sezon.sezon} Sezonu</h2>`;
            if (sezon.aciklama) {
                sezonHtml += `<p class="sezon-aciklama">${sezon.aciklama}</p>`;
            }

            sezon.icerikler?.forEach(block => {
                sezonHtml += `<div class="content-block">`;
                if (block.baslik) {
                    sezonHtml += `<h3 class="content-block-title">${block.baslik}</h3>`;
                }

                switch (block.tip) {
                    case 'oyun':
                        sezonHtml += `
                            <div class="archive-play-card">
                                <img src="${block.afis || 'assets/afis-placeholder.png'}" alt="${block.baslik} Afişi">
                                <div class="archive-play-info">
                                    <p><strong>Yönetmen:</strong> ${block.yonetmen || '-'}</p>
                                    <p><strong>Yazar:</strong> ${block.yazar || '-'}</p>
                                </div>
                            </div>`;
                        break;
                    case 'galeri':
                        sezonHtml += `<div class="archive-gallery">`;
                        block.fotograflar?.forEach(foto => {
                            sezonHtml += `<a href="${foto}" target="_blank"><img src="${foto}" alt="Galeri fotoğrafı"></a>`;
                        });
                        sezonHtml += `</div>`;
                        break;
                    case 'video':
                        const videoId = new URL(block.videoUrl).searchParams.get('v');
                        if (videoId) {
                             sezonHtml += `<div class="archive-video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                        }
                        break;
                    case 'metin':
                        sezonHtml += `<div class="archive-text-block">${block.metin.replace(/\n/g, '<br>')}</div>`;
                        break;
                }
                sezonHtml += `</div>`;
            });

            sezonWrapper.innerHTML = sezonHtml;
            archiveContainer.appendChild(sezonWrapper);
        });
    }

    function populateFooter() {
        const iletisim = allContent.iletisim;
        if (!iletisim) return;
        const sosyalMedya = document.querySelector('.sosyal-medya');
        sosyalMedya.innerHTML = `
            <a href="${iletisim.instagram}" target="_blank">Instagram</a>
            <a href="${iletisim.twitter}" target="_blank">Twitter</a>
            <a href="${iletisim.youtube}" target="_blank">Youtube</a>
        `;
        const iletisimBilgileri = document.querySelector('.iletisim-bilgileri');
        iletisimBilgileri.innerHTML = `
             <p>Koç Üniversitesi Tiyatro Kulübü (KUTİY)</p>
             <p>${iletisim.adres.replace(/<br>/g, '<br>')}</p>
             <p>${iletisim.email}</p>
        `;
    }

    function setupYearFilters() {
        const filterContainer = document.querySelector('.year-filter-container');
        const archiveContainer = document.getElementById('archive-container');

        if (!filterContainer) return;

        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('year-filter-btn')) {
                filterContainer.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');

                const selectedYear = e.target.dataset.year;
                const sezonWrappers = archiveContainer.querySelectorAll('.sezon-wrapper');

                sezonWrappers.forEach(wrapper => {
                    if (selectedYear === 'all' || wrapper.dataset.year === selectedYear) {
                        wrapper.style.display = 'block';
                    } else {
                        wrapper.style.display = 'none';
                    }
                });
            }
        });
    }

    populateArchive();
});
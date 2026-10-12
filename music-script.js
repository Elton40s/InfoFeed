const JAMENDO_CLIENT_ID = '56d30c95'; // Client ID padrão da comunidade para testes de desenvolvimento
let listaMusicasAtual = [];
let indiceMusicaAtual = 0;

window.addEventListener('DOMContentLoaded', () => {
    carregarMusicasTrending();
});

async function carregarMusicasTrending() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = '<div class="loading-text">Buscando sucessos na Jamendo... 🎵</div>';

    try {
        const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&order=popularity_total`);
        const data = await res.json();

        if (data && data.results && data.results.length > 0) {
            listaMusicasAtual = data.results;
            renderizarGridMusicas(listaMusicasAtual);
        } else {
            container.innerHTML = '<div class="loading-text">Nenhuma música encontrada no momento.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div class="loading-text">Erro ao conectar com a API da Jamendo.</div>';
    }
}

async function carregarGenerosMusicais() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = `
        <div style="width:100%; display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:20px;">
            <button onclick="buscarPorTag('pop')" class="music-tab-btn">Pop</button>
            <button onclick="buscarPorTag('rock')" class="music-tab-btn">Rock</button>
            <button onclick="buscarPorTag('electronic')" class="music-tab-btn">Eletrônica</button>
            <button onclick="buscarPorTag('hiphop')" class="music-tab-btn">Hip-Hop</button>
            <button onclick="buscarPorTag('jazz')" class="music-tab-btn">Jazz</button>
            <button onclick="buscarPorTag('classical')" class="music-tab-btn">Clássica</button>
        </div>
        <div id="generoResults" class="music-grid" style="width:100%;"></div>
    `;
    buscarPorTag('pop');
}

async function buscarPorTag(tag) {
    const subContainer = document.getElementById('generoResults');
    if(!subContainer) return;
    subContainer.innerHTML = '<div class="loading-text">Carregando estilo...</div>';

    try {
        const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&tags=${tag}&limit=16`);
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
            listaMusicasAtual = data.results;
            subContainer.innerHTML = '';
            data.results.forEach((track, index) => {
                subContainer.appendChild(criarCardElemento(track, index));
            });
        } else {
            subContainer.innerHTML = '<div class="loading-text">Nenhuma música para este estilo.</div>';
        }
    } catch (e) {
        subContainer.innerHTML = '<div class="loading-text">Erro ao carregar estilo.</div>';
    }
}

async function carregarRadios() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = '<div class="loading-text">Carregando rádios...</div>';

    try {
        const res = await fetch(`https://api.jamendo.com/v3.0/radios/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=12`);
        const data = await res.json();

        if (data && data.results && data.results.length > 0) {
            container.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'music-grid';

            data.results.forEach((radio) => {
                const card = document.createElement('div');
                card.className = 'music-card';
                card.innerHTML = `
                    <div class="music-card-img-wrapper">
                        <img src="${radio.image || 'https://ui-avatars.com/api/?name=Radio&background=10b981&color=fff'}" alt="${radio.dispname}" class="music-card-img">
                    </div>
                    <div class="music-card-info">
                        <span class="music-card-title">${radio.dispname}</span>
                        <span class="music-card-artist">Rádio Online Jamendo</span>
                    </div>
                `;
                card.onclick = () => {
                    tocarRadioStream(radio.stream, radio.dispname, radio.image);
                };
                grid.appendChild(card);
            });
            container.appendChild(grid);
        } else {
            container.innerHTML = '<div class="loading-text">Nenhuma rádio disponível no momento.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div class="loading-text">Erro ao carregar rádios.</div>';
    }
}

function renderizarGridMusicas(tracks) {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'music-grid';

    tracks.forEach((track, index) => {
        grid.appendChild(criarCardElemento(track, index));
    });
    container.appendChild(grid);
}

function criarCardElemento(track, index) {
    const card = document.createElement('div');
    card.className = 'music-card';
    const imagemCapa = track.album_image || track.image || 'https://ui-avatars.com/api/?name=Music&background=10b981&color=fff';

    card.innerHTML = `
        <div class="music-card-img-wrapper">
            <img src="${imagemCapa}" alt="${track.name}" class="music-card-img">
            <div class="music-play-overlay">
                <div class="music-play-icon">▶</div>
            </div>
        </div>
        <div class="music-card-info">
            <span class="music-card-title">${track.name}</span>
            <span class="music-card-artist">${track.artist_name}</span>
        </div>
    `;

    card.onclick = () => selecionarEIniciarMusica(index);
    return card;
}

function selecionarEIniciarMusica(index) {
    indiceMusicaAtual = index;
    const track = listaMusicasAtual[index];
    const audioEl = document.getElementById('audioElement');
    
    audioEl.src = track.audio;
    audioEl.play().catch(err => console.log("Erro ao reproduzir áudio:", err));

    document.getElementById('playerTitle').innerText = track.name;
    document.getElementById('playerArtist').innerText = track.artist_name;
    document.getElementById('playerCover').src = track.album_image || track.image || 'https://ui-avatars.com/api/?name=Music&background=10b981&color=fff';
    document.getElementById('playPauseBtn').innerText = '❚❚';
}

function tocarRadioStream(streamUrl, nomeRadio, imagemRadio) {
    const audioEl = document.getElementById('audioElement');
    audioEl.src = streamUrl;
    audioEl.play().catch(err => console.log("Erro ao reproduzir rádio:", err));

    document.getElementById('playerTitle').innerText = nomeRadio;
    document.getElementById('playerArtist').innerText = 'Rádio Jamendo';
    document.getElementById('playerCover').src = imagemRadio || 'https://ui-avatars.com/api/?name=Radio&background=10b981&color=fff';
    document.getElementById('playPauseBtn').innerText = '❚❚';
}

function alternarPlayPause() {
    const audioEl = document.getElementById('audioElement');
    const btn = document.getElementById('playPauseBtn');

    if (audioEl.paused) {
        if (audioEl.src) {
            audioEl.play();
            btn.innerText = '❚❚';
        } else if (listaMusicasAtual.length > 0) {
            selecionarEIniciarMusica(0);
        }
    } else {
        audioEl.pause();
        btn.innerText = '▶';
    }
}

function tocarProximaMusica() {
    if (listaMusicasAtual.length === 0) return;
    indiceMusicaAtual = (indiceMusicaAtual + 1) % listaMusicasAtual.length;
    selecionarEIniciarMusica(indiceMusicaAtual);
}

function tocarMusicaAnterior() {
    if (listaMusicasAtual.length === 0) return;
    indiceMusicaAtual = (indiceMusicaAtual - 1 + listaMusicasAtual.length) % listaMusicasAtual.length;
    selecionarEIniciarMusica(indiceMusicaAtual);
}

function ajustarVolume(valor) {
    const audioEl = document.getElementById('audioElement');
    audioEl.volume = valor;
}

function mudarAbaMusica(tipo, btnEl) {
    document.querySelectorAll('.music-tab-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');

    if (tipo === 'trending') carregarMusicasTrending();
    if (tipo === 'genres') carregarGenerosMusicais();
    if (tipo === 'radios') carregarRadios();
}

function toggleMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    hamburgerBtn.classList.toggle('active');
    menuOverlay.classList.toggle('active');
}

function fecharMenu() {
    document.getElementById('hamburgerBtn').classList.remove('active');
    document.getElementById('menuOverlay').classList.remove('active');
}

function fecharMenuPorFora(event) {
    if (event.target.id === 'menuOverlay') {
        fecharMenu();
    }
}

function irParaLogin() {
    window.location.href = 'login.html';
}
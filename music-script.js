// Usando a estrutura padrão da API oficial da Jamendo: v3.0/tracks
const JAMENDO_CLIENT_ID = '709fa152'; // Client ID oficial público de testes da documentação da Jamendo
let listaMusicasAtual = [];
let indiceMusicaAtual = 0;

window.addEventListener('DOMContentLoaded', () => {
    carregarMusicasDaAPI();
});

async function carregarMusicasDaAPI() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = '<div class="loading-text">Conectando à Jamendo API... 🎵</div>';

    // Montando a URL oficial da API: https://api.jamendo.com/v3.0/tracks/?client_id=...&format=json
    const urlAPI = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=24&order=popularity_total`;

    try {
        const resposta = await fetch(urlAPI);
        const dados = await resposta.json();

        if (dados && dados.results && dados.results.length > 0) {
            listaMusicasAtual = dados.results;
            renderizarGridMusicas(listaMusicasAtual);
        } else {
            container.innerHTML = '<div class="loading-text">Nenhuma música retornada pela API.</div>';
        }
    } catch (erro) {
        console.error("Erro na requisição da Jamendo:", erro);
        container.innerHTML = '<div class="loading-text">Erro ao carregar dados da Jamendo API.</div>';
    }
}

async function carregarGenerosMusicais() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = `
        <div style="width:100%; display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:20px;">
            <button onclick="buscarPorTagAPI('pop')" class="music-tab-btn">Pop</button>
            <button onclick="buscarPorTagAPI('rock')" class="music-tab-btn">Rock</button>
            <button onclick="buscarPorTagAPI('electronic')" class="music-tab-btn">Eletrônica</button>
            <button onclick="buscarPorTagAPI('hiphop')" class="music-tab-btn">Hip-Hop</button>
            <button onclick="buscarPorTagAPI('jazz')" class="music-tab-btn">Jazz</button>
        </div>
        <div id="generoResults" class="music-grid" style="width:100%;"></div>
    `;
    buscarPorTagAPI('pop');
}

async function buscarPorTagAPI(tag) {
    const subContainer = document.getElementById('generoResults');
    if (!subContainer) return;
    subContainer.innerHTML = '<div class="loading-text">Buscando estilo na API...</div>';

    const urlTag = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&tags=${tag}&limit=16`;

    try {
        const resposta = await fetch(urlTag);
        const dados = await resposta.json();

        if (dados && dados.results && dados.results.length > 0) {
            listaMusicasAtual = dados.results;
            subContainer.innerHTML = '';
            dados.results.forEach((track, index) => {
                subContainer.appendChild(criarCardElemento(track, index));
            });
        } else {
            subContainer.innerHTML = '<div class="loading-text">Nenhuma faixa encontrada para este estilo.</div>';
        }
    } catch (e) {
        subContainer.innerHTML = '<div class="loading-text">Erro ao buscar estilo.</div>';
    }
}

async function carregarRadios() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = '<div class="loading-text">Carregando rádios da Jamendo...</div>';

    // Rota oficial de rádios: v3.0/radios
    const urlRadios = `https://api.jamendo.com/v3.0/radios/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=12`;

    try {
        const resposta = await fetch(urlRadios);
        const dados = await resposta.json();

        if (dados && dados.results && dados.results.length > 0) {
            container.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'music-grid';

            dados.results.forEach((radio) => {
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
            container.innerHTML = '<div class="loading-text">Nenhuma rádio disponível.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div class="loading-text">Erro ao conectar com as rádios.</div>';
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
    audioEl.play().catch(err => console.log("Erro de reprodução:", err));

    document.getElementById('playerTitle').innerText = track.name;
    document.getElementById('playerArtist').innerText = track.artist_name;
    document.getElementById('playerCover').src = track.album_image || track.image || 'https://ui-avatars.com/api/?name=Music&background=10b981&color=fff';
    document.getElementById('playPauseBtn').innerText = '❚❚';
}

function tocarRadioStream(streamUrl, nomeRadio, imagemRadio) {
    const audioEl = document.getElementById('audioElement');
    audioEl.src = streamUrl;
    audioEl.play().catch(err => console.log("Erro de reprodução rádio:", err));

    document.getElementById('playerTitle').innerText = nomeRadio;
    document.getElementById('playerArtist').innerText = 'Rádio Ao Vivo';
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

    if (tipo === 'trending') carregarMusicasDaAPI();
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
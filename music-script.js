const JAMENDO_CLIENT_ID = 'f61f517b'; 
let listaMusicasAtual = [];
let indiceMusicaAtual = 0;

if (!localStorage.getItem('modoNoturno')) {
    localStorage.setItem('modoNoturno', 'ativo');
}

if (localStorage.getItem('modoNoturno') === 'ativo') {
    document.body.classList.add('dark-mode');
    const btnNoturno = document.getElementById('modoNoturnoBtn');
    if(btnNoturno) btnNoturno.innerText = 'MODO CLARO';
} else {
    document.body.classList.remove('dark-mode');
    const btnNoturno = document.getElementById('modoNoturnoBtn');
    if(btnNoturno) btnNoturno.innerText = 'MODO NOTURNO';
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.logo-animada-principal').forEach(el => {
            el.classList.add('animate-logo');
        });
    }, 10000);

    carregarMusicasDaAPI();
    criarBotaoFlutuanteMenu();
    configurarArrastePlayer();
});

function alternarModoNoturno(event) {
    event.preventDefault();
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('modoNoturnoBtn');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('modoNoturno', 'ativo');
        if(btn) btn.innerText = 'MODO CLARO';
    } else {
        localStorage.setItem('modoNoturno', 'inativo');
        if(btn) btn.innerText = 'MODO NOTURNO';
    }
    fecharMenu();
}

async function carregarMusicasDaAPI() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = '<div class="loading-text">Conectando à Jamendo... 🎵</div>';

    const urlAPI = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=24&order=popularity_total&include=musicinfo`;

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

// Nova função para Lançamentos (ordenado por data de lançamento / mais recente)
async function carregarLancamentos() {
    const container = document.getElementById('musicFeedContainer');
    container.innerHTML = '<div class="loading-text">Buscando últimos lançamentos... 🚀</div>';

    const urlLancamentos = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=24&order=releasedate_desc&include=musicinfo`;

    try {
        const resposta = await fetch(urlLancamentos);
        const dados = await resposta.json();

        if (dados && dados.results && dados.results.length > 0) {
            listaMusicasAtual = dados.results;
            renderizarGridMusicas(listaMusicasAtual);
        } else {
            container.innerHTML = '<div class="loading-text">Nenhum lançamento encontrado.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div class="loading-text">Erro ao carregar lançamentos.</div>';
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

    const urlTag = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&tags=${tag}&limit=16&include=musicinfo`;

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
    
    // Extrai o ano da data de lançamento
    let anoMusica = "2026";
    if (track.releasedate) {
        anoMusica = track.releasedate.split('-')[0];
    }

    // Formata o número de vezes ouvida (popularity ou listens se disponível)
    const totalOuvidas = track.stats && track.stats.rate_listen_total ? Number(track.stats.rate_listen_total).toLocaleString('pt-BR') : Math.floor(Math.random() * 5000 + 300);

    // Foto redonda do artista no lado oposto (fallback para avatar gerado se não houver foto)
    const fotoArtista = track.artist_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist_name)}&background=10b981&color=fff`;

    card.innerHTML = `
        <div class="music-card-img-wrapper">
            <img src="${imagemCapa}" alt="${track.name}" class="music-card-img">
            <div class="music-play-overlay">
                <div class="music-play-icon">▶</div>
            </div>
        </div>
        <div class="music-card-info">
            <div class="music-card-header-flex">
                <div class="music-card-titles-box">
                    <span class="music-card-title">${track.name}</span>
                    <span class="music-card-artist">${track.artist_name}</span>
                </div>
                <div class="artist-avatar-container" title="${track.artist_name}">
                    <img src="${fotoArtista}" alt="${track.artist_name}" class="artist-round-img" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist_name)}&background=10b981&color=fff'">
                    <span class="artist-name-mini">${track.artist_name}</span>
                </div>
            </div>
            <div class="music-card-footer-meta">
                <span>📅 ${anoMusica}</span>
                <span>🎧 ${totalOuvidas} reproduções</span>
            </div>
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

    const playerBar = document.getElementById('musicPlayerBar');
    playerBar.classList.remove('oculto');
}

function tocarRadioStream(streamUrl, nomeRadio, imagemRadio) {
    const audioEl = document.getElementById('audioElement');
    audioEl.src = streamUrl;
    audioEl.play().catch(err => console.log("Erro de reprodução rádio:", err));

    document.getElementById('playerTitle').innerText = nomeRadio;
    document.getElementById('playerArtist').innerText = 'Rádio Ao Vivo';
    document.getElementById('playerCover').src = imagemRadio || 'https://ui-avatars.com/api/?name=Radio&background=10b981&color=fff';
    document.getElementById('playPauseBtn').innerText = '❚❚';

    const playerBar = document.getElementById('musicPlayerBar');
    playerBar.classList.remove('oculto');
}

function fecharPlayerTotalmente(event) {
    event.stopPropagation();
    const audioEl = document.getElementById('audioElement');
    audioEl.pause();
    audioEl.src = '';
    
    const playerBar = document.getElementById('musicPlayerBar');
    playerBar.classList.add('oculto');
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
    if (tipo === 'releases') carregarLancamentos();
    if (tipo === 'genres') carregarGenerosMusicais();
    if (tipo === 'radios') carregarRadios();
}

function configurarArrastePlayer() {
    const playerBar = document.getElementById('musicPlayerBar');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const startDrag = (clientX, clientY, target) => {
        if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button') || target.closest('input')) {
            return false;
        }
        isDragging = true;
        startX = clientX;
        startY = clientY;

        const rect = playerBar.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        playerBar.style.bottom = 'auto';
        playerBar.style.right = 'auto';
        playerBar.style.left = `${initialLeft}px`;
        playerBar.style.top = `${initialTop}px`;
        return true;
    };

    const moveDrag = (clientX, clientY) => {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const maxX = window.innerWidth - playerBar.offsetWidth;
        const maxY = window.innerHeight - playerBar.offsetHeight;

        newLeft = Math.max(10, Math.min(newLeft, maxX - 10));
        newTop = Math.max(10, Math.min(newTop, maxY - 10));

        playerBar.style.left = `${newLeft}px`;
        playerBar.style.top = `${newTop}px`;
    };

    playerBar.addEventListener('mousedown', (e) => {
        if (startDrag(e.clientX, e.clientY, e.target)) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    });
    function onMouseMove(e) { moveDrag(e.clientX, e.clientY); }
    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    playerBar.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            if (startDrag(touch.clientX, touch.clientY, e.target)) {
                document.addEventListener('touchmove', onTouchMove, { passive: false });
                document.addEventListener('touchend', onTouchEnd);
            }
        }
    }, { passive: true });

    function onTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
    }
    function onTouchEnd() {
        isDragging = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }
}

function atualizarProgressoAudio() {
    const audioEl = document.getElementById('audioElement');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationTimeEl = document.getElementById('durationTime');

    if (audioEl.duration) {
        const progressoPercent = (audioEl.currentTime / audioEl.duration) * 100;
        progressBar.value = progressoPercent;

        currentTimeEl.innerText = formatarTempo(audioEl.currentTime);
        durationTimeEl.innerText = formatarTempo(audioEl.duration);
    }
}

function buscarAudioPorProgresso(valorPercentual) {
    const audioEl = document.getElementById('audioElement');
    if (audioEl.duration) {
        const novoTempo = (valorPercentual / 100) * audioEl.duration;
        audioEl.currentTime = novoTempo;
    }
}

function formatarTempo(segundos) {
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
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

function criarBotaoFlutuanteMenu() {
    if (document.getElementById('floatingMenuBtn')) return;

    const floatBtn = document.createElement('button');
    floatBtn.id = 'floatingMenuBtn';
    floatBtn.className = 'floating-menu-btn';
    floatBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" class="float-icon-line line-1"></line>
            <line x1="3" y1="12" x2="21" y2="12" class="float-icon-line line-2"></line>
            <line x1="3" y1="18" x2="21" y2="18" class="float-icon-line line-3"></line>
        </svg>
    `;
    floatBtn.setAttribute('title', 'Menu');
    document.body.appendChild(floatBtn);

    let pulseTimer = null;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 150) {
            floatBtn.classList.add('active-float');
            
            if (!pulseTimer && !floatBtn.classList.contains('pulsing')) {
                pulseTimer = setTimeout(() => {
                    if (!document.getElementById('menuOverlay').classList.contains('active')) {
                        floatBtn.classList.add('pulsing');
                    }
                }, 5000);
            }
        } else {
            floatBtn.classList.remove('active-float');
            floatBtn.classList.remove('pulsing');
            clearTimeout(pulseTimer);
            pulseTimer = null;
        }
    });

    const observer = new MutationObserver(() => {
        const menuAberto = document.getElementById('menuOverlay').classList.contains('active');
        if (menuAberto) {
            floatBtn.classList.add('is-open');
            floatBtn.classList.remove('pulsing');
            clearTimeout(pulseTimer);
            pulseTimer = null;
        } else {
            floatBtn.classList.remove('is-open');
        }
    });
    observer.observe(document.getElementById('menuOverlay'), { attributes: true, attributeFilter: ['class'] });

    floatBtn.addEventListener('click', (e) => {
        if (floatBtn.getAttribute('data-dragging') === 'true') return;
        floatBtn.classList.remove('pulsing');
        clearTimeout(pulseTimer);
        toggleMenu();
    });

    let isDragging = false;
    let startX, startY, initialX, initialY;

    const dragStart = (clientX, clientY) => {
        isDragging = false;
        startX = clientX;
        startY = clientY;
        
        const rect = floatBtn.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        floatBtn.setAttribute('data-dragging', 'false');
    };

    const dragMove = (clientX, clientY, e) => {
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
            floatBtn.setAttribute('data-dragging', 'true');
        }

        if (isDragging) {
            if(e) e.preventDefault();
            let newX = initialX + dx;
            let newY = initialY + dy;

            const maxX = window.innerWidth - floatBtn.offsetWidth;
            const maxY = window.innerHeight - floatBtn.offsetHeight;

            newX = Math.max(10, Math.min(newX, maxX - 10));
            newY = Math.max(10, Math.min(newY, maxY - 10));

            floatBtn.style.left = `${newX}px`;
            floatBtn.style.top = `${newY}px`;
            floatBtn.style.right = 'auto';
        }
    };

    const dragEnd = () => {
        setTimeout(() => {
            floatBtn.setAttribute('data-dragging', 'false');
        }, 50);
    };

    floatBtn.addEventListener('mousedown', (e) => {
        dragStart(e.clientX, e.clientY);
        const onMouseMove = (ev) => dragMove(ev.clientX, ev.clientY, ev);
        const onMouseUp = () => {
            dragEnd();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    floatBtn.addEventListener('touchstart', (e) => {
        if(e.touches.length === 1) {
            dragStart(e.touches[0].clientX, e.touches[0].clientY);
            const onTouchMove = (ev) => dragMove(ev.touches[0].clientX, ev.touches[0].clientY, ev);
            const onTouchEnd = () => {
                dragEnd();
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
            };
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }
    }, { passive: true });
}
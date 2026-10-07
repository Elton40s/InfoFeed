const SUPABASE_URL = 'https://edrmehdyusznzdltlhxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkcm1laGR5dXN6bnpkbHRsaHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjcxMDUsImV4cCI6MjEwNTgwMzEwNX0.TDclKranm8q1Zcb2ngv6lgflM4yU5fpANLVuyJer6gk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Animação imediata na logo principal (acima do título) ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.logo-animada-principal').forEach(el => {
            el.classList.add('animate-logo');
        });
    }, 400);
});

if (localStorage.getItem('modoNoturno') === 'ativo') {
    document.body.classList.add('dark-mode');
    document.getElementById('modoNoturnoBtn').innerText = 'MODO CLARO';
}

function alternarModoNoturno(event) {
    event.preventDefault();
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('modoNoturnoBtn');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('modoNoturno', 'ativo');
        btn.innerText = 'MODO CLARO';
    } else {
        localStorage.setItem('modoNoturno', 'inativo');
        btn.innerText = 'MODO NOTURNO';
    }
    fecharMenu();
}

const navBar = document.getElementById('navBar');
const navLogoEl = document.getElementById('navLogoEl');
let navAnimated = false;

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navBar.classList.add('scrolled');
        if (!navAnimated) {
            navAnimated = true;
            setTimeout(() => {
                navLogoEl.classList.add('animate-logo');
            }, 2000);
        }
    } else {
        navBar.classList.remove('scrolled');
    }
});

async function carregarDadosFaixa() {
    const tickerEl = document.getElementById('weatherTickerText');
    let climaTexto = "Clima local indisponível &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;";
    let dolarTexto = "Dólar: Carregando...";
    let euroTexto = "Euro: Carregando...";
    let dowTexto = "Dow Jones: Carregando...";
    let nasdaqTexto = "Nasdaq: Carregando...";
    let ibovTexto = "Ibovespa: Carregando...";

    try {
        const resCotacoes = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
        const dataCotacoes = await resCotacoes.json();
        
        if (dataCotacoes && dataCotacoes.USDBRL) {
            const cotDolar = parseFloat(dataCotacoes.USDBRL.bid).toFixed(2);
            const varDolar = parseFloat(dataCotacoes.USDBRL.pctChange);
            const corDolar = varDolar >= 0 ? '#16a34a' : '#dc2626';
            const setaDolar = varDolar >= 0 ? '▲' : '▼';
            dolarTexto = `Dólar: R$ <span class="tech-dolar">${cotDolar}</span> <span style="color: ${corDolar}; font-weight: 700;">${setaDolar} ${Math.abs(varDolar)}%</span>`;
        }

        if (dataCotacoes && dataCotacoes.EURBRL) {
            const cotEuro = parseFloat(dataCotacoes.EURBRL.bid).toFixed(2);
            const varEuro = parseFloat(dataCotacoes.EURBRL.pctChange);
            const corEuro = varEuro >= 0 ? '#16a34a' : '#dc2626';
            const setaEuro = varEuro >= 0 ? '▲' : '▼';
            euroTexto = `Euro: R$ <span class="tech-dolar">${cotEuro}</span> <span style="color: ${corEuro}; font-weight: 700;">${setaEuro} ${Math.abs(varEuro)}%</span>`;
        }
    } catch(e) {}

    try {
        const dowVal = 43250.20; 
        const dowVar = 0.45;
        const corDow = dowVar >= 0 ? '#16a34a' : '#dc2626';
        dowTexto = `Dow Jones: <span class="tech-index">${dowVal.toLocaleString('en-US')}</span> <span style="color: ${corDow}; font-weight: 700;">▲ ${dowVar}%</span>`;

        const nasdaqVal = 18650.40;
        const nasdaqVar = 0.72;
        const corNasdaq = nasdaqVar >= 0 ? '#16a34a' : '#dc2626';
        nasdaqTexto = `Nasdaq: <span class="tech-index">${nasdaqVal.toLocaleString('en-US')}</span> <span style="color: ${corNasdaq}; font-weight: 700;">▲ ${nasdaqVar}%</span>`;

        const ibovVal = 131450.80;
        const ibovVar = -0.32;
        const corIbov = ibovVar >= 0 ? '#16a34a' : '#dc2626';
        ibovTexto = `Ibovespa: <span class="tech-index">${ibovVal.toLocaleString('pt-BR')}</span> <span style="color: ${corIbov}; font-weight: 700;">▼ ${Math.abs(ibovVar)}%</span>`;
    } catch(e) {}

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const resClima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const dataClima = await resClima.json();

                if (dataClima && dataClima.current_weather) {
                    const temp = dataClima.current_weather.temperature;
                    const vento = dataClima.current_weather.windspeed;
                    
                    let alertaChuva = "";
                    const weatherCode = dataClima.current_weather.weathercode;
                    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 99)) {
                        alertaChuva = " ⚠️ <span style='color: #eab308; font-weight: bold;'>ATENÇÃO: Previsão de Chuva/Tempestade!</span>";
                    }

                    climaTexto = `Região — Temp: ${temp}°C | Vento: ${vento} km/h${alertaChuva} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;`;
                }
                montarConteudoFaixa(tickerEl, climaTexto, dolarTexto, euroTexto, dowTexto, nasdaqTexto, ibovTexto);
            } catch (e) {
                montarConteudoFaixa(tickerEl, climaTexto, dolarTexto, euroTexto, dowTexto, nasdaqTexto, ibovTexto);
            }
        }, () => {
            montarConteudoFaixa(tickerEl, "Localização desativada &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;", dolarTexto, euroTexto, dowTexto, nasdaqTexto, ibovTexto);
        });
    } else {
        montarConteudoFaixa(tickerEl, "Geolocalização não suportada &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;", dolarTexto, euroTexto, dowTexto, nasdaqTexto, ibovTexto);
    }
}

function montarConteudoFaixa(el, clima, dolar, euro, dow, nasdaq, ibov) {
    const blocoUnico = `${clima} ${dolar} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${euro} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${dow} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${nasdaq} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${ibov} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; <span style="color: #000;">Info</span><span style="color: #0ea5e9;">Feed</span> - Notícias Reais &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
    el.innerHTML = blocoUnico + blocoUnico;
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

async function atualizarEstadoUsuario() {
    const userNavContainer = document.getElementById('userNavContainer');
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session && session.user) {
        const emailUser = session.user.email;
        let apelidoSalvo = localStorage.getItem('usuarioApelidoCustom') || emailUser.split('@')[0];
        localStorage.setItem('usuarioLogado', apelidoSalvo);
        
        const iniciais = emailUser.substring(0, 2).toUpperCase();
        
        userNavContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="user-avatar-badge" title="${emailUser}">${iniciais}</div>
                <button class="logout-icon-btn" onclick="abrirModalRodape('logoutConfirmModal')" title="Sair da conta">
                    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>
        `;
    } else {
        const usuarioLocal = localStorage.getItem('usuarioLogado');
        if (usuarioLocal) {
            const iniciais = usuarioLocal.substring(0, 2).toUpperCase();
            userNavContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="user-avatar-badge" title="${usuarioLocal}">${iniciais}</div>
                    <button class="logout-icon-btn" onclick="abrirModalRodape('logoutConfirmModal')" title="Sair da conta">
                        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            `;
        } else {
            userNavContainer.innerHTML = `<button class="btn-login" id="btnLoginNav" onclick="irParaLogin()">Login</button>`;
        }
    }
}

async function executarLogoutDefinitivo() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('usuarioApelidoCustom');
    fecharModalRodape('logoutConfirmModal');
    window.location.reload();
}

function irParaLogin() {
    window.location.href = 'login.html';
}

const feedContainer = document.getElementById('feedContainer');
let linkNoticiaAtual = "";
let postIdAtual = null;

async function carregarFeed() {
    try {
        const response = await fetch('/api/noticias');
        const data = await response.json();

        feedContainer.innerHTML = '';

        if (data.articles && data.articles.length > 0) {
            data.articles.forEach((article, index) => {
                let dominio = "globo.com";
                try {
                    const urlObj = new URL(article.url);
                    dominio = urlObj.hostname;
                } catch(e) {}

                const faviconUrl = `https://www.google.com/s2/favicons?domain=${dominio}&sz=128`;
                const nomeFonte = article.source.name || "Portal de Notícias";
                const postId = `post_${index}`;

                criarCardNoticia(article, nomeFonte, faviconUrl, postId);
            });
        } else {
            feedContainer.innerHTML = '<div class="loading-text">Nenhuma notícia encontrada no momento.</div>';
        }
    } catch (error) {
        feedContainer.innerHTML = '<div class="loading-text">Erro ao conectar com o servidor de notícias.</div>';
    }
}

function criarCardNoticia(article, nomePortal, logoUrl, postId) {
    const articleEl = document.createElement('article');
    articleEl.className = 'post-card';

    const dataPublicacao = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const urlEncoded = encodeURIComponent(article.url);
    const portalEncoded = encodeURIComponent(nomePortal);
    const logoEncoded = encodeURIComponent(logoUrl);
    const uniqueCardId = `cardNoticia_${Math.random().toString(36).substring(2, 9)}`;
    const uniqueBtnId = `btnNoticia_${Math.random().toString(36).substring(2, 9)}`;

    articleEl.id = uniqueCardId;

    articleEl.innerHTML = `
        <header class="post-header">
            <img src="${logoUrl}" alt="Logo ${nomePortal}" class="avatar" onerror="this.src='https://ui-avatars.com/api/?name=${nomePortal}&background=0ea5e9&color=fff'">
            <div class="author-info">
                <span class="author-name">${nomePortal}</span>
                <span class="post-time">${dataPublicacao}</span>
            </div>
        </header>
        <div class="post-content" onclick="abrirConfirmacaoRedirecionamento('${urlEncoded}', '${portalEncoded}', '${logoEncoded}')">
            <p class="post-text">
                <strong>${article.title}</strong>
                ${article.description || ''}
            </p>
            ${article.image ? `
                <div style="position: relative; width: 100%;">
                    <img src="${article.image}" alt="Imagem da notícia" class="post-image" style="width: 100%; display: block;">
                    <button id="${uniqueBtnId}" class="noticia-completa-btn" onclick="event.stopPropagation(); abrirConfirmacaoRedirecionamento('${urlEncoded}', '${portalEncoded}', '${logoEncoded}')">
                        Noticia completa
                    </button>
                </div>
            ` : ''}
        </div>
        <footer class="post-footer">
            <button class="action-btn btn-curtir" onclick="alternarCurtida(this)">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                Curtir
            </button>
            <button class="action-btn" onclick="abrirComentarios('${postId}')">
                <svg viewBox="0 0 24 24" style="fill:none; stroke:currentColor;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Comentários
            </button>
            <button class="action-btn" onclick="abrirCompartilhar('${encodeURIComponent(article.url)}', '${encodeURIComponent(article.title)}')">
                <svg viewBox="0 0 24 24" style="fill:none; stroke:currentColor;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Compartilhar
            </button>
        </footer>
    `;

    feedContainer.appendChild(articleEl);

    // Usa IntersectionObserver para disparar o temporizador de 2 segundos APENAS quando o card aparecer na tela
    if (article.image) {
        const observerCard = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        const btnEl = document.getElementById(uniqueBtnId);
                        if (btnEl) {
                            btnEl.classList.add('visivel');
                        }
                    }, 4000);
                    observer.unobserve(entry.target); // Para de observar após ativar
                }
            });
        }, { threshold: 0.2 }); // Ativa quando pelo menos 20% do card estiver visível

        observerCard.observe(articleEl);
    }
}

function abrirConfirmacaoRedirecionamento(urlEncoded, fonteEncoded, logoEncoded) {
    const url = decodeURIComponent(urlEncoded);
    const fonte = decodeURIComponent(fonteEncoded);
    const logo = decodeURIComponent(logoEncoded);

    const imgLogo = document.getElementById('redirectLogo');
    imgLogo.src = logo;
    imgLogo.onerror = function() {
        this.src = `https://ui-avatars.com/api/?name=${fonte}&background=0ea5e9&color=fff`;
    };

    document.getElementById('redirectSource').innerText = fonte;
    document.getElementById('redirectConfirmBtn').href = url;

    document.getElementById('redirectModal').classList.add('active');
}

let botaoCurtidaAtivo = null;

function alternarCurtida(botao) {
    if (botao.classList.contains('liked')) {
        botaoCurtidaAtivo = botao;
        document.getElementById('cancelarCurtidaModal').classList.add('active');
        
        document.getElementById('confirmarDescurtirBtn').onclick = function() {
            executarCancelamentoCurtida(botaoCurtidaAtivo);
            fecharModal('cancelarCurtidaModal');
        };
        return;
    }

    botao.classList.remove('liked');
    void botao.offsetWidth; 
    
    botao.classList.add('liked');
    const svgHtml = botao.querySelector('svg').outerHTML;
    botao.innerHTML = svgHtml + ' Curtido';
}

function executarCancelamentoCurtida(botao) {
    if (!botao) return;
    
    botao.classList.remove('liked');
    const svgHtml = botao.querySelector('svg').outerHTML;
    botao.innerHTML = svgHtml + ' Curtir';
    botaoCurtidaAtivo = null;
}

function abrirCompartilhar(urlEncoded, tituloEncoded) {
    const url = decodeURIComponent(urlEncoded);
    const titulo = decodeURIComponent(tituloEncoded);
    linkNoticiaAtual = url;

    document.getElementById('shareWhatsapp').href = `https://api.whatsapp.com/send?text=${encodeURIComponent('Olha essa notícia que legal: ' + titulo + ' - ' + url)}`;
    document.getElementById('shareGmail').href = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(titulo)}&body=${encodeURIComponent('Confira esta notícia: ' + url)}`;

    document.getElementById('shareModal').classList.add('active');
}

function copiarLinkNoticia() {
    navigator.clipboard.writeText(linkNoticiaAtual).then(() => {
        alert('Link copiado para a área de transferência!');
        fecharModal('shareModal');
    });
}

async function abrirComentarios(postId) {
    postIdAtual = postId;
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const areaInput = document.getElementById('commentInputArea');

    if (!usuarioLogado) {
        areaInput.innerHTML = `
            <div style="text-align: center; padding: 10px; background-color: var(--border-color); border-radius: 6px;">
                <p style="font-size: 14px; color: var(--sub-text); margin-bottom: 8px;">Você precisa estar logado para comentar.</p>
                <button onclick="irParaLogin()" style="background-color: #0ea5e9; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Fazer Login / Entrar</button>
            </div>
        `;
    } else {
        const ultimoApelido = localStorage.getItem('usuarioApelidoCustom') || '';
        areaInput.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 13px; color: var(--sub-text);">Identificação nos comentários:</div>
                <input type="text" class="modal-input" id="commentAuthorInput" value="${ultimoApelido}" placeholder="Digite seu apelido...">
            </div>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
                <input type="text" class="modal-input" id="commentText" placeholder="Escreva seu comentário...">
                <button class="modal-submit" onclick="adicionarComentario()" style="padding: 0 15px;">Comentar</button>
            </div>
        `;
    }

    await buscarComentariosDoSupabase();
    document.getElementById('commentModal').classList.add('active');
}

async function adicionarComentario() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        alert('Você precisa fazer login para comentar!');
        irParaLogin();
        return;
    }

    const inputApelidoEl = document.getElementById('commentAuthorInput');
    const apelidoEscolhido = inputApelidoEl ? inputApelidoEl.value.trim() : "";

    if (!apelidoEscolhido) {
        alert('Por favor, informe um apelido válido!');
        return;
    }

    localStorage.setItem('usuarioApelidoCustom', apelidoEscolhido);
    localStorage.setItem('usuarioLogado', apelidoEscolhido);

    const text = document.getElementById('commentText').value.trim();
    if(!text) {
        alert('Escreva algum comentário!');
        return;
    }

    const { error } = await supabaseClient
        .from('comentarios')
        .insert([{ post_id: postIdAtual, autor: apelidoEscolhido, texto: text }]);

    if (error) {
        alert('Erro ao enviar comentário: ' + error.message);
        return;
    }

    document.getElementById('commentText').value = '';
    await buscarComentariosDoSupabase();
}

async function buscarComentariosDoSupabase() {
    const container = document.getElementById('commentsListContainer');
    container.innerHTML = '<div style="text-align:center; color:var(--sub-text); padding:10px;">Carregando comentários...</div>';

    const { data, error } = await supabaseClient
        .from('comentarios')
        .select('*')
        .eq('post_id', postIdAtual)
        .order('created_at', { ascending: false })
        .limit(20);

    container.innerHTML = '';

    if (error || !data || data.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:var(--sub-text); padding:20px;">Nenhum comentário ainda. Seja o primeiro!</div>';
        return;
    }

    data.forEach(c => {
        let dataFormatada = "Recentemente";
        if(c.created_at) {
            const dataObj = new Date(c.created_at);
            const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
            dataFormatada = `${dataObj.getDate()} de ${meses[dataObj.getMonth()]}. de ${dataObj.getFullYear()}, ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        }

        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `
            <div class="comment-author">
                <span>${c.autor}</span>
                <span class="comment-date">${dataFormatada}</span>
            </div>
            <div>${c.texto}</div>
        `;
        container.appendChild(item);
    });
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

carregarFeed();
atualizarEstadoUsuario();
carregarDadosFaixa();

function abrirModalRodape(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function fecharModalRodape(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// =========================================================================
// COMPORTAMENTO DO MENU FLUTUANTE ARRASTÁVEL COM ANIMAÇÃO DE X E PULSAR
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
    criarBotaoFlutuanteMenu();
});

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

    const dragStart = (e) => {
        isDragging = false;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        
        const rect = floatBtn.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        floatBtn.setAttribute('data-dragging', 'false');

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    };

    const dragMove = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
            floatBtn.setAttribute('data-dragging', 'true');
        }

        if (isDragging) {
            e.preventDefault();
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
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        
        setTimeout(() => {
            floatBtn.setAttribute('data-dragging', 'false');
        }, 50);
    };

    floatBtn.addEventListener('mousedown', dragStart);
    floatBtn.addEventListener('touchstart', dragStart, { passive: true });
}
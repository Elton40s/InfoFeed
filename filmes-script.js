const SUPABASE_URL = 'https://edrmehdyusznzdltlhxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkcm1laGR5dXN6bnpkbHRsaHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjcxMDUsImV4cCI6MjEwNTgwMzEwNX0.TDclKranm8q1Zcb2ngv6lgflM4yU5fpANLVuyJer6gk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TMDB_API_KEY = '1792a76c814b3057e6b8b05d4eee27d5';

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.logo-animada-principal').forEach(el => {
            el.classList.add('animate-logo');
        });
    }, 400);
});

if (localStorage.getItem('modoNoturno') === 'ativo') {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('modoNoturnoBtn');
    if(btn) btn.innerText = 'MODO CLARO';
}

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
    let dolarTexto = "Dólar: Carregando...";
    let euroTexto = "Euro: Carregando...";

    try {
        const resCotacoes = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
        const dataCotacoes = await resCotacoes.json();
        
        if (dataCotacoes && dataCotacoes.USDBRL) {
            const cotDolar = parseFloat(dataCotacoes.USDBRL.bid).toFixed(2);
            const varDolar = parseFloat(dataCotacoes.USDBRL.pctChange);
            const corDolar = varDolar >= 0 ? '#16a34a' : '#dc2626';
            dolarTexto = `Dólar: R$ <span class="tech-dolar">${cotDolar}</span> <span style="color: ${corDolar}; font-weight: 700;">${varDolar >= 0 ? '▲' : '▼'} ${Math.abs(varDolar)}%</span>`;
        }
        if (dataCotacoes && dataCotacoes.EURBRL) {
            const cotEuro = parseFloat(dataCotacoes.EURBRL.bid).toFixed(2);
            const varEuro = parseFloat(dataCotacoes.EURBRL.pctChange);
            const corEuro = varEuro >= 0 ? '#16a34a' : '#dc2626';
            euroTexto = `Euro: R$ <span class="tech-dolar">${cotEuro}</span> <span style="color: ${corEuro}; font-weight: 700;">${varEuro >= 0 ? '▲' : '▼'} ${Math.abs(varEuro)}%</span>`;
        }
    } catch(e) {}

    const blocoUnico = `🎬 Cinema & Séries em Alta &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${dolarTexto} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${euroTexto} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; <span style="color: #000;">Info</span><span style="color: #0ea5e9;">Feed</span> - Filmes & Séries &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
    tickerEl.innerHTML = blocoUnico + blocoUnico;
}

function toggleMenu() {
    document.getElementById('hamburgerBtn').classList.toggle('active');
    document.getElementById('menuOverlay').classList.toggle('active');
}

function fecharMenu() {
    document.getElementById('hamburgerBtn').classList.remove('active');
    document.getElementById('menuOverlay').classList.remove('active');
}

function fecharMenuPorFora(event) {
    if (event.target.id === 'menuOverlay') fecharMenu();
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
            userNavContainer.innerHTML = `<button class="btn-login" onclick="irParaLogin()">Login</button>`;
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
let postIdAtual = null;
let linkCompartilharAtual = "";

async function carregarFilmesSeries() {
    try {
        const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}&language=pt-BR`;
        const response = await fetch(url);
        const data = await response.json();

        feedContainer.innerHTML = '';

        if (data.results && data.results.length > 0) {
            data.results.forEach((item, index) => {
                const titulo = item.title || item.name || 'Título Indisponível';
                const sinopse = item.overview || 'Sinopse não disponível em português.';
                const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=Sem+Cartaz';
                const tipoMidia = item.media_type === 'movie' ? 'Filme' : 'Série';
                const nota = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
                const dataLancamento = item.release_date || item.first_air_date || 'Data não informada';
                const ano = dataLancamento.split('-')[0];
                const postId = `media_${index}`;

                criarCardMidia(postId, titulo, sinopse, posterPath, tipoMidia, nota, ano);
            });
        } else {
            feedContainer.innerHTML = '<div class="loading-text">Nenhum filme ou série encontrado no momento.</div>';
        }
    } catch (error) {
        feedContainer.innerHTML = '<div class="loading-text">Erro ao conectar com a API de Filmes e Séries.</div>';
    }
}

function criarCardMidia(postId, titulo, sinopse, posterUrl, tipo, nota, ano) {
    const articleEl = document.createElement('article');
    articleEl.className = 'post-card';

    articleEl.innerHTML = `
        <header class="post-header">
            <span class="media-type-badge">${tipo} (${ano})</span>
            <span class="media-rating">⭐ ${nota} / 10</span>
        </header>
        <div class="post-content">
            <p class="post-text">
                <strong>${titulo}</strong>
                ${sinopse}
            </p>
            <img src="${posterUrl}" alt="Cartaz de ${titulo}" class="post-image">
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
            <button class="action-btn" onclick="abrirCompartilhar('${encodeURIComponent(titulo)}')">
                <svg viewBox="0 0 24 24" style="fill:none; stroke:currentColor;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Compartilhar
            </button>
        </footer>
    `;

    feedContainer.appendChild(articleEl);
}

let botaoCurtidaAtivo = null;

function alternarCurtida(botao) {
    if (botao.classList.contains('liked')) {
        botaoCurtidaAtivo = botao;
        document.getElementById('cancelarCurtidaModal').classList.add('active');
        document.getElementById('confirmarDescurtirBtn').onclick = function() {
            if (botaoCurtidaAtivo) {
                botaoCurtidaAtivo.classList.remove('liked');
                const svgHtml = botaoCurtidaAtivo.querySelector('svg').outerHTML;
                botaoCurtidaAtivo.innerHTML = svgHtml + ' Curtir';
                botaoCurtidaAtivo = null;
            }
            fecharModal('cancelarCurtidaModal');
        };
        return;
    }
    botao.classList.add('liked');
    const svgHtml = botao.querySelector('svg').outerHTML;
    botao.innerHTML = svgHtml + ' Curtido';
}

function abrirCompartilhar(tituloEncoded) {
    const titulo = decodeURIComponent(tituloEncoded);
    linkCompartilharAtual = `Confira ${titulo} no InfoFeed Filmes & Séries!`;

    document.getElementById('shareWhatsapp').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(linkCompartilharAtual)}`;
    document.getElementById('shareGmail').href = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(titulo)}&body=${encodeURIComponent(linkCompartilharAtual)}`;

    document.getElementById('shareModal').classList.add('active');
}

function copiarLinkNoticia() {
    navigator.clipboard.writeText(linkCompartilharAtual).then(() => {
        alert('Texto copiado para a área de transferência!');
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
                <input type="text" class="modal-input" id="commentText" placeholder="Escreva seu comentário sobre este título...">
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

function abrirModalRodape(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function fecharModalRodape(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

carregarFilmesSeries();
atualizarEstadoUsuario();
carregarDadosFaixa();
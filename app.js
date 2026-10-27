// ====== CONFIGURAÇÃO (edite à vontade) ======
const ATRIBUTOS = {
  vitalidade: { nome: 'Vitalidade', icone: '❤️' },
  hidratacao: { nome: 'Hidratação', icone: '💧' },
  forca: { nome: 'Força', icone: '💪' },
  agilidade: { nome: 'Agilidade', icone: '⚡' },
  inteligencia: { nome: 'Inteligência', icone: '🧠' },
  disciplina: { nome: 'Disciplina', icone: '🎯' },
  foco: { nome: 'Foco', icone: '🔭' },
};

const TAREFAS = [
  { id: 'agua', nome: 'Beber 2L de água', cat: 'Nutrição', attr: 'hidratacao', pts: 50 },
  { id: 'prot', nome: 'Bater meta de proteína', cat: 'Nutrição', attr: 'forca', pts: 60 },
  { id: 'flex', nome: '20 flexões', cat: 'Treino', attr: 'forca', pts: 40 },
  { id: 'abd', nome: '20 abdominais', cat: 'Treino', attr: 'vitalidade', pts: 40 },
  { id: 'corr', nome: 'Correr 5 km', cat: 'Treino', attr: 'vitalidade', pts: 60 },
  { id: 'along', nome: 'Alongar 3 minutos', cat: 'Treino', attr: 'agilidade', pts: 20 },
  { id: 'sono', nome: 'Dormir 8 horas', cat: 'Recuperação', attr: 'disciplina', pts: 50 },
  { id: 'ler', nome: 'Ler 10 páginas', cat: 'Mente', attr: 'inteligencia', pts: 40 },
  { id: 'foco', nome: '1 hora de foco sem celular', cat: 'Mente', attr: 'foco', pts: 50 },
];

const TEMAS = {
  padrao: { nome: 'Padrão', a: '#8b3dff', b: '#b57cff', g: '#2a0f55' },
  oceano: { nome: 'Oceano', a: '#0a7cff', b: '#5db0ff', g: '#0c2a55' },
  sol: { nome: 'Pôr do Sol', a: '#ff4d0a', b: '#ff8a5c', g: '#4a1405' },
  floresta: { nome: 'Floresta', a: '#16a864', b: '#4fe39a', g: '#0b3a22' },
  royal: { nome: 'Royal', a: '#c026d3', b: '#f472b6', g: '#450a55' },
  ouro: { nome: 'Ouro', a: '#e68a00', b: '#ffc24d', g: '#4a2f05' },
};

const PENALIDADE_POR_DIA = 100; // XP perdido por dia faltado (máx. 5 dias)
const RANKS = [[50, 'S'], [40, 'A'], [30, 'B'], [20, 'C'], [10, 'D'], [1, 'E']];
const TITULOS = { E: 'Caçador Fraco', D: 'Caçador Iniciante', C: 'Caçador Experiente', B: 'Caçador Elite', A: 'Caçador Veterano', S: 'Monarca das Sombras' };
const xpParaNivel = (n) => 500 * n;
const rankDe = (n) => RANKS.find(([min]) => n >= min)[1];

// ====== ESTADO ======
const hoje = () => new Date().toLocaleDateString('sv'); // AAAA-MM-DD
const ontem = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toLocaleDateString('sv'); };

const salvo = JSON.parse(localStorage.getItem('shape') || 'null') || {};
let S = {
  nome: 'Caçador', nivel: 1, xp: 0, pontos: 0, streak: 0, ultimoDia: null, dia: hoje(),
  feitas: {}, tema: 'padrao', onboarded: false, penalidade: 0,
  ...salvo,
  attrs: { vitalidade: 0, hidratacao: 0, forca: 0, agilidade: 0, inteligencia: 0, disciplina: 0, foco: 0, ...(salvo.attrs || {}) },
};

if (S.dia !== hoje()) { S.dia = hoje(); S.feitas = {}; }

// Penalidade por dias sem completar nenhuma missão
if (S.onboarded && S.ultimoDia && S.ultimoDia < ontem()) {
  const dias = Math.round((new Date(hoje()) - new Date(S.ultimoDia)) / 864e5) - 1;
  const perda = Math.min(dias, 5) * PENALIDADE_POR_DIA;
  S.xp = Math.max(0, S.xp - perda);
  S.streak = 0;
  S.ultimoDia = null;
  S.penalidade = { dias, perda };
}

const salvar = () => localStorage.setItem('shape', JSON.stringify(S));

function aplicarTema(id) {
  const t = TEMAS[id] || TEMAS.padrao;
  const r = document.documentElement.style;
  r.setProperty('--roxo', t.a); r.setProperty('--roxo2', t.b); r.setProperty('--glow', t.g);
}
aplicarTema(S.tema);
function setTema(id) { S.tema = id; aplicarTema(id); salvar(); render(); }

function concluir(id) {
  if (S.feitas[id]) return;
  const t = TAREFAS.find((x) => x.id === id);
  S.feitas[id] = true;
  S.pontos += t.pts;
  S.xp += t.pts;
  S.attrs[t.attr] = Math.min(100, S.attrs[t.attr] + 2);
  while (S.xp >= xpParaNivel(S.nivel)) { S.xp -= xpParaNivel(S.nivel); S.nivel++; }
  if (S.ultimoDia !== hoje()) { S.streak = S.ultimoDia === ontem() ? S.streak + 1 : 1; S.ultimoDia = hoje(); }
  salvar();
  render();
}

// ====== MODAIS E FLUXO DE NOVO JOGADOR ======

function modal(html, classe = '') {
  fecharModal();

  const m = document.createElement('div');
  m.id = 'modal';
  m.innerHTML = `<div class="caixa ${classe}">${html}</div>`;

  document.body.appendChild(m);
}

function fecharModal() {
  const m = document.getElementById('modal');
  if (m) m.remove();
}


function convite() {
  
function convite() {
  modal(`
    <div class="titulo-neon">
      <span class="icone-neon">!</span>
      <span>NOTIFICAÇÃO</span>
    </div>

    <p class="mensagem-neon">
      Você deseja se tornar um jogador?
    </p>

    <p class="pergunta-neon">Você aceita?</p>

    <div class="duo">
      <button class="btn" onclick="pedirNome()">SIM</button>
      <button class="btn" onclick="gameOver()">NÃO</button>
    </div>
  `, 'caixa-neon');
}
}

function pedirNome() {
  modal(`<h2>Novo Jogador</h2>
    <p>Para continuar, digite seu nome e comece sua jornada.</p>
    <input id="in-nome" placeholder="Sung Jinwoo" value="${S.nome === 'Caçador' ? '' : S.nome}">
    <button class="btn azul" onclick="salvarNome()">Salvar</button>`);
}
function salvarNome() {
  const v = document.getElementById('in-nome').value.trim();
  if (v) { S.nome = v; pedirKm(); }
}

function pedirKm() {
  modal(`<h2>Novo Jogador</h2>
    <p>Defina seu nível inicial:<br>quantos quilômetros você consegue correr confortavelmente?</p>
    <div class="kmbox"><b id="kmv">0</b><span>km</span></div>
    <input id="in-km" type="range" min="0" max="20" value="0" oninput="document.getElementById('kmv').textContent=this.value">
    <button class="btn azul" onclick="salvarKm()">Salvar</button>`);
}
function salvarKm() {
  const km = +document.getElementById('in-km').value;
  S.attrs.vitalidade = Math.max(S.attrs.vitalidade, Math.min(30, km * 3));
  S.onboarded = true;
  salvar();
  modal(`<h2>Inicialização completa</h2>
    <p>Seu perfil está pronto. Comece suas missões diárias e suba de rank. Seu rank inicial é:</p>
    <div class="rombo"><span>E</span></div>
    <p class="aviso">Atenção: se você faltar um dia, receberá uma penalidade severa.</p>
    <button class="btn azul" onclick="fecharModal();render()">Entrar no sistema</button>`);
}

function gameOver() {
  fecharModal();
  const g = document.createElement('div');
  g.id = 'gameover';
  g.innerHTML = `<h1>GAME OVER</h1><p>Não existem recomeços na vida.<br>Você foi eliminado pelo sistema.</p>
    <button class="btn" onclick="this.parentElement.remove();convite()">Começar nova missão</button>`;
  document.body.appendChild(g);
}

function iniciar() {
  if (!S.onboarded) return convite();
  if (S.penalidade) {
    const { dias, perda } = S.penalidade;
    S.penalidade = 0; salvar();
    modal(`<h2>Penalidade</h2>
      <p>Você ficou <b>${dias} dia(s)</b> sem completar missões. O sistema retirou <b>${perda} XP</b> e sua sequência foi zerada.</p>
      <button class="btn verm" onclick="fecharModal();render()">Entendido</button>`);
  }
}

// ====== TELAS ======
let aba = 'home';
const view = document.getElementById('view');

function saudacao() {
  const h = new Date().getHours();
  return h < 6 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

const telas = {
  home() {
    const r = rankDe(S.nivel), need = xpParaNivel(S.nivel);
    const feitas = Object.keys(S.feitas).length;
    const prox = [...RANKS].reverse().find(([m]) => m > S.nivel);
    const proxTxt = prox ? `Próximo rank <b>${prox[1]}</b> em <b>${prox[0] - S.nivel}</b> níveis.` : 'Você alcançou o rank máximo.';
    return `
      <h1>${saudacao()}, <span style="color:var(--roxo2)">${S.nome}</span>.</h1>
      <p class="mut">Disciplina hoje. Um eu melhor amanhã.</p>
      <div class="hero">
        <span class="badge">${r} • Level ${S.nivel}</span>
       <img class="avatar-img" src="avatar.jpg" alt="Avatar" onerror="this.style.display='none'">
        <h1>@${S.nome}</h1>
        <p class="mut">${TITULOS[r]}</p>
      </div>
      <div class="card">
        <div class="row"><span class="mut">XP para Level ${S.nivel + 1}</span><b>${S.xp}/${need}</b></div>
        <div class="bar"><i style="width:${(S.xp / need) * 100}%"></i></div>
        <p class="mut" style="margin-top:10px">${proxTxt}</p>
      </div>
      <div class="grid">
        <div class="card stat"><b>🔥 ${S.streak}</b><span class="mut">Dias de streak</span></div>
        <div class="card stat"><b>${S.pontos}</b><span class="mut">Pontos totais</span></div>
      </div>
      <div class="card stat"><b>${feitas}/${TAREFAS.length}</b><span class="mut">Missões de hoje</span></div>`;
  },

  tasks() {
    const cats = [...new Set(TAREFAS.map((t) => t.cat))];
    return `<h1>Missões diárias</h1><p class="mut">Conclua as atividades e melhore suas habilidades</p>` +
      cats.map((c) => `<h2>${c}</h2>` + TAREFAS.filter((t) => t.cat === c).map((t) => `
        <div class="card task ${S.feitas[t.id] ? 'done' : ''}" onclick="concluir('${t.id}')">
          <div class="ck">${S.feitas[t.id] ? '✓' : ''}</div>
          <span class="nome">${t.nome}</span>
          <span class="pts">+${t.pts} pts</span>
        </div>`).join('')).join('');
  },

  status() {
    return `<h1>Status do Personagem</h1><p class="mut">Seus atributos são afetados pelas suas atividades diárias</p><br>` +
      Object.entries(ATRIBUTOS).map(([k, a]) => `
        <div class="attr">
          <div class="row"><span>${a.icone} ${a.nome}</span><span class="mut">${S.attrs[k]}/100</span></div>
          <div class="bar"><i style="width:${S.attrs[k]}%"></i></div>
        </div>`).join('');
  },

  perfil() {
    return `<h1>Perfil</h1>
      <div class="card">
        <label class="mut">Seu nome de caçador</label>
        <input id="nome" value="${S.nome}">
        <button class="btn" onclick="S.nome=document.getElementById('nome').value||'Caçador';salvar();render()">Salvar nome</button>
      </div>
      <div class="card">
        <h2 style="margin-top:0">🎨 Tema de cores</h2>
        <div class="temas">${Object.entries(TEMAS).map(([id, t]) => `
          <div class="tema ${S.tema === id ? 'sel' : ''}" style="background:linear-gradient(135deg,${t.a},${t.b})" onclick="setTema('${id}')">${S.tema === id ? '✓ ' : ''}${t.nome}</div>`).join('')}
        </div>
      </div>
      <div class="card">
        <p class="mut">Zerar todo o progresso (não dá pra desfazer)</p>
        <button class="btn" style="background:#6b1d1d" onclick="if(confirm('Zerar tudo?')){localStorage.removeItem('shape');location.reload()}">Resetar</button>
      </div>`;
  },
};

function render() {
  view.innerHTML = telas[aba]();
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === aba));
}

document.querySelectorAll('nav button').forEach((b) => (b.onclick = () => { aba = b.dataset.tab; render(); }));
render();

// ====== TELA DE INTRODUÇÃO ======
(function intro() {
  const el = document.getElementById('intro');
  const txt = document.getElementById('intro-txt');
  const bg = document.getElementById('intro-bg');
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  let pular = false, fechado = false;

  for (let i = 0; i < 9; i++) {
    const p = document.createElement('i');
    p.className = 'ponto';
    p.style.cssText = `left:${Math.random() * 95}%;top:${Math.random() * 95}%;animation-delay:${Math.random() * 5}s`;
    bg.appendChild(p);
  }
  [[45, 10, 1, 55], [0, 62, 100, 1], [12, 70, 1, 28], [92, 75, 1, 25]].forEach(([l, t, w, h], i) => {
    const d = document.createElement('i');
    d.className = 'linha';
    d.style.cssText = `left:${l}%;top:${t}%;width:${w === 1 ? '1px' : w + '%'};height:${h === 1 ? '1px' : h + '%'};animation-delay:${i * 1.2}s`;
    bg.appendChild(d);
  });

  async function digitar(frase) {
    txt.classList.remove('some');
    txt.classList.add('cursor');
    txt.textContent = '';
    for (const ch of frase) {
      if (pular) return;
      txt.textContent += ch;
      await esperar(70);
    }
    await esperar(1400);
    txt.classList.add('some');
    await esperar(700);
  }

  function fechar() {
    if (fechado) return;
    fechado = true; pular = true;
    el.classList.add('sai');
    setTimeout(() => el.remove(), 900);
    setTimeout(iniciar, 500);
  }
  el.onclick = fechar;

  (async () => {
    await esperar(600);
    await digitar('Bem-vindo, Jogador.');
    if (!pular) await digitar('Segunda chance concedida.');
    fechar();
  })();
})();

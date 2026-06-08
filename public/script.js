// ==================== CONFIGURAÇÃO GLOBAL ====================
const API = '/api';
let TOKEN = localStorage.getItem('ft_token') || '';
let USUARIO_LOGADO = JSON.parse(localStorage.getItem('ft_usuario') || 'null');
let cProdutos = [], cClientes = [];

// ==================== UTILITÁRIOS ====================
function toast(msg, tipo = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${tipo}`;
  setTimeout(() => el.className = '', 3000);
}

function abrir(id) { document.getElementById(id).classList.add('open'); }
function fechar(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-bg').forEach(bg =>
  bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); })
);

function badgeStatus(status) {
  const classes = {
    'Aguardando Produção': 'status-aguardando',
    'Em Produção': 'status-producao',
    'Finalizado': 'status-finalizado'
  };
  return `<span class="badge-status ${classes[status]}">${status}</span>`;
}

// ==================== API WRAPPER ====================
async function api(method, url, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + url, opts);
  const data = await res.json();
  if (res.status === 401) { sair(); throw new Error('Sessão expirada'); }
  if (!res.ok) throw new Error(data.erro || 'Erro');
  return data;
}

// ==================== LOGIN / LOGOUT ====================
async function fazerLogin() {
  const email = document.getElementById('l-email').value.trim();
  const senha = document.getElementById('l-senha').value;
  const btn = document.getElementById('btn-login');
  const erro = document.getElementById('login-erro');
  if (!email || !senha) {
    erro.style.display = 'block';
    erro.textContent = 'Preencha e-mail e senha.';
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Acessando...';
  erro.style.display = 'none';
  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Credenciais inválidas');
    TOKEN = data.token;
    USUARIO_LOGADO = data.usuario;
    localStorage.setItem('ft_token', TOKEN);
    localStorage.setItem('ft_usuario', JSON.stringify(data.usuario));
    document.body.classList.add('logado');
    aplicarPerfil();
    carregarPaginaInicial();
  } catch (e) {
    erro.style.display = 'block';
    erro.textContent = e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

function sair() {
  TOKEN = '';
  USUARIO_LOGADO = null;
  localStorage.removeItem('ft_token');
  localStorage.removeItem('ft_usuario');
  document.body.classList.remove('logado');
  document.getElementById('l-senha').value = '';
}

function aplicarPerfil() {
  const perfil = USUARIO_LOGADO.perfil;
  document.getElementById('sb-nome').textContent = USUARIO_LOGADO.nome;
  document.getElementById('sb-perfil').textContent = perfil;

  // Iniciais no avatar
  const avatarEl = document.getElementById('sb-avatar');
  if (avatarEl) {
    const partes = USUARIO_LOGADO.nome.trim().split(' ');
    const iniciais = partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0].slice(0, 2);
    avatarEl.textContent = iniciais.toUpperCase();
  }

  const isAdmin = perfil === 'Administrativo';
  const isLider = perfil === 'Líder de Produção';

  // Mostrar/ocultar menus conforme perfil
  document.querySelectorAll('.nav-only-admin').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
  document.querySelectorAll('.nav-only-lider').forEach(el => {
    el.style.display = isLider ? '' : 'none';
  });

  // Ajustar título da página de Operações para o Líder
  if (isLider) {
    // título já está fixo no HTML como "Operações"
  }
}

function carregarPaginaInicial() {
  // Navegação entre páginas
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(`pg-${page}`).classList.add('active');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      // Marca como ativo todos os botões daquela page (admin e lider podem ter o mesmo data-page)
      document.querySelectorAll(`.nav-item[data-page="${page}"]`).forEach(n => n.classList.add('active'));
      // Carregar dados conforme página
      if (page === 'dashboard') carregarDashboard();
      else if (page === 'produtos') carregarProdutos();
      else if (page === 'pedidos') carregarPedidos();
      else if (page === 'clientes') carregarClientes();
      else if (page === 'equipe') carregarUsuarios();
      else if (page === 'relatorios') carregarOperacoes();
    });
  });

  // Ativa página inicial conforme perfil
  const perfil = USUARIO_LOGADO.perfil;
  const paginaInicial = perfil === 'Administrativo' ? 'dashboard' : 'pedidos';
  const primeiroBtn = document.querySelector(`.nav-item[data-page="${paginaInicial}"]`);
  if (primeiroBtn) primeiroBtn.click();
}

// ==================== DASHBOARD ====================
async function carregarDashboard() {
  try {
    const [ordens, produtos, clientes] = await Promise.all([
      api('GET', '/ordens'),
      api('GET', '/produtos'),
      api('GET', '/clientes')
    ]);
    const totalFinalizadas = ordens.filter(o => o.status === 'Finalizado').length;
    const totalPendencias = ordens.filter(o => o.status !== 'Finalizado').length;
    const totalPecasProduzidas = ordens.reduce((acc, o) => acc + (o.quantidade || 0), 0);
    // Receita fictícia: R$ 10 por peça produzida (apenas exemplo)
    const receitaMensal = totalPecasProduzidas * 10;
    document.getElementById('stat-receita').innerHTML = `R$ ${receitaMensal.toLocaleString()}`;
    document.getElementById('stat-pedidos-produzidos').innerText = totalFinalizadas;
    document.getElementById('stat-clientes-ativos').innerText = clientes.length;
    document.getElementById('stat-pendencias').innerText = totalPendencias;
    // Produção hoje: quantidade das ordens finalizadas nas últimas 24h (simulação)
    const hoje = new Date().toISOString().slice(0,10);
    const produzidasHoje = ordens.filter(o => o.status === 'Finalizado' && o.updatedAt?.startsWith(hoje)).length;
    document.getElementById('producao-hoje').innerText = produzidasHoje;
    // Tabela de pedidos recentes (últimos 5)
    const recentes = ordens.slice(0, 5);
    let html = `<table><thead><tr><th>OP #</th><th>Cliente</th><th>Produto</th><th>Qtd</th><th>Prazo</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
    recentes.forEach(o => {
      html += `<tr>
        <td><span class="op-num">#${String(o.numeroOP || '').padStart(4,'0')}</span></td>
        <td>${o.cliente?.nome || '—'}</td>
        <td>${o.produto?.nome || '—'}</td>
        <td>${o.quantidade}</td>
        <td>${new Date(o.prazoEntrega).toLocaleDateString()}</td>
        <td>${badgeStatus(o.status)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="abrirStatus('${o._id}','${o.status}')">Status</button></td>
      </tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('tabela-pedidos-recentes').innerHTML = html;
  } catch (e) {
    toast('Erro ao carregar dashboard: ' + e.message, 'err');
  }
}

// ==================== PRODUTOS ====================
async function carregarProdutos() {
  try {
    cProdutos = await api('GET', '/produtos');
    const container = document.getElementById('tbl-produtos');
    if (!cProdutos.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚙️</div><div class="empty-state-text">Nenhum produto cadastrado</div></div>';
      return;
    }
    let html = `<table><thead><tr><th>Código</th><th>Nome da Peça</th><th>Descrição</th><th>Ações</th></tr></thead><tbody>`;
    cProdutos.forEach(p => {
      html += `<tr>
        <td><span class="op-num">${p.codigo || '-'}</span></td>
        <td>${p.nome}</td>
        <td style="color:var(--text-3)">${p.descricao || '-'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editarProduto('${p._id}')">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deletarProduto('${p._id}','${p.nome}')">🗑️</button>
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
  } catch (e) { toast(e.message, 'err'); }
}

function abrirProduto() {
  document.getElementById('m-produto-t').textContent = 'Novo Produto';
  ['p-id','p-nome','p-codigo','p-desc'].forEach(id => document.getElementById(id).value = '');
  abrir('m-produto');
}

function editarProduto(id) {
  const p = cProdutos.find(x => x._id === id);
  if (!p) return;
  document.getElementById('m-produto-t').textContent = 'Editar Produto';
  document.getElementById('p-id').value = p._id;
  document.getElementById('p-nome').value = p.nome;
  document.getElementById('p-codigo').value = p.codigo || '';
  document.getElementById('p-desc').value = p.descricao || '';
  abrir('m-produto');
}

async function salvarProduto() {
  const id = document.getElementById('p-id').value;
  const nome = document.getElementById('p-nome').value.trim();
  if (!nome) { toast('Nome obrigatório', 'err'); return; }
  const dados = { nome, codigo: document.getElementById('p-codigo').value, descricao: document.getElementById('p-desc').value };
  try {
    id ? await api('PUT', `/produtos/${id}`, dados) : await api('POST', '/produtos', dados);
    toast(id ? 'Produto atualizado' : 'Produto criado');
    fechar('m-produto');
    carregarProdutos();
  } catch (e) { toast(e.message, 'err'); }
}

async function deletarProduto(id, nome) {
  if (!confirm(`Excluir "${nome}"?`)) return;
  try {
    await api('DELETE', `/produtos/${id}`);
    toast('Produto excluído');
    carregarProdutos();
  } catch (e) { toast(e.message, 'err'); }
}

// ==================== CLIENTES ====================
async function carregarClientes(busca = '') {
  const container = document.getElementById('tbl-clientes');
  container.innerHTML = '<div class="loading">Carregando...</div>';
  try {
    const url = busca ? `/clientes?busca=${encodeURIComponent(busca)}` : '/clientes';
    cClientes = await api('GET', url);
    if (!cClientes.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏢</div><div class="empty-state-text">Nenhum cliente cadastrado</div></div>';
      return;
    }
    let html = `<table><thead><tr><th>Empresa</th><th>Telefone</th><th>Endereço</th><th>Ações</th></tr></thead><tbody>`;
    cClientes.forEach(c => {
      const end = c.endereco ? `${c.endereco.rua || ''}, ${c.endereco.numero || ''} - ${c.endereco.cidade || ''}`.replace(/^,\s*-\s*/, '—') : '—';
      html += `<tr>
        <td>${c.nome}</td>
        <td>${c.telefone}</td>
        <td style="color:var(--text-3)">${end}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editarCliente('${c._id}')">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deletarCliente('${c._id}','${c.nome}')">🗑️</button>
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
  } catch (e) { toast(e.message, 'err'); }
}

let buscaTimeout;
function buscarCli(v) {
  clearTimeout(buscaTimeout);
  buscaTimeout = setTimeout(() => carregarClientes(v), 400);
}
document.getElementById('busca-cli')?.addEventListener('input', e => buscarCli(e.target.value));

function abrirCliente() {
  document.getElementById('m-cli-t').textContent = 'Nova Empresa';
  ['c-id','c-nome','c-tel','c-rua','c-num','c-bairro','c-cidade','c-cep','c-obs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  abrir('m-cliente');
}

function editarCliente(id) {
  const c = cClientes.find(x => x._id === id);
  if (!c) return;
  document.getElementById('m-cli-t').textContent = 'Editar Empresa';
  document.getElementById('c-id').value = c._id;
  document.getElementById('c-nome').value = c.nome;
  document.getElementById('c-tel').value = c.telefone;
  document.getElementById('c-rua').value = c.endereco?.rua || '';
  document.getElementById('c-num').value = c.endereco?.numero || '';
  document.getElementById('c-bairro').value = c.endereco?.bairro || '';
  document.getElementById('c-cidade').value = c.endereco?.cidade || '';
  document.getElementById('c-cep').value = c.endereco?.cep || '';
  document.getElementById('c-obs').value = c.observacoes || '';
  abrir('m-cliente');
}

async function salvarCliente() {
  const id = document.getElementById('c-id').value;
  const nome = document.getElementById('c-nome').value.trim();
  if (!nome) { toast('Nome obrigatório', 'err'); return; }
  const dados = {
    nome, telefone: document.getElementById('c-tel').value,
    endereco: {
      rua: document.getElementById('c-rua').value,
      numero: document.getElementById('c-num').value,
      bairro: document.getElementById('c-bairro').value,
      cidade: document.getElementById('c-cidade').value,
      cep: document.getElementById('c-cep').value
    },
    observacoes: document.getElementById('c-obs').value
  };
  try {
    id ? await api('PUT', `/clientes/${id}`, dados) : await api('POST', '/clientes', dados);
    toast(id ? 'Cliente atualizado' : 'Cliente criado');
    fechar('m-cliente');
    carregarClientes();
  } catch (e) { toast(e.message, 'err'); }
}

async function deletarCliente(id, nome) {
  if (!confirm(`Excluir ${nome}?`)) return;
  try {
    await api('DELETE', `/clientes/${id}`);
    toast('Cliente removido');
    carregarClientes();
  } catch (e) { toast(e.message, 'err'); }
}

// ==================== PEDIDOS (tabela para admin, kanban para líder) ====================
async function carregarPedidos() {
  const container = document.getElementById('pedidos-container');
  const perfil = USUARIO_LOGADO.perfil;
  try {
    const ordens = await api('GET', '/ordens');
    if (perfil === 'Líder de Produção') {
      // Exibir Kanban
      let html = `<div class="kanban-board">`;
      const statusMap = {
        'Aguardando Produção': { label: 'Aguardando', dot: '#f59e0b' },
        'Em Produção':         { label: 'Em Produção', dot: '#3b82f6' },
        'Finalizado':          { label: 'Finalizado',  dot: '#22c55e' }
      };
      for (const status of ['Aguardando Produção', 'Em Produção', 'Finalizado']) {
        const filtered = ordens.filter(o => o.status === status);
        const info = statusMap[status];
        html += `<div class="kanban-col">
          <div class="kanban-col-header">
            <div class="kanban-col-title">
              <span class="kanban-dot" style="background:${info.dot}"></span>
              ${info.label}
            </div>
            <span class="kanban-count">${filtered.length}</span>
          </div>
          <div class="kanban-cards">
            ${filtered.map(o => `
              <div class="kanban-card" onclick="abrirStatus('${o._id}','${o.status}')">
                <div class="kanban-op">OP #${String(o.numeroOP || '').padStart(4,'0')}</div>
                <div class="kanban-produto">${o.produto?.nome || '-'}</div>
                <div class="kanban-meta">
                  <span class="kanban-tag">Qtd: ${o.quantidade}</span>
                  <span class="kanban-tag">📅 ${new Date(o.prazoEntrega).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('') || '<div class="kanban-empty">Nenhuma ordem</div>'}
          </div>
        </div>`;
      }
      html += `</div>`;
      container.innerHTML = html;
    } else {
      // Tabela para administrativo
      let html = `<div class="table-wrap"><table><thead><tr><th>OP #</th><th>Cliente</th><th>Produto</th><th>Qtd</th><th>Prazo</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
      ordens.forEach(o => {
        html += `<tr>
          <td><span class="op-num">#${String(o.numeroOP || '').padStart(4,'0')}</span></td>
          <td>${o.cliente?.nome || '—'}</td>
          <td>${o.produto?.nome || '—'}</td>
          <td>${o.quantidade}</td>
          <td>${new Date(o.prazoEntrega).toLocaleDateString()}</td>
          <td>${badgeStatus(o.status)}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="abrirStatus('${o._id}','${o.status}')">Status</button>
            <button class="btn btn-danger btn-sm" onclick="deletarOrdem('${o._id}')">🗑️</button>
          </td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      container.innerHTML = html;
    }
  } catch (e) {
    container.innerHTML = `<div class="loading">Erro: ${e.message}</div>`;
  }
}

async function abrirOrdem() {
  try {
    if (!cProdutos.length) cProdutos = await api('GET', '/produtos');
    if (!cClientes.length) cClientes = await api('GET', '/clientes');
    const clienteSelect = document.getElementById('ordem-cli');
    const produtoSelect = document.getElementById('ordem-prod');
    clienteSelect.innerHTML = '<option value="">Selecione o cliente</option>' + cClientes.map(c => `<option value="${c._id}">${c.nome}</option>`).join('');
    produtoSelect.innerHTML = '<option value="">Selecione o produto</option>' + cProdutos.map(p => `<option value="${p._id}">${p.nome}</option>`).join('');
    document.getElementById('ordem-qtd').value = '100';
    document.getElementById('ordem-prazo').value = '';
    abrir('m-ordem');
  } catch (e) { toast(e.message, 'err'); }
}

async function salvarOrdem() {
  const cliente = document.getElementById('ordem-cli').value;
  const produto = document.getElementById('ordem-prod').value;
  const quantidade = parseInt(document.getElementById('ordem-qtd').value);
  const prazoEntrega = document.getElementById('ordem-prazo').value;
  if (!cliente || !produto || !quantidade || !prazoEntrega) {
    toast('Preencha todos os campos', 'err');
    return;
  }
  try {
    await api('POST', '/ordens', { cliente, produto, quantidade, prazoEntrega });
    toast('OP gerada com sucesso!');
    fechar('m-ordem');
    carregarPedidos();
    if (document.getElementById('pg-dashboard').classList.contains('active')) carregarDashboard();
  } catch (e) { toast(e.message, 'err'); }
}

async function deletarOrdem(id) {
  if (!confirm('Excluir esta OP?')) return;
  try {
    await api('DELETE', `/ordens/${id}`);
    toast('OP removida');
    carregarPedidos();
    if (document.getElementById('pg-dashboard').classList.contains('active')) carregarDashboard();
  } catch (e) { toast(e.message, 'err'); }
}

function abrirStatus(id, statusAtual) {
  document.getElementById('st-id').value = id;
  document.getElementById('st-val').value = statusAtual;
  abrir('m-status');
}

async function salvarStatus() {
  const id = document.getElementById('st-id').value;
  const status = document.getElementById('st-val').value;
  try {
    await api('PATCH', `/ordens/${id}/status`, { status });
    toast('Status atualizado!');
    fechar('m-status');
    carregarPedidos();
    if (document.getElementById('pg-dashboard').classList.contains('active')) carregarDashboard();
  } catch (e) { toast(e.message, 'err'); }
}

// ==================== OPERAÇÕES (Líder de Produção) ====================
let _ordensOperacoes = []; // cache para filtro

async function carregarOperacoes() {
  try {
    const ordens = await api('GET', '/ordens');
    _ordensOperacoes = ordens;
    const hoje = new Date().toISOString().slice(0, 10);
    const agora = new Date();

    // --- Cards de resumo ---
    const aguardando   = ordens.filter(o => o.status === 'Aguardando Produção').length;
    const emProducao   = ordens.filter(o => o.status === 'Em Produção').length;
    const finalizadas  = ordens.filter(o => o.status === 'Finalizado' && o.updatedAt?.startsWith(hoje)).length;
    const atrasadas    = ordens.filter(o => {
      if (o.status === 'Finalizado') return false;
      return new Date(o.prazoEntrega) < agora;
    }).length;

    document.getElementById('ops-aguardando').textContent  = aguardando;
    document.getElementById('ops-em-producao').textContent = emProducao;
    document.getElementById('ops-finalizadas').textContent = finalizadas;
    document.getElementById('ops-atrasadas').textContent   = atrasadas;

    // --- Em Produção Agora ---
    const emAndamento = ordens.filter(o => o.status === 'Em Produção');
    const listaEl = document.getElementById('ops-em-andamento-lista');
    if (!emAndamento.length) {
      listaEl.innerHTML = '<div class="ops-empty">Nenhuma OP em produção no momento.</div>';
    } else {
      listaEl.innerHTML = emAndamento.map(o => {
        const prazoStr = new Date(o.prazoEntrega).toLocaleDateString('pt-BR');
        return `<div class="ops-em-andamento-card" onclick="abrirStatus('${o._id}','${o.status}')">
          <span class="ops-and-num">OP #${String(o.numeroOP || '').padStart(4,'0')}</span>
          <div class="ops-and-info">
            <div class="ops-and-nome">${o.produto?.nome || '—'}</div>
            <div class="ops-and-meta">📅 Prazo: ${prazoStr}</div>
          </div>
          <div class="ops-and-qtd">${o.quantidade} un.</div>
          <button class="ops-and-btn" onclick="event.stopPropagation();abrirStatus('${o._id}','${o.status}')">Atualizar</button>
        </div>`;
      }).join('');
    }

    // --- Prazo Crítico (próximos 3 dias, não finalizados) ---
    const em3dias = new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000);
    const criticas = ordens
      .filter(o => o.status !== 'Finalizado' && new Date(o.prazoEntrega) <= em3dias)
      .sort((a, b) => new Date(a.prazoEntrega) - new Date(b.prazoEntrega));
    const criticasEl = document.getElementById('ops-criticas-lista');
    if (!criticas.length) {
      criticasEl.innerHTML = '<div class="ops-empty" style="color:var(--text-3);font-size:.85rem;padding:.5rem 0">✅ Nenhuma OP em prazo crítico</div>';
    } else {
      criticasEl.innerHTML = criticas.map(o => {
        const prazo = new Date(o.prazoEntrega);
        const diff  = Math.ceil((prazo - agora) / (1000 * 60 * 60 * 24));
        const atrasado = diff < 0;
        const classCard = atrasado ? '' : 'amarelo';
        const textoData = atrasado
          ? `⚠️ Atrasado ${Math.abs(diff)} dia(s)`
          : diff === 0 ? '🔥 Vence hoje' : `⏰ Vence em ${diff} dia(s)`;
        return `<div class="ops-critica-card ${classCard}">
          <div class="ops-critica-op">OP #${String(o.numeroOP || '').padStart(4,'0')} · ${o.status}</div>
          <div class="ops-critica-nome">${o.produto?.nome || '—'}</div>
          <div class="ops-critica-prazo">${textoData} · ${prazo.toLocaleDateString('pt-BR')}</div>
        </div>`;
      }).join('');
    }

    // --- Fila completa ---
    renderizarFilaOps(ordens, 'todos');

  } catch (e) {
    toast('Erro ao carregar operações: ' + e.message, 'err');
  }
}

function filtrarFila(btn, filtro) {
  document.querySelectorAll('.ops-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderizarFilaOps(_ordensOperacoes, filtro);
}

function renderizarFilaOps(ordens, filtro) {
  const agora = new Date();
  const lista = filtro === 'todos' ? ordens : ordens.filter(o => o.status === filtro);
  const el = document.getElementById('ops-fila-tabela');
  if (!lista.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Nenhuma ordem nesta categoria</div></div>';
    return;
  }
  let html = `<table><thead><tr>
    <th>OP #</th><th>Produto</th><th>Qtd</th><th>Prazo</th><th>Situação do Prazo</th><th>Status</th><th>Ação</th>
  </tr></thead><tbody>`;
  lista.forEach(o => {
    const prazo = new Date(o.prazoEntrega);
    const diff  = Math.ceil((prazo - agora) / (1000 * 60 * 60 * 24));
    let prazoClass = 'prazo-ok', prazoTxt = `✅ ${diff}d restantes`;
    if (o.status !== 'Finalizado') {
      if (diff < 0)      { prazoClass = 'prazo-late'; prazoTxt = `🔴 ${Math.abs(diff)}d atrasado`; }
      else if (diff <= 3){ prazoClass = 'prazo-warn'; prazoTxt = `🟡 ${diff}d restantes`; }
    } else {
      prazoTxt = '—'; prazoClass = '';
    }
    html += `<tr>
      <td><span class="op-num">#${String(o.numeroOP || '').padStart(4,'0')}</span></td>
      <td>${o.produto?.nome || '—'}</td>
      <td>${o.quantidade}</td>
      <td>${prazo.toLocaleDateString('pt-BR')}</td>
      <td><span class="${prazoClass}">${prazoTxt}</span></td>
      <td>${badgeStatus(o.status)}</td>
      <td><button class="btn btn-outline btn-sm" onclick="abrirStatus('${o._id}','${o.status}')">Atualizar</button></td>
    </tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML = html;
}

// ==================== USUÁRIOS (apenas admin) ====================
async function carregarUsuarios() {
  try {
    const usuarios = await api('GET', '/usuarios');
    const container = document.getElementById('tbl-usuarios');
    if (!usuarios.length) {
      container.innerHTML = '<div class="loading">Nenhum usuário cadastrado</div>';
      return;
    }
    let html = `<table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Ações</th></tr></thead><tbody>`;
    usuarios.forEach(u => {
      html += `<tr>
        <td>${u.nome}</td>
        <td>${u.email}</td>
        <td>${u.perfil}</td>
        <td><button class="btn btn-sm btn-outline" onclick="deletarUsuario('${u._id}','${u.nome}')">🗑️</button></td>
      </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
  } catch (e) { toast(e.message, 'err'); }
}

function abrirUsuario() {
  ['u-nome','u-email','u-senha'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('u-perfil').value = 'Administrativo';
  abrir('m-usuario');
}

async function salvarUsuario() {
  const dados = {
    nome: document.getElementById('u-nome').value.trim(),
    email: document.getElementById('u-email').value.trim(),
    senha: document.getElementById('u-senha').value,
    perfil: document.getElementById('u-perfil').value
  };
  if (!dados.nome || !dados.email || !dados.senha) {
    toast('Preencha todos os campos', 'err');
    return;
  }
  try {
    await api('POST', '/usuarios', dados);
    toast('Usuário criado');
    fechar('m-usuario');
    carregarUsuarios();
  } catch (e) { toast(e.message, 'err'); }
}

async function deletarUsuario(id, nome) {
  if (!confirm(`Remover ${nome}?`)) return;
  try {
    await api('DELETE', `/usuarios/${id}`);
    toast('Usuário removido');
    carregarUsuarios();
  } catch (e) { toast(e.message, 'err'); }
}

// Inicialização
if (TOKEN && USUARIO_LOGADO) {
  document.body.classList.add('logado');
  aplicarPerfil();
  carregarPaginaInicial();
}
const { ready, query, run, get } = require('../database/sqlite');

const SELECT_ORDEM = `
  SELECT
    o.*,
    c.nome AS cliente_nome,
    c.telefone AS cliente_telefone,
    p.nome AS produto_nome,
    p.codigo AS produto_codigo
  FROM ordens_producao o
  LEFT JOIN clientes c ON c.id = o.cliente_id
  LEFT JOIN produtos p ON p.id = o.produto_id
`;

function formatarOrdem(row) {
  if (!row) return null;
  return {
    _id:           row.id,
    id:            row.id,
    numeroOP:      row.numero_ordem,
    numeroOrdem:   row.numero_ordem,
    cliente: {
      _id:         row.cliente_id,
      id:          row.cliente_id,
      nome:        row.cliente_nome,
      telefone:    row.cliente_telefone,
    },
    produto: {
      _id:         row.produto_id,
      id:          row.produto_id,
      nome:        row.produto_nome,
      codigo:      row.produto_codigo,
    },
    quantidade:    row.quantidade,
    prazoEntrega:  row.prazo,
    status:        row.status,
    observacoes:   row.observacoes,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

const OrdemProducao = {

  async findAll({ status } = {}) {
    await ready;
    let rows;
    if (status) {
      rows = await query(`${SELECT_ORDEM} WHERE o.status = ? ORDER BY o.created_at DESC`, [status]);
    } else {
      rows = await query(`${SELECT_ORDEM} ORDER BY o.created_at DESC`);
    }
    return rows.map(row => formatarOrdem(row));
  },

  async findById(id) {
    await ready;
    const row = await get(`${SELECT_ORDEM} WHERE o.id = ?`, [id]);
    return formatarOrdem(row);
  },

  async create({ clienteId, produtoId, quantidade, prazo }) {
    await ready;

    const Produto = require('./Produto');
    const produto = await Produto.findById(produtoId);
    if (!produto) throw new Error(`Produto ID ${produtoId} não encontrado`);

    const Cliente = require('./Cliente');
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) throw new Error(`Cliente ID ${clienteId} não encontrado`);

    const contagem = await get('SELECT COUNT(*) as total FROM ordens_producao');
    const numeroOrdem = (contagem?.total || 0) + 1;

    const statusInicial = 'Aguardando Produção';

    const infoOrdem = await run(`
      INSERT INTO ordens_producao
        (numero_ordem, cliente_id, produto_id, quantidade, prazo, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [numeroOrdem, clienteId, produtoId, quantidade, prazo, statusInicial]);

    return this.findById(infoOrdem.lastInsertRowid);
  },

  async updateStatus(id, status) {
    await ready;

    const statusValidos = ['Aguardando Produção', 'Em Produção', 'Finalizado'];
    if (!statusValidos.includes(status)) {
      throw new Error('Status inválido. Use: Aguardando Produção, Em Produção ou Finalizado.');
    }

    const ordem = await this.findById(id);
    if (!ordem) throw new Error('Ordem não encontrada');

    const info = await run(
      "UPDATE ordens_producao SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, id]
    );
    return info.changes > 0 ? this.findById(id) : null;
  },

  async delete(id) {
    await ready;
    const info = await run('DELETE FROM ordens_producao WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = OrdemProducao;
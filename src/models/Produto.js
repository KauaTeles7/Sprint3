const { ready, query, run, get } = require('../database/sqlite');

// Formatar produto (peça metálica)
function formatarProduto(row) {
  if (!row) return null;
  return {
    _id:         row.id,
    id:          row.id,
    nome:        row.nome,
    descricao:   row.descricao,
    codigo:      row.codigo,
    ativo:       row.ativo === 1,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// Objeto de Produto
const Produto = {

  // Buscar todos os produtos
  async findAll() {
    await ready;
    return query('SELECT * FROM produtos ORDER BY nome').map(formatarProduto);
  },

  // Buscar produto por ID
  async findById(id) {
    await ready;
    return formatarProduto(get('SELECT * FROM produtos WHERE id = ?', [id]));
  },

  // Criar novo produto
  async create({ nome, descricao = '', codigo = '', ativo = true }) {
    await ready;
    const info = run(
      'INSERT INTO produtos (nome, descricao, codigo, ativo) VALUES (?, ?, ?, ?)',
      [
        nome.trim(), 
        descricao.trim(), 
        codigo.trim(),
        ativo ? 1 : 0
      ]
    );
    return this.findById(info.lastInsertRowid);
  },

  // Atualizar dados do produto
  async update(id, { nome, descricao, codigo, ativo }) {
    await ready;
    const atual = get('SELECT * FROM produtos WHERE id = ?', [id]);
    if (!atual) return null;

    run(`
      UPDATE produtos SET
        nome       = ?,
        descricao  = ?,
        codigo     = ?,
        ativo      = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `, [
      nome      ?? atual.nome,
      descricao ?? atual.descricao,
      codigo    ?? atual.codigo,
      ativo     !== undefined ? (ativo ? 1 : 0) : atual.ativo,
      id
    ]);

    return this.findById(id);
  },

  // Deletar produto do banco de dados
  async delete(id) {
    await ready;
    const info = run('DELETE FROM produtos WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Produto;
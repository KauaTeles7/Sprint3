//====================================
// Rotas basicas para obter dados
//====================================

const express  = require('express');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const auth     = require('../middlewares/auth');

const Usuario       = require('../models/Usuario');
const Produto       = require('../models/Produto');
const Cliente       = require('../models/Cliente');
const OrdemProducao = require('../models/OrdemProducao');

//====================================
// Rota de autenticação de login 
//====================================

router.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });

    const usuario = await Usuario.findByEmail(email);
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const ok = await Usuario.verificarSenha(senha, usuario.senha);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET || 'secreta',
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil } });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

//====================================
// Rotas de Produtos (Peças Metálicas)
//====================================

router.get('/produtos', auth, async (req, res) => {
  try { res.json(await Produto.findAll()); }
  catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/produtos/:id', auth, async (req, res) => {
  try {
    const p = await Produto.findById(req.params.id);
    if (!p) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.post('/produtos', auth, async (req, res) => {
  try {
    if (!req.body.nome)
      return res.status(400).json({ erro: 'O nome do produto é obrigatório' });
    res.status(201).json(await Produto.create(req.body));
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.put('/produtos/:id', auth, async (req, res) => {
  try {
    const p = await Produto.update(req.params.id, req.body);
    if (!p) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/produtos/:id', auth, async (req, res) => {
  try {
    const ok = await Produto.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ mensagem: 'Produto deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

//====================================
// Rotas de Clientes
//====================================

router.get('/clientes', auth, async (req, res) => {
  try { res.json(await Cliente.findAll(req.query.busca)); }
  catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/clientes/:id', auth, async (req, res) => {
  try {
    const c = await Cliente.findById(req.params.id);
    if (!c) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(c);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.post('/clientes', auth, async (req, res) => {
  try {
    if (!req.body.nome || !req.body.telefone)
      return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });
    res.status(201).json(await Cliente.create(req.body));
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.put('/clientes/:id', auth, async (req, res) => {
  try {
    const c = await Cliente.update(req.params.id, req.body);
    if (!c) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(c);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/clientes/:id', auth, async (req, res) => {
  try {
    const ok = await Cliente.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ mensagem: 'Cliente deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

//====================================
// Rotas de Ordens de Produção
//====================================

router.get('/ordens', auth, async (req, res) => {
  try {
    const filtros = {};
    if (req.query.status) filtros.status = req.query.status;
    res.json(await OrdemProducao.findAll(filtros));
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/ordens/:id', auth, async (req, res) => {
  try {
    const p = await OrdemProducao.findById(req.params.id);
    if (!p) return res.status(404).json({ erro: 'Ordem de produção não encontrada' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// ==================== ROTA POST /ordens CORRIGIDA ====================
router.post('/ordens', auth, async (req, res) => {
  try {
    // Front envia: cliente, produto, quantidade, prazoEntrega
    const { cliente, produto, quantidade, prazoEntrega } = req.body;
    
    if (!cliente || !produto || !quantidade || !prazoEntrega) {
      return res.status(400).json({ 
        erro: 'cliente, produto, quantidade e prazoEntrega são obrigatórios' 
      });
    }

    const novaOrdem = await OrdemProducao.create({
      clienteId: cliente,
      produtoId: produto,
      quantidade,
      prazo: prazoEntrega
    });
    
    res.status(201).json(novaOrdem);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});
// =====================================================================

router.patch('/ordens/:id/status', auth, async (req, res) => {
  try {
    const validos = ['Aguardando Produção', 'Em Produção', 'Finalizado'];
    if (!validos.includes(req.body.status))
      return res.status(400).json({ erro: 'Status inválido. Use: Aguardando Produção, Em Produção ou Finalizado.' });
      
    const p = await OrdemProducao.updateStatus(req.params.id, req.body.status);
    if (!p) return res.status(404).json({ erro: 'Ordem de produção não encontrada' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/ordens/:id', auth, async (req, res) => {
  try {
    const ok = await OrdemProducao.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Ordem de produção não encontrada' });
    res.json({ mensagem: 'Ordem de produção deletada' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

//====================================
// Rotas de Usuários
//====================================

router.get('/usuarios', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrativo')
      return res.status(403).json({ erro: 'Acesso restrito ao setor Administrativo' });
    res.json(await Usuario.findAll());
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.post('/usuarios', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrativo')
      return res.status(403).json({ erro: 'Acesso restrito ao setor Administrativo' });
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    res.status(201).json(await Usuario.create({ nome, email, senha, perfil }));
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(400).json({ erro: 'E-mail já cadastrado' });
    res.status(500).json({ erro: e.message });
  }
});

router.put('/usuarios/:id', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrativo')
      return res.status(403).json({ erro: 'Acesso restrito ao setor Administrativo' });
    const u = await Usuario.update(req.params.id, req.body);
    if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(u);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/usuarios/:id', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrativo')
      return res.status(403).json({ erro: 'Acesso restrito ao setor Administrativo' });
    const ok = await Usuario.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Usuário deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = router;
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Extrair o token do cabeçalho (formato esperado: Bearer <token>)
  const token = authHeader && authHeader.split(' ')[1];

  // Se não tiver Token, bloqueia o acesso e retorna erro
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login.' });
  }
  
  try { 
    // Verifica a validade do token usando a chave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    
    // Anexa os dados do usuário (id, nome, email, perfil) na requisição
    req.usuario = payload;
    
    // Libera o acesso para a próxima função (a rota solicitada)
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticar;
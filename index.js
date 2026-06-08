require('dotenv').config();  // Importa o arquivo .env

const express = require('express');   // Importa o express
const cors    = require('cors');      // Importa o cors
const path    = require('path');      // Importa o path

const app  = express();  // Adiciona o express a uma variavel
const PORT = process.env.PORT || 3002;   // Porta

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const { ready } = require('./src/database/sqlite');  // Importa requisições do banco de dados
const routes    = require('./src/routes/index');     // Importa as rotas no arquivo de rotas

ready.then(() => {
  app.use('/api', routes);  // Define /api/(rota) para requisições da API

  app.get('/teste', (req, res) => {  // Teste para mostrar que o servidor esta funcionando
    // Atualizado de "Pizzaria" para "FactoryTrack"
    res.json({ mensagem: 'API do FactoryTrack funcionando!', status: 'online', porta: PORT });
  });

  app.get(/.*/, (req, res) => {  // Envia o frontend
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, () => {  
    console.log('=================================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Front-end: http://localhost:${PORT}`);
    console.log('=================================');
  });
}).catch(err => {
  console.error('Erro ao inicializar banco de dados:', err);
  process.exit(1);
});
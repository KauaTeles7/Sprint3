# 🏭 FactoryTrack

Sistema de Registro e Acompanhamento de Produção desenvolvido para a empresa fictícia **MetalTech Indústria**, com o objetivo de controlar pedidos, clientes, produtos e ordens de produção de forma digital.

## 📋 Sobre o Projeto

O FactoryTrack foi criado para substituir processos manuais de registro e acompanhamento da produção, permitindo maior organização, controle e rastreabilidade das informações.

O sistema possibilita:

- Cadastro de clientes
- Cadastro de produtos (peças metálicas)
- Controle de ordens de produção
- Sistema de autenticação com login
- Gerenciamento de dados através de API REST
- Armazenamento de informações em banco SQLite

---

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- SQLite
- SQL.js
- JWT (JSON Web Token)
- BcryptJS
- CORS
- Dotenv

### Frontend
- HTML5
- CSS3
- JavaScript

---

## 📂 Estrutura do Projeto

```text
Sprint3/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── src/
│   ├── database/
│   │   └── sqlite.js
│   │
│   ├── middlewares/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Cliente.js
│   │   ├── Produto.js
│   │   └── OrdemProducao.js
│   │
│   └── routes/
│       └── index.js
│
├── factorytrack.db
├── seed.js
├── index.js
├── package.json
└── .env

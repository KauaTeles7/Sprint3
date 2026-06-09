# 🏭 FactoryTrack

Sistema web de registro e acompanhamento da produção desenvolvido para a empresa fictícia **MetalTech Indústria**.

O FactoryTrack foi criado para auxiliar as operações do chão de fábrica, permitindo o gerenciamento de clientes, produtos, ordens de produção e usuários em uma única plataforma, com foco em organização, produtividade e segurança.

---

## 🎯 Objetivo do Projeto

A MetalTech realizava grande parte do controle de pedidos e produção de forma manual, gerando dificuldades no acompanhamento das ordens de serviço e no controle das informações.

O FactoryTrack foi desenvolvido para digitalizar esse processo através de uma plataforma web capaz de:

* Controlar clientes e pedidos;
* Gerenciar produtos fabricados;
* Acompanhar ordens de produção;
* Melhorar a rastreabilidade dos processos;
* Garantir maior segurança no acesso aos dados;
* Facilitar o uso em computadores, tablets e dispositivos utilizados no ambiente industrial.

---

## 🚀 Tecnologias Utilizadas

### Back-end

* Node.js
* Express.js
* SQLite
* BcryptJS
* JWT
* Dotenv
* API REST

### Front-end

* HTML5
* CSS3
* JavaScript

---

## 🔥 Melhorias Implementadas na Sprint 3

Durante a Sprint 3 o foco principal foi a experiência do usuário no chão de fábrica e a melhoria da arquitetura do sistema.

### 🎨 Nova Interface Visual

Foi realizado um redesign completo das telas do sistema, tornando a interface:

* Mais moderna;
* Mais intuitiva;
* Responsiva para celular, tablet e desktop;
* Mais adequada ao ambiente industrial.

Além disso, foram adotados:

* Botões maiores;
* Melhor contraste de cores;
* Tipografia mais legível;
* Navegação simplificada.

### 🔒 Segurança Aprimorada

Para proteger os dados do sistema foram implementadas diversas melhorias:

* Criptografia de senhas utilizando BcryptJS;
* Proteção de rotas restritas;
* Controle de sessão dos usuários;
* Armazenamento seguro de variáveis sensíveis utilizando arquivos `.env`;
* Estrutura preparada para autenticação JWT.

### ⚡ Melhor Experiência de Navegação

A navegação interna foi otimizada através de:

* Sistema de rotas organizado;
* Controle automático de acesso;
* Redirecionamento para login quando necessário;
* Menor quantidade de erros de navegação.

### 🏗️ Organização da Arquitetura

O projeto passou por uma reorganização estrutural para facilitar a manutenção futura.

#### Antes

```text
index.js
 └── Todas as regras do sistema
```

#### Depois

```text
src/
├── database/
├── middlewares/
├── models/
├── routes/
└── public/
```

#### Benefícios

* Código mais limpo;
* Melhor manutenção;
* Facilidade para novos desenvolvedores;
* Escalabilidade do sistema.

---

## 📈 Evolução do Projeto

### Sprint 1

* Planejamento da solução;
* Levantamento de requisitos;
* Definição da estrutura inicial.

### Sprint 2

* Desenvolvimento da API REST;
* Integração com SQLite;
* Criptografia de senhas;
* Organização inicial do código;
* Implementação das funcionalidades principais.

### Sprint 3

* Reformulação completa do visual;
* Melhorias de UX;
* Proteção de rotas;
* Controle de acesso por perfil;
* Melhor estruturação do projeto;
* Preparação para autenticação JWT;
* Otimização das consultas ao banco de dados.

---

## 💡 Principais Aprendizados

Durante o desenvolvimento foram identificados aprendizados importantes.

### 🎨 Visual também é produtividade

Em ambientes industriais, telas confusas aumentam erros operacionais e reduzem a eficiência.

### 🔒 Segurança deve ser pensada desde o início

Implementar criptografia e proteção de acesso logo no começo evita retrabalho e aumenta a confiabilidade do sistema.

### 🏗️ Organização acelera o desenvolvimento

Uma arquitetura organizada permite que novos recursos sejam adicionados com mais rapidez e menor risco.

### 📂 Boas práticas de Git são essenciais

Foram implementados:

* `.gitignore`;
* `.env.example`;
* Organização do repositório;
* Padronização do ambiente de desenvolvimento.

---

## 🔮 Próximas Evoluções

Planejadas para as próximas versões:

* Autenticação JWT completa;
* Controle de acesso por níveis (RBAC);
* Histórico de alterações (Logs);
* Sistema de auditoria;
* Migrations para banco de dados;
* Dashboard gerencial;
* Indicadores OEE em tempo real;
* Aplicativo para tablets e dispositivos móveis.

---

## 👨‍💻 Equipe

* Ana Julia Lima Dos Santos
* Kauã Teles Santos
* Henrique da Silva Lima
* Lucas Gabriel de Moura Adorni

---


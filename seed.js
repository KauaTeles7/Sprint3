// Arquivo que insere valores iniciais ao banco de dados

require('dotenv').config();
const { ready, run, query } = require('./src/database/sqlite');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await ready;
    console.log('🧹 Limpando banco de dados...');

    // Deletar dados do banco nas tabelas atuais
    run('DELETE FROM ordens_producao');
    run('DELETE FROM produtos');
    run('DELETE FROM clientes');
    run('DELETE FROM usuarios');

    try {
      // Resetar os IDs automáticos (Auto Increment)
      run("DELETE FROM sqlite_sequence WHERE name IN ('ordens_producao','produtos','clientes','usuarios')");
    } catch(_) { }

    console.log('✅ Banco limpo');
    
    // Criptografar senhas padrão:
    const hash = await bcrypt.hash('123456', 10);
    
    // Inserir usuários com os perfis da fábrica:
    run('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      ['Admin Sistema', 'admin@factorytrack.com', hash, 'Administrativo']);
    run('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      ['Carlos Produção', 'lider@factorytrack.com', hash, 'Líder de Produção']);

    console.log('✅ Usuários criados');

    // Array de Clientes B2B (Empresas)
    const clientes = [ 
      ['Metalúrgica Alpha S/A', '11991234501', {rua:'Av. Industrial',numero:'1000',bairro:'Distrito Industrial',cidade:'Guarulhos',cep:'07220-000'}, 'Faturamento para 30 dias'],
      ['Construtora Base Forte', '11991234502', {rua:'Rua da Construção',numero:'45',bairro:'Centro',cidade:'São Paulo',cep:'01001-000'}, 'Entregar na obra central'],
      ['AutoPeças Brasil', '11991234503', {rua:'Av. das Peças',numero:'880',bairro:'Vila Automotiva',cidade:'São Bernardo do Campo',cep:'09700-000'}, 'Exige laudo de qualidade'],
      ['Usinagem Precisão', '11991234504', {rua:'Rua do Torno',numero:'112',bairro:'Polo Tecnológico',cidade:'Campinas',cep:'13010-000'}, ''],
      ['Montadora XYZ', '11991234505', {rua:'Rodovia BR-116',numero:'Km 20',bairro:'Zona Rural',cidade:'Taubaté',cep:'12000-000'}, 'Recebimento apenas até 16h'],
      ['Ferramentas & Cia', '11991234506', {rua:'Av. Comercial',numero:'300',bairro:'Comércio',cidade:'Osasco',cep:'06010-000'}, ''],
      ['Estruturas Metálicas Silva', '11991234507', {rua:'Alameda do Aço',numero:'500',bairro:'Vila Ferro',cidade:'Diadema',cep:'09900-000'}, 'Cliente Premium'],
    ];

    for (const [nome, tel, end, obs] of clientes) {
      run('INSERT INTO clientes (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)',
        [nome, tel, JSON.stringify(end), obs]);
    }
    console.log('✅ Clientes B2B criados');

    // Array de Produtos (Peças Metálicas)
    const produtos = [ 
      ['Parafuso Sextavado M8', 'Parafuso de aço carbono de alta resistência, rosca total.', 'PF-M8-01'],
      ['Porca Sextavada M8', 'Porca de aço carbono zincada para fixação geral.', 'PO-M8-01'],
      ['Arruela Lisa M8', 'Arruela lisa zincada para distribuição de carga.', 'AR-M8-01'],
      ['Chapa de Aço Carbono 5mm', 'Chapa laminada a quente, cortada sob medida.', 'CH-AC-05'],
      ['Viga U 100mm', 'Viga de suporte estrutural em aço carbono.', 'VG-U-100'],
      ['Eixo Torneado 20mm', 'Eixo cilíndrico torneado em aço inox 304.', 'EX-IN-20'],
      ['Mola de Compressão D50', 'Mola helicoidal em aço temperado.', 'ML-CP-50'],
      ['Engrenagem Z20', 'Engrenagem cilíndrica de dentes retos em aço 1045.', 'EG-DR-20'],
      ['Flange Cega 4"', 'Flange para vedação de tubulações industriais.', 'FL-CG-04'],
      ['Suporte Angular 90º', 'Cantoneira de fixação industrial pesada.', 'SP-AN-90']
    ]; 

    for (const [nome, desc, cod] of produtos) {
      run('INSERT INTO produtos (nome, descricao, codigo) VALUES (?, ?, ?)',
        [nome, desc, cod]);
    }
    console.log('✅ Catálogo de peças metálicas criado');

    // Inserir algumas Ordens de Produção iniciais para teste
    const ordens = [
      { clienteId: 1, produtoId: 1, quantidade: 5000, prazo: '2026-06-15', status: 'Finalizado' },
      { clienteId: 2, produtoId: 5, quantidade: 200, prazo: '2026-06-20', status: 'Em Produção' },
      { clienteId: 3, produtoId: 8, quantidade: 1500, prazo: '2026-07-01', status: 'Aguardando Produção' },
      { clienteId: 4, produtoId: 6, quantidade: 300, prazo: '2026-07-05', status: 'Aguardando Produção' },
    ];

    for (const ordem of ordens) {
      const contagem = query('SELECT COUNT(*) as total FROM ordens_producao')[0];
      const numeroOrdem = (contagem?.total || 0) + 1;
      
      run(`INSERT INTO ordens_producao (numero_ordem, cliente_id, produto_id, quantidade, prazo, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
        [numeroOrdem, ordem.clienteId, ordem.produtoId, ordem.quantidade, ordem.prazo, ordem.status]);
    }
    console.log('✅ Ordens de produção iniciais criadas');

    console.log('======================================');
    console.log('🏭 FACTORY TRACK - SEED CONCLUÍDO!');
    console.log('======================================');
    console.log('Login Admin : admin@factorytrack.com');
    console.log('Login Líder : lider@factorytrack.com');
    console.log('Senha Padrão: 123456');
    console.log('======================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERRO NO SEED:', err);
    process.exit(1);
  }
}

seed();
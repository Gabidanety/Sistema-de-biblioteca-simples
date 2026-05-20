const readline = require('readline');
const Biblioteca = require('./src/Biblioteca');

const bib = new Biblioteca('Biblioteca Central');

// ── Dados de exemplo ───────────────────────────────────
bib.cadastrarLivro('Dom Casmurro', 'Machado de Assis', '978-8535902778', 1899);
bib.cadastrarLivro('O Alquimista', 'Paulo Coelho', '978-8506074497', 1988);
bib.cadastrarLivro('A Revolução dos Bichos', 'George Orwell', '978-8535909555', 1945);
bib.cadastrarLivro('Cem Anos de Solidão', 'Gabriel García Márquez', '978-8501086242', 1967);
bib.cadastrarUsuario('Ana Lima', 'ana@email.com');
bib.cadastrarUsuario('Bruno Souza', 'bruno@email.com');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const perguntar = (prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

// ── Utilitários de exibição ────────────────────────────
const linha = '─'.repeat(52);
const cabecalho = (titulo) => {
  console.log(`\n╔${linha}╗`);
  console.log(`║  ${titulo.padEnd(50)}║`);
  console.log(`╚${linha}╝`);
};
const ok = (msg) => console.log(`  ✓ ${msg}`);
const erro = (msg) => console.log(`  ✗ Erro: ${msg}`);
const info = (msg) => console.log(`  • ${msg}`);

// ── Menu principal ─────────────────────────────────────
function exibirMenu() {
  cabecalho(`📚 ${bib.nome}`);
  console.log('');
  console.log('  ── Livros ───────────────────────────');
  console.log('  1. Cadastrar livro');
  console.log('  2. Listar todos os livros');
  console.log('  3. Buscar livro por título');
  console.log('');
  console.log('  ── Usuários ─────────────────────────');
  console.log('  4. Cadastrar usuário');
  console.log('  5. Listar todos os usuários');
  console.log('');
  console.log('  ── Empréstimos ──────────────────────');
  console.log('  6. Realizar empréstimo');
  console.log('  7. Registrar devolução');
  console.log('');
  console.log('  ── Relatórios ───────────────────────');
  console.log('  8. Livros emprestados agora');
  console.log('  9. Relatório completo do acervo');
  console.log('');
  console.log('  0. Sair');
  console.log('');
}

// ── Ações ──────────────────────────────────────────────

async function cadastrarLivro() {
  cabecalho('Cadastrar Livro');
  const titulo = await perguntar('  Título  : ');
  const autor  = await perguntar('  Autor   : ');
  const isbn   = await perguntar('  ISBN    : ');
  const ano    = await perguntar('  Ano     : ');
  try {
    const livro = bib.cadastrarLivro(titulo, autor, isbn, parseInt(ano) || ano);
    ok(`Livro "${livro.titulo}" cadastrado com ID #${livro.id}.`);
  } catch (e) { erro(e.message); }
}

function listarLivros() {
  cabecalho('Acervo de Livros');
  if (!bib.livros.length) { info('Nenhum livro cadastrado.'); return; }
  bib.listarLivros().forEach(l => console.log(`  ${l.toString()}`));
}

async function buscarLivro() {
  cabecalho('Buscar Livro');
  const termo = await perguntar('  Título (parcial): ');
  const resultado = bib.buscarLivroPorTitulo(termo);
  if (!resultado.length) { info('Nenhum livro encontrado.'); return; }
  resultado.forEach(l => console.log(`  ${l.toString()}`));
}

async function cadastrarUsuario() {
  cabecalho('Cadastrar Usuário');
  const nome  = await perguntar('  Nome  : ');
  const email = await perguntar('  Email : ');
  try {
    const u = bib.cadastrarUsuario(nome, email);
    ok(`Usuário "${u.nome}" cadastrado com ID #${u.id}.`);
  } catch (e) { erro(e.message); }
}

function listarUsuarios() {
  cabecalho('Usuários Cadastrados');
  if (!bib.usuarios.length) { info('Nenhum usuário cadastrado.'); return; }
  bib.listarUsuarios().forEach(u => {
    console.log(`  ${u.toString()}`);
    if (u.emprestimosAtivos.length) {
      console.log(`    └─ Livros: IDs [${u.emprestimosAtivos.join(', ')}]`);
    }
  });
}

async function realizarEmprestimo() {
  cabecalho('Realizar Empréstimo');

  const disp = bib.livrosDisponiveis;
  if (!disp.length) { info('Nenhum livro disponível para empréstimo.'); return; }

  console.log('\n  Livros disponíveis:');
  disp.forEach(l => info(`#${l.id} — ${l.titulo} (${l.autor})`));

  const livroId = parseInt(await perguntar('\n  ID do livro  : '));

  if (!bib.usuarios.length) { info('Nenhum usuário cadastrado.'); return; }
  console.log('\n  Usuários:');
  bib.listarUsuarios().forEach(u => info(`#${u.id} — ${u.nome}`));

  const usuarioId = parseInt(await perguntar('\n  ID do usuário: '));

  try {
    const { livro, usuario } = bib.realizarEmprestimo(livroId, usuarioId);
    ok(`"${livro.titulo}" emprestado para ${usuario.nome} em ${livro.dataEmprestimo}.`);
  } catch (e) { erro(e.message); }
}

async function realizarDevolucao() {
  cabecalho('Registrar Devolução');

  const emp = bib.livrosEmprestados;
  if (!emp.length) { info('Nenhum livro emprestado no momento.'); return; }

  console.log('\n  Livros emprestados:');
  emp.forEach(l => info(`#${l.id} — ${l.titulo} → ${l.emprestadoPara.nome}`));

  const livroId = parseInt(await perguntar('\n  ID do livro a devolver: '));

  try {
    const { livro, usuario } = bib.realizarDevolucao(livroId);
    ok(`"${livro.titulo}" devolvido por ${usuario.nome}.`);
  } catch (e) { erro(e.message); }
}

function relatorioCirculacao() {
  cabecalho('Livros Emprestados Agora');
  const rel = bib.relatorioCiralculacao();
  info(`Total no acervo : ${rel.totalLivros}`);
  info(`Disponíveis     : ${rel.disponiveis}`);
  info(`Emprestados     : ${rel.emprestados}`);

  if (!rel.itens.length) {
    console.log('\n  Nenhum livro emprestado no momento.');
    return;
  }
  console.log('\n  Detalhes:');
  rel.itens.forEach(i => {
    console.log(`  ┌─ Livro     : "${i.livro}"`);
    console.log(`  │  Autor     : ${i.autor}`);
    console.log(`  │  Usuário   : ${i.emprestadoPara}`);
    console.log(`  └─ Desde     : ${i.desde}`);
    console.log('');
  });
}

function relatorioCompleto() {
  cabecalho('Relatório Completo do Acervo');
  const acervo = bib.relatorioCompleto();
  if (!acervo.length) { info('Acervo vazio.'); return; }

  const disponiveis = acervo.filter(l => l.status === 'Disponível');
  const emprestados = acervo.filter(l => l.status !== 'Disponível');

  console.log('\n  ✅ Disponíveis:');
  disponiveis.length
    ? disponiveis.forEach(l => console.log(`     #${l.id} | ${l.titulo} | ${l.autor} | ${l.ano}`))
    : console.log('     (nenhum)');

  console.log('\n  📤 Emprestados:');
  emprestados.length
    ? emprestados.forEach(l => console.log(`     #${l.id} | ${l.titulo} | ${l.status}`))
    : console.log('     (nenhum)');
}

// ── Loop principal ─────────────────────────────────────
async function main() {
  console.log('\n  Bem-vindo ao Sistema de Gerenciamento de Biblioteca!');
  console.log('  (4 livros e 2 usuários de exemplo já foram carregados)\n');

  while (true) {
    exibirMenu();
    const opcao = (await perguntar('  Escolha uma opção: ')).trim();

    switch (opcao) {
      case '1': await cadastrarLivro();    break;
      case '2': listarLivros();            break;
      case '3': await buscarLivro();       break;
      case '4': await cadastrarUsuario();  break;
      case '5': listarUsuarios();          break;
      case '6': await realizarEmprestimo(); break;
      case '7': await realizarDevolucao(); break;
      case '8': relatorioCirculacao();     break;
      case '9': relatorioCompleto();       break;
      case '0':
        console.log('\n  Até logo! 📚\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n  Opção inválida. Tente novamente.');
    }

    await perguntar('\n  Pressione Enter para continuar…');
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  rl.close();
  process.exit(1);
});

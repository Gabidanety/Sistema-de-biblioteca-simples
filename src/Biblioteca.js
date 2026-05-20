const Livro = require('./Livro');
const Usuario = require('./Usuario');

class Biblioteca {
  constructor(nome) {
    this.nome = nome;
    this.livros = [];
    this.usuarios = [];
    this._nextLivroId = 1;
    this._nextUsuarioId = 1;
  }

  // ── Livros ─────────────────────────────────────────────

  cadastrarLivro(titulo, autor, isbn, ano) {
    if (!titulo || !autor) {
      throw new Error('Título e autor são obrigatórios.');
    }
    const livro = new Livro(this._nextLivroId++, titulo, autor, isbn, ano);
    this.livros.push(livro);
    return livro;
  }

  buscarLivroPorId(id) {
    const livro = this.livros.find(l => l.id === id);
    if (!livro) throw new Error(`Livro com ID ${id} não encontrado.`);
    return livro;
  }

  buscarLivroPorTitulo(titulo) {
    const termo = titulo.toLowerCase();
    return this.livros.filter(l => l.titulo.toLowerCase().includes(termo));
  }

  listarLivros() {
    return [...this.livros];
  }

  get livrosDisponiveis() {
    return this.livros.filter(l => l.disponivel);
  }

  get livrosEmprestados() {
    return this.livros.filter(l => !l.disponivel);
  }

  // ── Usuários ───────────────────────────────────────────

  cadastrarUsuario(nome, email) {
    if (!nome) throw new Error('Nome é obrigatório.');
    const usuario = new Usuario(this._nextUsuarioId++, nome, email);
    this.usuarios.push(usuario);
    return usuario;
  }

  buscarUsuarioPorId(id) {
    const usuario = this.usuarios.find(u => u.id === id);
    if (!usuario) throw new Error(`Usuário com ID ${id} não encontrado.`);
    return usuario;
  }

  listarUsuarios() {
    return [...this.usuarios];
  }

  // ── Empréstimos ────────────────────────────────────────

  realizarEmprestimo(livroId, usuarioId) {
    const livro = this.buscarLivroPorId(livroId);
    const usuario = this.buscarUsuarioPorId(usuarioId);
    livro.emprestar(usuario);
    usuario.registrarEmprestimo(livro);
    return { livro, usuario };
  }

  realizarDevolucao(livroId) {
    const livro = this.buscarLivroPorId(livroId);
    const usuario = livro.emprestadoPara;
    livro.devolver();
    usuario.registrarDevolucao(livro);
    return { livro, usuario };
  }

  // ── Relatórios ─────────────────────────────────────────

  relatorioCiralculacao() {
    return {
      totalLivros: this.livros.length,
      disponiveis: this.livrosDisponiveis.length,
      emprestados: this.livrosEmprestados.length,
      itens: this.livrosEmprestados.map(l => ({
        livro: l.titulo,
        autor: l.autor,
        emprestadoPara: l.emprestadoPara.nome,
        desde: l.dataEmprestimo,
      })),
    };
  }

  relatorioCompleto() {
    return this.livros.map(l => ({
      id: l.id,
      titulo: l.titulo,
      autor: l.autor,
      isbn: l.isbn,
      ano: l.ano,
      status: l.status,
    }));
  }
}

module.exports = Biblioteca;

class Livro {
  constructor(id, titulo, autor, isbn, ano) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn || 'N/A';
    this.ano = ano || 'N/A';
    this.disponivel = true;
    this.emprestadoPara = null;
    this.dataEmprestimo = null;
  }

  emprestar(usuario) {
    if (!this.disponivel) {
      throw new Error(`Livro "${this.titulo}" já está emprestado para ${this.emprestadoPara.nome}.`);
    }
    this.disponivel = false;
    this.emprestadoPara = usuario;
    this.dataEmprestimo = new Date().toLocaleDateString('pt-BR');
  }

  devolver() {
    if (this.disponivel) {
      throw new Error(`Livro "${this.titulo}" não está emprestado.`);
    }
    const usuarioAnterior = this.emprestadoPara;
    this.disponivel = true;
    this.emprestadoPara = null;
    this.dataEmprestimo = null;
    return usuarioAnterior;
  }

  get status() {
    return this.disponivel ? 'Disponível' : `Emprestado → ${this.emprestadoPara.nome}`;
  }

  toString() {
    return `[#${this.id}] "${this.titulo}" | ${this.autor} | ${this.ano} | ISBN: ${this.isbn} | ${this.status}`;
  }
}

module.exports = Livro;

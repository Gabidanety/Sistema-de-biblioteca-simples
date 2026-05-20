class Usuario {
  constructor(id, nome, email) {
    this.id = id;
    this.nome = nome;
    this.email = email || 'N/A';
    this.emprestimosAtivos = [];
    this.historicoEmprestimos = [];
  }

  registrarEmprestimo(livro) {
    this.emprestimosAtivos.push(livro.id);
    this.historicoEmprestimos.push({
      livroId: livro.id,
      titulo: livro.titulo,
      dataEmprestimo: livro.dataEmprestimo,
      dataDevolucao: null,
    });
  }

  registrarDevolucao(livro) {
    this.emprestimosAtivos = this.emprestimosAtivos.filter(id => id !== livro.id);
    const registro = this.historicoEmprestimos.find(
      h => h.livroId === livro.id && h.dataDevolucao === null
    );
    if (registro) {
      registro.dataDevolucao = new Date().toLocaleDateString('pt-BR');
    }
  }

  get totalEmprestimosAtivos() {
    return this.emprestimosAtivos.length;
  }

  toString() {
    return `[#${this.id}] ${this.nome} | ${this.email} | Empréstimos ativos: ${this.totalEmprestimosAtivos}`;
  }
}

module.exports = Usuario;

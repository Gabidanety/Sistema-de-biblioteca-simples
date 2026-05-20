const http = require('http');
const Biblioteca = require('./src/Biblioteca');

const bib = new Biblioteca('Biblioteca Central');

// ── Dados de exemplo ───────────────────────────────────
bib.cadastrarLivro(
  'Dom Casmurro',
  'Machado de Assis',
  '978-8535902778',
  1899
);

bib.cadastrarLivro(
  'O Alquimista',
  'Paulo Coelho',
  '978-8506074497',
  1988
);

bib.cadastrarLivro(
  'A Revolução dos Bichos',
  'George Orwell',
  '978-8535909555',
  1945
);

bib.cadastrarLivro(
  'Cem Anos de Solidão',
  'Gabriel García Márquez',
  '978-8501086242',
  1967
);

bib.cadastrarUsuario(
  'Ana Lima',
  'ana@email.com'
);

bib.cadastrarUsuario(
  'Bruno Souza',
  'bruno@email.com'
);

// ── Helpers ────────────────────────────────────────────

function sendJSON(res, status, data) {

  res.writeHead(status, {
    'Content-Type':
      'application/json; charset=utf-8',

    // CORS
    'Access-Control-Allow-Origin':
      '*',

    'Access-Control-Allow-Methods':
      'GET, POST, OPTIONS',

    'Access-Control-Allow-Headers':
      'Content-Type'
  });

  res.end(
    JSON.stringify(data, null, 2)
  );
}

function readBody(req) {

  return new Promise((resolve, reject) => {

    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {

      try {

        resolve(
          body
            ? JSON.parse(body)
            : {}
        );

      } catch {

        reject(
          new Error(
            'JSON inválido.'
          )
        );
      }
    });

    req.on('error', reject);

  });
}

// ── Servidor ───────────────────────────────────────────

const server = http.createServer(
  async (req, res) => {

    // ── CORS ───────────────────────

    if (req.method === 'OPTIONS') {

      res.writeHead(204, {

        'Access-Control-Allow-Origin':
          '*',

        'Access-Control-Allow-Methods':
          'GET, POST, OPTIONS',

        'Access-Control-Allow-Headers':
          'Content-Type'

      });

      return res.end();
    }

    // ── URL ───────────────────────

    const url = new URL(
      req.url,
      `http://${req.headers.host}`
    );

    const pathname =
      url.pathname;

    const method =
      req.method;

    try {

      // ─────────────────────────────
      // GET /
      // ─────────────────────────────

      if (
        method === 'GET' &&
        pathname === '/'
      ) {

        return sendJSON(res, 200, {

          sistema:
            bib.nome,

          mensagem:
            'API funcionando 🚀'

        });
      }

      // ─────────────────────────────
      // GET /livros
      // ─────────────────────────────

      if (
        method === 'GET' &&
        pathname === '/livros'
      ) {

        return sendJSON(res, 200, {

          total:
            bib.livros.length,

          livros:
            bib.listarLivros()

        });
      }

      // ─────────────────────────────
      // POST /livros
      // ─────────────────────────────

      if (
        method === 'POST' &&
        pathname === '/livros'
      ) {

        const {
          titulo,
          autor,
          isbn,
          ano
        } = await readBody(req);

        const livro =
          bib.cadastrarLivro(
            titulo,
            autor,
            isbn,
            ano
          );

        return sendJSON(res, 201, {

          mensagem:
            'Livro cadastrado com sucesso.',

          livro

        });
      }

      // ─────────────────────────────
      // GET /usuarios
      // ─────────────────────────────

      if (
        method === 'GET' &&
        pathname === '/usuarios'
      ) {

        return sendJSON(res, 200, {

          total:
            bib.usuarios.length,

          usuarios:
            bib.listarUsuarios()

        });
      }

      // ─────────────────────────────
      // POST /usuarios
      // ─────────────────────────────

      if (
        method === 'POST' &&
        pathname === '/usuarios'
      ) {

        const {
          nome,
          email
        } = await readBody(req);

        const usuario =
          bib.cadastrarUsuario(
            nome,
            email
          );

        return sendJSON(res, 201, {

          mensagem:
            'Usuário cadastrado com sucesso.',

          usuario

        });
      }

      // ─────────────────────────────
      // POST /emprestimos
      // ─────────────────────────────

      if (
        method === 'POST' &&
        pathname === '/emprestimos'
      ) {

        const {
          livroId,
          usuarioId
        } = await readBody(req);

        const {
          livro,
          usuario
        } = bib.realizarEmprestimo(
          Number(livroId),
          Number(usuarioId)
        );

        return sendJSON(res, 200, {

          mensagem:
            `"${livro.titulo}" emprestado para ${usuario.nome}.`,

          livro,
          usuario

        });
      }

      // ─────────────────────────────
      // POST /emprestimos/devolucao
      // ─────────────────────────────

      if (
        method === 'POST' &&
        pathname === '/emprestimos/devolucao'
      ) {

        const {
          livroId
        } = await readBody(req);

        const {
          livro,
          usuario
        } = bib.realizarDevolucao(
          Number(livroId)
        );

        return sendJSON(res, 200, {

          mensagem:
            `"${livro.titulo}" devolvido por ${usuario.nome}.`,

          livro,
          usuario

        });
      }

      // ─────────────────────────────
      // GET /relatorios/acervo
      // ─────────────────────────────

      if (
        method === 'GET' &&
        pathname === '/relatorios/acervo'
      ) {

        return sendJSON(res, 200, {

          biblioteca:
            bib.nome,

          acervo:
            bib.relatorioCompleto()

        });
      }

      // ─────────────────────────────
      // 404
      // ─────────────────────────────

      return sendJSON(res, 404, {

        erro:
          'Rota não encontrada.'

      });

    } catch (err) {

      return sendJSON(res, 400, {

        erro:
          err.message

      });
    }
  }
);

// ── Porta ──────────────────────────────────────────────

const PORT = 3000;

server.listen(PORT, () => {

  console.log(`
╔══════════════════════════════════════╗
║      📚 API Biblioteca Online       ║
╠══════════════════════════════════════╣
║  http://localhost:${PORT}            ║
╚══════════════════════════════════════╝
  `);

});
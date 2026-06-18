/**
 * Rota de usuários — GET /api/usuarios e POST /api/usuarios
 *
 * GET  → lista usuários com busca, filtro por perfil e paginação
 * POST → cria um novo usuário (Admin e Professor podem fazer isso)
 *
 * Toda operação verifica primeiro se o usuário está autenticado,
 * e depois se o perfil dele tem permissão para a ação solicitada.
 */

import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { obterUsuarioDaRequisicao } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

// ─── CRIAR USUÁRIO ────────────────────────────────────────────────────────────

export async function POST(req) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    // Verificação de autenticação — sem isso, qualquer pessoa poderia criar contas
    if (!usuarioLogado) {
      return Response.json(
        { error: "Você precisa estar logado para realizar esta ação." },
        { status: 401 }
      );
    }

    // Alunos são de somente leitura — não podem cadastrar ninguém
    if (usuarioLogado.perfil === "Aluno") {
      return Response.json(
        { error: "Alunos não têm permissão para cadastrar usuários." },
        { status: 403 }
      );
    }

    const { nome, email, senha, perfil } = await req.json();

    // Validações no servidor — nunca confiamos apenas no front-end
    if (!nome || !email || !senha || !perfil) {
      return Response.json(
        { error: "Preencha todos os campos: nome, e-mail, senha e perfil." },
        { status: 400 }
      );
    }

    if (nome.trim().length < 3) {
      return Response.json(
        { error: "O nome precisa ter pelo menos 3 caracteres." },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return Response.json(
        { error: "A senha precisa ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    if (!["Admin", "Professor", "Aluno"].includes(perfil)) {
      return Response.json(
        { error: "Perfil inválido. Use Admin, Professor ou Aluno." },
        { status: 400 }
      );
    }

    // Professores não podem criar Admins — limitamos o escopo de permissão
    if (usuarioLogado.perfil === "Professor" && perfil === "Admin") {
      return Response.json(
        { error: "Professores não podem criar contas de administrador." },
        { status: 403 }
      );
    }

    // Criptografamos a senha com bcrypt (salt 10) — nunca armazenamos em texto puro
    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, perfil)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, perfil, criado_em`,
      [nome.trim(), email.toLowerCase().trim(), senhaHash, perfil]
    );

    const novoUsuario = resultado.rows[0];

    // Auditamos a criação — registramos quem criou, quando e com quais dados
    await registrarAuditoria(
      usuarioLogado.id,
      "usuarios",
      novoUsuario.id,
      "INSERT",
      null,
      { nome: novoUsuario.nome, email: novoUsuario.email, perfil: novoUsuario.perfil }
    );

    return Response.json({ ok: true, usuario: novoUsuario }, { status: 201 });

  } catch (erro) {
    console.error("Erro ao criar usuário:", erro);

    // Código 23505 = violação de UNIQUE no PostgreSQL (e-mail duplicado)
    if (erro.code === "23505") {
      return Response.json(
        { error: "Este e-mail já está cadastrado no sistema." },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Não foi possível cadastrar o usuário. Tente novamente." },
      { status: 500 }
    );
  }
}

// ─── LISTAR USUÁRIOS ──────────────────────────────────────────────────────────

export async function GET(req) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    if (!usuarioLogado) {
      return Response.json(
        { error: "Você precisa estar logado para visualizar os usuários." },
        { status: 401 }
      );
    }

    // Lemos os parâmetros de busca, filtro e paginação da URL
    const { searchParams } = new URL(req.url);
    const pagina       = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limite       = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const busca        = searchParams.get("search") || "";
    const perfilFiltro = searchParams.get("perfil") || "";
    const offset       = (pagina - 1) * limite;

    // Construção dinâmica da query — adicionamos filtros apenas quando fornecidos
    let query  = "SELECT id, nome, email, perfil, criado_em FROM usuarios WHERE 1=1";
    let params = [];

    if (busca.trim()) {
      params.push(`%${busca.trim()}%`);
      // ILIKE = busca sem diferenciar maiúsculas/minúsculas
      query += ` AND (nome ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    if (perfilFiltro && ["Admin", "Professor", "Aluno"].includes(perfilFiltro)) {
      params.push(perfilFiltro);
      query += ` AND perfil = $${params.length}`;
    }

    // Primeiro contamos o total (para calcular as páginas), depois buscamos a página
    const queryContagem = query.replace(
      "SELECT id, nome, email, perfil, criado_em",
      "SELECT COUNT(*) AS total"
    );
    const resultadoContagem = await pool.query(queryContagem, params);
    const total = parseInt(resultadoContagem.rows[0].total);

    // Adicionamos ordenação e paginação
    query += ` ORDER BY criado_em DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limite, offset);

    const resultado = await pool.query(query, params);

    return Response.json({
      usuarios: resultado.rows,
      total,
      page:  pagina,
      limit: limite,
      pages: Math.ceil(total / limite),
    });

  } catch (erro) {
    console.error("Erro ao listar usuários:", erro);
    return Response.json(
      { error: "Não foi possível carregar os usuários. Tente novamente." },
      { status: 500 }
    );
  }
}

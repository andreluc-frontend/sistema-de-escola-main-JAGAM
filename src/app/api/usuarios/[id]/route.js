/**
 * Rota de usuário individual — PUT /api/usuarios/[id] e DELETE /api/usuarios/[id]
 *
 * PUT    → atualiza dados de um usuário (somente Admin)
 * DELETE → remove um usuário permanentemente (somente Admin)
 *
 * Ambas as operações são auditadas: registramos o estado anterior e o posterior
 * para que seja possível rastrear qualquer mudança.
 */

import pool from "@/lib/db";
import { obterUsuarioDaRequisicao, usuarioEhAdmin } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";

// ─── EDITAR USUÁRIO ───────────────────────────────────────────────────────────

export async function PUT(req, context) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    if (!usuarioLogado) {
      return Response.json(
        { error: "Você precisa estar logado para editar usuários." },
        { status: 401 }
      );
    }

    // Somente Admin pode editar — nem mesmo o Professor pode alterar dados de outros
    if (!usuarioEhAdmin(usuarioLogado)) {
      return Response.json(
        { error: "Somente administradores podem editar usuários." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const { nome, email, perfil } = await req.json();

    if (!nome || !email || !perfil) {
      return Response.json(
        { error: "Preencha nome, e-mail e perfil para salvar." },
        { status: 400 }
      );
    }

    if (nome.trim().length < 3) {
      return Response.json(
        { error: "O nome precisa ter pelo menos 3 caracteres." },
        { status: 400 }
      );
    }

    if (!["Admin", "Professor", "Aluno"].includes(perfil)) {
      return Response.json(
        { error: "Perfil inválido." },
        { status: 400 }
      );
    }

    // Buscamos os dados atuais antes de editar — necessário para a auditoria
    const resultadoAtual = await pool.query(
      "SELECT nome, email, perfil FROM usuarios WHERE id = $1",
      [id]
    );

    if (resultadoAtual.rows.length === 0) {
      return Response.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const dadosAntigos = resultadoAtual.rows[0];

    await pool.query(
      `UPDATE usuarios
       SET nome = $1, email = $2, perfil = $3, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [nome.trim(), email.toLowerCase().trim(), perfil, Number(id)]
    );

    // Registramos o "antes" e o "depois" na auditoria
    await registrarAuditoria(
      usuarioLogado.id,
      "usuarios",
      Number(id),
      "UPDATE",
      dadosAntigos,
      { nome: nome.trim(), email: email.toLowerCase().trim(), perfil }
    );

    return Response.json({ ok: true });

  } catch (erro) {
    console.error("Erro ao editar usuário:", erro);

    if (erro.code === "23505") {
      return Response.json(
        { error: "Este e-mail já pertence a outro usuário." },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Não foi possível salvar as alterações. Tente novamente." },
      { status: 500 }
    );
  }
}

// ─── EXCLUIR USUÁRIO ──────────────────────────────────────────────────────────

export async function DELETE(req, context) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    if (!usuarioLogado) {
      return Response.json(
        { error: "Você precisa estar logado para excluir usuários." },
        { status: 401 }
      );
    }

    if (!usuarioEhAdmin(usuarioLogado)) {
      return Response.json(
        { error: "Somente administradores podem excluir usuários." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Impedimos que o Admin se exclua — evita que o sistema fique sem administrador
    if (Number(id) === usuarioLogado.id) {
      return Response.json(
        { error: "Você não pode excluir a sua própria conta." },
        { status: 400 }
      );
    }

    // Salvamos os dados antes de deletar — a auditoria precisa do "antes"
    const resultadoAtual = await pool.query(
      "SELECT nome, email, perfil FROM usuarios WHERE id = $1",
      [id]
    );

    if (resultadoAtual.rows.length === 0) {
      return Response.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const dadosExcluidos = resultadoAtual.rows[0];

    await pool.query("DELETE FROM usuarios WHERE id = $1", [Number(id)]);

    // Auditamos a exclusão com os dados que existiam
    await registrarAuditoria(
      usuarioLogado.id,
      "usuarios",
      Number(id),
      "DELETE",
      dadosExcluidos,
      null // Não há "depois" em uma exclusão
    );

    return Response.json({ ok: true });

  } catch (erro) {
    console.error("Erro ao excluir usuário:", erro);
    return Response.json(
      { error: "Não foi possível excluir o usuário. Tente novamente." },
      { status: 500 }
    );
  }
}

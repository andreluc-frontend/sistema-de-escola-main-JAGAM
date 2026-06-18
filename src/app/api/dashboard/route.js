/**
 * Rota do dashboard — GET /api/dashboard
 *
 * Retorna um resumo completo do sistema em uma única requisição,
 * evitando múltiplas chamadas do front-end. Inclui:
 *
 * - Total de usuários cadastrados
 * - Contagem por perfil (Admin, Professor, Aluno)
 * - 5 últimos cadastros
 * - 5 últimos logins bem-sucedidos (visível apenas para Admin)
 * - 5 últimas alterações auditadas (visível apenas para Admin)
 */

import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { obterUsuarioDaRequisicao } from "@/lib/auth";

export async function GET(req) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    if (!usuarioLogado) {
      return NextResponse.json(
        { error: "Você precisa estar logado para acessar o dashboard." },
        { status: 401 }
      );
    }

    // Consultamos tudo em paralelo com Promise.all para máxima performance
    const [
      resultadoTotal,
      resultadoPorPerfil,
      resultadoUltimosCadastros,
      resultadoUltimosLogins,
      resultadoUltimasAlteracoes,
    ] = await Promise.all([

      // Total geral de usuários
      pool.query("SELECT COUNT(*) AS total FROM usuarios"),

      // Distribuição por perfil — usamos GROUP BY para agregar em uma só query
      pool.query(
        "SELECT perfil, COUNT(*) AS total FROM usuarios GROUP BY perfil ORDER BY perfil"
      ),

      // Últimos 5 usuários cadastrados (mais recentes primeiro)
      pool.query(
        `SELECT id, nome, email, perfil, criado_em
         FROM usuarios
         ORDER BY criado_em DESC
         LIMIT 5`
      ),

      // Últimos 5 logins bem-sucedidos — fazemos JOIN para trazer o nome do usuário
      pool.query(
        `SELECT l.id, u.nome, l.acao, l.data_hora, l.ip
         FROM log_acesso l
         LEFT JOIN usuarios u ON l.usuario_id = u.id
         WHERE l.acao = 'LOGIN'
         ORDER BY l.data_hora DESC
         LIMIT 5`
      ),

      // Últimas 5 alterações auditadas
      pool.query(
        `SELECT a.id, u.nome, a.tabela, a.tipo_alteracao, a.data_hora
         FROM auditoria a
         LEFT JOIN usuarios u ON a.usuario_id = u.id
         ORDER BY a.data_hora DESC
         LIMIT 5`
      ),
    ]);

    return NextResponse.json({
      totalUsuarios:      parseInt(resultadoTotal.rows[0].total),
      usuariosPorPerfil:  resultadoPorPerfil.rows,
      ultimosCadastros:   resultadoUltimosCadastros.rows,
      ultimosLogins:      resultadoUltimosLogins.rows,
      ultimasAlteracoes:  resultadoUltimasAlteracoes.rows,
    });

  } catch (erro) {
    console.error("Erro ao carregar dados do dashboard:", erro);
    return NextResponse.json(
      { error: "Não foi possível carregar o dashboard. Tente novamente." },
      { status: 500 }
    );
  }
}

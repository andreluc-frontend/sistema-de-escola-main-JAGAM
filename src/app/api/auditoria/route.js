/**
 * Rota de auditoria — GET /api/auditoria
 *
 * Retorna o histórico de todas as alterações feitas no sistema,
 * com paginação. Exclusivo para administradores.
 *
 * A auditoria responde perguntas como:
 * "Quem excluiu esse usuário?" ou "O que foi alterado quinta-feira?"
 */

import { NextResponse } from "next/server";
import { obterUsuarioDaRequisicao, usuarioEhAdmin } from "@/lib/auth";
import { obterAuditoria } from "@/lib/auditoria";

export async function GET(req) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    // Auditoria é informação sensível — somente Admin pode ver
    if (!usuarioLogado || !usuarioEhAdmin(usuarioLogado)) {
      return NextResponse.json(
        { error: "Esta página é exclusiva para administradores." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const pagina = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limite = 20;
    const offset = (pagina - 1) * limite;

    const registros = await obterAuditoria(limite, offset);

    return NextResponse.json({ logs: registros, page: pagina, limit: limite });

  } catch (erro) {
    console.error("Erro ao buscar auditoria:", erro);
    return NextResponse.json(
      { error: "Não foi possível carregar o histórico de auditoria." },
      { status: 500 }
    );
  }
}

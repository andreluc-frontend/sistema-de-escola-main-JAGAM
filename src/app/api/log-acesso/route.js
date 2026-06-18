/**
 * Rota de log de acessos — GET /api/log-acesso
 *
 * Retorna o histórico de logins, logouts e tentativas falhas,
 * com paginação e filtro opcional por usuário. Exclusivo para Admin.
 *
 * Útil para detectar tentativas suspeitas de acesso ao sistema.
 */

import { NextResponse } from "next/server";
import { obterUsuarioDaRequisicao, usuarioEhAdmin } from "@/lib/auth";
import { obterLogAcesso } from "@/lib/log-acesso";

export async function GET(req) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    if (!usuarioLogado || !usuarioEhAdmin(usuarioLogado)) {
      return NextResponse.json(
        { error: "Esta página é exclusiva para administradores." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const pagina         = Math.max(1, parseInt(searchParams.get("page")    || "1"));
    const usuarioFiltro  = searchParams.get("usuario") || null;
    const limite         = 30;
    const offset         = (pagina - 1) * limite;

    const registros = await obterLogAcesso(
      limite,
      offset,
      usuarioFiltro ? parseInt(usuarioFiltro) : null
    );

    return NextResponse.json({ logs: registros, page: pagina, limit: limite });

  } catch (erro) {
    console.error("Erro ao buscar log de acessos:", erro);
    return NextResponse.json(
      { error: "Não foi possível carregar o log de acessos." },
      { status: 500 }
    );
  }
}

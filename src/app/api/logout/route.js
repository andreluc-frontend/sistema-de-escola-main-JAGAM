/**
 * Rota de logout — POST /api/logout
 *
 * Encerra a sessão do usuário de forma segura:
 * 1. Registra o evento de saída no log de acessos
 * 2. Apaga todos os cookies de autenticação do servidor
 *
 * Apagar os cookies no servidor (e não só no cliente) garante que,
 * mesmo que alguém tenha copiado os cookies, eles não funcionam mais.
 */

import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  ADMIN_CODE_COOKIE,
  ADMIN_VERIFIED_COOKIE,
  obterUsuarioDaRequisicao,
} from "@/lib/auth";
import { registrarAcesso } from "@/lib/log-acesso";

export async function POST(req) {
  try {
    const usuarioLogado = obterUsuarioDaRequisicao(req);

    // Registramos o logout apenas se havia um usuário autenticado
    if (usuarioLogado) {
      const ip        = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "desconhecido";
      const userAgent = req.headers.get("user-agent") || "desconhecido";
      await registrarAcesso(usuarioLogado.id, "LOGOUT", ip, userAgent);
    }

    const resposta = NextResponse.json({ ok: true });

    // Apagamos todos os cookies relacionados à sessão
    resposta.cookies.delete(AUTH_COOKIE);
    resposta.cookies.delete(ADMIN_CODE_COOKIE);
    resposta.cookies.delete(ADMIN_VERIFIED_COOKIE);

    return resposta;

  } catch (erro) {
    console.error("Erro ao fazer logout:", erro);
    return NextResponse.json(
      { error: "Ocorreu um erro ao encerrar a sessão." },
      { status: 500 }
    );
  }
}

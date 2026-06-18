import { ADMIN_CODE_COOKIE, ADMIN_VERIFIED_COOKIE, obterUsuarioDaRequisicao, usuarioEhAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const usuario = obterUsuarioDaRequisicao(req);

  if (!usuario) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  if (!usuarioEhAdmin(usuario)) {
    return NextResponse.json(
      { error: "Apenas administradores usam este código" },
      { status: 403 }
    );
  }

  const { codigo } = await req.json();
  const codigoSalvo = req.cookies.get(ADMIN_CODE_COOKIE)?.value;

  if (!codigoSalvo || codigo !== codigoSalvo) {
    return NextResponse.json(
      { error: "Código secreto inválido ou expirado" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set(ADMIN_VERIFIED_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  response.cookies.delete(ADMIN_CODE_COOKIE);

  return response;
}

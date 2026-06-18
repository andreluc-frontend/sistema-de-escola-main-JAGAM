import { ADMIN_VERIFIED_COOKIE, obterUsuarioDaRequisicao, usuarioEhAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const usuario = obterUsuarioDaRequisicao(req);

  if (!usuario) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const adminVerificado = req.cookies.get(ADMIN_VERIFIED_COOKIE)?.value === "true";

  return NextResponse.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    precisaCodigoAdmin: usuarioEhAdmin(usuario) && !adminVerificado,
  });
}

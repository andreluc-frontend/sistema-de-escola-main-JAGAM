/**
 * Rota de autenticação — POST /api/login
 *
 * Aqui acontece o processo completo de login:
 * 1. Verificamos se o usuário existe com o e-mail e perfil informados
 * 2. Comparamos a senha com o hash armazenado no banco (bcrypt)
 * 3. Geramos um token JWT e o enviamos em um cookie seguro (httpOnly)
 * 4. Registramos o evento no log de acessos — seja sucesso ou falha
 */

import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  ADMIN_CODE_COOKIE,
  ADMIN_VERIFIED_COOKIE,
  gerarToken,
  gerarCodigoAdmin,
} from "@/lib/auth";
import { registrarAcesso } from "@/lib/log-acesso";

export async function POST(req) {
  try {
    const { email, senha, perfil } = await req.json();

    // Capturamos o IP e o navegador para o log de acesso
    const ip        = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "desconhecido";
    const userAgent = req.headers.get("user-agent") || "desconhecido";

    // Validação básica antes de consultar o banco
    if (!email || !senha || !perfil) {
      return NextResponse.json(
        { error: "Preencha e-mail, senha e perfil para continuar." },
        { status: 400 }
      );
    }

    // Buscamos o usuário pelo e-mail e perfil juntos.
    // Isso evita que um aluno se autentique como Admin com as mesmas credenciais.
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND perfil = $2",
      [email.toLowerCase().trim(), perfil]
    );

    const usuario = resultado.rows[0];

    // Usuário não encontrado — registramos a tentativa e retornamos mensagem genérica.
    // Mensagem genérica é intencional: não revelamos se o e-mail existe ou não.
    if (!usuario) {
      await registrarAcesso(null, "LOGIN_FALHA", ip, userAgent);
      return NextResponse.json(
        { error: "E-mail, senha ou perfil incorretos." },
        { status: 401 }
      );
    }

    // Verificamos a senha usando bcrypt.compare — ele compara com o hash salvo,
    // sem nunca descriptografar a senha original.
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      await registrarAcesso(usuario.id, "LOGIN_FALHA", ip, userAgent);
      return NextResponse.json(
        { error: "E-mail, senha ou perfil incorretos." },
        { status: 401 }
      );
    }

    // Login bem-sucedido — geramos o token com os dados do usuário
    await registrarAcesso(usuario.id, "LOGIN", ip, userAgent);

    const token = gerarToken({
      id:     usuario.id,
      nome:   usuario.nome,
      email:  usuario.email,
      perfil: usuario.perfil,
    });

    // Admins recebem um código extra de verificação (segunda camada de segurança)
    const codigoAdmin = usuario.perfil === "Admin" ? gerarCodigoAdmin() : null;

    const resposta = NextResponse.json({
      ok:        true,
      perfil:    usuario.perfil,
      adminCode: codigoAdmin,
      token,
    });

    // Salvamos o token em um cookie httpOnly — o JavaScript da página
    // não consegue acessá-lo, protegendo contra ataques XSS
    resposta.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
      maxAge:   60 * 60 * 24, // 24 horas
      path:     "/",
    });

    // Limpamos o cookie de verificação de Admin (fresh login)
    resposta.cookies.delete(ADMIN_VERIFIED_COOKIE);

    if (codigoAdmin) {
      resposta.cookies.set(ADMIN_CODE_COOKIE, codigoAdmin, {
        httpOnly: true,
        sameSite: "lax",
        secure:   process.env.NODE_ENV === "production",
        maxAge:   60 * 10, // 10 minutos para usar o código
        path:     "/",
      });
    } else {
      resposta.cookies.delete(ADMIN_CODE_COOKIE);
    }

    return resposta;

  } catch (erro) {
    console.error("Erro no login:", erro);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}

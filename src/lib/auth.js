/**
 * Autenticação — tokens JWT e helpers de perfil
 *
 * Toda a lógica de "quem está logado" passa por aqui.
 * Usamos JWT (JSON Web Token) porque ele é stateless: o servidor não
 * precisa guardar sessões — o próprio token carrega as informações do
 * usuário e é assinado com uma chave secreta para evitar falsificação.
 *
 * O token fica em um cookie httpOnly: o JavaScript do navegador
 * não consegue lê-lo, o que protege contra ataques XSS.
 */

import jwt from "jsonwebtoken";

// Em produção, essa chave deve estar numa variável de ambiente (.env)
const SECRET = process.env.JWT_SECRET || "segredo123";

// Nomes dos cookies usados no sistema
export const AUTH_COOKIE          = "auth_token";
export const ADMIN_CODE_COOKIE    = "admin_code";
export const ADMIN_VERIFIED_COOKIE = "admin_verified";

/**
 * Gera um token JWT com os dados do usuário.
 * O token expira em 24 horas — depois disso, o usuário precisa fazer login novamente.
 */
export function gerarToken(usuario) {
  return jwt.sign(usuario, SECRET, { expiresIn: "1d" });
}

/**
 * Verifica se um token é válido e retorna os dados do usuário.
 * Se o token for inválido ou estiver expirado, retorna null.
 */
export function verificarToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null; // Token inválido ou expirado
  }
}

/**
 * Lê o token do cookie da requisição e retorna os dados do usuário logado.
 * Essa função é chamada no início de toda rota de API que precisa saber
 * quem está fazendo a requisição.
 */
export function obterUsuarioDaRequisicao(req) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verificarToken(token);
}

/**
 * Gera um código numérico de 6 dígitos para verificação de Admin.
 * Funciona como uma segunda camada de segurança para ações administrativas.
 */
export function gerarCodigoAdmin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Atalho para verificar se o usuário logado é Administrador.
 * Centralizar essa verificação evita erros de digitação espalhados pelo código.
 */
export function usuarioEhAdmin(usuario) {
  return usuario?.perfil === "Admin";
}

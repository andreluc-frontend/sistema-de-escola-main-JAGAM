/**
 * Log de acessos do sistema
 *
 * Registra cada entrada e saída — inclusive tentativas de login com senha errada.
 * Isso permite identificar tentativas de acesso não autorizado e auditar
 * quem acessou o sistema e de onde.
 */

import pool from "./db";

/**
 * Registra um evento de acesso.
 *
 * @param {number|null} usuarioId - ID do usuário (null em tentativas falhas com e-mail inexistente)
 * @param {string} acao           - "LOGIN", "LOGOUT" ou "LOGIN_FALHA"
 * @param {string} ip             - Endereço IP de origem
 * @param {string} userAgent      - Identificação do navegador
 */
export async function registrarAcesso(usuarioId, acao, ip, userAgent) {
  try {
    await pool.query(
      `INSERT INTO log_acesso (usuario_id, acao, ip, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [usuarioId, acao, ip, userAgent]
    );
  } catch (erro) {
    console.error("Erro ao registrar acesso:", erro);
  }
}

/**
 * Busca o histórico de acessos com paginação.
 * Permite filtrar por usuário específico quando necessário.
 */
export async function obterLogAcesso(limite = 30, offset = 0, usuarioId = null) {
  try {
    // Construímos a query dinamicamente para suportar o filtro opcional por usuário
    let query = `
      SELECT
        l.*,
        u.nome AS usuario_nome
      FROM log_acesso l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
    `;

    const params = [];

    if (usuarioId) {
      query += ` WHERE l.usuario_id = $1`;
      params.push(usuarioId);
    }

    query += ` ORDER BY l.data_hora DESC
               LIMIT $${params.length + 1}
               OFFSET $${params.length + 2}`;
    params.push(limite, offset);

    const resultado = await pool.query(query, params);
    return resultado.rows;
  } catch (erro) {
    console.error("Erro ao buscar log de acesso:", erro);
    return [];
  }
}

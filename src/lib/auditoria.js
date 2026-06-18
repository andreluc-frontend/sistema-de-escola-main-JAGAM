/**
 * Auditoria do sistema
 *
 * Toda vez que alguém cria, edita ou exclui um usuário, registramos
 * quem fez isso, quando, o que havia antes e o que ficou depois.
 * Isso garante rastreabilidade total — sabemos exatamente o histórico
 * de cada alteração no sistema.
 */

import pool from "./db";

/**
 * Registra uma alteração no banco de dados.
 *
 * @param {number} usuarioId    - Quem fez a alteração
 * @param {string} tabela       - Em qual tabela foi feita
 * @param {number} registroId   - Qual registro foi afetado
 * @param {string} tipoAlteracao - "INSERT", "UPDATE" ou "DELETE"
 * @param {object} dadosAntigos - Estado anterior (null em inserções)
 * @param {object} dadosNovos   - Estado posterior (null em exclusões)
 */
export async function registrarAuditoria(
  usuarioId,
  tabela,
  registroId,
  tipoAlteracao,
  dadosAntigos = null,
  dadosNovos = null
) {
  try {
    await pool.query(
      `INSERT INTO auditoria
         (usuario_id, tabela, registro_id, tipo_alteracao, dados_antigos, dados_novos)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        usuarioId,
        tabela,
        registroId,
        tipoAlteracao,
        dadosAntigos ? JSON.stringify(dadosAntigos) : null,
        dadosNovos   ? JSON.stringify(dadosNovos)   : null,
      ]
    );
  } catch (erro) {
    // Não lançamos o erro para não interromper a operação principal.
    // A auditoria é importante, mas não deve impedir que o sistema funcione.
    console.error("Erro ao registrar auditoria:", erro);
  }
}

/**
 * Busca o histórico de alterações com paginação.
 * Traz também o nome do usuário responsável via JOIN com a tabela usuarios.
 */
export async function obterAuditoria(limite = 20, offset = 0) {
  try {
    const resultado = await pool.query(
      `SELECT
         a.*,
         u.nome AS usuario_nome
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.id
       ORDER BY a.data_hora DESC
       LIMIT $1 OFFSET $2`,
      [limite, offset]
    );
    return resultado.rows;
  } catch (erro) {
    console.error("Erro ao buscar auditoria:", erro);
    return [];
  }
}

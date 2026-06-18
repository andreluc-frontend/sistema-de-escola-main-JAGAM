/**
 * Conexão com o banco de dados PostgreSQL
 *
 * Utilizamos o Pool do pg em vez de um Client simples porque o Pool
 * gerencia múltiplas conexões simultâneas automaticamente — importante
 * em ambientes web onde várias requisições chegam ao mesmo tempo.
 */

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "escoladb",
  password: "90098228",
  port: 5432,
});

export default pool;

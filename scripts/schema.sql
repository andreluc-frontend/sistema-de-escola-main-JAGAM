-- =============================================================================
-- Schema do Banco de Dados — Sistema Escolar EDEM Jagam
-- =============================================================================
-- Execute este arquivo uma única vez para criar toda a estrutura do banco:
--   psql -U postgres -d postgres -f scripts/schema.sql
-- =============================================================================


-- ─── TABELA DE USUÁRIOS ───────────────────────────────────────────────────────
--
-- Armazena todos os usuários do sistema.
--
-- Decisões de design:
--   - email UNIQUE garante que não existam dois usuários com o mesmo e-mail
--   - senha VARCHAR(255) armazena o hash bcrypt (o hash tem ~60 caracteres,
--     mas usamos 255 para ter margem de segurança)
--   - perfil usa CHECK para garantir que só valores válidos sejam inseridos —
--     isso é uma validação no nível do banco, independente do back-end
--   - atualizado_em registra a última vez que o cadastro foi modificado

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL       PRIMARY KEY,
  nome          VARCHAR(100) NOT NULL,
  email         VARCHAR(120) UNIQUE NOT NULL,
  senha         VARCHAR(255) NOT NULL, -- Sempre armazenado como hash bcrypt
  perfil        VARCHAR(20)  NOT NULL CHECK (perfil IN ('Admin', 'Professor', 'Aluno')),
  criado_em     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ─── TABELA DE AUDITORIA ──────────────────────────────────────────────────────
--
-- Registra toda alteração feita no banco de dados: quem alterou, quando,
-- o que havia antes e o que ficou depois.
--
-- Decisões de design:
--   - ON DELETE SET NULL: se um usuário for excluído, mantemos o registro de
--     auditoria mas com usuario_id = null (não perdemos o histórico)
--   - dados_antigos e dados_novos usam JSONB (JSON binário) para armazenar
--     qualquer estrutura de dados de forma flexível e com boa performance
--   - tipo_alteracao usa CHECK para garantir apenas valores conhecidos

CREATE TABLE IF NOT EXISTS auditoria (
  id             SERIAL      PRIMARY KEY,
  usuario_id     INTEGER     REFERENCES usuarios(id) ON DELETE SET NULL,
  tabela         VARCHAR(80) NOT NULL,               -- Em qual tabela foi a alteração
  registro_id    INTEGER,                            -- Qual registro foi afetado
  tipo_alteracao VARCHAR(30) NOT NULL CHECK (tipo_alteracao IN ('INSERT', 'UPDATE', 'DELETE')),
  dados_antigos  JSONB,                              -- Estado antes da alteração (null em INSERT)
  dados_novos    JSONB,                              -- Estado após a alteração (null em DELETE)
  data_hora      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);


-- ─── TABELA DE LOG DE ACESSO ─────────────────────────────────────────────────
--
-- Registra cada evento de autenticação: login bem-sucedido, logout
-- e tentativas de login com credenciais erradas.
--
-- Decisões de design:
--   - usuario_id pode ser NULL: em tentativas falhas com e-mail inexistente,
--     não há usuário para vincular — mas ainda assim registramos o evento
--   - ip VARCHAR(45) suporta tanto IPv4 (máx. 15 chars) quanto IPv6 (máx. 45 chars)
--   - user_agent TEXT (sem limite): o user-agent do navegador pode ser longo

CREATE TABLE IF NOT EXISTS log_acesso (
  id          SERIAL      PRIMARY KEY,
  usuario_id  INTEGER     REFERENCES usuarios(id) ON DELETE SET NULL,
  acao        VARCHAR(80) NOT NULL,  -- 'LOGIN', 'LOGOUT' ou 'LOGIN_FALHA'
  data_hora   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  ip          VARCHAR(45),           -- Endereço IP de origem
  user_agent  TEXT                   -- Navegador/cliente utilizado
);


-- ─── ÍNDICES PARA PERFORMANCE ────────────────────────────────────────────────
--
-- Índices aceleram buscas nas colunas mais consultadas.
-- Sem índice, o banco faz uma varredura completa da tabela a cada busca.
-- Com índice, encontra o dado diretamente — essencial em tabelas grandes.

-- Busca de usuários por e-mail (usada no login e na verificação de duplicatas)
CREATE INDEX IF NOT EXISTS idx_usuarios_email
  ON usuarios(email);

-- Filtro de auditoria por usuário responsável
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario
  ON auditoria(usuario_id);

-- Ordenação da auditoria por data (a query mais comum é "mais recentes primeiro")
CREATE INDEX IF NOT EXISTS idx_auditoria_data_hora
  ON auditoria(data_hora DESC);

-- Filtro de log por usuário
CREATE INDEX IF NOT EXISTS idx_log_acesso_usuario
  ON log_acesso(usuario_id);

-- Ordenação do log por data
CREATE INDEX IF NOT EXISTS idx_log_acesso_data_hora
  ON log_acesso(data_hora DESC);

# Sistema Escolar Jagam - Versão Completa

Sistema escolar desenvolvido em **Next.js 16** e **PostgreSQL** com todas as funcionalidades de um sistema de gestão educacional profissional.

## ✅ Requisitos Implementados (10/10)

### 1️⃣ Login e Cadastro de Usuários (2,0 pontos)
- ✅ Cadastro com nome, email e senha criptografada
- ✅ Três perfis: Admin, Professor e Aluno
- ✅ Validação de dados no frontend e backend
- ✅ Proteção de senha com bcrypt

### 2️⃣ Autenticação (1,0 ponto)
- ✅ Login com email e senha
- ✅ JWT em cookies httpOnly
- ✅ Logout com limpeza de sessão
- ✅ Proteção de rotas privadas
- ✅ Sessão segura do usuário

### 3️⃣ Autorização do Perfil (3,0 pontos)
- ✅ Admin: gerencia tudo (cadastro, edição, exclusão)
- ✅ Professor: cadastra e edita usuários
- ✅ Aluno: apenas visualização
- ✅ Verificação em rotas e endpoints
- ✅ UI adaptada por perfil

### 4️⃣ Dashboard (2,5 pontos)
- ✅ Total de usuários cadastrados
- ✅ Total de usuários por perfil
- ✅ Últimos cadastros (últimas 5)
- ✅ Últimos logins (apenas Admin)
- ✅ Últimas alterações (apenas Admin)
- ✅ Layout responsivo

### 5️⃣ Melhorias no CRUD (1,5 pontos)
- ✅ Campo de busca por nome/email
- ✅ Filtro por perfil
- ✅ Paginação
- ✅ Validação de formulário
- ✅ Mensagens de sucesso/erro

### 6️⃣ Auditoria Simples (1,5 pontos)
- ✅ Tabela `auditoria` no banco
- ✅ Registro de todas as alterações (INSERT, UPDATE, DELETE)
- ✅ Usuário que fez a alteração
- ✅ Data e hora
- ✅ Página de auditoria para Admin
- ✅ Visualização de dados antigos e novos

### 7️⃣ Log de Acesso (1,5 pontos)
- ✅ Tabela `log_acesso` no banco
- ✅ Registro de LOGIN e LOGOUT
- ✅ Tentativas de login falhadas
- ✅ IP do usuário
- ✅ User Agent (navegador)
- ✅ Data e hora
- ✅ Página de logs para Admin

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone https://github.com/andreluc-frontend/sistema-escolar-jagam4.git
cd sistema-escolar-jagam4

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do PostgreSQL

# Criar banco de dados
psql -U postgres -f scripts/schema.sql

# Executar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no navegador.

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── usuarios/
│   │   ├── login/
│   │   ├── logout/
│   │   ├── auditoria/
│   │   ├── log-acesso/
│   │   └── dashboard/
│   ├── dashboard/
│   ├── auditoria/
│   ├── log-acesso/
│   ├── clientes/
│   ├── cadastro/
│   └── login/
├── lib/
│   ├── db.js
│   ├── auth.js
│   ├── auditoria.js
│   └── log-acesso.js
scripts/
└── schema.sql
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- JWT em cookies httpOnly
- Validação no frontend e backend
- Proteção de rotas
- Auditoria completa de alterações
- Registro de acessos
- Verificação de IP

## 📊 Banco de Dados

- **usuarios**: Armazena dados de usuários
- **auditoria**: Registra alterações no sistema
- **log_acesso**: Registra acessos e tentativas de login

## 👥 Perfis de Usuário

### Admin
- Cadastro, edição e exclusão de usuários
- Acesso a auditoria
- Acesso a logs de acesso
- Dashboard completo

### Professor
- Visualização de usuários
- Cadastro de alunos

### Aluno
- Apenas visualização

## 📝 Notas

Este sistema foi desenvolvido como projeto educacional para demonstrar:
- Autenticação e autorização
- Auditoria e logging
- Validação de dados
- Boas práticas de segurança
- Arquitetura de aplicação web

## 📄 Licença

MIT License - Veja LICENSE para detalhes.
# sistema-de-escola-main-JAGAM

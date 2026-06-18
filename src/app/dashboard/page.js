'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [perfil, setPerfil] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [dados, setDados] = useState({
    totalUsuarios: 0,
    usuariosPorPerfil: [],
    ultimosCadastros: [],
    ultimosLogins: [],
    ultimasAlteracoes: [],
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfilLocal = localStorage.getItem('perfil') || '';

    if (!token) {
      router.push('/login');
      return;
    }

    setPerfil(perfilLocal);
    buscarDados();
  }, []);

  async function buscarDados() {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        setErro('Não foi possível carregar os dados do dashboard.');
        return;
      }
      const data = await res.json();
      setDados(data);
    } catch {
      setErro('Erro de conexão ao carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    router.push('/login');
  }

  function formatarData(dataStr) {
    return new Date(dataStr).toLocaleDateString('pt-BR');
  }

  function formatarDataHora(dataStr) {
    return new Date(dataStr).toLocaleString('pt-BR');
  }

  function corBadgePerfil(p) {
    if (p === 'Admin') return styles.badgeAdmin;
    if (p === 'Professor') return styles.badgeProfessor;
    return styles.badgeAluno;
  }

  function corBadgeAcao(acao) {
    if (acao === 'INSERT') return styles.acaoInsert;
    if (acao === 'UPDATE') return styles.acaoUpdate;
    if (acao === 'DELETE') return styles.acaoDelete;
    return '';
  }

  const perfilCounts = {};
  dados.usuariosPorPerfil.forEach(({ perfil: p, total }) => {
    perfilCounts[p] = Number(total);
  });

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitulo}>Dashboard</h1>
          <p className={styles.headerSub}>
            Bem-vindo, <strong>{perfil}</strong> — visão geral do sistema
          </p>
        </div>
        <div className={styles.headerAcoes}>
          <a href="/clientes" className={styles.btnVerUsuarios}>Ver usuários</a>
          <button onClick={handleLogout} className={styles.logoutBtn}>Sair</button>
        </div>
      </header>

      {erro && <div className={styles.mensagemErro}>⚠ {erro}</div>}

      {/* Cards de totais */}
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Total de usuários</p>
          <p className={styles.cardNumero}>{dados.totalUsuarios}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Administradores</p>
          <p className={`${styles.cardNumero} ${styles.numAdmin}`}>{perfilCounts['Admin'] || 0}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Professores</p>
          <p className={`${styles.cardNumero} ${styles.numProfessor}`}>{perfilCounts['Professor'] || 0}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Alunos</p>
          <p className={`${styles.cardNumero} ${styles.numAluno}`}>{perfilCounts['Aluno'] || 0}</p>
        </div>
      </div>

      {/* Últimos cadastros */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitulo}>Últimos cadastros</h2>
        {dados.ultimosCadastros.length === 0 ? (
          <p className={styles.vazio}>Nenhum cadastro encontrado.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {dados.ultimosCadastros.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td><span className={`${styles.badge} ${corBadgePerfil(u.perfil)}`}>{u.perfil}</span></td>
                    <td>{formatarData(u.criado_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Seções exclusivas para Admin */}
      {perfil === 'Admin' && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitulo}>Últimos acessos</h2>
            {dados.ultimosLogins.length === 0 ? (
              <p className={styles.vazio}>Nenhum acesso registrado.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Data / Hora</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.ultimosLogins.map((log) => (
                      <tr key={log.id}>
                        <td>{log.nome || 'Desconhecido'}</td>
                        <td>{formatarDataHora(log.data_hora)}</td>
                        <td><code className={styles.ip}>{log.ip}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <a href="/log-acesso" className={styles.verTodos}>Ver todos os logs →</a>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitulo}>Últimas alterações</h2>
            {dados.ultimasAlteracoes.length === 0 ? (
              <p className={styles.vazio}>Nenhuma alteração registrada.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Usuário responsável</th>
                      <th>Tabela</th>
                      <th>Ação</th>
                      <th>Data / Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.ultimasAlteracoes.map((a) => (
                      <tr key={a.id}>
                        <td>{a.nome || 'Desconhecido'}</td>
                        <td>{a.tabela}</td>
                        <td><span className={`${styles.acao} ${corBadgeAcao(a.tipo_alteracao)}`}>{a.tipo_alteracao}</span></td>
                        <td>{formatarDataHora(a.data_hora)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <a href="/auditoria" className={styles.verTodos}>Ver auditoria completa →</a>
          </section>
        </>
      )}
    </div>
  );
}

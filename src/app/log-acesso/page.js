'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LogAcesso() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [temMais, setTemMais] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('perfil');

    if (!token || perfil !== 'Admin') {
      router.push('/login');
      return;
    }

    buscarLogAcesso(page);
  }, [page]);

  async function buscarLogAcesso(pageNum) {
    setLoading(true);
    try {
      const res = await fetch(`/api/log-acesso?page=${pageNum}`);
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setTemMais((data.logs || []).length >= 30);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function corAcao(acao) {
    if (acao === 'LOGIN') return styles.acaoLogin;
    if (acao === 'LOGOUT') return styles.acaoLogout;
    if (acao === 'LOGIN_FALHA') return styles.acaoFalha;
    return '';
  }

  if (loading) return <div className={styles.loading}><p>Carregando logs de acesso...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.titulo}>Log de Acessos</h1>
          <p className={styles.subtitulo}>Histórico de entradas, saídas e tentativas falhas no sistema</p>
        </div>
        <a href="/dashboard" className={styles.btnVoltar}>← Voltar ao dashboard</a>
      </div>

      {logs.length === 0 ? (
        <p className={styles.vazio}>Nenhum acesso registrado ainda.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Data / Hora</th>
                <th>IP</th>
                <th>Navegador</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className={log.acao === 'LOGIN_FALHA' ? styles.linhaFalha : ''}>
                  <td className={styles.idCell}>{log.id}</td>
                  <td>{log.usuario_nome || <em className={styles.anonimo}>Anônimo</em>}</td>
                  <td>
                    <span className={`${styles.acao} ${corAcao(log.acao)}`}>{log.acao}</span>
                  </td>
                  <td className={styles.dataCell}>
                    {new Date(log.data_hora).toLocaleString('pt-BR')}
                  </td>
                  <td><code className={styles.ip}>{log.ip}</code></td>
                  <td className={styles.agente}>
                    {log.user_agent ? log.user_agent.substring(0, 55) + '...' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.paginacao}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={styles.btnPagina}>
          ← Anterior
        </button>
        <span className={styles.paginaInfo}>Página {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={!temMais} className={styles.btnPagina}>
          Próxima →
        </button>
      </div>
    </div>
  );
}

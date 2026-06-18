'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Auditoria() {
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

    buscarAuditoria(page);
  }, [page]);

  async function buscarAuditoria(pageNum) {
    setLoading(true);
    try {
      const res = await fetch(`/api/auditoria?page=${pageNum}`);
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setTemMais((data.logs || []).length >= 20);
    } catch (error) {
      console.error('Erro ao buscar auditoria:', error);
    } finally {
      setLoading(false);
    }
  }

  function corAcao(acao) {
    if (acao === 'INSERT') return styles.acaoInsert;
    if (acao === 'UPDATE') return styles.acaoUpdate;
    if (acao === 'DELETE') return styles.acaoDelete;
    return '';
  }

  if (loading) return <div className={styles.loading}><p>Carregando auditoria...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.titulo}>Auditoria do Sistema</h1>
          <p className={styles.subtitulo}>Registro de todas as alterações feitas no banco de dados</p>
        </div>
        <a href="/dashboard" className={styles.btnVoltar}>← Voltar ao dashboard</a>
      </div>

      {logs.length === 0 ? (
        <p className={styles.vazio}>Nenhuma alteração registrada até o momento.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Responsável</th>
                <th>Tabela</th>
                <th>Ação</th>
                <th>Data / Hora</th>
                <th>Dados anteriores</th>
                <th>Dados novos</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.idCell}>{log.id}</td>
                  <td>{log.usuario_nome || <em className={styles.anonimo}>Desconhecido</em>}</td>
                  <td><code className={styles.tabelaTag}>{log.tabela}</code></td>
                  <td>
                    <span className={`${styles.acao} ${corAcao(log.tipo_alteracao)}`}>
                      {log.tipo_alteracao}
                    </span>
                  </td>
                  <td className={styles.dataCell}>
                    {new Date(log.data_hora).toLocaleString('pt-BR')}
                  </td>
                  <td>
                    {log.dados_antigos ? (
                      <details>
                        <summary className={styles.detalheLink}>Ver dados</summary>
                        <pre className={styles.jsonPre}>{JSON.stringify(log.dados_antigos, null, 2)}</pre>
                      </details>
                    ) : <span className={styles.anonimo}>—</span>}
                  </td>
                  <td>
                    {log.dados_novos ? (
                      <details>
                        <summary className={styles.detalheLink}>Ver dados</summary>
                        <pre className={styles.jsonPre}>{JSON.stringify(log.dados_novos, null, 2)}</pre>
                      </details>
                    ) : <span className={styles.anonimo}>—</span>}
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

"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfilLogado, setPerfilLogado] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Filtros e paginação
  const [busca, setBusca] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Edição
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({ nome: "", email: "", perfil: "" });
  const [erroEdicao, setErroEdicao] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Mensagem de operação
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    const perfil = localStorage.getItem("perfil") || "";
    setPerfilLogado(perfil);
  }, []);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "8",
        ...(busca.trim() ? { search: busca.trim() } : {}),
        ...(filtroPerfil ? { perfil: filtroPerfil } : {}),
      });

      const res = await fetch(`/api/usuarios?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao carregar usuários.");
        return;
      }

      setUsuarios(data.usuarios || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [page, busca, filtroPerfil]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  // Ao mudar filtros, volta pra página 1
  function aplicarBusca(e) {
    setBusca(e.target.value);
    setPage(1);
  }

  function aplicarFiltro(e) {
    setFiltroPerfil(e.target.value);
    setPage(1);
  }

  function mostrarMensagem(texto, tipo = "sucesso") {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3500);
  }

  async function deletarUsuario(id, nome) {
    if (!window.confirm(`Tem certeza que deseja excluir "${nome}"? Essa ação não pode ser desfeita.`)) return;

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        mostrarMensagem(data.error || "Erro ao excluir.", "erro");
        return;
      }

      mostrarMensagem(`Usuário "${nome}" excluído com sucesso.`);
      carregarUsuarios();
    } catch {
      mostrarMensagem("Erro de conexão ao tentar excluir.", "erro");
    }
  }

  function iniciarEdicao(usuario) {
    setEditandoId(usuario.id);
    setFormEdit({ nome: usuario.nome, email: usuario.email, perfil: usuario.perfil });
    setErroEdicao("");
  }

  async function salvarEdicao(id) {
    setErroEdicao("");

    if (!formEdit.nome.trim() || !formEdit.email || !formEdit.perfil) {
      setErroEdicao("Preencha todos os campos.");
      return;
    }
    if (formEdit.nome.trim().length < 3) {
      setErroEdicao("O nome precisa ter pelo menos 3 caracteres.");
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdit),
      });
      const data = await res.json();

      if (!res.ok) {
        setErroEdicao(data.error || "Erro ao salvar.");
        return;
      }

      setEditandoId(null);
      mostrarMensagem(`Usuário atualizado com sucesso.`);
      carregarUsuarios();
    } catch {
      setErroEdicao("Erro de conexão ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const podeEditar = perfilLogado === "Admin";
  const podeDeletar = perfilLogado === "Admin";
  const podeCadastrar = perfilLogado === "Admin" || perfilLogado === "Professor";

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.titulo}>Usuários Cadastrados</h1>
          <p className={styles.subtitulo}>{total} {total === 1 ? "registro encontrado" : "registros encontrados"}</p>
        </div>
        {podeCadastrar && (
          <a href="/cadastro" className={styles.btnNovo}>+ Novo usuário</a>
        )}
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={aplicarBusca}
          className={styles.inputBusca}
        />
        <select value={filtroPerfil} onChange={aplicarFiltro} className={styles.selectFiltro}>
          <option value="">Todos os perfis</option>
          <option value="Admin">Administrador</option>
          <option value="Professor">Professor</option>
          <option value="Aluno">Aluno</option>
        </select>
        {(busca || filtroPerfil) && (
          <button className={styles.btnLimpar} onClick={() => { setBusca(""); setFiltroPerfil(""); setPage(1); }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* Mensagem global */}
      {mensagem.texto && (
        <div className={mensagem.tipo === "erro" ? styles.mensagemErro : styles.mensagemSucesso}>
          {mensagem.tipo === "erro" ? "⚠" : "✓"} {mensagem.texto}
        </div>
      )}

      {erro && <div className={styles.mensagemErro}>⚠ {erro}</div>}

      {loading ? (
        <div className={styles.loadingBox}>
          <p>Carregando usuários...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className={styles.vazio}>
          <p>Nenhum usuário encontrado{busca || filtroPerfil ? " para os filtros aplicados" : ""}.</p>
          {(busca || filtroPerfil) && (
            <button className={styles.btnLimpar} onClick={() => { setBusca(""); setFiltroPerfil(""); setPage(1); }}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {usuarios.map((usuario) => (
            <div key={usuario.id} className={styles.card}>
              {editandoId === usuario.id ? (
                <div className={styles.formEdicao}>
                  <p className={styles.editandoLabel}>Editando usuário</p>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Nome</label>
                    <input
                      type="text"
                      value={formEdit.nome}
                      onChange={(e) => setFormEdit({ ...formEdit, nome: e.target.value })}
                      className={styles.inputEdicao}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>E-mail</label>
                    <input
                      type="email"
                      value={formEdit.email}
                      onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })}
                      className={styles.inputEdicao}
                      placeholder="E-mail"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Perfil</label>
                    <select
                      value={formEdit.perfil}
                      onChange={(e) => setFormEdit({ ...formEdit, perfil: e.target.value })}
                      className={styles.inputEdicao}
                    >
                      <option value="Admin">Administrador</option>
                      <option value="Professor">Professor</option>
                      <option value="Aluno">Aluno</option>
                    </select>
                  </div>

                  {erroEdicao && <p className={styles.erroEdicao}>⚠ {erroEdicao}</p>}

                  <div className={styles.botoesEdicao}>
                    <button
                      className={styles.btnSalvar}
                      onClick={() => salvarEdicao(usuario.id)}
                      disabled={salvando}
                    >
                      {salvando ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      className={styles.btnCancelar}
                      onClick={() => { setEditandoId(null); setErroEdicao(""); }}
                      disabled={salvando}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.cardHeader}>
                    <div className={styles.avatar}>
                      {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className={styles.nome}>{usuario.nome}</h2>
                      <span className={`${styles.badge} ${styles[`badge${usuario.perfil}`]}`}>
                        {usuario.perfil}
                      </span>
                    </div>
                  </div>

                  <div className={styles.info}>
                    <p className={styles.infoItem}>
                      <span className={styles.infoLabel}>E-mail:</span> {usuario.email}
                    </p>
                    <p className={styles.infoItem}>
                      <span className={styles.infoLabel}>Cadastrado em:</span>{" "}
                      {new Date(usuario.criado_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className={styles.botoes}>
                    {podeEditar && (
                      <button className={styles.editar} onClick={() => iniciarEdicao(usuario)}>
                        Editar
                      </button>
                    )}
                    {podeDeletar && (
                      <button className={styles.deletar} onClick={() => deletarUsuario(usuario.id, usuario.nome)}>
                        Excluir
                      </button>
                    )}
                    {!podeEditar && !podeDeletar && (
                      <span className={styles.soVisualizar}>Somente visualização</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className={styles.paginacao}>
          <button
            className={styles.btnPagina}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span className={styles.paginaInfo}>Página {page} de {totalPages}</span>
          <button
            className={styles.btnPagina}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

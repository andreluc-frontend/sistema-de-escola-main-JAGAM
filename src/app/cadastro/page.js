"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Cadastro() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", perfil: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setErro("");
    setSucesso("");
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validar() {
    if (!form.nome.trim() || !form.email || !form.senha || !form.perfil) {
      return "Preencha todos os campos antes de continuar.";
    }
    if (form.nome.trim().length < 3) {
      return "O nome precisa ter pelo menos 3 caracteres.";
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      return "Informe um e-mail válido.";
    }
    if (form.senha.length < 6) {
      return "A senha precisa ter pelo menos 6 caracteres.";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Não foi possível concluir o cadastro.");
        return;
      }

      setSucesso(`Usuário "${form.nome}" cadastrado com sucesso!`);
      setForm({ nome: "", email: "", senha: "", perfil: "" });
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cadastro de Usuário</h1>
        <p className={styles.subtitle}>Preencha os dados para criar uma nova conta</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              name="nome"
              placeholder="Ex: João Silva"
              value={form.nome}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Ex: joao@email.com"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="senha">Senha <span className={styles.dica}>(mínimo 6 caracteres)</span></label>
            <input
              id="senha"
              type="password"
              name="senha"
              placeholder="Crie uma senha segura"
              value={form.senha}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="perfil">Perfil de acesso</label>
            <select
              id="perfil"
              name="perfil"
              value={form.perfil}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Selecione um perfil</option>
              <option value="Admin">Administrador</option>
              <option value="Professor">Professor</option>
              <option value="Aluno">Aluno</option>
            </select>
          </div>

          {erro && <p className={styles.mensagemErro}>⚠ {erro}</p>}
          {sucesso && <p className={styles.mensagemSucesso}>✓ {sucesso}</p>}

          <button className={styles.button} disabled={carregando}>
            {carregando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className={styles.rodape}>
          Já tem conta?{" "}
          <a href="/login" className={styles.link}>Faça o login</a>
        </p>
      </div>
    </div>
  );
}

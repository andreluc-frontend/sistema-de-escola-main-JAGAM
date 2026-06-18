"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Login() {
  const [form, setForm]         = useState({ email: "", senha: "", perfil: "" });
  const [erro, setErro]         = useState("");
  const [sucesso, setSucesso]   = useState("");
  const [carregando, setCarregando] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  function handleChange(e) {
    setErro("");
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.email || !form.senha || !form.perfil) {
      setErro("Ops! Preencha o e-mail, a senha e o perfil antes de continuar.");
      return;
    }

    setCarregando(true);
    try {
      const res  = await fetch("/api/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Não reconhecemos esses dados. Confira e tente de novo.");
        return;
      }

      localStorage.setItem("token",     data.token);
      localStorage.setItem("perfil",    form.perfil);
      localStorage.setItem("adminCode", data.adminCode || "");

      setSucesso("Tudo certo! Levando você ao painel...");
      setTimeout(() => { window.location.href = "/dashboard"; }, 900);
    } catch {
      setErro("Parece que a conexão caiu. Verifique sua internet e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.card}>

        {/* Ícone / logo topo */}
        <div className={styles.iconeTopo}>🎓</div>
        <h1 className={styles.titulo}>Bem-vindo de volta!</h1>
        <p className={styles.subtitulo}>
          Informe seus dados abaixo para entrar no sistema da escola.
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* E-mail */}
          <div className={styles.grupo}>
            <label htmlFor="email" className={styles.label}>Seu e-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="exemplo@escola.com"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Senha com mostrar/ocultar */}
          <div className={styles.grupo}>
            <label htmlFor="senha" className={styles.label}>Sua senha</label>
            <div className={styles.inputWrapper}>
              <input
                id="senha"
                type={senhaVisivel ? "text" : "password"}
                name="senha"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                className={styles.inputComBotao}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.olho}
                onClick={() => setSenhaVisivel(!senhaVisivel)}
                title={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
              >
                {senhaVisivel ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Perfil */}
          <div className={styles.grupo}>
            <label htmlFor="perfil" className={styles.label}>Como você vai entrar?</label>
            <select
              id="perfil"
              name="perfil"
              value={form.perfil}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">— escolha seu perfil —</option>
              <option value="Admin">🛡️  Administrador</option>
              <option value="Professor">📚  Professor</option>
              <option value="Aluno">🎒  Aluno</option>
            </select>
          </div>

          {/* Mensagens */}
          {erro    && <div className={styles.alerta} role="alert">⚠️ {erro}</div>}
          {sucesso && <div className={styles.ok}     role="status">✅ {sucesso}</div>}

          <button type="submit" className={styles.botao} disabled={carregando}>
            {carregando
              ? <span className={styles.spinner}>⏳ Verificando...</span>
              : "Entrar agora →"}
          </button>
        </form>

        <p className={styles.rodape}>
          Primeira vez aqui?{" "}
          <a href="/cadastro" className={styles.linkRodape}>Crie sua conta</a>
        </p>
      </div>
    </div>
  );
}

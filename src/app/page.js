import styles from "./page.module.css";
import db from "../lib/db";

export default async function Home() {
  let totalUsuarios = 0;

  try {
    const result = await db.query("SELECT COUNT(*) AS total FROM usuarios");
    totalUsuarios = result.rows[0].total;
  } catch {
    // banco pode não estar disponível no build
  }

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.content}>
          <p className={styles.tag}>Sistema Escolar</p>
          <h1 className={styles.title}>
            Gestão simples e<br />eficiente para sua escola
          </h1>
          <p className={styles.description}>
            Cadastre alunos, professores e administradores. Acompanhe acessos,
            edições e todo o histórico do sistema em um só lugar.
          </p>
          <div className={styles.buttons}>
            <a href="/cadastro" className={styles.primaryButton}>Cadastrar usuário</a>
            <a href="/login" className={styles.secondaryButton}>Fazer login</a>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.cardTop}>Usuários cadastrados</div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardNumero}>{totalUsuarios}</h3>
            <p className={styles.cardSub}>no sistema</p>
          </div>
        </div>
      </section>
    </main>
  );
}

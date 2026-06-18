import "./globals.css";
import Link from "next/link";
import styles from "./layout.module.css";

export const metadata = {
  title: "Escola de Ensino Médio Jagam",
  description: "Sistema de gestão escolar — cadastro, autenticação e controle de usuários.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <nav className={styles.navbar}>
          <div className={styles.container}>
            <Link href="/" className={styles.logoLink}>
              <span className={styles.logo}>EDEM Jagam</span>
            </Link>
            <div className={styles.links}>
              <Link href="/">Início</Link>
              <Link href="/cadastro">Cadastro</Link>
              <Link href="/clientes">Usuários</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/login" className={styles.linkLogin}>Login</Link>
            </div>
          </div>
        </nav>

        <main className={styles.main}>
          {children}
        </main>

        <footer className={styles.footer}>
          <p>© 2026 Escola de Ensino Médio Jagam — Sistema de Gestão Escolar</p>
        </footer>
      </body>
    </html>
  );
}

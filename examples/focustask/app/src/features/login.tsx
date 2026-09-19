"use client";
import styles from "@/components/ui.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, ArrowRight } from "lucide-react";
import { api } from "@/lib/client";
export function Login() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className={styles.loginPage}>
      <div className={styles.loginIntro}>
        <div className={styles.brand}>
          <CheckCheck aria-hidden="true" />
          <span>FocusTask</span>
        </div>
        <p className={styles.eyebrow}>专注于下一步</p>
        <h1>
          让每一件事，
          <br />
          都有清楚的开始。
        </h1>
        <p>
          把任务放在一起，
          <br />
          让团队知道下一步要做什么。
        </p>
        <div className={styles.introLine} />
      </div>
      <section className={styles.loginCard} aria-labelledby="login-title">
        <p className={styles.eyebrow}>欢迎回来</p>
        <h2 id="login-title">登录你的工作空间</h2>
        <p className={styles.muted}>查看项目，继续今天的工作。</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            const data = new FormData(e.currentTarget);
            try {
              await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                  email: data.get("email"),
                  password: data.get("password"),
                }),
              });
              router.push("/projects");
            } catch (err) {
              setError(err instanceof Error ? err.message : "登录失败");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
          />
          <label htmlFor="password">密码</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={1024}
          />
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <button
            className={[styles.primary, styles.loginSubmit].join(" ")}
            disabled={busy}
          >
            {busy ? "登录中…" : "登录"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}

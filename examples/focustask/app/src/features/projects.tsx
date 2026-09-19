"use client";
import styles from "@/components/ui.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Folder } from "lucide-react";
import { Shell } from "@/components/shell";
import { api, ClientError, type Project } from "@/lib/client";
export function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    api<Project[]>("/projects")
      .then((p) => {
        if (live) {
          setProjects(p);
          setError("");
        }
      })
      .catch((e) => {
        if (!live) return;
        if (e instanceof ClientError && e.status === 401)
          router.replace("/login");
        else setError("项目加载失败");
      });
    return () => {
      live = false;
    };
  }, [router, attempt]);
  return (
    <Shell>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>你的工作空间</p>
          <h1>项目</h1>
          <p className={styles.muted}>从一个清晰的目标开始。</p>
        </div>
        <span className={styles.countBadge}>
          {projects?.length ?? "—"} 个项目
        </span>
      </header>
      {error ? (
        <div role="alert" className={styles.empty}>
          <h2>{error}</h2>
          <button
            className={styles.secondary}
            onClick={() => setAttempt((a) => a + 1)}
          >
            重试
          </button>
        </div>
      ) : !projects ? (
        <div
          aria-label="项目加载中"
          role="status"
          className={styles.skeleton}
        />
      ) : projects.length === 0 ? (
        <section className={styles.empty}>
          <h2>还没有项目</h2>
          <p>加入项目后，就能在这里查看任务。</p>
        </section>
      ) : (
        <div className={styles.projectGrid}>
          {projects.map((p, i) => (
            <Link
              href={`/projects/${p.id}/tasks`}
              key={p.id}
              className={styles.projectCard}
            >
              <div className={styles.projectIcon}>
                <Folder aria-hidden="true" size={24} />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h2>{p.name}</h2>
              <p>
                {p.status === "archived"
                  ? "已归档 · 只读"
                  : p.role === "viewer"
                    ? "只读成员"
                    : "团队项目"}
              </p>
              <span className={styles.cardLink}>
                查看任务
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}

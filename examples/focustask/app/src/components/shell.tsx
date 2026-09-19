"use client";
import styles from "@/components/ui.module.css";
import Link from "next/link";
import { CheckCheck, Folder, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/projects" className={styles.brand}>
          <CheckCheck aria-hidden="true" size={27} />
          <span>FocusTask</span>
        </Link>
        <div className={styles.navLabel}>工作空间</div>
        <nav aria-label="主导航">
          <Link href="/projects" className={styles.navItem}>
            <Folder size={19} aria-hidden="true" />
            <span>项目</span>
          </Link>
        </nav>
        <div className={styles.sidebarBottom}>
          <span>把注意力留给重要的事</span>
          <button
            className={styles.logout}
            onClick={async () => {
              try {
                await api("/auth/logout", { method: "POST" });
                router.push("/login");
              } catch {
                window.alert("退出失败，请重试");
              }
            }}
          >
            <LogOut size={17} aria-hidden="true" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>
      <main className={styles.workspace}>{children}</main>
    </div>
  );
}

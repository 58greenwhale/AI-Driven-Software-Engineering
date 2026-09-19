"use client";
import styles from "@/components/ui.module.css";
import { displayDate } from "@/lib/date";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  X,
  ArrowLeft,
  Circle,
  CircleCheck,
  CircleDot,
  ListChecks,
} from "lucide-react";
import { Shell } from "@/components/shell";
import {
  api,
  ClientError,
  type Member,
  type Project,
  type Task,
} from "@/lib/client";

export function Tasks({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const latestLoad = useRef(0);
  const [loading, setLoading] = useState(true);
  const [hasTasks, setHasTasks] = useState(false);
  const [detail, setDetail] = useState<{
    project: Project;
    members: Member[];
  } | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assigneeId, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const saving = useRef(false);
  const request = useRef<{ fingerprint: string; key: string } | null>(null);
  useEffect(() => {
    if (!busy && open && Object.keys(fields).length)
      document.getElementById(`task-${Object.keys(fields)[0]}`)?.focus();
  }, [busy, open, fields]);
  const load = useCallback(
    async (filter = status) => {
      const generation = ++latestLoad.current;
      setLoadError("");
      setLoading(true);
      try {
        const d = await api<{ project: Project; members: Member[] }>(
          `/projects/${projectId}`,
        );
        if (generation !== latestLoad.current) return;
        setDetail(d);
        const list = await api<{ tasks: Task[]; total: number }>(
          `/projects/${projectId}/tasks${filter ? `?status=${encodeURIComponent(filter)}` : ""}`,
        );
        let anyTasks = list.total > 0;
        if (filter && !anyTasks) {
          const all = await api<{ total: number }>(
            `/projects/${projectId}/tasks`,
          );
          anyTasks = all.total > 0;
        }
        if (generation !== latestLoad.current) return;
        setTasks(list.tasks);
        setHasTasks(anyTasks);
      } catch (e) {
        if (generation !== latestLoad.current) return;
        if (e instanceof ClientError && e.status === 401)
          router.replace("/login");
        else if (e instanceof ClientError && e.status === 404) {
          setDetail(null);
          setNotFound(true);
        } else
          setLoadError(
            e instanceof ClientError && e.fields?.status
              ? "筛选状态无效，请清除筛选"
              : "任务加载失败",
          );
      } finally {
        if (generation === latestLoad.current) setLoading(false);
      }
    },
    [projectId, router, status],
  );
  useEffect(() => {
    const sequence = latestLoad;
    void load();
    return () => {
      sequence.current++;
    };
  }, [load]);
  const selectStatus = (value: string) => {
    const query = new URLSearchParams(searchParams.toString());
    if (value) query.set("status", value);
    else query.delete("status");
    router.push(
      `/projects/${projectId}/tasks${query.size ? "?" + query.toString() : ""}`,
      { scroll: false },
    );
  };
  const canWrite =
    detail &&
    detail.project.status === "active" &&
    ["admin", "editor"].includes(detail.project.role);
  const changeOpen = (next: boolean) => {
    if (saving.current) return;
    if (
      !next &&
      (title || assigneeId || dueDate) &&
      !window.confirm("放弃未保存的内容？")
    )
      return;
    setOpen(next);
    if (next) {
      setError("");
      setFields({});
    } else {
      setTitle("");
      setAssignee("");
      setDueDate("");
      request.current = null;
    }
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    const clean = title.trim();
    if (!clean || [...clean].length > 100) {
      setFields({
        title: clean ? "任务标题不能超过 100 个字符" : "请输入任务标题",
      });
      titleRef.current?.focus();
      return;
    }
    const body = JSON.stringify({
      title: clean,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    });
    if (request.current?.fingerprint !== body)
      request.current = { fingerprint: body, key: crypto.randomUUID() };
    saving.current = true;
    setBusy(true);
    setError("");
    setFields({});
    try {
      await api(`/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Idempotency-Key": request.current.key },
        body,
      });
      setOpen(false);
      setTitle("");
      setAssignee("");
      setDueDate("");
      request.current = null;
      const currentFilter =
        new URL(window.location.href).searchParams.get("status") ?? "";
      setNotice(
        currentFilter && currentFilter !== "todo"
          ? "任务已创建，但不符合当前筛选条件"
          : "任务已创建",
      );
      await load(currentFilter);
    } catch (e) {
      if (e instanceof ClientError && e.fields) {
        setFields(e.fields);
        const first = Object.keys(e.fields)[0];
        setTimeout(() => document.getElementById(`task-${first}`)?.focus(), 0);
      } else if (
        e instanceof ClientError &&
        (e.status === 403 || e.status === 404 || e.code === "PROJECT_ARCHIVED")
      ) {
        setOpen(false);
        setNotice(e.message);
        await load(
          new URL(window.location.href).searchParams.get("status") ?? "",
        );
      } else
        setError(
          e instanceof ClientError && e.status === 401
            ? "会话已过期，请重新登录后重试"
            : "创建失败，请重试",
        );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  if (notFound)
    return (
      <Shell>
        <section className={styles.empty}>
          <h1>未找到页面</h1>
          <p>页面不存在或你没有访问权限。</p>
          <Link href="/projects">返回项目列表</Link>
        </section>
      </Shell>
    );
  return (
    <Shell>
      <Link href="/projects" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        项目
      </Link>
      <header className={styles.pageHeader}>
        <div>
          <h1>{detail?.project.name ?? "项目任务"}</h1>
        </div>
        <Dialog.Root open={open} onOpenChange={changeOpen}>
          {canWrite && (
            <Dialog.Trigger asChild>
              <button
                className={[styles.primary, styles.createTrigger].join(" ")}
              >
                <Plus size={20} aria-hidden="true" />
                <span>新建任务</span>
              </button>
            </Dialog.Trigger>
          )}
          <Dialog.Portal>
            <Dialog.Overlay className={styles.overlay} />
            <Dialog.Content
              className={styles.dialog}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                titleRef.current?.focus();
              }}
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => {
                if (busy) e.preventDefault();
              }}
            >
              <div className={styles.dialogTop}>
                <div>
                  <p className={styles.eyebrow}>让下一步更明确</p>
                  <Dialog.Title>新建任务</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button
                    aria-label="关闭表单"
                    className={styles.iconButton}
                    disabled={busy}
                  >
                    <X aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description className={styles.muted}>
                写下需要完成的工作，可选负责人和截止日期。
              </Dialog.Description>
              <form onSubmit={submit} noValidate>
                <fieldset disabled={busy}>
                  <label htmlFor="task-title">
                    任务标题 <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={titleRef}
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    aria-required="true"
                    aria-invalid={!!fields.title}
                    aria-describedby={fields.title ? "title-error" : undefined}
                    placeholder="例如：准备周会材料"
                  />
                  {fields.title && (
                    <p id="title-error" className={styles.error}>
                      {fields.title}
                    </p>
                  )}
                  <label htmlFor="task-assigneeId">
                    负责人 <span className={styles.optional}>可选</span>
                  </label>
                  <select
                    id="task-assigneeId"
                    value={assigneeId}
                    onChange={(e) => setAssignee(e.target.value)}
                    aria-invalid={!!fields.assigneeId}
                    aria-describedby={
                      fields.assigneeId ? "assignee-error" : undefined
                    }
                  >
                    <option value="">未分配</option>
                    {detail?.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName} · {m.email}
                      </option>
                    ))}
                  </select>
                  {fields.assigneeId && (
                    <p id="assignee-error" className={styles.error}>
                      {fields.assigneeId}
                    </p>
                  )}
                  <label htmlFor="task-dueDate">
                    截止日期 <span className={styles.optional}>可选</span>
                  </label>
                  <input
                    type="date"
                    id="task-dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    aria-invalid={!!fields.dueDate}
                    aria-describedby={fields.dueDate ? "date-error" : undefined}
                  />
                  {fields.dueDate && (
                    <p id="date-error" className={styles.error}>
                      {fields.dueDate}
                    </p>
                  )}
                </fieldset>
                {error && (
                  <p
                    role="alert"
                    className={[styles.error, styles.formError].join(" ")}
                  >
                    {error}
                  </p>
                )}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={busy}
                    onClick={() => changeOpen(false)}
                  >
                    取消
                  </button>
                  <button className={styles.primary} disabled={busy}>
                    {busy ? "创建中…" : error ? "重试创建" : "创建任务"}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
      {detail?.project.status === "archived" && (
        <div className={styles.readonly}>该项目已归档，只能查看</div>
      )}
      {detail?.project.role === "viewer" && (
        <div className={styles.readonly}>只读成员 · 你可以查看本项目的任务</div>
      )}
      <div className={styles.notice} role="status" aria-live="polite">
        {notice}
      </div>
      <div className={styles.filterBar}>
        <label htmlFor="task-status">状态</label>
        <select
          id="task-status"
          value={status}
          onChange={(e) => selectStatus(e.target.value)}
        >
          <option value="">全部</option>
          <option value="todo">待处理</option>
          <option value="in_progress">进行中</option>
          <option value="done">已完成</option>
          {status && !["todo", "in_progress", "done"].includes(status) && (
            <option value={status}>无效状态</option>
          )}
        </select>
        {status && (
          <button className={styles.secondary} onClick={() => selectStatus("")}>
            清除筛选
          </button>
        )}
      </div>
      <section
        className={styles.taskPanel}
        aria-label="任务列表"
        aria-busy={loading}
      >
        <div className={styles.panelHeader}>
          <h2>
            <ListChecks size={19} aria-hidden="true" />
            项目任务
          </h2>
          <span>{tasks?.length ?? "—"} 条任务</span>
        </div>
        {loadError ? (
          <div role="alert" className={styles.empty}>
            <h3>{loadError}</h3>
            <p>连接可能暂时中断，请稍后重试。</p>
            <button className={styles.secondary} onClick={() => void load()}>
              重试
            </button>
          </div>
        ) : tasks === null || loading ? (
          <div
            aria-label="任务加载中"
            role="status"
            className={styles.skeletonList}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <CircleCheck size={32} aria-hidden="true" />
            <h3>{status && hasTasks ? "没有符合条件的任务" : "还没有任务"}</h3>
            <p>
              {status && hasTasks
                ? "试试其他状态，或清除筛选。"
                : canWrite
                  ? "创建第一条任务，开始安排项目工作。"
                  : "该项目暂时没有任务。"}
            </p>
            {canWrite && !(status && hasTasks) && (
              <button
                className={styles.secondary}
                onClick={() => changeOpen(true)}
              >
                新建任务
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.taskColumns} aria-hidden="true">
              <span>任务</span>
              <span>状态</span>
              <span>负责人</span>
              <span>截止日期</span>
            </div>
            <ul className={styles.taskList}>
              {tasks.map((task) => {
                const Icon =
                  task.status === "done"
                    ? CircleCheck
                    : task.status === "in_progress"
                      ? CircleDot
                      : Circle;
                const date = displayDate(
                  task.dueDate,
                  detail?.project.timeZone ?? "Asia/Shanghai",
                );
                const label = {
                  todo: "待处理",
                  in_progress: "进行中",
                  done: "已完成",
                }[task.status];
                return (
                  <li key={task.id} className={styles.taskRow}>
                    <div className={styles.taskTitle}>
                      <Icon size={19} aria-hidden="true" />
                      <span>{task.title}</span>
                    </div>
                    <span
                      className={`${styles.statusTag} ${styles[task.status]}`}
                    >
                      {label}
                    </span>
                    <span className={styles.assignee}>
                      {task.assignee?.displayName ?? "未分配"}
                    </span>
                    <span
                      className={styles.date}
                      style={
                        date.overdue ? { color: "var(--error)" } : undefined
                      }
                      aria-label={task.dueDate ?? "无截止日期"}
                    >
                      {date.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </Shell>
  );
}

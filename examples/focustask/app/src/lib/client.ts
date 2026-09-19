export type Project = {
  id: string;
  name: string;
  status: string;
  role: string;
  timeZone: string;
};
export type Member = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};
export type Task = {
  id: string;
  title: string;
  status: string;
  assignee: { id: string; displayName: string } | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};
export class ClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${url}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
  } catch {
    throw new ClientError(0, "NETWORK", "请求失败，请重试");
  }
  const payload = await response
    .json()
    .catch(() => ({
      error: { code: "INVALID_RESPONSE", message: "服务暂不可用，请重试" },
    }));
  if (!response.ok)
    throw new ClientError(
      response.status,
      payload.error?.code ?? "ERROR",
      payload.error?.message ?? "请求失败，请重试",
      payload.error?.fields,
    );
  return payload.data as T;
}

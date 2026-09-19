import { Tasks } from "@/features/tasks";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Tasks projectId={(await params).id} />;
}

import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "FocusTask · 让工作更清楚",
  description: "轻量任务协作与软件生命周期实证",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

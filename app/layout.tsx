import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SGC三周年庆典",
  description: "SGC三周年庆典舞者查询可约摄影、摄影师维护可接节目状态。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

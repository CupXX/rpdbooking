"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PhotographerLoginPage() {
  const router = useRouter();
  const [photographerCode, setPhotographerCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/photographer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographer_code: photographerCode }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message ?? "登录失败，请稍后重试。");
        return;
      }
      router.push("/photographer/dashboard");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sgc-shell px-4 py-5">
      <div className="sgc-content mx-auto w-full max-w-md space-y-5">
        <header className="space-y-2">
          <Link href="/" className="sgc-link text-sm">返回首页</Link>
          <p className="text-sm font-semibold text-white">SGC三周年庆典</p>
          <h1 className="text-2xl font-black text-white">摄影登录</h1>
        </header>

        <form onSubmit={handleLogin} className="sgc-panel p-4">
          <label className="sgc-label block" htmlFor="photographerCode">摄影 ID</label>
          <input
            id="photographerCode"
            value={photographerCode}
            onChange={(event) => setPhotographerCode(event.target.value)}
            className="sgc-input mt-2 px-4 py-3 text-base"
            placeholder="例如 CupX"
          />

          <button type="submit" disabled={loading} className="sgc-button-primary mt-5 w-full px-4 py-3 text-base">
            {loading ? "进入中..." : "进入管理页"}
          </button>
          {error ? <p className="mt-3 text-sm leading-6 text-red-300">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}

"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function PhotographerSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photographerCode = useMemo(() => searchParams.get("code") ?? "", [searchParams]);
  const displayName = useMemo(() => searchParams.get("name") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wechat, setWechat] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!photographerCode) {
      setError("缺少摄影 ID，请先从登录页进入首次设置。");
      return;
    }
    if (!password) {
      setError("密码不能为空。");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码必须一致。");
      return;
    }
    if (!wechat.trim()) {
      setError("微信号不能为空。");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/photographer/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photographer_code: photographerCode,
          password,
          wechat,
          sample_url: sampleUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message ?? "保存失败，请稍后重试。");
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
    <main className="min-h-screen bg-paper px-4 py-5">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="space-y-2">
          <Link href="/photographer/login" className="text-sm font-medium text-zinc-500">返回登录</Link>
          <h1 className="text-2xl font-semibold text-ink">首次设置</h1>
        </header>

        <form onSubmit={handleSetup} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 rounded-lg bg-zinc-50 p-3 text-sm">
            <div>
              <span className="text-zinc-500">摄影 ID</span>
              <p className="mt-1 font-semibold text-ink">{photographerCode || "未获取"}</p>
            </div>
            <div>
              <span className="text-zinc-500">摄影显示名</span>
              <p className="mt-1 font-semibold text-ink">{displayName || "未获取"}</p>
            </div>
          </div>

          <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="password">设置密码</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-emerald-600" />

          <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="confirmPassword">确认密码</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-emerald-600" />

          <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="wechat">微信号</label>
          <input id="wechat" value={wechat} onChange={(event) => setWechat(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-emerald-600" />

          <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="sampleUrl">样片链接</label>
          <input id="sampleUrl" value={sampleUrl} onChange={(event) => setSampleUrl(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-emerald-600" placeholder="https://example.com" />

          <button type="submit" disabled={loading} className="mt-5 w-full rounded-lg bg-ink px-4 py-3 text-base font-semibold text-white">
            {loading ? "保存中..." : "保存并进入管理页"}
          </button>
          {error ? <p className="mt-3 text-sm leading-6 text-red-600">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}

export default function PhotographerSetupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper px-4 py-5"><div className="mx-auto w-full max-w-md rounded-lg bg-white p-4 text-zinc-600">加载中...</div></main>}>
      <PhotographerSetupForm />
    </Suspense>
  );
}
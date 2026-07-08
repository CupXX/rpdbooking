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
    <main className="sgc-shell px-4 py-5">
      <div className="sgc-content mx-auto w-full max-w-md space-y-5">
        <header className="space-y-2">
          <Link href="/photographer/login" className="sgc-link text-sm">返回登录</Link>
          <p className="text-sm font-semibold text-white">SGC三周年庆典</p>
          <h1 className="text-2xl font-black text-white">首次设置</h1>
        </header>

        <form onSubmit={handleSetup} className="sgc-panel p-4">
          <div className="grid gap-3 rounded-lg border border-white/15 bg-white/5 p-3 text-sm">
            <div>
              <span className="sgc-subtle">摄影 ID</span>
              <p className="mt-1 font-bold text-white">{photographerCode || "未获取"}</p>
            </div>
            <div>
              <span className="sgc-subtle">摄影显示名</span>
              <p className="mt-1 font-bold text-white">{displayName || "未获取"}</p>
            </div>
          </div>

          <label className="sgc-label mt-4 block" htmlFor="password">设置密码</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="sgc-input mt-2 px-4 py-3" />

          <label className="sgc-label mt-4 block" htmlFor="confirmPassword">确认密码</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="sgc-input mt-2 px-4 py-3" />

          <label className="sgc-label mt-4 block" htmlFor="wechat">微信号</label>
          <input id="wechat" value={wechat} onChange={(event) => setWechat(event.target.value)} className="sgc-input mt-2 px-4 py-3" />

          <label className="sgc-label mt-4 block" htmlFor="sampleUrl">样片链接</label>
          <input id="sampleUrl" value={sampleUrl} onChange={(event) => setSampleUrl(event.target.value)} className="sgc-input mt-2 px-4 py-3" placeholder="https://example.com" />

          <button type="submit" disabled={loading} className="sgc-button-primary mt-5 w-full px-4 py-3 text-base">
            {loading ? "保存中..." : "保存并进入管理页"}
          </button>
          {error ? <p className="mt-3 text-sm leading-6 text-red-300">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}

export default function PhotographerSetupPage() {
  return (
    <Suspense fallback={<main className="sgc-shell px-4 py-5"><div className="sgc-content sgc-panel mx-auto w-full max-w-md p-4 text-white/70">加载中...</div></main>}>
      <PhotographerSetupForm />
    </Suspense>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DashboardProgram, DashboardResponse } from "@/lib/types";

export default function PhotographerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProgramId, setSavingProgramId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [wechat, setWechat] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");
  const [password, setPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/photographer/dashboard", { cache: "no-store" });
      const responseData = await response.json();
      if (!response.ok) {
        setError(responseData.message ?? "获取数据失败，请重新登录。");
        return;
      }
      const dashboard = responseData as DashboardResponse;
      setData(dashboard);
      setWechat(dashboard.photographer.wechat ?? "");
      setSampleUrl(dashboard.photographer.sample_url ?? "");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function updateProgram(program: DashboardProgram, available: boolean) {
    setSavingProgramId(program.id);
    setError("");
    try {
      const response = await fetch("/api/photographer/program-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_id: program.id, available }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        setError(responseData.message ?? "更新失败，请稍后重试。");
        return;
      }
      setData((current) => current ? {
        ...current,
        programs: current.programs.map((item) => item.id === program.id ? { ...item, available } : item),
      } : current);
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setSavingProgramId(null);
    }
  }

  async function bulkUpdate(available: boolean) {
    const label = available ? "一键全部可接" : "一键全部不可接";
    if (!window.confirm(`确认${label}吗？`)) return;

    setBulkLoading(true);
    setError("");
    try {
      const response = await fetch("/api/photographer/program-status/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        setError(responseData.message ?? "批量更新失败，请稍后重试。");
        return;
      }
      setData((current) => current ? {
        ...current,
        programs: current.programs.map((program) => ({ ...program, available })),
      } : current);
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setBulkLoading(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setError("");

    try {
      const response = await fetch("/api/photographer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wechat, sample_url: sampleUrl, password }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        setProfileMessage(responseData.message ?? "更新资料失败，请稍后重试。");
        return;
      }
      setData((current) => current ? {
        ...current,
        photographer: { ...current.photographer, wechat, sample_url: sampleUrl || null },
      } : current);
      setPassword("");
      setEditingProfile(false);
      setProfileMessage("资料已更新。");
    } catch {
      setProfileMessage("网络异常，请稍后重试。");
    }
  }

  async function logout() {
    await fetch("/api/photographer/logout", { method: "POST" });
    router.push("/photographer/login");
  }

  return (
    <main className="sgc-shell px-4 py-5">
      <div className="sgc-content mx-auto w-full max-w-md space-y-4">
        <header className="flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="sgc-link text-sm">返回首页</Link>
            <p className="mt-2 text-sm font-semibold text-white">SGC三周年庆典</p>
            <h1 className="mt-1 text-2xl font-black text-white">摄影管理页</h1>
          </div>
          <button type="button" onClick={logout} className="sgc-button-secondary px-3 py-2 text-sm">退出登录</button>
        </header>

        {loading ? <p className="sgc-panel p-4 text-white/70">加载中...</p> : null}
        {error ? <p className="rounded-lg border border-red-300/40 bg-red-950/50 p-4 text-sm text-red-200">{error}</p> : null}

        {data ? (
          <>
            <section className="sgc-panel p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="sgc-subtle text-sm">摄影师</p>
                  <h2 className="mt-1 text-xl font-bold text-white">{data.photographer.display_name}</h2>
                  <p className="sgc-muted mt-2 break-all text-sm">微信号：{data.photographer.wechat || "未填写"}</p>
                  {data.photographer.sample_url ? <p className="sgc-muted mt-1 break-all text-sm">样片：{data.photographer.sample_url}</p> : null}
                </div>
                <button type="button" onClick={() => setEditingProfile((value) => !value)} className="sgc-button-secondary px-3 py-2 text-sm">编辑资料</button>
              </div>

              {editingProfile ? (
                <form onSubmit={saveProfile} className="mt-4 border-t border-white/15 pt-4">
                  <label className="sgc-label block" htmlFor="wechat">微信号</label>
                  <input id="wechat" value={wechat} onChange={(event) => setWechat(event.target.value)} className="sgc-input mt-2 px-4 py-3" />
                  <label className="sgc-label mt-4 block" htmlFor="sampleUrl">样片链接</label>
                  <input id="sampleUrl" value={sampleUrl} onChange={(event) => setSampleUrl(event.target.value)} className="sgc-input mt-2 px-4 py-3" />
                  <label className="sgc-label mt-4 block" htmlFor="newPassword">新密码</label>
                  <input id="newPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="不修改可留空" className="sgc-input mt-2 px-4 py-3" />
                  <button type="submit" className="sgc-button-primary mt-4 w-full px-4 py-3">保存资料</button>
                </form>
              ) : null}
              {profileMessage ? <p className="mt-3 text-sm text-white/80">{profileMessage}</p> : null}
            </section>

            <section className="grid grid-cols-2 gap-3">
              <button type="button" disabled={bulkLoading} onClick={() => bulkUpdate(true)} className="sgc-button-primary px-3 py-3 text-sm">一键全部可接</button>
              <button type="button" disabled={bulkLoading} onClick={() => bulkUpdate(false)} className="sgc-button-danger px-3 py-3 text-sm">一键全部不可接</button>
            </section>

            <section className="space-y-3">
              {data.programs.map((program) => (
                <article key={program.id} className="sgc-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="sgc-subtle text-sm font-semibold">节目 {String(program.order_no).padStart(2, "0")}</p>
                      <h2 className="mt-1 text-lg font-bold text-white">{program.title}</h2>
                      {program.song_name ? <p className="sgc-muted mt-1 text-sm">{program.song_name}</p> : null}
                    </div>
                    <span className={program.available ? "rounded-full border border-white bg-white px-3 py-1 text-sm font-bold text-black" : "rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm font-bold text-white/60"}>
                      {program.available ? "可接" : "不可接"}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={savingProgramId === program.id}
                    onClick={() => updateProgram(program, !program.available)}
                    className={program.available ? "sgc-button-secondary mt-4 w-full px-4 py-3" : "sgc-button-primary mt-4 w-full px-4 py-3"}
                  >
                    {savingProgramId === program.id ? "更新中..." : program.available ? "设为不可接" : "设为可接"}
                  </button>
                </article>
              ))}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

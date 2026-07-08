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
    <main className="min-h-screen bg-paper px-4 py-5">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-medium text-zinc-500">返回首页</Link>
            <h1 className="mt-2 text-2xl font-semibold text-ink">摄影管理页</h1>
          </div>
          <button type="button" onClick={logout} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-ink">退出登录</button>
        </header>

        {loading ? <p className="rounded-lg bg-white p-4 text-zinc-600">加载中...</p> : null}
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        {data ? (
          <>
            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-500">摄影师</p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">{data.photographer.display_name}</h2>
                  <p className="mt-2 break-all text-sm text-zinc-600">微信号：{data.photographer.wechat || "未填写"}</p>
                  {data.photographer.sample_url ? <p className="mt-1 break-all text-sm text-zinc-600">样片：{data.photographer.sample_url}</p> : null}
                </div>
                <button type="button" onClick={() => setEditingProfile((value) => !value)} className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-ink">编辑资料</button>
              </div>

              {editingProfile ? (
                <form onSubmit={saveProfile} className="mt-4 border-t border-zinc-200 pt-4">
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="wechat">微信号</label>
                  <input id="wechat" value={wechat} onChange={(event) => setWechat(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-emerald-600" />
                  <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="sampleUrl">样片链接</label>
                  <input id="sampleUrl" value={sampleUrl} onChange={(event) => setSampleUrl(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-emerald-600" />
                  <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="newPassword">新密码</label>
                  <input id="newPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="不修改可留空" className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-emerald-600" />
                  <button type="submit" className="mt-4 w-full rounded-lg bg-ink px-4 py-3 font-semibold text-white">保存资料</button>
                </form>
              ) : null}
              {profileMessage ? <p className="mt-3 text-sm text-emerald-700">{profileMessage}</p> : null}
            </section>

            <section className="grid grid-cols-2 gap-3">
              <button type="button" disabled={bulkLoading} onClick={() => bulkUpdate(true)} className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white">一键全部可接</button>
              <button type="button" disabled={bulkLoading} onClick={() => bulkUpdate(false)} className="rounded-lg bg-zinc-800 px-3 py-3 text-sm font-semibold text-white">一键全部不可接</button>
            </section>

            <section className="space-y-3">
              {data.programs.map((program) => (
                <article key={program.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-500">节目 {String(program.order_no).padStart(2, "0")}</p>
                      <h2 className="mt-1 text-lg font-semibold text-ink">{program.title}</h2>
                      {program.song_name ? <p className="mt-1 text-sm text-zinc-600">{program.song_name}</p> : null}
                    </div>
                    <span className={program.available ? "rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700" : "rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-600"}>
                      {program.available ? "可接" : "不可接"}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={savingProgramId === program.id}
                    onClick={() => updateProgram(program, !program.available)}
                    className={program.available ? "mt-4 w-full rounded-lg border border-zinc-300 px-4 py-3 font-semibold text-ink" : "mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white"}
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

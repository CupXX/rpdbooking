"use client";

import { FormEvent, useEffect, useState } from "react";
import type { DashboardProgram, DashboardResponse, PhotographerOption } from "@/lib/types";

type PendingAvailabilityAction =
  | { kind: "single"; program: DashboardProgram }
  | { kind: "bulk" };

export default function PhotographerPage() {
  const [photographers, setPhotographers] = useState<PhotographerOption[]>([]);
  const [selectedPhotographerCode, setSelectedPhotographerCode] = useState("");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [savingProgramId, setSavingProgramId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [wechat, setWechat] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [pendingAvailability, setPendingAvailability] = useState<PendingAvailabilityAction | null>(null);
  const [wechatDraft, setWechatDraft] = useState("");
  const [wechatModalError, setWechatModalError] = useState("");
  const [wechatModalSaving, setWechatModalSaving] = useState(false);

  async function loadPhotographers() {
    const response = await fetch("/api/photographer/list", { cache: "no-store" });
    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message ?? "获取摄影名单失败。");
    setPhotographers(responseData.photographers ?? []);
  }

  async function loadDashboard(options: { silentUnauthorized?: boolean } = {}) {
    const response = await fetch("/api/photographer/dashboard", { cache: "no-store" });
    const responseData = await response.json();
    if (!response.ok) {
      if (response.status === 401 && options.silentUnauthorized) {
        setData(null);
        return;
      }
      throw new Error(responseData.message ?? "获取数据失败，请重新选择摄影。");
    }

    const dashboard = responseData as DashboardResponse;
    setData(dashboard);
    setSelectedPhotographerCode(dashboard.photographer.photographer_code);
    setWechat(dashboard.photographer.wechat ?? "");
    setSampleUrl(dashboard.photographer.sample_url ?? "");
  }

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError("");
      try {
        await loadPhotographers();
        await loadDashboard({ silentUnauthorized: true });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "加载失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
  }, []);

  async function choosePhotographer(photographerCode: string) {
    setSelectedPhotographerCode(photographerCode);
    setError("");
    setProfileMessage("");
    setPendingAvailability(null);

    if (!photographerCode) {
      setData(null);
      return;
    }

    setSelecting(true);
    try {
      const response = await fetch("/api/photographer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographer_code: photographerCode }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        setError(responseData.message ?? "选择摄影失败，请稍后重试。");
        setData(null);
        return;
      }
      await loadDashboard();
    } catch {
      setError("网络异常，请稍后重试。");
      setData(null);
    } finally {
      setSelecting(false);
    }
  }

  function needsWechatBeforeAvailable() {
    return !data?.photographer.wechat?.trim();
  }

  function requestProgramUpdate(program: DashboardProgram, available: boolean) {
    if (available && needsWechatBeforeAvailable()) {
      setPendingAvailability({ kind: "single", program });
      setWechatDraft(wechat);
      setWechatModalError("");
      return;
    }
    void updateProgram(program, available);
  }

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

  function requestBulkUpdate(available: boolean) {
    if (available && needsWechatBeforeAvailable()) {
      setPendingAvailability({ kind: "bulk" });
      setWechatDraft(wechat);
      setWechatModalError("");
      return;
    }
    void bulkUpdate(available);
  }

  async function bulkUpdate(available: boolean) {
    const label = available ? "全部可约" : "全部不可约";
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
        body: JSON.stringify({ wechat, sample_url: sampleUrl }),
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
      setEditingProfile(false);
      setProfileMessage("资料已更新。");
    } catch {
      setProfileMessage("网络异常，请稍后重试。");
    }
  }

  async function saveWechatAndContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextWechat = wechatDraft.trim();
    if (!nextWechat) {
      setWechatModalError("请先填写微信号。");
      return;
    }
    if (!pendingAvailability) return;

    setWechatModalSaving(true);
    setWechatModalError("");
    try {
      const response = await fetch("/api/photographer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wechat: nextWechat, sample_url: sampleUrl }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        setWechatModalError(responseData.message ?? "保存微信失败，请稍后重试。");
        return;
      }

      setWechat(nextWechat);
      setData((current) => current ? {
        ...current,
        photographer: { ...current.photographer, wechat: nextWechat },
      } : current);

      const action = pendingAvailability;
      setPendingAvailability(null);
      if (action.kind === "single") {
        await updateProgram(action.program, true);
      } else {
        await bulkUpdate(true);
      }
    } catch {
      setWechatModalError("网络异常，请稍后重试。");
    } finally {
      setWechatModalSaving(false);
    }
  }

  return (
    <main className="sgc-shell px-4 py-5">
      <div className="sgc-content mx-auto w-full max-w-md space-y-4">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-white">SGC三周年庆典</p>
          <h1 className="text-2xl font-black text-white">直拍摄影管理</h1>
        </header>

        <section className="sgc-panel p-4">
          <label className="sgc-label block" htmlFor="photographerSelect">选择摄影</label>
          <select
            id="photographerSelect"
            value={selectedPhotographerCode}
            onChange={(event) => void choosePhotographer(event.target.value)}
            disabled={loading || selecting}
            className="sgc-input mt-2 px-4 py-3 text-base"
          >
            <option value="">请选择摄影</option>
            {photographers.map((photographer) => (
              <option key={photographer.photographer_code} value={photographer.photographer_code}>
                {photographer.display_name}
              </option>
            ))}
          </select>
          {selecting ? <p className="sgc-muted mt-3 text-sm">切换中...</p> : null}
        </section>

        {loading ? <p className="sgc-panel p-4 text-white/70">加载中...</p> : null}
        {error ? <p className="rounded-lg border border-red-300/40 bg-red-950/50 p-4 text-sm text-red-200">{error}</p> : null}

        {data ? (
          <>
            <section className="sgc-panel p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="sgc-subtle text-sm">当前摄影</p>
                  <h2 className="mt-1 text-xl font-bold text-white">{data.photographer.display_name}</h2>
                  <p className="sgc-muted mt-2 break-all text-sm">微信号：{data.photographer.wechat || "未填写"}</p>
                  {data.photographer.sample_url ? (
                    <p className="sgc-muted mt-1 break-all text-sm">
                      样片：
                      <a href={data.photographer.sample_url} target="_blank" rel="noreferrer" className="sgc-link">
                        {data.photographer.sample_url}
                      </a>
                    </p>
                  ) : null}
                </div>
                <button type="button" onClick={() => setEditingProfile((value) => !value)} className="sgc-button-secondary px-3 py-2 text-sm">编辑资料</button>
              </div>

              {editingProfile ? (
                <form onSubmit={saveProfile} className="mt-4 border-t border-white/15 pt-4">
                  <label className="sgc-label block" htmlFor="wechat">微信号</label>
                  <input id="wechat" value={wechat} onChange={(event) => setWechat(event.target.value)} className="sgc-input mt-2 px-4 py-3" />
                  <label className="sgc-label mt-4 block" htmlFor="sampleUrl">样片链接</label>
                  <input id="sampleUrl" value={sampleUrl} onChange={(event) => setSampleUrl(event.target.value)} className="sgc-input mt-2 px-4 py-3" />
                  <button type="submit" className="sgc-button-primary mt-4 w-full px-4 py-3">保存资料</button>
                </form>
              ) : null}
              {profileMessage ? <p className="mt-3 text-sm text-white/80">{profileMessage}</p> : null}
            </section>

            <section className="grid grid-cols-2 gap-3">
              <button type="button" disabled={bulkLoading} onClick={() => requestBulkUpdate(true)} className="sgc-button-primary px-3 py-3 text-sm">全部可约</button>
              <button type="button" disabled={bulkLoading} onClick={() => requestBulkUpdate(false)} className="sgc-button-danger px-3 py-3 text-sm">全部不可约</button>
            </section>

            <section className="sgc-panel overflow-hidden">
              <table className="w-full table-fixed border-collapse text-left">
                <tbody className="divide-y divide-white/10">
                  {data.programs.map((program) => {
                    const members = program.dancers
                      .map((dancer) => dancer.display_name ?? dancer.nickname)
                      .join("、");
                    const disabled = savingProgramId === program.id || bulkLoading || selecting;

                    return (
                      <tr key={program.id} className="align-middle">
                        <td className="w-10 px-3 py-3 text-sm font-bold text-white/55">
                          {String(program.order_no).padStart(2, "0")}
                        </td>
                        <td className="px-1 py-3">
                          <p className="text-sm font-bold leading-5 text-white">{program.song_name ?? program.title}</p>
                          <p className="sgc-muted mt-1 line-clamp-2 text-xs leading-5">{members || "暂无成员"}</p>
                        </td>
                        <td className="w-20 px-3 py-3 text-right">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={program.available}
                            disabled={disabled}
                            onClick={() => requestProgramUpdate(program, !program.available)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full border transition ${program.available ? "border-white bg-white" : "border-white/35 bg-white/10"}`}
                          >
                            <span
                              className={`inline-block h-5 w-5 rounded-full transition ${program.available ? "translate-x-7 bg-black" : "translate-x-1 bg-white/70"}`}
                            />
                            <span className="sr-only">{program.available ? "设为不可约" : "设为可约"}</span>
                          </button>
                          <p className={`mt-1 text-xs font-bold ${program.available ? "text-white" : "text-white/45"}`}>
                            {program.available ? "可约" : "不可约"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          !loading ? <p className="sgc-panel p-4 text-sm text-white/70">请先选择摄影。</p> : null
        )}
      </div>

      {pendingAvailability ? (
        <div className="fixed inset-0 z-20 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
          <section className="sgc-panel w-full max-w-md p-5">
            <div className="space-y-2">
              <p className="sgc-subtle text-sm">开放可约前需要联系方式</p>
              <h2 className="text-xl font-bold text-white">填写微信号</h2>
            </div>
            <form onSubmit={saveWechatAndContinue} className="mt-5">
              <label className="sgc-label block" htmlFor="wechatBeforeAvailable">微信号</label>
              <input
                id="wechatBeforeAvailable"
                value={wechatDraft}
                onChange={(event) => setWechatDraft(event.target.value)}
                className="sgc-input mt-2 px-4 py-3"
                autoFocus
              />
              {wechatModalError ? <p className="mt-3 text-sm text-red-300">{wechatModalError}</p> : null}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={wechatModalSaving}
                  onClick={() => setPendingAvailability(null)}
                  className="sgc-button-secondary px-4 py-3"
                >
                  取消
                </button>
                <button type="submit" disabled={wechatModalSaving} className="sgc-button-primary px-4 py-3">
                  {wechatModalSaving ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { DancerSearchProgram, DancerSearchResponse } from "@/lib/types";

type PhotographerDetail = DancerSearchProgram["available_photographers"][number];

export default function DancerPage() {
  const [nickname, setNickname] = useState("");
  const [result, setResult] = useState<DancerSearchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<PhotographerDetail | null>(null);
  const [toast, setToast] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/dancer/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "查询失败，请稍后重试。");
        return;
      }
      setResult(data as DancerSearchResponse);
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setToast("已复制");
    window.setTimeout(() => setToast(""), 1600);
  }

  return (
    <main className="sgc-shell px-4 py-5">
      <div className="sgc-content mx-auto w-full max-w-md space-y-5">
        <header className="space-y-2">
          <Link href="/" className="sgc-link text-sm">返回首页</Link>
          <p className="text-sm font-semibold text-white">SGC三周年庆典</p>
          <h1 className="text-2xl font-black text-white">舞者约拍查询</h1>
        </header>

        <form onSubmit={handleSearch} className="sgc-panel p-4">
          <label className="sgc-label block" htmlFor="nickname">昵称</label>
          <input
            id="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="请输入报名昵称"
            className="sgc-input mt-2 px-4 py-3 text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="sgc-button-primary mt-3 w-full px-4 py-3 text-base"
          >
            {loading ? "查询中..." : "查询"}
          </button>
          {error ? <p className="mt-3 text-sm leading-6 text-red-300">{error}</p> : null}
        </form>

        {result ? (
          <section className="space-y-3">
            <div className="sgc-card px-4 py-3 text-sm text-white">
              {result.dancer.display_name ?? result.dancer.nickname} 参与 {result.programs.length} 个节目
            </div>
            {result.programs.map((program) => (
              <article key={program.id} className="sgc-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="sgc-subtle text-sm font-semibold">节目 {String(program.order_no).padStart(2, "0")}</p>
                    <h2 className="mt-1 text-lg font-bold text-white">{program.title}</h2>
                    {program.song_name ? <p className="sgc-muted mt-1 text-sm">{program.song_name}</p> : null}
                  </div>
                </div>

                {program.dancers.length > 0 ? (
                  <p className="sgc-muted mt-3 text-sm leading-6">
                    同组舞者：{program.dancers.map((dancer) => dancer.display_name ?? dancer.nickname).join("、")}
                  </p>
                ) : null}

                <div className="mt-4 space-y-2">
                  {program.available_photographers.length === 0 ? (
                    <p className="rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-white/60">当前暂无可接摄影，请稍后刷新查看。</p>
                  ) : (
                    program.available_photographers.map((photographer) => (
                      <div key={photographer.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/15 px-3 py-3">
                        <span className="font-semibold text-white">{photographer.display_name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedPhotographer(photographer)}
                          className="sgc-button-primary px-3 py-2 text-sm"
                        >
                          查看联系方式
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>

      {selectedPhotographer ? (
        <div className="fixed inset-0 z-20 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
          <section className="sgc-panel w-full max-w-md p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="sgc-subtle text-sm">摄影师</p>
                <h2 className="text-xl font-bold text-white">{selectedPhotographer.display_name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedPhotographer(null)} className="sgc-button-secondary px-3 py-2 text-sm">关闭</button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="sgc-label">微信号</p>
                <p className="mt-1 break-all text-base text-white">{selectedPhotographer.wechat}</p>
                <button type="button" onClick={() => copyText(selectedPhotographer.wechat)} className="sgc-button-primary mt-2 w-full px-4 py-3">复制微信</button>
              </div>
              {selectedPhotographer.sample_url ? (
                <div>
                  <p className="sgc-label">样片链接</p>
                  <p className="mt-1 break-all text-base text-white">{selectedPhotographer.sample_url}</p>
                  <button type="button" onClick={() => copyText(selectedPhotographer.sample_url ?? "")} className="sgc-button-secondary mt-2 w-full px-4 py-3">复制链接</button>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {toast ? <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/30 bg-white px-4 py-2 text-sm font-bold text-black">{toast}</div> : null}
    </main>
  );
}

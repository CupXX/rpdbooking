import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center gap-8">
        <section className="space-y-3">
          <p className="text-sm font-medium text-emerald-700">路演比赛约拍登记</p>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">随舞约拍查询</h1>
          <p className="text-base leading-7 text-zinc-600">舞者查询当前可约摄影，摄影师维护自己的可接节目状态。</p>
        </section>

        <section className="grid gap-3">
          <Link
            href="/dancer"
            className="rounded-lg bg-ink px-5 py-4 text-center text-base font-semibold text-white shadow-sm active:scale-[0.99]"
          >
            我是舞者，查询可约摄影
          </Link>
          <Link
            href="/photographer/login"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-4 text-center text-base font-semibold text-ink shadow-sm active:scale-[0.99]"
          >
            我是摄影，管理可接节目
          </Link>
        </section>
      </div>
    </main>
  );
}

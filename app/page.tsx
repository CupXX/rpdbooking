import Link from "next/link";

export default function HomePage() {
  return (
    <main className="sgc-shell px-5 py-8">
      <div className="sgc-content mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center gap-8">
        <section className="space-y-4">
          <div>
            <p className="sgc-logo">SGC</p>
            <p className="mt-3 text-center text-sm font-bold text-white">RANDOM DANCE</p>
          </div>
          <div className="sgc-panel p-5">
            <p className="text-sm font-semibold text-white">SGC三周年庆典</p>
            <h1 className="mt-2 text-3xl font-black text-white">约拍登记</h1>
            <p className="sgc-muted mt-3 text-base leading-7">舞者查询当前可约摄影，摄影师维护自己的可接节目状态。</p>
          </div>
        </section>

        <section className="grid gap-3">
          <Link
            href="/dancer"
            className="sgc-button-primary px-5 py-4 text-center text-base active:scale-[0.99]"
          >
            我是舞者，查询可约摄影
          </Link>
          <Link
            href="/photographer/login"
            className="sgc-button-secondary px-5 py-4 text-center text-base active:scale-[0.99]"
          >
            我是摄影，管理可接节目
          </Link>
        </section>
      </div>
    </main>
  );
}

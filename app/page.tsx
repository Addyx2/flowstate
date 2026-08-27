export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] text-[#4a9eff] mb-6">
          FLOWSTATE // PRODUCT // v0.1.0
        </p>
        <h1 className="text-4xl md:text-5xl font-light mb-4 text-[#e2e2e2]">
          The product lives here.
        </h1>
        <p className="text-lg text-[#a0a0a0] mb-12">
          Dashboard, API routes, auth, and the voice agent. This is separate
          from the marketing site at aultrum.com.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/dashboard"
            className="px-8 py-3 bg-white text-black font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
          >
            DASHBOARD
          </a>
          <a
            href="/api/health"
            className="px-8 py-3 border border-[#2a2a2a] text-[#e2e2e2] font-mono text-xs tracking-widest hover:bg-[#111] transition-colors"
          >
            HEALTH CHECK
          </a>
        </div>
      </div>
    </main>
  );
}

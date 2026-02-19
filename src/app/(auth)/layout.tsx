export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">⚽</span>
          <h1 className="font-display font-black text-3xl text-[var(--text-primary)]">
            Golazo<span className="gradient-text">Zone</span>
          </h1>
          <p className="text-[var(--accent)] font-semibold text-sm tracking-widest mt-1">
            FIFA WORLD CUP 2026
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

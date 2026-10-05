export default function GlassCard({ children }) {
  return (
    <div className="relative w-full max-w-[400px] rounded-2xl border border-border bg-surface p-8 shadow-glass backdrop-blur-xl">
      {/* Sky blue top hairline shimmer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-sky/30 to-transparent" />
      {/* Subtle corner glow */}
      <div className="pointer-events-none absolute -top-px left-6 h-[2px] w-12 rounded-full bg-sky/40 blur-sm" />
      {children}
    </div>
  )
}

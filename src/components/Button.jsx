export default function Button({ children, loading, variant = 'primary', ...props }) {
  const base =
    'w-full rounded-xl px-4 py-2.5 text-sm font-semibold font-display transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    primary:
      'bg-sky text-slate-950 font-bold hover:bg-sky-dim hover:shadow-glow',
    ghost:
      'bg-white/[0.06] text-ink border border-border hover:bg-white/[0.1] hover:border-sky/40 font-semibold',
  }

  return (
    <button className={`${base} ${variants[variant]}`} disabled={loading} {...props}>
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />
          Working...
        </>
      ) : (
        children
      )}
    </button>
  )
}

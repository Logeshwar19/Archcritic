export default function SocialButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-white/[0.07] hover:border-sky/25 active:scale-[0.98]"
    >
      {icon}
      {label}
    </button>
  )
}

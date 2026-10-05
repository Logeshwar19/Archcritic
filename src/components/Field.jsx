import { useId, useState } from 'react'

export default function Field({
  label,
  type = 'text',
  icon,
  placeholder,
  value,
  onChange,
  autoComplete,
  error,
}) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-muted">
        {label}
      </label>
      <div
        className={`group flex items-center gap-2.5 rounded-xl border bg-white/[0.03] px-3.5 py-2.5 transition-all focus-within:bg-white/[0.05] ${
          error
            ? 'border-red-400/50 focus-within:shadow-[0_0_0_1px_rgba(248,113,113,0.35)]'
            : 'border-border focus-within:border-sky/40 focus-within:shadow-glow'
        }`}
      >
        <span className="text-muted transition-colors group-focus-within:text-sky">
          {icon}
        </span>
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent font-body text-sm text-ink placeholder:text-muted/50 focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="shrink-0 text-[11px] font-semibold text-muted transition-colors hover:text-sky"
            tabIndex={0}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? 'HIDE' : 'SHOW'}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

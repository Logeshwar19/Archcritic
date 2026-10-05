import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import GlassCard from '../components/GlassCard.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import { MailIcon, ArrowLeftIcon, CheckIcon } from '../components/icons.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    if (!email) {
      setError('Enter your email address')
      return false
    }
    setError('')
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <AuthShell>
      <GlassCard>
        <div className="mb-6 flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-bold text-ink">Reset password</h1>
          <p className="text-sm text-muted">
            {submitted
              ? "We've sent a password reset link to your email."
              : 'Enter your email and we’ll send you a recovery link.'}
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-xl border border-sky/20 bg-sky/5 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky/10 text-sky">
                <CheckIcon />
              </div>
              <p className="text-xs leading-relaxed text-ink/80">
                Instructions sent to <span className="font-semibold text-sky">{email}</span>. Please check your inbox and spam folder.
              </p>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-white/[0.06] active:scale-[0.98]"
            >
              <ArrowLeftIcon />
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Field
              label="Email address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              error={error}
              icon={<MailIcon />}
            />

            <Button type="submit" loading={loading}>
              Send reset link
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-sky"
              >
                <ArrowLeftIcon />
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </GlassCard>
    </AuthShell>
  )
}

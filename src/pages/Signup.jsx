import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import GlassCard from '../components/GlassCard.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import SocialButton from '../components/SocialButton.jsx'
import { UserIcon, MailIcon, LockIcon, GithubIcon, GoogleIcon } from '../components/icons.jsx'
import { signupUser } from '../utils/auth.js'

const MIN_PASSWORD_LEN = 8

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const next = {}
    if (!name) next.name = 'Enter your name'
    if (!email) next.email = 'Enter your work email'
    if (password.length < MIN_PASSWORD_LEN)
      next.password = `Use at least ${MIN_PASSWORD_LEN} characters`
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    signupUser({ name, email })
    setLoading(false)
    navigate('/dashboard')
  }

  function handleSocialSignup(provider = 'Google') {
    setLoading(true)
    setTimeout(() => {
      signupUser({
        name: provider === 'GitHub' ? 'GitHub Architect' : 'Google Cloud Architect',
        email: provider === 'GitHub' ? 'developer@github.com' : 'google.user@gmail.com',
      })
      setLoading(false)
      navigate('/dashboard')
    }, 400)
  }

  const strength = getStrength(password)

  return (
    <AuthShell>
      <GlassCard>
        <div className="mb-6 flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-muted">Start reviewing architecture as you draw it.</p>
        </div>

        <div className="mb-5 flex flex-col gap-2.5">
          <SocialButton
            label="Continue with GitHub"
            icon={<GithubIcon />}
            onClick={() => handleSocialSignup('GitHub')}
          />
          <SocialButton
            label="Continue with Google"
            icon={<GoogleIcon />}
            onClick={() => handleSocialSignup('Google')}
          />
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Field
            label="Full name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            error={errors.name}
            icon={<UserIcon />}
          />
          <Field
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={errors.email}
            icon={<MailIcon />}
          />
          <div className="flex flex-col gap-1.5">
            <Field
              label="Password"
              type="password"
              placeholder="Enter your password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              error={errors.password}
              icon={<LockIcon />}
            />
            {password.length > 0 && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex h-1 flex-1 gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${
                        i < strength.level ? strength.color : 'bg-white/[0.07]'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-muted">{strength.label}</span>
              </div>
            )}
          </div>

          <Button type="submit" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted/70">
          By continuing, you agree to the Terms of Service and Privacy Policy.
        </p>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sky hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </AuthShell>
  )
}

function getStrength(pw) {
  if (pw.length === 0) return { level: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= MIN_PASSWORD_LEN) score++
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { level: 1, label: 'Weak', color: 'bg-red-400' },
    { level: 2, label: 'Okay', color: 'bg-amber-400' },
    { level: 3, label: 'Strong', color: 'bg-sky' },
  ]
  return map[Math.max(0, score - 1)] || map[0]
}

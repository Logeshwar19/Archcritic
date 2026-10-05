import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import GlassCard from '../components/GlassCard.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import SocialButton from '../components/SocialButton.jsx'
import { MailIcon, LockIcon, GithubIcon, GoogleIcon } from '../components/icons.jsx'
import { loginUser } from '../utils/auth.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const next = {}
    if (!email) next.email = 'Enter your work email'
    if (!password) next.password = 'Enter your password'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    loginUser({ email, password })
    setLoading(false)
    navigate('/dashboard')
  }

  function handleSocialLogin(provider = 'Google') {
    setLoading(true)
    setTimeout(() => {
      loginUser({
        email: provider === 'GitHub' ? 'developer@github.com' : 'google.user@gmail.com',
        name: provider === 'GitHub' ? 'GitHub Architect' : 'Google Cloud Architect',
      })
      setLoading(false)
      navigate('/dashboard')
    }, 400)
  }

  return (
    <AuthShell>
      <GlassCard>
        <div className="mb-6 flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-muted">Sign in to keep reviewing live, together.</p>
        </div>

        <div className="mb-5 flex flex-col gap-2.5">
          <SocialButton
            label="Continue with GitHub"
            icon={<GithubIcon />}
            onClick={() => handleSocialLogin('GitHub')}
          />
          <SocialButton
            label="Continue with Google"
            icon={<GoogleIcon />}
            onClick={() => handleSocialLogin('Google')}
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
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={errors.email}
            icon={<MailIcon />}
          />
          <Field
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={errors.password}
            icon={<LockIcon />}
          />

          <div className="-mt-1 flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-muted transition-colors hover:text-sky"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-sky hover:underline">
            Create account
          </Link>
        </p>
      </GlassCard>
    </AuthShell>
  )
}

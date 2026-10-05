// Authentication & User Session Store
const AUTH_KEY = 'archcritic_auth_user'
const CLOUD_KEY = 'archcritic_cloud_config'

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read user from localStorage', e)
  }
  return null
}

export function saveUser(userData) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData))
  } catch (e) {
    console.error('Failed to save user', e)
  }
}

export function loginUser({ email, password, name }) {
  let displayName = name
  if (!displayName) {
    // Derive friendly name from email e.g. "loki@gmail.com" -> "Loki"
    const prefix = (email || '').split('@')[0]
    displayName = prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1)) : 'Cloud Architect'
  }

  const user = {
    name: displayName,
    email: (email || '').trim(),
    role: 'Cloud Architect',
    organization: 'Acme Cloud Labs',
    avatarInitial: displayName.charAt(0).toUpperCase() || 'U',
    plan: 'Team Pro',
    loginAt: new Date().toISOString(),
  }
  saveUser(user)
  return user
}

export function signupUser({ name, email }) {
  let displayName = (name || '').trim()
  if (!displayName) {
    const prefix = (email || '').split('@')[0]
    displayName = prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1)) : 'Cloud Engineer'
  }
  const user = {
    name: displayName,
    email: (email || '').trim(),
    role: 'Cloud Architect',
    organization: 'Personal Workspace',
    avatarInitial: displayName.charAt(0).toUpperCase() || 'U',
    plan: 'Developer Free',
    loginAt: new Date().toISOString(),
  }
  saveUser(user)
  return user
}

export function logoutUser() {
  try {
    localStorage.removeItem(AUTH_KEY)
  } catch (e) {
    console.error('Failed to logout', e)
  }
}

export function updateUserProfile(updates) {
  const current = getCurrentUser() || {}
  const next = {
    ...current,
    ...updates,
    avatarInitial: (updates.name || current.name || 'U').charAt(0).toUpperCase(),
  }
  saveUser(next)
  return next
}

// ── Cloud Connection State ──────────────────────────────────────────────────
export function getSavedCloudConfig() {
  try {
    const raw = localStorage.getItem(CLOUD_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read cloud config', e)
  }
  return null
}

export function saveCloudConfig(config) {
  try {
    if (!config) {
      localStorage.removeItem(CLOUD_KEY)
    } else {
      localStorage.setItem(CLOUD_KEY, JSON.stringify(config))
    }
  } catch (e) {
    console.error('Failed to save cloud config', e)
  }
}

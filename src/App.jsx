import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <Routes>
      {/* Default: show Login page first */}
      <Route path="/"               element={<Navigate to="/login" replace />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/signup"         element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard"      element={<Dashboard />} />
      {/* Anything unknown → back to login */}
      <Route path="*"               element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

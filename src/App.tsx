import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Generator from './pages/Generator'
import History from './pages/History'
import Account from './pages/Account'
import Auth from './pages/Auth'
import Navbar from './components/Navbar'
import './index.css'
import type {JSX} from "react"

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="center">Loading...</div>
  if (!session) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="container">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Generator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()
  const signOut = async () => {
    await supabase.auth.signOut()
  }
  return (
    <header className="navbar">
      <div className="nav-left">
        <span className="brand">AI Coder Copilot</span>
        <nav className="nav-links">
          <Link className={location.pathname === '/' ? 'active' : ''} to="/">Generate</Link>
          <Link className={location.pathname === '/history' ? 'active' : ''} to="/history">History</Link>
        </nav>
      </div>
      <div className="nav-right">
        {user && (
          <>
            <Link className={location.pathname === '/account' ? 'active' : ''} to="/account">Account</Link>
            <button className="ghost" onClick={signOut}>Sign out</button>
          </>
        )}
      </div>
    </header>
  )
}

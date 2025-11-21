import {useEffect, useState} from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'
import { Navigate } from 'react-router-dom'

type AuthError = { message?: string }

export default function Auth() {
    const { session } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)

    useEffect(() => {
        if (error) {
            setTimeout(() => setError(null), 3000);
        }
    }, [error]);

    if (session) return <Navigate to="/" replace />

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setInfo(null)
        try {
            if (mode === 'signup') {
                const { error: err } = await supabase.auth.signUp({ email, password })
                if (err) throw err
                setInfo('Signup successful. Please verify your email, then sign in.')
                setMode('signin')
            } else {
                const { error: err } = await supabase.auth.signInWithPassword({ email, password })
                if (err) throw err
            }
        } catch (e) {
            const err = e as AuthError
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    const isSignup = mode === 'signup'

    return (
        <div className="auth-page">
            <div
                className="panel"
                style={{
                    minWidth:'50%',
                    borderColor: isSignup ? '#2c2150' : 'var(--border)',
                    background: isSignup
                        ? 'linear-gradient(180deg, #1a1530, #121225)'
                        : 'linear-gradient(180deg, #12121a, #0f0f16)',
                    boxShadow: isSignup
                        ? '0 10px 40px rgba(124,77,255,0.25)'
                        : '0 10px 40px rgba(0, 200, 83, 0.25)'
                }}
            >
                <div style={{ textAlign:'center' }}>
                    <h1 style={{ margin: 0 }}>
                        {isSignup ? 'Join AI Coder Copilot' : 'Welcome back'}
                    </h1>
                </div>
                <p className="muted" style={{ marginTop: 0, textAlign:'center' }}>
                    {isSignup
                        ? 'Create your account to start using AI Coder copilot.'
                        : 'Sign in to use AI Coder copilot and access old generations.'}
                </p>

                <form onSubmit={submit} className="form">
                    <label>
                        Email
                        <input
                            type="email"
                            required
                            value={email}
                            autoComplete={isSignup ? 'new-email' : 'email'}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            required
                            value={password}
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    {isSignup && (
                        <div className="muted" style={{ fontSize: 12, marginTop: -4 }}>
                            A verification email will be sent to complete your signup.
                        </div>
                    )}

                    {error && <div className="error">{error}</div>}
                    {info && (
                        <div className="error" style={{ background: '#132012', borderColor: '#214a29', color: '#b6f0c3' }}>
                            {info}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className="primary"
                        style={{
                            background: isSignup
                                ? 'linear-gradient(90deg, #7c4dff, #9b6dff)'
                                : 'linear-gradient(90deg, #1f9d5a, #27c169)',
                        }}
                    >
                        {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
                    </button>
                </form>

                <div className="spacer" />

                <div
                    className="switch"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
          <span className="muted">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className="secondary"
                            onClick={() => {
                                setMode(isSignup ? 'signin' : 'signup')
                                setInfo(null)
                            }}
                            aria-label={isSignup ? 'Switch to sign in' : 'Switch to create account'}
                        >
                            {isSignup ? 'Go to Sign in' : 'Create an account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
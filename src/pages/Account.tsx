import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Account() {
  const [email, setEmail] = useState<string>('')
  const [createdAt, setCreatedAt] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setEmail(u?.email || '')
      setCreatedAt(u?.created_at ? new Date(u.created_at).toLocaleString() : '')
    }
    load()
  }, [])

  return (
    <div className="page">
      <div className="panel">
        <h2>Account</h2>
        <div className="grid2">
          <div>
            <div className="label">Email</div>
            <div>{email}</div>
          </div>
          <div>
            <div className="label">Member since</div>
            <div>{createdAt}</div>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Your generations are private to your account. Only you can view them.
        </p>
      </div>
    </div>
  )
}

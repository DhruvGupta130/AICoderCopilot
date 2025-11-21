import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import CodeBlock from '../components/CodeBlock'

type Row = {
  id: number
  prompt: string
  language: string
  code: string
  created_at: string
}

const PAGE_SIZE = 10

export default function History() {
  const [rows, setRows] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  useEffect(() => {
    const fetchCount = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) return
      const { count, error: err } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
      if (err) return
      setTotal(count || 0)
    }
    fetchCount()
  }, [])

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true)
      setError(null)
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) {
        setRows([])
        setLoading(false)
        return
      }
      const { data, error: err } = await supabase
        .from('generations')
        .select('id, prompt, language, code, created_at')
        .order('created_at', { ascending: false })
        .eq('user_id', uid)
        .range(from, to)
      if (err) setError(err.message)
      else setRows((data as Row[]) || [])
      setLoading(false)
    }
    fetchPage()
  }, [page])

  return (
    <div className="page">
      <div className="panel">
        <h2>History</h2>
        {loading && <div className="muted">Loading…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && rows.length === 0 && <div className="muted">No generations yet.</div>}
        <div className="list">
          {rows.map((r) => (
            <div key={r.id} className="card">
              <div className="meta">
                <span className="badge">{r.language}</span>
                <span className="time">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div className="prompt">{r.prompt}</div>
              <CodeBlock code={r.code} language={r.language} />
            </div>
          ))}
        </div>
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <span className="muted">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</button>
        </div>
      </div>
    </div>
  )
}

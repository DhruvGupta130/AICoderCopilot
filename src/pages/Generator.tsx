import {useEffect, useMemo, useState} from 'react'
import {generateCode} from '../lib/gemini'
import CodeBlock from '../components/CodeBlock'
import {supabase} from '../lib/supabaseClient'

const LANGUAGE_OPTIONS = ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++']

export default function Generator() {
    const [prompt, setPrompt] = useState('')
    const [language, setLanguage] = useState('Java')
    const [code, setCode] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const disabled = useMemo(
        () => !prompt.trim() || !language || loading,
        [prompt, language, loading]
    )

    useEffect(() => {
        const seed = async () => {
            await supabase.from('languages').upsert(
                LANGUAGE_OPTIONS.map((name) => ({name})),
                {onConflict: 'name'}
            )
        }
        seed()
    }, [])

    const onGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        setCode('')
        try {
            const {data: userData, error: userErr} = await supabase.auth.getUser()
            if (userErr) throw userErr
            const user_id = userData.user?.id
            if (!user_id) throw new Error('Not signed in')

            const generated = await generateCode(prompt.trim(), language)
            setCode(generated)

            const {error: dbErr} = await supabase.from('generations').insert({
                user_id,
                prompt: prompt.trim(),
                language,
                code: generated
            })

            if (dbErr) throw dbErr
        } catch (err: any) {
            setError(err.message || 'Failed to generate')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <div className="page">
                <div className="panel" style={{padding: 0}}>
                    <div style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0}}>
                        {/* LEFT SIDE — FORM */}
                        <aside style={{borderRight: '1px solid var(--border)', padding: 20}}>
                            <h1 style={{fontSize: 18, fontWeight: 600, margin: '0 0 12px'}}>
                                Generate Code
                            </h1>

                            <form onSubmit={onGenerate} className="form">
                                <label>
                                    <span>Your prompt</span>
                                    <textarea
                                        className="textarea"
                                        rows={10}
                                        placeholder="Write a Python function to reverse a string"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Language</span>
                                    <select
                                        className="select"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        {LANGUAGE_OPTIONS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </label>

                                {error && (
                                    <div className="error">{error}</div>
                                )}

                                <div style={{display: 'flex', gap: 8}}>
                                    <button
                                        disabled={disabled}
                                        type="submit"
                                        className="primary"
                                        style={{width: '100%'}}
                                    >
                                        {loading ? 'Generating…' : 'Generate'}
                                    </button>
                                    <button
                                        type="button"
                                        className="secondary"
                                        onClick={() => {
                                            setPrompt('');
                                            setCode('');
                                            setError(null)
                                        }}
                                        disabled={loading}
                                        title="Clear"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </aside>

                        {/* RIGHT SIDE — RESULT */}
                        <section style={{padding: 20, minHeight: 480, display: 'grid'}}>
                            {code ? (
                                <div className="page" style={{gap: 12}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                        <h2 style={{fontSize: 18, fontWeight: 600, margin: 0}}>AI Response</h2>
                                        <span className="badge">{language}</span>
                                    </div>
                                    <div className="panel" style={{padding: 0}}>
                                        <CodeBlock code={code} language={language}/>
                                    </div>
                                </div>
                            ) : (
                                <div className="center" style={{textAlign: 'center'}}>
                                    <div>
                                        <div className="badge" style={{display: 'inline-block', marginBottom: 10}}>
                                            Ready to generate
                                        </div>
                                        <h3 style={{margin: '0 0 8px'}}>Describe what you want</h3>
                                        <p className="muted" style={{margin: 0}}>
                                            Enter a prompt on the left and choose a language to get started.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
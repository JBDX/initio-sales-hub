import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'

export function Login() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError(
        signInError === 'Invalid login credentials'
          ? 'Identifiants incorrects. Vérifiez votre email et votre mot de passe.'
          : signInError,
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-teal-500 font-mono text-sm font-semibold text-ink-950">
            IN
          </span>
          <div>
            <p className="text-sm font-semibold text-paper-50">Initio</p>
            <p className="text-xs text-ink-400">Outil technico-commercial</p>
          </div>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="rounded-sm border border-ink-800 bg-ink-900 px-6 py-7"
        >
          <h1 className="mb-1 text-lg font-semibold text-paper-50">Connexion</h1>
          <p className="mb-6 text-sm text-ink-400">
            Accédez à votre portefeuille clients et devis.
          </p>

          <label className="mb-1 block text-xs font-medium text-ink-400" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full border-ink-700 bg-ink-800 text-paper-50 placeholder:text-ink-500"
            placeholder="prenom@entreprise.fr"
          />

          <label className="mb-1 block text-xs font-medium text-ink-400" htmlFor="password">
            Mot de passe
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full border-ink-700 bg-ink-800 text-paper-50"
          />

          {error && (
            <p className="mb-4 rounded-sm border border-red-700/40 bg-red-700/10 px-3 py-2 text-xs text-red-100">
              {error}
            </p>
          )}

          <Button type="submit" variant="accent" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  )
}

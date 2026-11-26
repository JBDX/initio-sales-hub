import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
    </div>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm border border-paper-200 bg-white ${className}`}>{children}</div>
  )
}

export function KpiCard({
  label,
  value,
  accent = 'teal',
}: {
  label: string
  value: ReactNode
  accent?: 'teal' | 'amber' | 'red' | 'blue'
}) {
  const accentColor: Record<string, string> = {
    teal: 'bg-teal-500',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
    blue: 'bg-blue-600',
  }
  return (
    <div className="relative overflow-hidden rounded-sm border border-paper-200 bg-white px-5 py-4">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${accentColor[accent]}`} />
      <p className="font-mono text-2xl font-medium tabular text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{label}</p>
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-paper-300 px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  )
}

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return <p className="px-1 py-8 text-sm text-ink-500">{label}</p>
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-red-100 bg-red-100 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', ...rest } = props
  return (
    <select
      {...rest}
      className={`rounded-sm border border-paper-300 bg-white px-3 py-1.5 text-sm text-ink-800 focus:border-teal-500 ${className}`}
    />
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      {...rest}
      className={`rounded-sm border border-paper-300 bg-white px-3 py-1.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-teal-500 ${className}`}
    />
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return (
    <textarea
      {...rest}
      className={`rounded-sm border border-paper-300 bg-white px-3 py-1.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-teal-500 ${className}`}
    />
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
}) {
  const variants: Record<string, string> = {
    primary: 'bg-ink-900 text-paper-50 hover:bg-ink-800',
    secondary: 'border border-paper-300 bg-white text-ink-800 hover:bg-paper-100',
    ghost: 'text-ink-600 hover:bg-paper-100',
    accent: 'bg-teal-600 text-paper-50 hover:bg-teal-700',
  }
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  )
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
    value,
  )
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(value),
  )
}

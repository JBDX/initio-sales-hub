import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Ma journée', end: true },
  { to: '/devis', label: 'Pipeline devis' },
  { to: '/clients', label: 'Clients' },
  { to: '/mfa', label: 'Campagne MFA' },
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/base-savoir', label: 'Base de connaissance' },
]

export function Layout() {
  const { profil, user, signOut } = useAuth()

  const displayName = profil?.nom_affiche || user?.email || 'Utilisateur'
  const portefeuilleLabel = profil?.commercial
    ? `Portefeuille ${profil.commercial === 'MK' ? 'MK' : 'JT'}`
    : profil?.role === 'manager'
      ? 'Vue manager'
      : ''

  return (
    <div className="flex min-h-screen bg-paper-50">
      <aside className="flex w-64 shrink-0 flex-col bg-ink-950 text-paper-50">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-teal-500 font-mono text-sm font-semibold text-ink-950">
            IN
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-paper-50">Initio</p>
            <p className="text-xs text-ink-400">Outil technico-commercial</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative flex items-center rounded-sm px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-ink-800 font-medium text-paper-50'
                        : 'text-ink-400 hover:bg-ink-900 hover:text-paper-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-teal-500" />
                      )}
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-ink-800 px-6 py-4">
          <p className="truncate text-sm font-medium text-paper-100">{displayName}</p>
          {portefeuilleLabel && <p className="text-xs text-ink-400">{portefeuilleLabel}</p>}
          <button
            onClick={() => void signOut()}
            className="mt-3 text-xs text-ink-400 underline-offset-2 hover:text-paper-100 hover:underline"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

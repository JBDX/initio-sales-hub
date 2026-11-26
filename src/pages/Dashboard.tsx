import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Devis } from '../types/database'
import { EmptyState, ErrorNote, KpiCard, PageHeader, Panel, Spinner, formatCurrency, formatPercent } from '../components/ui'
import { useAuth } from '../context/AuthContext'

function useDevisForDashboard() {
  return useQuery({
    queryKey: ['dashboard-devis'],
    queryFn: async () => {
      const { data, error } = await supabase.from('devis').select('*')
      if (error) throw error
      return data as Devis[]
    },
  })
}

function computeKpis(devis: Devis[]) {
  const total = devis.length
  const parStatut = devis.reduce<Record<string, number>>((acc, d) => {
    acc[d.statut] = (acc[d.statut] ?? 0) + 1
    return acc
  }, {})
  const gagnes = devis.filter((d) => d.statut === 'Gagne')
  const perdus = devis.filter((d) => d.statut === 'Perdu')
  const caGagne = gagnes.reduce((sum, d) => sum + (d.montant_ht ?? 0), 0)
  const clos = gagnes.length + perdus.length
  const tauxTransformation = clos > 0 ? gagnes.length / clos : null
  return { total, parStatut, caGagne, tauxTransformation, nbGagnes: gagnes.length, nbPerdus: perdus.length }
}

export function Dashboard() {
  const { profil } = useAuth()
  const devisQuery = useDevisForDashboard()

  const kpis = useMemo(() => computeKpis(devisQuery.data ?? []), [devisQuery.data])
  const kpisParCommercial = useMemo(() => {
    if (profil?.role !== 'manager' || !devisQuery.data) return null
    const map = new Map<string, Devis[]>()
    for (const d of devisQuery.data) {
      const list = map.get(d.commercial) ?? []
      list.push(d)
      map.set(d.commercial, list)
    }
    return Array.from(map.entries()).map(([commercial, list]) => ({
      commercial,
      ...computeKpis(list),
    }))
  }, [devisQuery.data, profil?.role])

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle={
          profil?.role === 'manager'
            ? "Vue d'ensemble de l'équipe, calculée à partir des devis en base."
            : 'Vos indicateurs clés, calculés à partir de vos devis.'
        }
      />

      {devisQuery.isLoading && <Spinner />}
      {devisQuery.isError && <ErrorNote message={(devisQuery.error as Error).message} />}

      {devisQuery.data && devisQuery.data.length === 0 && (
        <EmptyState
          title="Pas encore de données à agréger"
          hint="Les KPI apparaîtront dès que des devis seront créés ou migrés."
        />
      )}

      {devisQuery.data && devisQuery.data.length > 0 && (
        <>
          <div className="mb-8 grid grid-cols-4 gap-4">
            <KpiCard label="Devis au total" value={kpis.total} accent="teal" />
            <KpiCard label="CA gagné (HT)" value={formatCurrency(kpis.caGagne)} accent="blue" />
            <KpiCard
              label="Taux de transformation"
              value={formatPercent(kpis.tauxTransformation)}
              accent="amber"
            />
            <KpiCard label="Devis perdus" value={kpis.nbPerdus} accent="red" />
          </div>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Répartition par statut
            </h2>
            <Panel className="p-5">
              <div className="grid grid-cols-6 gap-4 text-center">
                {Object.entries(kpis.parStatut).map(([statut, count]) => (
                  <div key={statut}>
                    <p className="font-mono text-xl tabular text-ink-900">{count}</p>
                    <p className="text-xs text-ink-500">{statut.replaceAll('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          {kpisParCommercial && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
                Par commercial
              </h2>
              <Panel>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-paper-200 text-left text-xs text-ink-500">
                      <th className="px-4 py-2 font-medium">Commercial</th>
                      <th className="px-4 py-2 text-right font-medium">Devis</th>
                      <th className="px-4 py-2 text-right font-medium">CA gagné</th>
                      <th className="px-4 py-2 text-right font-medium">Taux transfo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpisParCommercial.map((row) => (
                      <tr key={row.commercial} className="border-b border-paper-200 last:border-0">
                        <td className="px-4 py-2 font-medium text-ink-900">{row.commercial}</td>
                        <td className="px-4 py-2 text-right font-mono tabular text-ink-800">{row.total}</td>
                        <td className="px-4 py-2 text-right font-mono tabular text-ink-800">
                          {formatCurrency(row.caGagne)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono tabular text-ink-800">
                          {formatPercent(row.tauxTransformation)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </section>
          )}
        </>
      )}
    </div>
  )
}

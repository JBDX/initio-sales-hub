import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Portefeuille, StatutMfa } from '../types/database'
import { EmptyState, ErrorNote, KpiCard, PageHeader, Panel, Select, Spinner } from '../components/ui'
import { PortefeuilleBadge, StatutMfaBadge } from '../components/StatusBadge'

const STATUTS: StatutMfa[] = [
  'Devis_a_faire',
  'Devis_envoye',
  'Devis_valide',
  'Deja_en_place',
  'En_attente_info',
  'Pas_de_tenant',
  'A_ne_pas_faire',
  'Non_audite',
]
const PORTEFEUILLES: Portefeuille[] = ['JT', 'MK', 'Hors_contrat', 'Autre']

export function Mfa() {
  const [portefeuilleFilter, setPortefeuilleFilter] = useState('tous')
  const [statutFilter, setStatutFilter] = useState('tous')

  const campagnesQuery = useQuery({
    queryKey: ['campagnes-mfa', portefeuilleFilter, statutFilter],
    queryFn: async () => {
      let query = supabase.from('campagnes_mfa').select('*').order('societe')
      if (portefeuilleFilter !== 'tous') query = query.eq('portefeuille', portefeuilleFilter)
      if (statutFilter !== 'tous') query = query.eq('statut_mfa', statutFilter)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })

  const counters = useMemo(() => {
    const data = campagnesQuery.data ?? []
    const devisValide = data.filter((c) => c.statut_mfa === 'Devis_valide').length
    const dejaEnPlace = data.filter((c) => c.statut_mfa === 'Deja_en_place').length
    const aFaire = data.filter((c) => c.statut_mfa === 'Devis_a_faire').length
    const usersSansAuth = data.reduce((sum, c) => sum + (c.nb_users_sans_auth ?? 0), 0)
    return { total: data.length, devisValide, dejaEnPlace, aFaire, usersSansAuth }
  }, [campagnesQuery.data])

  return (
    <div>
      <PageHeader title="Campagne MFA" subtitle="Suivi de la campagne de déploiement du MFA M365 par portefeuille." />

      <div className="mb-6 grid grid-cols-4 gap-4">
        <KpiCard label="Sociétés suivies" value={counters.total} accent="teal" />
        <KpiCard label="Devis validés" value={counters.devisValide} accent="blue" />
        <KpiCard label="Déjà en place" value={counters.dejaEnPlace} accent="teal" />
        <KpiCard label="Utilisateurs sans MFA" value={counters.usersSansAuth} accent="amber" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-ink-500">Portefeuille</label>
          <Select value={portefeuilleFilter} onChange={(e) => setPortefeuilleFilter(e.target.value)}>
            <option value="tous">Tous</option>
            {PORTEFEUILLES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-ink-500">Statut</label>
          <Select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
            <option value="tous">Tous</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {campagnesQuery.isLoading && <Spinner />}
      {campagnesQuery.isError && <ErrorNote message={(campagnesQuery.error as Error).message} />}
      {campagnesQuery.data && campagnesQuery.data.length === 0 && (
        <EmptyState
          title="Aucune campagne MFA enregistrée"
          hint="Les sociétés suivies apparaîtront ici une fois la migration terminée."
        />
      )}

      {campagnesQuery.data && campagnesQuery.data.length > 0 && (
        <Panel>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-paper-200 text-left text-xs text-ink-500">
                <th className="px-4 py-2 font-medium">Société</th>
                <th className="px-4 py-2 font-medium">Portefeuille</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 text-right font-medium">Users licenciés</th>
                <th className="px-4 py-2 text-right font-medium">Users sans MFA</th>
                <th className="px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {campagnesQuery.data.map((c) => (
                <tr key={c.id} className="border-b border-paper-200 last:border-0 hover:bg-paper-50">
                  <td className="px-4 py-2 font-medium text-ink-900">{c.societe}</td>
                  <td className="px-4 py-2">
                    <PortefeuilleBadge value={c.portefeuille} />
                  </td>
                  <td className="px-4 py-2">
                    <StatutMfaBadge value={c.statut_mfa} />
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular text-ink-800">
                    {c.nb_users_licencies ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular text-ink-800">
                    {c.nb_users_sans_auth ?? '—'}
                  </td>
                  <td className="max-w-xs truncate px-4 py-2 text-ink-600">{c.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  )
}

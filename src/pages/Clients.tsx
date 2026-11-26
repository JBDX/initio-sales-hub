import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Portefeuille, PrioriteAppel, StatutCommercial } from '../types/database'
import { EmptyState, ErrorNote, PageHeader, Panel, Select, Spinner } from '../components/ui'
import { PortefeuilleBadge, PrioriteBadge, StatutCommercialBadge } from '../components/StatusBadge'

const STATUTS: StatutCommercial[] = [
  'A_relancer',
  'Actif',
  'Dormant',
  'Point_sensible',
  'RAS',
  'A_verifier',
  'Plus_de_contrat',
]
const PRIORITES: PrioriteAppel[] = ['Haute', 'Moyenne', 'Basse', 'Aucune']
const PORTEFEUILLES: Portefeuille[] = ['JT', 'MK', 'Hors_contrat', 'Autre']

export function Clients() {
  const [statutFilter, setStatutFilter] = useState('tous')
  const [prioriteFilter, setPrioriteFilter] = useState('toutes')
  const [portefeuilleFilter, setPortefeuilleFilter] = useState('tous')

  const clientsQuery = useQuery({
    queryKey: ['clients', statutFilter, prioriteFilter, portefeuilleFilter],
    queryFn: async () => {
      let query = supabase.from('clients').select('*').order('nom')
      if (statutFilter !== 'tous') query = query.eq('statut_commercial', statutFilter)
      if (prioriteFilter !== 'toutes') query = query.eq('priorite_appel', prioriteFilter)
      if (portefeuilleFilter !== 'tous') query = query.eq('portefeuille', portefeuilleFilter)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <PageHeader title="Clients" subtitle="Portefeuille clients filtrable par statut, priorité et portefeuille." />

      <div className="mb-6 flex flex-wrap items-center gap-4">
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
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-ink-500">Priorité</label>
          <Select value={prioriteFilter} onChange={(e) => setPrioriteFilter(e.target.value)}>
            <option value="toutes">Toutes</option>
            {PRIORITES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
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
      </div>

      {clientsQuery.isLoading && <Spinner />}
      {clientsQuery.isError && <ErrorNote message={(clientsQuery.error as Error).message} />}
      {clientsQuery.data && clientsQuery.data.length === 0 && (
        <EmptyState
          title="Aucun client ne correspond à ces filtres"
          hint="Ajustez les filtres, ou attendez la migration des données existantes."
        />
      )}

      {clientsQuery.data && clientsQuery.data.length > 0 && (
        <Panel>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-paper-200 text-left text-xs text-ink-500">
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Portefeuille</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Priorité</th>
                <th className="px-4 py-2 font-medium">Contact</th>
                <th className="px-4 py-2 font-medium">Prochaine action</th>
              </tr>
            </thead>
            <tbody>
              {clientsQuery.data.map((client) => (
                <tr key={client.id} className="border-b border-paper-200 last:border-0 hover:bg-paper-50">
                  <td className="px-4 py-2 font-medium text-ink-900">
                    <Link to={`/clients/${client.id}`} className="hover:underline">
                      {client.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <PortefeuilleBadge value={client.portefeuille} />
                  </td>
                  <td className="px-4 py-2">
                    {client.statut_commercial && <StatutCommercialBadge value={client.statut_commercial} />}
                  </td>
                  <td className="px-4 py-2">
                    {client.priorite_appel && <PrioriteBadge value={client.priorite_appel} />}
                  </td>
                  <td className="px-4 py-2 text-ink-700">{client.contact ?? '—'}</td>
                  <td className="max-w-xs truncate px-4 py-2 text-ink-700">
                    {client.prochaine_action ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  )
}

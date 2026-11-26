import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Devis, StatutDevis } from '../types/database'
import { PageHeader, Panel, EmptyState, Spinner, ErrorNote, Select, formatCurrency, formatDate } from '../components/ui'
import { StatutDevisBadge, UrgenceBadge, StatutCommercialBadge, PrioriteBadge } from '../components/StatusBadge'

const STATUTS_ACTIONNABLES: StatutDevis[] = ['A_faire', 'En_attente_infos', 'Envoye', 'Relance']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function useDevisAFaire() {
  return useQuery({
    queryKey: ['devis-du-jour'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devis')
        .select('*, client:clients(id, nom, portefeuille)')
        .or(
          `statut.in.(A_faire,En_attente_infos),urgence.eq.Urgent_Bloquant`,
        )
        .order('date_demande', { ascending: true })
      if (error) throw error
      return data as Devis[]
    },
  })
}

function useClientsARappeler() {
  return useQuery({
    queryKey: ['clients-a-rappeler'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .lte('date_rappel', todayIso())
        .not('date_rappel', 'is', null)
        .order('date_rappel', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function MaJournee() {
  const devisQuery = useDevisAFaire()
  const clientsQuery = useClientsARappeler()
  const queryClient = useQueryClient()

  const updateStatutMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: StatutDevis }) => {
      const { error } = await supabase.from('devis').update({ statut }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['devis-du-jour'] })
      void queryClient.invalidateQueries({ queryKey: ['devis'] })
    },
  })

  return (
    <div>
      <PageHeader
        title="Ma journée"
        subtitle="Devis urgents ou en attente de traitement, et clients à rappeler aujourd'hui."
      />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
          Devis à traiter
        </h2>
        {devisQuery.isLoading && <Spinner />}
        {devisQuery.isError && <ErrorNote message={(devisQuery.error as Error).message} />}
        {devisQuery.data && devisQuery.data.length === 0 && (
          <EmptyState
            title="Aucun devis urgent ou en attente"
            hint="Les devis A_faire, En_attente_infos ou Urgent_Bloquant apparaîtront ici."
          />
        )}
        {devisQuery.data && devisQuery.data.length > 0 && (
          <Panel>
            <ul className="divide-y divide-paper-200">
              {devisQuery.data.map((devis) => (
                <li key={devis.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {devis.client?.nom ?? 'Client non lié'}
                      </p>
                      <StatutDevisBadge value={devis.statut} />
                      {devis.urgence && <UrgenceBadge value={devis.urgence} />}
                    </div>
                    <p className="truncate text-xs text-ink-500">
                      {devis.objet ?? 'Sans objet'} · {formatCurrency(devis.montant_ht)}
                      {devis.numero_ebp ? ` · ${devis.numero_ebp}` : ''}
                    </p>
                  </div>
                  <Select
                    value={devis.statut}
                    onChange={(e) =>
                      updateStatutMutation.mutate({ id: devis.id, statut: e.target.value as StatutDevis })
                    }
                    className="shrink-0"
                  >
                    {STATUTS_ACTIONNABLES.concat(['Gagne', 'Perdu']).map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </Select>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
          Clients à rappeler
        </h2>
        {clientsQuery.isLoading && <Spinner />}
        {clientsQuery.isError && <ErrorNote message={(clientsQuery.error as Error).message} />}
        {clientsQuery.data && clientsQuery.data.length === 0 && (
          <EmptyState
            title="Aucun rappel programmé aujourd'hui"
            hint="Les clients avec une date de rappel passée ou due apparaîtront ici."
          />
        )}
        {clientsQuery.data && clientsQuery.data.length > 0 && (
          <Panel>
            <ul className="divide-y divide-paper-200">
              {clientsQuery.data.map((client) => (
                <li key={client.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-ink-900">{client.nom}</p>
                      {client.statut_commercial && (
                        <StatutCommercialBadge value={client.statut_commercial} />
                      )}
                      {client.priorite_appel && <PrioriteBadge value={client.priorite_appel} />}
                    </div>
                    <p className="truncate text-xs text-ink-500">
                      {client.prochaine_action || 'Pas de prochaine action notée'} · rappel le{' '}
                      {formatDate(client.date_rappel)}
                    </p>
                  </div>
                  {client.telephone && (
                    <a
                      href={`tel:${client.telephone}`}
                      className="shrink-0 rounded-sm border border-paper-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-paper-100"
                    >
                      {client.telephone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </section>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Devis } from '../types/database'
import { EmptyState, ErrorNote, PageHeader, Panel, Spinner, formatCurrency, formatDate } from '../components/ui'
import {
  PortefeuilleBadge,
  PrioriteBadge,
  StatutCommercialBadge,
  StatutDevisBadge,
  StatutMfaBadge,
} from '../components/StatusBadge'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()

  const clientQuery = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    enabled: Boolean(id),
  })

  const devisQuery = useQuery({
    queryKey: ['client-devis', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devis')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Devis[]
    },
    enabled: Boolean(id),
  })

  if (clientQuery.isLoading) return <Spinner />
  if (clientQuery.isError) return <ErrorNote message={(clientQuery.error as Error).message} />
  if (!clientQuery.data) return <EmptyState title="Client introuvable" />

  const client = clientQuery.data

  return (
    <div>
      <Link to="/clients" className="mb-4 inline-block text-xs text-ink-500 hover:underline">
        ← Retour aux clients
      </Link>
      <PageHeader title={client.nom} subtitle="Fiche client 360°" />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Panel className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Informations générales</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-ink-500">Portefeuille</dt>
              <dd><PortefeuilleBadge value={client.portefeuille} /></dd>
              <dt className="text-ink-500">Commercial référent</dt>
              <dd className="text-ink-800">{client.commercial_referent}</dd>
              <dt className="text-ink-500">Statut</dt>
              <dd>{client.statut_commercial && <StatutCommercialBadge value={client.statut_commercial} />}</dd>
              <dt className="text-ink-500">Priorité d'appel</dt>
              <dd>{client.priorite_appel && <PrioriteBadge value={client.priorite_appel} />}</dd>
              <dt className="text-ink-500">Contact</dt>
              <dd className="text-ink-800">{client.contact ?? '—'}</dd>
              <dt className="text-ink-500">Téléphone</dt>
              <dd className="text-ink-800">{client.telephone ?? '—'}</dd>
              <dt className="text-ink-500">Email</dt>
              <dd className="text-ink-800">{client.email ?? '—'}</dd>
              <dt className="text-ink-500">Heures contrat</dt>
              <dd className="text-ink-800">{client.heures_contrat ?? '—'}</dd>
              <dt className="text-ink-500">Prochaine action</dt>
              <dd className="text-ink-800">{client.prochaine_action ?? '—'}</dd>
              <dt className="text-ink-500">Date de rappel</dt>
              <dd className="text-ink-800">{formatDate(client.date_rappel)}</dd>
            </dl>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Infrastructure</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-ink-500">Parc OCS</dt>
              <dd className="text-ink-800">{client.parc_ocs ?? '—'}</dd>
              <dt className="text-ink-500">Serveur</dt>
              <dd className="text-ink-800">{client.serveur ?? '—'}</dd>
              <dt className="text-ink-500">Agent DW</dt>
              <dd className="text-ink-800">{client.dw_agent === null ? '—' : client.dw_agent ? 'Oui' : 'Non'}</dd>
              <dt className="text-ink-500">Migration SharePoint</dt>
              <dd className="text-ink-800">{client.migration_sharepoint ?? '—'}</dd>
              <dt className="text-ink-500">MFA M365</dt>
              <dd className="text-ink-800">{client.mfa_m365 ?? '—'}</dd>
              <dt className="text-ink-500">Statut MFA</dt>
              <dd>{client.statut_mfa && <StatutMfaBadge value={client.statut_mfa} />}</dd>
            </dl>
          </Panel>

          {client.notes_historiques && (
            <Panel className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-ink-900">Notes & historique</h2>
              <p className="whitespace-pre-wrap text-sm text-ink-700">{client.notes_historiques}</p>
            </Panel>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Devis liés</h2>
          {devisQuery.isLoading && <Spinner />}
          {devisQuery.isError && <ErrorNote message={(devisQuery.error as Error).message} />}
          {devisQuery.data && devisQuery.data.length === 0 && (
            <EmptyState title="Aucun devis pour ce client" />
          )}
          {devisQuery.data && devisQuery.data.length > 0 && (
            <ul className="flex flex-col gap-2">
              {devisQuery.data.map((devis) => (
                <li key={devis.id}>
                  <Panel className="p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-ink-900">
                        {devis.numero_ebp ?? devis.objet ?? 'Devis'}
                      </span>
                      <StatutDevisBadge value={devis.statut} />
                    </div>
                    <p className="text-xs text-ink-500">
                      {formatCurrency(devis.montant_ht)} · {formatDate(devis.date_demande)}
                    </p>
                  </Panel>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

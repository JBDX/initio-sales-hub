import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Commercial, Devis, StatutDevis, Urgence } from '../types/database'
import {
  Button,
  EmptyState,
  ErrorNote,
  Input,
  PageHeader,
  Panel,
  Select,
  Spinner,
  TextArea,
  formatCurrency,
  formatDate,
  formatPercent,
} from '../components/ui'
import { StatutDevisBadge, UrgenceBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'

const STATUTS: StatutDevis[] = ['A_faire', 'En_attente_infos', 'Envoye', 'Relance', 'Gagne', 'Perdu']
const COMMERCIAUX: Commercial[] = ['TD', 'JB', 'MK']
const URGENCES: Urgence[] = ['Urgent_Bloquant', 'Normal', 'Projet']

function useDevisList(commercialFilter: string) {
  return useQuery({
    queryKey: ['devis', commercialFilter],
    queryFn: async () => {
      let query = supabase
        .from('devis')
        .select('*, client:clients(id, nom, portefeuille)')
        .order('created_at', { ascending: false })
      if (commercialFilter !== 'tous') {
        query = query.eq('commercial', commercialFilter)
      }
      const { data, error } = await query
      if (error) throw error
      return data as Devis[]
    },
  })
}

interface DevisFormState {
  id?: string
  numero_ebp: string
  commercial: Commercial
  client_id: string
  objet: string
  montant_ht: string
  cout_achat_ht: string
  statut: StatutDevis
  urgence: Urgence
  date_demande: string
  prochaine_action: string
  remarques: string
}

function emptyForm(defaultCommercial: Commercial): DevisFormState {
  return {
    numero_ebp: '',
    commercial: defaultCommercial,
    client_id: '',
    objet: '',
    montant_ht: '',
    cout_achat_ht: '',
    statut: 'A_faire',
    urgence: 'Normal',
    date_demande: new Date().toISOString().slice(0, 10),
    prochaine_action: '',
    remarques: '',
  }
}

export function PipelineDevis() {
  const { profil } = useAuth()
  const [commercialFilter, setCommercialFilter] = useState('tous')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<DevisFormState>(() => emptyForm(profil?.commercial ?? 'TD'))

  const devisQuery = useDevisList(commercialFilter)
  const clientsQuery = useQuery({
    queryKey: ['clients-options'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('id, nom').order('nom')
      if (error) throw error
      return data
    },
  })

  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (values: DevisFormState) => {
      const payload = {
        numero_ebp: values.numero_ebp || null,
        commercial: values.commercial,
        client_id: values.client_id || null,
        objet: values.objet || null,
        montant_ht: values.montant_ht ? Number(values.montant_ht) : null,
        cout_achat_ht: values.cout_achat_ht ? Number(values.cout_achat_ht) : null,
        statut: values.statut,
        urgence: values.urgence,
        date_demande: values.date_demande || null,
        prochaine_action: values.prochaine_action || null,
        remarques: values.remarques || null,
      }
      if (values.id) {
        const { error } = await supabase.from('devis').update(payload).eq('id', values.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('devis').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['devis'] })
      void queryClient.invalidateQueries({ queryKey: ['devis-du-jour'] })
      setFormOpen(false)
      setForm(emptyForm(profil?.commercial ?? 'TD'))
    },
  })

  const grouped = useMemo(() => {
    const byStatus = new Map<StatutDevis, Devis[]>()
    STATUTS.forEach((s) => byStatus.set(s, []))
    for (const devis of devisQuery.data ?? []) {
      byStatus.get(devis.statut)?.push(devis)
    }
    return byStatus
  }, [devisQuery.data])

  return (
    <div>
      <PageHeader title="Pipeline devis" subtitle="Vue groupée par statut, avec marge et prochaine action." />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-ink-500" htmlFor="filtre-commercial">
            Commercial
          </label>
          <Select
            id="filtre-commercial"
            value={commercialFilter}
            onChange={(e) => setCommercialFilter(e.target.value)}
          >
            <option value="tous">Tous</option>
            {COMMERCIAUX.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="accent"
          onClick={() => {
            setForm(emptyForm(profil?.commercial ?? 'TD'))
            setFormOpen(true)
          }}
        >
          Nouveau devis
        </Button>
      </div>

      {devisQuery.isLoading && <Spinner />}
      {devisQuery.isError && <ErrorNote message={(devisQuery.error as Error).message} />}

      {devisQuery.data && (
        <div className="flex flex-col gap-6">
          {STATUTS.map((statut) => {
            const items = grouped.get(statut) ?? []
            return (
              <section key={statut}>
                <div className="mb-2 flex items-center gap-2">
                  <StatutDevisBadge value={statut} />
                  <span className="text-xs text-ink-500">{items.length} devis</span>
                </div>
                {items.length === 0 ? (
                  <p className="px-1 text-xs text-ink-400">Rien dans ce statut.</p>
                ) : (
                  <Panel>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-paper-200 text-left text-xs text-ink-500">
                          <th className="px-4 py-2 font-medium">Client</th>
                          <th className="px-4 py-2 font-medium">Objet</th>
                          <th className="px-4 py-2 font-medium">Commercial</th>
                          <th className="px-4 py-2 text-right font-medium">Montant HT</th>
                          <th className="px-4 py-2 text-right font-medium">Marge</th>
                          <th className="px-4 py-2 text-right font-medium">Taux marge</th>
                          <th className="px-4 py-2 font-medium">Urgence</th>
                          <th className="px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((devis) => (
                          <tr
                            key={devis.id}
                            className="cursor-pointer border-b border-paper-200 last:border-0 hover:bg-paper-50"
                            onClick={() => {
                              setForm({
                                id: devis.id,
                                numero_ebp: devis.numero_ebp ?? '',
                                commercial: devis.commercial,
                                client_id: devis.client_id ?? '',
                                objet: devis.objet ?? '',
                                montant_ht: devis.montant_ht?.toString() ?? '',
                                cout_achat_ht: devis.cout_achat_ht?.toString() ?? '',
                                statut: devis.statut,
                                urgence: devis.urgence ?? 'Normal',
                                date_demande: devis.date_demande ?? '',
                                prochaine_action: devis.prochaine_action ?? '',
                                remarques: devis.remarques ?? '',
                              })
                              setFormOpen(true)
                            }}
                          >
                            <td className="px-4 py-2 font-medium text-ink-900">
                              {devis.client?.nom ?? '—'}
                            </td>
                            <td className="max-w-xs truncate px-4 py-2 text-ink-700">
                              {devis.objet ?? '—'}
                            </td>
                            <td className="px-4 py-2 text-ink-700">{devis.commercial}</td>
                            <td className="px-4 py-2 text-right font-mono tabular text-ink-900">
                              {formatCurrency(devis.montant_ht)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono tabular text-ink-700">
                              {formatCurrency(devis.marge_ht)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono tabular text-ink-700">
                              {formatPercent(devis.taux_marge)}
                            </td>
                            <td className="px-4 py-2">
                              {devis.urgence && <UrgenceBadge value={devis.urgence} />}
                            </td>
                            <td className="px-4 py-2 text-right text-xs text-ink-400">
                              {formatDate(devis.date_demande)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Panel>
                )}
              </section>
            )
          })}
        </div>
      )}

      {devisQuery.data && devisQuery.data.length === 0 && (
        <EmptyState
          title="Aucun devis pour l'instant"
          hint="Créez votre premier devis avec le bouton ci-dessus, ou attendez la migration des données."
        />
      )}

      {formOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink-950/40 px-4">
          <div className="w-full max-w-lg rounded-sm border border-paper-200 bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-ink-900">
              {form.id ? 'Modifier le devis' : 'Nouveau devis'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate(form)
              }}
              className="grid grid-cols-2 gap-3"
            >
              <label className="col-span-2 text-xs font-medium text-ink-500">
                Client
                <Select
                  required
                  className="mt-1 w-full"
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                >
                  <option value="">Sélectionner…</option>
                  {clientsQuery.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="col-span-2 text-xs font-medium text-ink-500">
                Objet
                <Input
                  className="mt-1 w-full"
                  value={form.objet}
                  onChange={(e) => setForm({ ...form, objet: e.target.value })}
                />
              </label>

              <label className="text-xs font-medium text-ink-500">
                N° EBP
                <Input
                  className="mt-1 w-full"
                  value={form.numero_ebp}
                  onChange={(e) => setForm({ ...form, numero_ebp: e.target.value })}
                />
              </label>

              <label className="text-xs font-medium text-ink-500">
                Commercial
                <Select
                  className="mt-1 w-full"
                  value={form.commercial}
                  onChange={(e) => setForm({ ...form, commercial: e.target.value as Commercial })}
                >
                  {COMMERCIAUX.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="text-xs font-medium text-ink-500">
                Montant HT
                <Input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full"
                  value={form.montant_ht}
                  onChange={(e) => setForm({ ...form, montant_ht: e.target.value })}
                />
              </label>

              <label className="text-xs font-medium text-ink-500">
                Coût d'achat HT
                <Input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full"
                  value={form.cout_achat_ht}
                  onChange={(e) => setForm({ ...form, cout_achat_ht: e.target.value })}
                />
              </label>

              <label className="text-xs font-medium text-ink-500">
                Statut
                <Select
                  className="mt-1 w-full"
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value as StatutDevis })}
                >
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll('_', ' ')}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="text-xs font-medium text-ink-500">
                Urgence
                <Select
                  className="mt-1 w-full"
                  value={form.urgence}
                  onChange={(e) => setForm({ ...form, urgence: e.target.value as Urgence })}
                >
                  {URGENCES.map((u) => (
                    <option key={u} value={u}>
                      {u.replaceAll('_', ' ')}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="text-xs font-medium text-ink-500">
                Date demande
                <Input
                  type="date"
                  className="mt-1 w-full"
                  value={form.date_demande}
                  onChange={(e) => setForm({ ...form, date_demande: e.target.value })}
                />
              </label>

              <label className="col-span-2 text-xs font-medium text-ink-500">
                Prochaine action
                <Input
                  className="mt-1 w-full"
                  value={form.prochaine_action}
                  onChange={(e) => setForm({ ...form, prochaine_action: e.target.value })}
                />
              </label>

              <label className="col-span-2 text-xs font-medium text-ink-500">
                Remarques
                <TextArea
                  rows={3}
                  className="mt-1 w-full"
                  value={form.remarques}
                  onChange={(e) => setForm({ ...form, remarques: e.target.value })}
                />
              </label>

              {saveMutation.isError && (
                <div className="col-span-2">
                  <ErrorNote message={(saveMutation.error as Error).message} />
                </div>
              )}

              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="accent" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

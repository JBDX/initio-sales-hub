import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { EmptyState, ErrorNote, Input, PageHeader, Panel, Spinner, formatCurrency, formatPercent } from '../components/ui'

export function BaseSavoir() {
  const [search, setSearch] = useState('')

  const query = useQuery({
    queryKey: ['base-savoir'],
    queryFn: async () => {
      const { data, error } = await supabase.from('base_savoir').select('*').order('produit')
      if (error) throw error
      return data
    },
  })

  const filtered = (query.data ?? []).filter((item) => {
    if (!search.trim()) return true
    const haystack = `${item.produit} ${item.categorie ?? ''} ${item.fournisseur ?? ''} ${item.reference ?? ''}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  return (
    <div>
      <PageHeader
        title="Base de connaissance"
        subtitle="Catalogue produit interne : prix, marge et équivalences techniques."
      />

      <div className="mb-6">
        <Input
          placeholder="Rechercher par produit, catégorie ou fournisseur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
      </div>

      {query.isLoading && <Spinner />}
      {query.isError && <ErrorNote message={(query.error as Error).message} />}
      {query.data && filtered.length === 0 && (
        <EmptyState
          title="Aucun produit trouvé"
          hint="Essayez un autre terme de recherche, ou attendez l'import du catalogue."
        />
      )}

      {filtered.length > 0 && (
        <Panel>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-paper-200 text-left text-xs text-ink-500">
                <th className="px-4 py-2 font-medium">Produit</th>
                <th className="px-4 py-2 font-medium">Catégorie</th>
                <th className="px-4 py-2 font-medium">Fournisseur</th>
                <th className="px-4 py-2 text-right font-medium">Prix achat HT</th>
                <th className="px-4 py-2 text-right font-medium">Prix vente HT</th>
                <th className="px-4 py-2 text-right font-medium">Taux de marque</th>
                <th className="px-4 py-2 text-right font-medium">Délai</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-paper-200 last:border-0 hover:bg-paper-50">
                  <td className="px-4 py-2 font-medium text-ink-900">{item.produit}</td>
                  <td className="px-4 py-2 text-ink-700">{item.categorie ?? '—'}</td>
                  <td className="px-4 py-2 text-ink-700">{item.fournisseur ?? '—'}</td>
                  <td className="px-4 py-2 text-right font-mono tabular text-ink-800">
                    {formatCurrency(item.prix_achat_ht)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular text-ink-800">
                    {formatCurrency(item.prix_vente_ht)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular text-ink-800">
                    {formatPercent(item.taux_de_marque)}
                  </td>
                  <td className="px-4 py-2 text-right text-ink-700">
                    {item.delai_jours !== null ? `${item.delai_jours} j` : '—'}
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

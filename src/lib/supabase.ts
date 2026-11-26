import { createClient } from '@supabase/supabase-js'

// Note : les tables sont typees manuellement dans src/types/database.ts et
// appliquees au cas par cas sur chaque requete (via des annotations/casts),
// plutot que via le generique `Database` de createClient. Le schema evolue
// encore cote Supabase (migration en cours dans un autre agent) et le
// generique strict de supabase-js est tres sensible au moindre ecart de
// forme (Insert/Update/Relationships), ce qui causait des erreurs de type
// en cascade peu utiles ici.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // En developpement cela signale un .env manquant plutot que d'echouer
  // silencieusement sur chaque requete.
  console.error(
    'Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. ' +
      'Copiez .env.example vers .env et renseignez vos identifiants Supabase.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

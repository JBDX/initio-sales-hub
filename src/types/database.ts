// Types TypeScript correspondant au schema Postgres Supabase du projet
// "initio-sales-hub" (project_id=eseznvssxxgjwbljpfpk).
// Ecrits a la main a partir du schema fourni (pas de generation automatique
// disponible dans cet environnement hors-ligne).

export type Commercial = 'TD' | 'JB' | 'MK'
export type Portefeuille = 'JT' | 'MK' | 'Hors_contrat' | 'Autre'
export type Role = 'commercial' | 'manager'

export type StatutCommercial =
  | 'A_relancer'
  | 'Actif'
  | 'Dormant'
  | 'Point_sensible'
  | 'RAS'
  | 'A_verifier'
  | 'Plus_de_contrat'

export type PrioriteAppel = 'Haute' | 'Moyenne' | 'Basse' | 'Aucune'

export type StatutDevis =
  | 'A_faire'
  | 'En_attente_infos'
  | 'Envoye'
  | 'Relance'
  | 'Gagne'
  | 'Perdu'

export type Urgence = 'Urgent_Bloquant' | 'Normal' | 'Projet'

export type MotifPerte =
  | 'Budget'
  | 'Trop_cher'
  | 'Besoin_abandonne'
  | 'Concurrence'
  | 'Info_technique'
  | 'Sans_reponse'
  | 'Autre'

export type StatutQualification =
  | 'Devis_a_faire'
  | 'En_cours_chiffrage'
  | 'Transfere'
  | 'Annule'

export type StatutMfa =
  | 'Devis_a_faire'
  | 'Devis_envoye'
  | 'Devis_valide'
  | 'Deja_en_place'
  | 'En_attente_info'
  | 'Pas_de_tenant'
  | 'A_ne_pas_faire'
  | 'Non_audite'

export interface Profil {
  user_id: string
  commercial: Commercial | null
  role: Role
  nom_affiche: string | null
}

export interface Parametres {
  delai_relance_1: number
  delai_relance_2: number
  delai_relance_infos: number
  objectif_ca_mensuel: number | null
}

export interface Client {
  id: string
  nom: string
  portefeuille: Portefeuille
  commercial_referent: Commercial
  heures_contrat: number | null
  compte: string | null
  statut_commercial: StatutCommercial | null
  priorite_appel: PrioriteAppel | null
  contact: string | null
  telephone: string | null
  email: string | null
  parc_ocs: string | null
  serveur: string | null
  dw_agent: boolean | null
  migration_sharepoint: string | null
  mfa_m365: string | null
  type_appel: string | null
  prochaine_action: string | null
  date_rappel: string | null
  notes_historiques: string | null
  statut_mfa: StatutMfa | null
  created_at: string
  updated_at: string
}

export interface Devis {
  id: string
  numero_ebp: string | null
  commercial: Commercial
  client_id: string | null
  contact_telephone: string | null
  objet: string | null
  montant_ht: number | null
  cout_achat_ht: number | null
  marge_ht: number | null
  taux_marge: number | null
  date_demande: string | null
  date_envoi: string | null
  statut: StatutDevis
  urgence: Urgence | null
  motif_perte: MotifPerte | null
  remarques: string | null
  prochaine_action: string | null
  qualification_id: string | null
  created_at: string
  updated_at: string
  // Jointure optionnelle
  client?: Pick<Client, 'id' | 'nom' | 'portefeuille'> | null
}

export interface Qualification {
  id: string
  commercial: Commercial
  client_nom: string | null
  interlocuteur: string | null
  contact: string | null
  objet: string | null
  infos_parc: string | null
  cloud_securite: string | null
  urgence_delai: string | null
  budget_contrainte: string | null
  notes_projet: string | null
  statut: StatutQualification
  devis_id: string | null
}

export interface CampagneMfa {
  id: string
  societe: string
  portefeuille: Portefeuille
  statut_mfa: StatutMfa
  nb_users_licencies: number | null
  nb_users_sans_auth: number | null
  notes: string | null
  client_id: string | null
}

export interface BaremeMfa {
  seuil_users_sans_auth: number
  duree_presta_jours: number | null
  tarif_estime: number | null
}

export interface BaseSavoir {
  id: string
  categorie: string | null
  reference: string | null
  produit: string
  description: string | null
  fournisseur: string | null
  prix_achat_ht: number | null
  prix_vente_ht: number | null
  taux_de_marque: number | null
  delai_jours: number | null
  equivalences: string | null
  notes_techniques: string | null
  updated_at: string
  updated_by: string | null
}

export interface CarnetApprentissage {
  id: string
  commercial: Commercial
  date_entree: string
  contexte: string | null
  apprentissage: string | null
  type: string | null
  source: string | null
  a_verifier_chef: boolean | null
}

export interface RevueHebdomadaire {
  id: string
  semaine_du: string
  apprentissage: string | null
  succes: string | null
  amelioration_suivante: string | null
}

export interface Database {
  public: {
    Tables: {
      profils: { Row: Profil; Insert: Partial<Profil>; Update: Partial<Profil> }
      parametres: { Row: Parametres; Insert: Partial<Parametres>; Update: Partial<Parametres> }
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> }
      devis: { Row: Devis; Insert: Partial<Devis>; Update: Partial<Devis> }
      qualifications: {
        Row: Qualification
        Insert: Partial<Qualification>
        Update: Partial<Qualification>
      }
      campagnes_mfa: {
        Row: CampagneMfa
        Insert: Partial<CampagneMfa>
        Update: Partial<CampagneMfa>
      }
      bareme_mfa: { Row: BaremeMfa; Insert: Partial<BaremeMfa>; Update: Partial<BaremeMfa> }
      base_savoir: { Row: BaseSavoir; Insert: Partial<BaseSavoir>; Update: Partial<BaseSavoir> }
      carnet_apprentissage: {
        Row: CarnetApprentissage
        Insert: Partial<CarnetApprentissage>
        Update: Partial<CarnetApprentissage>
      }
      revues_hebdomadaires: {
        Row: RevueHebdomadaire
        Insert: Partial<RevueHebdomadaire>
        Update: Partial<RevueHebdomadaire>
      }
    }
  }
}

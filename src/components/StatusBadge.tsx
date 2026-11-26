// Systeme de badges de statut : chaque badge associe une paire
// couleur de fond / texte desaturee a une valeur d'enum metier.
// L'esprit reprend la legende Excel (blanc = a remplir, gris = auto)
// mais exprime comme un vrai design system coherent.

type Tone = 'neutral' | 'amber' | 'orange' | 'blue' | 'green' | 'red' | 'teal'

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-paper-200 text-ink-700 border-paper-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-100',
  orange: 'bg-orange-100 text-orange-700 border-orange-100',
  blue: 'bg-blue-100 text-blue-700 border-blue-100',
  green: 'bg-green-100 text-green-700 border-green-100',
  red: 'bg-red-100 text-red-700 border-red-100',
  teal: 'bg-teal-100 text-teal-700 border-teal-100',
}

const STATUT_DEVIS_TONE: Record<string, Tone> = {
  A_faire: 'neutral',
  En_attente_infos: 'amber',
  Envoye: 'blue',
  Relance: 'orange',
  Gagne: 'green',
  Perdu: 'red',
}

const STATUT_COMMERCIAL_TONE: Record<string, Tone> = {
  A_relancer: 'orange',
  Actif: 'green',
  Dormant: 'neutral',
  Point_sensible: 'red',
  RAS: 'teal',
  A_verifier: 'amber',
  Plus_de_contrat: 'neutral',
}

const PRIORITE_TONE: Record<string, Tone> = {
  Haute: 'red',
  Moyenne: 'amber',
  Basse: 'teal',
  Aucune: 'neutral',
}

const URGENCE_TONE: Record<string, Tone> = {
  Urgent_Bloquant: 'red',
  Normal: 'teal',
  Projet: 'blue',
}

const STATUT_MFA_TONE: Record<string, Tone> = {
  Devis_a_faire: 'neutral',
  Devis_envoye: 'blue',
  Devis_valide: 'green',
  Deja_en_place: 'teal',
  En_attente_info: 'amber',
  Pas_de_tenant: 'neutral',
  A_ne_pas_faire: 'red',
  Non_audite: 'neutral',
}

const STATUT_QUALIF_TONE: Record<string, Tone> = {
  Devis_a_faire: 'neutral',
  En_cours_chiffrage: 'blue',
  Transfere: 'green',
  Annule: 'red',
}

function label(value: string) {
  return value.replaceAll('_', ' ')
}

function Badge({ value, tone }: { value: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium leading-5 ${TONE_CLASSES[tone]}`}
    >
      {label(value)}
    </span>
  )
}

export function StatutDevisBadge({ value }: { value: string }) {
  return <Badge value={value} tone={STATUT_DEVIS_TONE[value] ?? 'neutral'} />
}

export function StatutCommercialBadge({ value }: { value: string }) {
  return <Badge value={value} tone={STATUT_COMMERCIAL_TONE[value] ?? 'neutral'} />
}

export function PrioriteBadge({ value }: { value: string }) {
  return <Badge value={value} tone={PRIORITE_TONE[value] ?? 'neutral'} />
}

export function UrgenceBadge({ value }: { value: string }) {
  return <Badge value={value} tone={URGENCE_TONE[value] ?? 'neutral'} />
}

export function StatutMfaBadge({ value }: { value: string }) {
  return <Badge value={value} tone={STATUT_MFA_TONE[value] ?? 'neutral'} />
}

export function StatutQualificationBadge({ value }: { value: string }) {
  return <Badge value={value} tone={STATUT_QUALIF_TONE[value] ?? 'neutral'} />
}

export function PortefeuilleBadge({ value }: { value: string }) {
  const tone: Tone = value === 'JT' ? 'teal' : value === 'MK' ? 'blue' : 'neutral'
  return <Badge value={value} tone={tone} />
}

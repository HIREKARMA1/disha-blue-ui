import {
  MINIMAL_CLASSIC_BUILDER_VARIANT,
  isMinimalClassicResumeContent,
  type MinimalClassicModel,
  type MinimalClassicResumeContent,
} from "@/lib/minimalClassicResume"

export const MARCELINE_BUILDER_VARIANT = "marceline-single-v1" as const
export const MORGAN_BUILDER_VARIANT = "morgan-blocks-v1" as const
export const DANI_BUILDER_VARIANT = "dani-sidebar-v1" as const

export const STRUCTURED_LAYOUT_KEYS = [
  MINIMAL_CLASSIC_BUILDER_VARIANT,
  MARCELINE_BUILDER_VARIANT,
  MORGAN_BUILDER_VARIANT,
  DANI_BUILDER_VARIANT,
] as const

export type StructuredLayoutKey = (typeof STRUCTURED_LAYOUT_KEYS)[number]

export function isStructuredLayoutKey(value: string | null | undefined): value is StructuredLayoutKey {
  return !!value && (STRUCTURED_LAYOUT_KEYS as readonly string[]).includes(value)
}

/** Marceline-style single column (profile, experience, education, skill groups, achievements). */
export type MarcelineExperienceRow = {
  id: string
  role: string
  company: string
  dates: string
  bullets: string[]
}

export type MarcelineEducationRow = {
  id: string
  degree: string
  institutionYear: string
}

export type MarcelineSkillGroup = {
  id: string
  label: string
  itemsLine: string
}

export type MarcelineAchievement = {
  id: string
  text: string
}

export type MarcelineModel = {
  personalInfo: {
    fullName: string
    jobTitle: string
    addressLine: string
    phone: string
    email: string
  }
  profileSummary: string
  experience: MarcelineExperienceRow[]
  education: MarcelineEducationRow[]
  skillGroups: MarcelineSkillGroup[]
  achievements: MarcelineAchievement[]
}

export type MarcelineResumeContent = {
  builderVariant: typeof MARCELINE_BUILDER_VARIANT
  marcelineSingle: MarcelineModel
}

export function isMarcelineResumeContent(value: unknown): value is MarcelineResumeContent {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    v.builderVariant === MARCELINE_BUILDER_VARIANT &&
    v.marcelineSingle !== null &&
    typeof v.marcelineSingle === "object"
  )
}

export type MorganContactIcon = "phone" | "location" | "email" | "web" | "linkedin"

export type MorganContactRow = {
  id: string
  icon: MorganContactIcon
  text: string
}

export type MorganEducationEntry = {
  id: string
  institution: string
  degreeDatesLine: string
  bullets: string[]
}

export type MorganExperienceEntry = {
  id: string
  title: string
  companyDatesLine: string
  bullets: string[]
}

export type MorganReference = {
  id: string
  name: string
  titleCompany: string
  phone: string
  email: string
}

export type MorganModel = {
  personalInfo: {
    fullName: string
    jobTitle: string
    photoUrl: string
  }
  contacts: MorganContactRow[]
  summary: string
  expertise: string
  education: MorganEducationEntry[]
  experience: MorganExperienceEntry[]
  references: MorganReference[]
}

export type MorganResumeContent = {
  builderVariant: typeof MORGAN_BUILDER_VARIANT
  morganBlocks: MorganModel
}

export function isMorganResumeContent(value: unknown): value is MorganResumeContent {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return v.builderVariant === MORGAN_BUILDER_VARIANT && v.morganBlocks !== null && typeof v.morganBlocks === "object"
}

export type DaniContactIcon = "phone" | "email" | "location" | "web"

export type DaniContactRow = {
  id: string
  icon: DaniContactIcon
  text: string
}

export type DaniEducationSidebar = {
  id: string
  level: string
  schoolYearsLine: string
}

export type DaniExperienceRow = {
  id: string
  title: string
  company: string
  dates: string
  bullets: string[]
}

export type DaniModel = {
  personalInfo: {
    fullName: string
    jobTitle: string
  }
  sidebar: {
    photoUrl: string
    contacts: DaniContactRow[]
    skills: string[]
    education: DaniEducationSidebar[]
  }
  profileSummary: string
  experience: DaniExperienceRow[]
}

export type DaniResumeContent = {
  builderVariant: typeof DANI_BUILDER_VARIANT
  daniSidebar: DaniModel
}

export function isDaniResumeContent(value: unknown): value is DaniResumeContent {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return v.builderVariant === DANI_BUILDER_VARIANT && v.daniSidebar !== null && typeof v.daniSidebar === "object"
}

export type DesignerVariantResumeContent = MarcelineResumeContent | MorganResumeContent | DaniResumeContent

export function isDesignerVariantResumeContent(value: unknown): value is DesignerVariantResumeContent {
  return isMarcelineResumeContent(value) || isMorganResumeContent(value) || isDaniResumeContent(value)
}

export function isAnyStructuredResumeContent(
  value: unknown
): value is MinimalClassicResumeContent | DesignerVariantResumeContent {
  return isMinimalClassicResumeContent(value) || isDesignerVariantResumeContent(value)
}

export type StructuredResumeRoute =
  | { layoutKey: typeof MINIMAL_CLASSIC_BUILDER_VARIANT; initialModel: MinimalClassicModel | null }
  | { layoutKey: typeof MARCELINE_BUILDER_VARIANT; initialModel: MarcelineModel | null }
  | { layoutKey: typeof MORGAN_BUILDER_VARIANT; initialModel: MorganModel | null }
  | { layoutKey: typeof DANI_BUILDER_VARIANT; initialModel: DaniModel | null }

export function parseStoredContentToStructuredRoute(content: unknown): StructuredResumeRoute | null {
  if (isMinimalClassicResumeContent(content)) {
    return { layoutKey: MINIMAL_CLASSIC_BUILDER_VARIANT, initialModel: content.minimalClassic }
  }
  if (isMarcelineResumeContent(content)) {
    return { layoutKey: MARCELINE_BUILDER_VARIANT, initialModel: content.marcelineSingle }
  }
  if (isMorganResumeContent(content)) {
    return { layoutKey: MORGAN_BUILDER_VARIANT, initialModel: content.morganBlocks }
  }
  if (isDaniResumeContent(content)) {
    return { layoutKey: DANI_BUILDER_VARIANT, initialModel: content.daniSidebar }
  }
  return null
}

export function emptyStructuredRouteForLayoutKey(layoutKey: StructuredLayoutKey): StructuredResumeRoute {
  switch (layoutKey) {
    case MINIMAL_CLASSIC_BUILDER_VARIANT:
      return { layoutKey, initialModel: null }
    case MARCELINE_BUILDER_VARIANT:
      return { layoutKey, initialModel: null }
    case MORGAN_BUILDER_VARIANT:
      return { layoutKey, initialModel: null }
    case DANI_BUILDER_VARIANT:
      return { layoutKey, initialModel: null }
  }
}

export function structuredLayoutKeyFromMeta(meta: {
  layoutKey?: string
  structure?: Record<string, unknown>
} | null): StructuredLayoutKey | null {
  if (!meta) return null
  const lk =
    (typeof meta.layoutKey === "string" && meta.layoutKey) ||
    (meta.structure && typeof meta.structure.layoutKey === "string" ? meta.structure.layoutKey : null)
  return isStructuredLayoutKey(lk) ? lk : null
}

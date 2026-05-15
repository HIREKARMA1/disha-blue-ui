import type { SupportedLocale } from './types'

import enCommon from '@/locales/en/common.json'
import enAuth from '@/locales/en/auth.json'
import enDashboard from '@/locales/en/dashboard.json'
import enRoles from '@/locales/en/roles.json'
import enResumeAI from '@/locales/en/resumeAI.json'
import enLanding from '@/locales/en/landing.json'
import enSignup from '@/locales/en/signup.json'
import enJobs from '@/locales/en/jobs.json'

import hiCommon from '@/locales/hi/common.json'
import hiAuth from '@/locales/hi/auth.json'
import hiDashboard from '@/locales/hi/dashboard.json'
import hiRoles from '@/locales/hi/roles.json'
import hiResumeAI from '@/locales/hi/resumeAI.json'
import hiLanding from '@/locales/hi/landing.json'
import hiSignup from '@/locales/hi/signup.json'
import hiJobs from '@/locales/hi/jobs.json'

import orCommon from '@/locales/or/common.json'
import orAuth from '@/locales/or/auth.json'
import orDashboard from '@/locales/or/dashboard.json'
import orRoles from '@/locales/or/roles.json'
import orResumeAI from '@/locales/or/resumeAI.json'
import orLanding from '@/locales/or/landing.json'
import orSignup from '@/locales/or/signup.json'
import orJobs from '@/locales/or/jobs.json'

type JsonObject = Record<string, unknown>

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge(...sources: JsonObject[]): JsonObject {
  const result: JsonObject = {}
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (isPlainObject(value) && isPlainObject(result[key])) {
        result[key] = deepMerge(result[key] as JsonObject, value)
      } else if (isPlainObject(value)) {
        result[key] = deepMerge({}, value)
      } else {
        result[key] = value
      }
    }
  }
  return result
}

function buildDictionary(
  common: JsonObject,
  auth: JsonObject,
  dashboard: JsonObject,
  roles: JsonObject,
  resumeAI: JsonObject,
  landing: JsonObject,
  signup: JsonObject,
  jobs: JsonObject,
): JsonObject {
  return deepMerge(common, auth, dashboard, roles, resumeAI, landing, signup, jobs)
}

const dictionaries: Record<SupportedLocale, JsonObject> = {
  en: buildDictionary(
    enCommon as JsonObject,
    enAuth as JsonObject,
    enDashboard as JsonObject,
    enRoles as JsonObject,
    enResumeAI as JsonObject,
    enLanding as JsonObject,
    enSignup as JsonObject,
    enJobs as JsonObject,
  ),
  hi: buildDictionary(
    hiCommon as JsonObject,
    hiAuth as JsonObject,
    hiDashboard as JsonObject,
    hiRoles as JsonObject,
    hiResumeAI as JsonObject,
    hiLanding as JsonObject,
    hiSignup as JsonObject,
    hiJobs as JsonObject,
  ),
  or: buildDictionary(
    orCommon as JsonObject,
    orAuth as JsonObject,
    orDashboard as JsonObject,
    orRoles as JsonObject,
    orResumeAI as JsonObject,
    orLanding as JsonObject,
    orSignup as JsonObject,
    orJobs as JsonObject,
  ),
}

export function getDictionary(locale: SupportedLocale): JsonObject {
  return dictionaries[locale]
}

export function getMessage(locale: SupportedLocale, key: string): unknown {
  const parts = key.split('.')
  let value: unknown = dictionaries[locale]

  for (const part of parts) {
    if (isPlainObject(value) && part in value) {
      value = value[part]
    } else {
      value = undefined
      break
    }
  }

  if (value !== undefined) return value

  value = dictionaries.en
  for (const part of parts) {
    if (isPlainObject(value) && part in value) {
      value = value[part]
    } else {
      return undefined
    }
  }
  return value
}

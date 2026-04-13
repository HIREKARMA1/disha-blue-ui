import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface JobDiscoveryPreferencesSnapshot {
  resumeSkills: string[]
  preferredRole: string
  preferredLocations: string[]
  /** True after "Find Jobs" until discover page consumes it */
  fromResumeFlow: boolean
}

type JobDiscoveryPreferencesState = JobDiscoveryPreferencesSnapshot & {
  setJobDiscoveryPreferences: (partial: Partial<JobDiscoveryPreferencesSnapshot>) => void
  consumeResumeFlowIntent: () => void
}

const initial: JobDiscoveryPreferencesSnapshot = {
  resumeSkills: [],
  preferredRole: '',
  preferredLocations: [],
  fromResumeFlow: false,
}

export const useJobDiscoveryPreferencesStore = create<JobDiscoveryPreferencesState>()(
  persist(
    (set) => ({
      ...initial,
      setJobDiscoveryPreferences: (partial) => set((s) => ({ ...s, ...partial })),
      consumeResumeFlowIntent: () => set({ fromResumeFlow: false }),
    }),
    { name: 'disha-job-discovery-preferences' }
  )
)

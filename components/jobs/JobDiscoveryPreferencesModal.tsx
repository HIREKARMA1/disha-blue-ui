"use client"

import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { MapPin, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useJobDiscoveryPreferencesStore } from "@/stores/jobDiscoveryPreferencesStore"
import { profileService } from "@/services/profileService"
import toast from "react-hot-toast"

const LOCATION_PRESETS = ["Remote", "Bengaluru", "Hyderabad", "Mumbai", "Pune", "Delhi NCR"]

export interface JobDiscoveryPreferencesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** After store + optional profile sync (e.g. refresh recommendations) */
  onSaved?: () => void | Promise<void>
}

export function JobDiscoveryPreferencesModal({ open, onOpenChange, onSaved }: JobDiscoveryPreferencesModalProps) {
  const [role, setRole] = useState("")
  const [locations, setLocations] = useState<string[]>([])
  const [locInput, setLocInput] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const s = useJobDiscoveryPreferencesStore.getState()
    setRole(s.preferredRole)
    setLocations([...s.preferredLocations])
    setLocInput("")
  }, [open])

  const addLoc = (raw: string) => {
    const t = raw.trim()
    if (!t) return
    if (locations.some((l) => l.toLowerCase() === t.toLowerCase())) {
      setLocInput("")
      return
    }
    setLocations((prev) => [...prev, t])
    setLocInput("")
  }

  const handleSave = async () => {
    const r = role.trim()
    if (!r) {
      toast.error("Add a preferred role to personalize matches.")
      return
    }
    setSaving(true)
    try {
      useJobDiscoveryPreferencesStore.getState().setJobDiscoveryPreferences({
        preferredRole: r,
        preferredLocations: locations,
        fromResumeFlow: true,
      })
      try {
        const skills = useJobDiscoveryPreferencesStore.getState().resumeSkills
        await profileService.updateProfile({
          job_roles_of_interest: r,
          location_preferences: locations.length ? locations.join(", ") : undefined,
          preferred_job_city: locations[0] || undefined,
          preferred_job_remote: locations.some((l) => /remote/i.test(l)) || undefined,
          technical_skills: skills.length ? skills.join(", ") : undefined,
        })
      } catch {
        // Store is source of truth for the recommend API; profile sync is best-effort.
      }
      onOpenChange(false)
      toast.success("Preferences saved")
      try {
        await onSaved?.()
      } catch (refreshErr) {
        console.error("Post-save refresh:", refreshErr)
      }
    } catch (e) {
      console.error(e)
      toast.error("Could not save preferences. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[140] bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[150] w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2",
            "border border-border bg-card p-6 shadow-lg focus:outline-none dark:bg-black"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              <Dialog.Title className="font-display text-lg font-semibold text-foreground">Edit job preferences</Dialog.Title>
            </div>
            <Dialog.Close className="rounded-none p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            These settings power &quot;Recommended for You&quot; matches. Locations are optional.
          </Dialog.Description>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-primary" htmlFor="modal-pref-role">
                Preferred role
              </label>
              <Input
                id="modal-pref-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 h-11 rounded-none border-border bg-background dark:bg-black"
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Locations</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {LOCATION_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => addLoc(p)}
                    className="rounded-none border border-border bg-muted/40 px-2 py-1 text-xs font-medium hover:bg-primary/10"
                  >
                    + {p}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={locInput}
                  onChange={(e) => setLocInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLoc(locInput)
                    }
                  }}
                  placeholder="City — Enter to add"
                  className="h-11 rounded-none border-border bg-background pl-10 dark:bg-black"
                />
              </div>
              {locations.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <li
                      key={loc}
                      className="inline-flex items-center gap-1 rounded-none border border-primary/30 bg-primary/10 px-2 py-1 text-xs"
                    >
                      {loc}
                      <button type="button" className="p-0.5 hover:text-destructive" onClick={() => setLocations((p) => p.filter((x) => x !== loc))}>
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" className="rounded-none">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" className="rounded-none bg-primary font-semibold text-primary-foreground" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Saving…" : "Save & refresh matches"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

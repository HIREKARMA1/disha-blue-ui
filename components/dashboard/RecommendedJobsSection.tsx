"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { profileService } from "@/services/profileService"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface RecommendedJob {
 id: string
 title: string
 location: string
 city_or_town?: string
 district?: string
 state?: string
 job_type: string
 corporate_name?: string
 company_name?: string
 match_score?: number
 match_reasons?: string[]
}

export function RecommendedJobsSection() {
 const [jobs, setJobs] = useState<RecommendedJob[]>([])
 const [loading, setLoading] = useState(true)
 const [refreshing, setRefreshing] = useState(false)
 const [savingLocation, setSavingLocation] = useState(false)
 const [locationForm, setLocationForm] = useState({
 preferred_job_city:"",
 preferred_job_district:"",
 preferred_job_state:"",
 preferred_job_remote: false,
 open_to_relocation: false,
 })

 const locationLabel = useMemo(() => {
 const parts = [
 locationForm.preferred_job_city,
 locationForm.preferred_job_district,
 locationForm.preferred_job_state,
 ].filter(Boolean)
 return parts.join(",")
 }, [locationForm])

 const loadRecommendations = async (isRefresh = false) => {
 try {
 if (isRefresh) setRefreshing(true)
 else setLoading(true)

 const [profile, response] = await Promise.all([
 profileService.getProfile(),
 apiClient.getStudentRecommendedJobs({ limit: 6, page: 1, include_match_details: true }),
 ])

 setLocationForm({
 preferred_job_city: profile.preferred_job_city ||"",
 preferred_job_district: profile.preferred_job_district ||"",
 preferred_job_state: profile.preferred_job_state ||"",
 preferred_job_remote: Boolean(profile.preferred_job_remote),
 open_to_relocation: Boolean(profile.open_to_relocation),
 })
 setJobs((response?.jobs || []) as RecommendedJob[])
 } catch (error) {
 console.error("Failed to load recommendations", error)
 setJobs([])
 } finally {
 setLoading(false)
 setRefreshing(false)
 }
 }

 useEffect(() => {
 loadRecommendations()
 }, [])

 const saveLocationPreference = async () => {
 try {
 setSavingLocation(true)
 await profileService.updateProfile({
 preferred_job_city: locationForm.preferred_job_city || undefined,
 preferred_job_district: locationForm.preferred_job_district || undefined,
 preferred_job_state: locationForm.preferred_job_state || undefined,
 preferred_job_remote: locationForm.preferred_job_remote,
 open_to_relocation: locationForm.open_to_relocation,
 location_preferences: locationLabel || undefined,
 })
 await loadRecommendations(true)
 toast.success("Location preference saved. Recommendations updated.")
 } catch (error: any) {
 toast.error(error?.message ||"Failed to save location preference")
 } finally {
 setSavingLocation(false)
 }
 }

 return (
 <section className="dashboard-overview-card p-5">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">AI Matched Jobs</p>
 <h3 className="mt-1 font-display text-xl font-semibold text-foreground">Recommended for You</h3>
 <p className="text-sm text-muted-foreground">Based on your profile, resume, and location preferences</p>
 </div>
 <Button
 type="button"variant="outline"className="rounded-xl"onClick={() => loadRecommendations(true)}
 disabled={refreshing}
 >
 <RefreshCw className={cn("mr-2 h-4 w-4", refreshing &&"animate-spin")} />
 Refresh
 </Button>
 </div>

 <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
 <Input
 placeholder="Preferred city"value={locationForm.preferred_job_city}
 onChange={(e) => setLocationForm((p) => ({ ...p, preferred_job_city: e.target.value }))}
 className="md:col-span-1"/>
 <Input
 placeholder="Preferred district"value={locationForm.preferred_job_district}
 onChange={(e) => setLocationForm((p) => ({ ...p, preferred_job_district: e.target.value }))}
 className="md:col-span-1"/>
 <Input
 placeholder="Preferred state"value={locationForm.preferred_job_state}
 onChange={(e) => setLocationForm((p) => ({ ...p, preferred_job_state: e.target.value }))}
 className="md:col-span-1"/>
 <label className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 text-sm">
 <input
 type="checkbox"checked={locationForm.preferred_job_remote}
 onChange={(e) => setLocationForm((p) => ({ ...p, preferred_job_remote: e.target.checked }))}
 />
 Remote
 </label>
 <label className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 text-sm">
 <input
 type="checkbox"checked={locationForm.open_to_relocation}
 onChange={(e) => setLocationForm((p) => ({ ...p, open_to_relocation: e.target.checked }))}
 />
 Open to relocation
 </label>
 </div>
 <div className="mt-3">
 <Button type="button"variant="gradient"className="rounded-xl"onClick={saveLocationPreference} disabled={savingLocation}>
 Save Location Preference
 </Button>
 </div>

 <div className="mt-5 space-y-3">
 {loading ? (
 <p className="text-sm text-muted-foreground">Loading smart matches...</p>
 ) : jobs.length === 0 ? (
 <div className="rounded-xl border border-dashed border-slate-300 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
 Add skills, resume details, and preferred location to unlock stronger recommendations.
 </div>
 ) : (
 jobs.map((job) => (
 <article key={job.id} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h4 className="font-semibold text-foreground">{job.title}</h4>
 <p className="text-sm text-muted-foreground">{job.corporate_name || job.company_name ||"Hiring company"}</p>
 <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
 <MapPin className="h-3.5 w-3.5"/>
 {job.city_or_town || job.district || job.state || job.location ||"Location not specified"}
 </p>
 </div>
 <div className="text-sm font-semibold text-primary">
 {typeof job.match_score ==="number"? `${Math.round(job.match_score)}% match` :"Smart match"}
 </div>
 </div>
 <div className="mt-2 space-y-1">
 {(job.match_reasons || []).slice(0, 2).map((reason, idx) => (
 <p key={idx} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
 <Sparkles className="h-3.5 w-3.5 text-primary"/>
 {reason}
 </p>
 ))}
 </div>
 <div className="mt-3 flex gap-2">
 <Link href="/dashboard/student/jobs"className="inline-flex">
 <Button variant="outline"size="sm"className="rounded-xl">
 View
 </Button>
 </Link>
 <Link href="/dashboard/student/jobs"className="inline-flex">
 <Button variant="gradient"size="sm"className="rounded-xl">
 Apply
 </Button>
 </Link>
 </div>
 </article>
 ))
 )}
 </div>
 </section>
 )
}

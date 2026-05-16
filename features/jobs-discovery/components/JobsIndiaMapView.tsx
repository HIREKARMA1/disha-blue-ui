"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import { Briefcase, Loader2, Map as MapIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Job } from "@/components/jobs/AllJobs"
import {
  groupJobsByLocation,
  type JobLocationCluster,
} from "../utils/indiaGeo"
import { JobsMapSidePanel } from "./JobsMapSidePanel"

import "leaflet/dist/leaflet.css"

const INDIA_CENTER: [number, number] = [22.5937, 78.9629]
const DEFAULT_ZOOM = 5

function createJobMarkerIcon(count: number, selected: boolean) {
  return L.divIcon({
    className: "jobs-map-marker",
    html: `
      <div class="jobs-map-marker-pin ${selected ? "jobs-map-marker-pin--active" : ""}">
        <span class="jobs-map-marker-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path fill="#ffffff" stroke="none" d="M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z"/><path fill="none" d="M8 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path fill="none" d="M9 9h6"/></svg>
        </span>
        <span class="jobs-map-marker-badge">${count}</span>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 52],
  })
}

function MapInstanceCapture({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  return null
}

function FitIndiaBounds({ clusters }: { clusters: JobLocationCluster[] }) {
  const map = useMap()

  useEffect(() => {
    if (clusters.length === 0) {
      map.setView(INDIA_CENTER, DEFAULT_ZOOM)
      return
    }
    if (clusters.length === 1) {
      map.setView([clusters[0].lat, clusters[0].lng], 9, { animate: true })
      return
    }
    const bounds = L.latLngBounds(clusters.map((c) => [c.lat, c.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10, animate: true })
  }, [clusters, map])

  return null
}

type Props = {
  jobs: Job[]
  loading?: boolean
  selectedClusterId: string | null
  onSelectCluster: (cluster: JobLocationCluster | null) => void
  applyingJobId: string | null
  onViewDetails: (job: Job) => void
  onApply: (job: Job) => void
  className?: string
}

export function JobsIndiaMapView({
  jobs,
  loading,
  selectedClusterId,
  onSelectCluster,
  applyingJobId,
  onViewDetails,
  onApply,
  className,
}: Props) {
  const { clusters, unmapped } = useMemo(() => groupJobsByLocation(jobs), [jobs])

  const selectedCluster = useMemo(
    () => clusters.find((c) => c.id === selectedClusterId) ?? null,
    [clusters, selectedClusterId],
  )

  const totalOnMap = clusters.reduce((sum, c) => sum + c.jobs.length, 0)
  const locationCount = clusters.length
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const handleMapReady = useCallback((map: L.Map) => setMapInstance(map), [])
  const panelDismissedRef = useRef(false)
  const clusterSignature = useMemo(() => clusters.map((c) => c.id).sort().join("|"), [clusters])

  useEffect(() => {
    panelDismissedRef.current = false
  }, [clusterSignature])

  useEffect(() => {
    if (loading || clusters.length !== 1 || panelDismissedRef.current) return
    if (!selectedClusterId) {
      onSelectCluster(clusters[0])
    }
  }, [clusters, clusterSignature, loading, onSelectCluster, selectedClusterId])

  const handleSelectCluster = useCallback(
    (cluster: JobLocationCluster | null) => {
      if (cluster) {
        panelDismissedRef.current = false
      }
      onSelectCluster(cluster)
    },
    [onSelectCluster],
  )

  const handleClosePanel = useCallback(() => {
    panelDismissedRef.current = true
    onSelectCluster(null)
  }, [onSelectCluster])

  const showEmptyMap = !loading && jobs.length === 0
  const showNoMarkers = !loading && jobs.length > 0 && clusters.length === 0

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#dde3f5] bg-[#e8eef5] dark:border-blue-900/60 dark:bg-slate-800/50",
          "h-[min(72vh,640px)] min-h-[420px] w-full",
          "lg:h-[calc(100vh-220px)] lg:min-h-[520px] lg:max-h-[720px]",
        )}
      >
        {loading ? (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70 dark:bg-slate-900/70">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : null}

        <MapContainer
          center={INDIA_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInstanceCapture onReady={handleMapReady} />
          <FitIndiaBounds clusters={clusters} />

          {clusters.map((cluster) => (
            <Marker
              key={cluster.id}
              position={[cluster.lat, cluster.lng]}
              icon={createJobMarkerIcon(cluster.jobs.length, selectedClusterId === cluster.id)}
              eventHandlers={{
                click: () => handleSelectCluster(cluster),
              }}
            />
          ))}
        </MapContainer>

        {mapInstance ? (
          <div className="absolute bottom-20 right-3 z-[800] flex flex-col gap-1 lg:bottom-4">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-md hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => mapInstance.zoomIn()}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-md hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => mapInstance.zoomOut()}
              aria-label="Zoom out"
            >
              −
            </button>
          </div>
        ) : null}

        {/* Mobile summary pill */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[800] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 lg:hidden">
          <div className="pointer-events-auto flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <MapIcon className="h-4 w-4 text-primary-600" />
            {loading ? (
              "Loading map…"
            ) : (
              <>
                {totalOnMap} job{totalOnMap === 1 ? "" : "s"} across {locationCount} location
                {locationCount === 1 ? "" : "s"}
                {unmapped.length > 0 ? ` · ${unmapped.length} unmapped` : ""}
              </>
            )}
          </div>
        </div>

        {/* Desktop side panel */}
        <JobsMapSidePanel
          cluster={selectedCluster}
          applyingJobId={applyingJobId}
          onClose={handleClosePanel}
          onViewDetails={onViewDetails}
          onApply={onApply}
          variant="desktop"
          className="hidden lg:flex"
        />
        {showEmptyMap || showNoMarkers ? (
          <div className="pointer-events-none absolute inset-0 z-[600] flex items-center justify-center p-6">
            <div className="max-w-sm rounded-2xl border border-slate-200 bg-white/95 p-6 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
              <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-900 dark:text-slate-50">
                {showEmptyMap ? "No jobs to show on map" : "Could not place jobs on map"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {showEmptyMap
                  ? "Try adjusting filters or search."
                  : "Switch to List view to see these jobs."}
              </p>
            </div>
          </div>
        ) : null}

      </div>

      {/* Mobile side panel */}
      <JobsMapSidePanel
        cluster={selectedCluster}
        applyingJobId={applyingJobId}
        onClose={handleClosePanel}
        onViewDetails={onViewDetails}
        onApply={onApply}
        variant="mobile"
        className="lg:hidden"
      />


    </div>
  )
}


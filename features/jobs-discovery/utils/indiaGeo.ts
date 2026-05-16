import type { Job } from "@/components/jobs/AllJobs"
import { formatJobLocation } from "./jobFormatters"

export type GeoPoint = { lat: number; lng: number; label: string }

/** Normalized keys → [lat, lng, display label] */
const INDIA_LOCATIONS: Record<string, [number, number, string]> = {
  delhi: [28.6139, 77.209, "Delhi"],
  newdelhi: [28.6139, 77.209, "Delhi"],
  ncr: [28.5355, 77.391, "NCR"],
  gurgaon: [28.4595, 77.0266, "Gurgaon"],
  gurugram: [28.4595, 77.0266, "Gurugram"],
  noida: [28.5355, 77.391, "Noida"],
  faridabad: [28.4089, 77.3178, "Faridabad"],
  ghaziabad: [28.6692, 77.4538, "Ghaziabad"],
  mumbai: [19.076, 72.8777, "Mumbai"],
  thane: [19.2183, 72.9781, "Thane"],
  pune: [18.5204, 73.8567, "Pune"],
  nagpur: [21.1458, 79.0882, "Nagpur"],
  bengaluru: [12.9716, 77.5946, "Bengaluru"],
  bangalore: [12.9716, 77.5946, "Bengaluru"],
  chennai: [13.0827, 80.2707, "Chennai"],
  hyderabad: [17.385, 78.4867, "Hyderabad"],
  secunderabad: [17.4399, 78.4983, "Secunderabad"],
  kolkata: [22.5726, 88.3639, "Kolkata"],
  ahmedabad: [23.0225, 72.5714, "Ahmedabad"],
  surat: [21.1702, 72.8311, "Surat"],
  jaipur: [26.9124, 75.7873, "Jaipur"],
  khushkhera: [28.12, 76.62, "Khushkhera"],
  lucknow: [26.8467, 80.9462, "Lucknow"],
  kanpur: [26.4499, 80.3319, "Kanpur"],
  patna: [25.5941, 85.1376, "Patna"],
  bhopal: [23.2599, 77.4126, "Bhopal"],
  indore: [22.7196, 75.8577, "Indore"],
  chandigarh: [30.7333, 76.7794, "Chandigarh"],
  ludhiana: [30.901, 75.8573, "Ludhiana"],
  amritsar: [31.634, 74.8723, "Amritsar"],
  kochi: [9.9312, 76.2673, "Kochi"],
  coimbatore: [11.0168, 76.9558, "Coimbatore"],
  visakhapatnam: [17.6868, 83.2185, "Visakhapatnam"],
  vijayawada: [16.5062, 80.648, "Vijayawada"],
  bhubaneswar: [20.2961, 85.8245, "Bhubaneswar"],
  ranchi: [23.3441, 85.3096, "Ranchi"],
  raipur: [21.2514, 81.6296, "Raipur"],
  guwahati: [26.1445, 91.7362, "Guwahati"],
  dehradun: [30.3165, 78.0322, "Dehradun"],
  haridwar: [29.9457, 78.1642, "Haridwar"],
  agra: [27.1767, 78.0081, "Agra"],
  varanasi: [25.3176, 82.9739, "Varanasi"],
  meerut: [28.9845, 77.7064, "Meerut"],
  allahabad: [25.4358, 81.8463, "Prayagraj"],
  prayagraj: [25.4358, 81.8463, "Prayagraj"],
  udaipur: [24.5854, 73.7125, "Udaipur"],
  jodhpur: [26.2389, 73.0243, "Jodhpur"],
  kota: [25.2138, 75.8648, "Kota"],
  ajmer: [26.4499, 74.6399, "Ajmer"],
  goa: [15.2993, 74.124, "Goa"],
  panaji: [15.4909, 73.8278, "Panaji"],
  mangalore: [12.9141, 74.856, "Mangalore"],
  mysuru: [12.2958, 76.6394, "Mysuru"],
  mysore: [12.2958, 76.6394, "Mysore"],
  madurai: [9.9252, 78.1198, "Madurai"],
  tiruchirappalli: [10.7905, 78.7047, "Tiruchirappalli"],
  salem: [11.6643, 78.146, "Salem"],
  hubli: [15.3647, 75.124, "Hubli"],
  nashik: [19.9975, 73.7898, "Nashik"],
  aurangabad: [19.8762, 75.3433, "Aurangabad"],
  vadodara: [22.3072, 73.1812, "Vadodara"],
  rajkot: [22.3039, 70.8022, "Rajkot"],
  bhavnagar: [21.7645, 72.1519, "Bhavnagar"],
  jammu: [32.7266, 74.857, "Jammu"],
  srinagar: [34.0837, 74.7973, "Srinagar"],
  shimla: [31.1048, 77.1734, "Shimla"],
  gangtok: [27.3389, 88.6065, "Gangtok"],
  imphal: [24.817, 93.9368, "Imphal"],
  shillong: [25.5788, 91.8933, "Shillong"],
  agartala: [23.8315, 91.2868, "Agartala"],
  itanagar: [27.0844, 93.6053, "Itanagar"],
  kohima: [25.6751, 94.1086, "Kohima"],
  aizawl: [23.7271, 92.7176, "Aizawl"],
  portblair: [11.6234, 92.7265, "Port Blair"],
  maharashtra: [19.7515, 75.7139, "Maharashtra"],
  karnataka: [15.3173, 75.7139, "Karnataka"],
  tamilnadu: [11.1271, 78.6569, "Tamil Nadu"],
  telangana: [18.1124, 79.0193, "Telangana"],
  gujarat: [22.2587, 71.1924, "Gujarat"],
  rajasthan: [27.0238, 74.2179, "Rajasthan"],
  uttarpradesh: [26.8467, 80.9462, "Uttar Pradesh"],
  westbengal: [22.9868, 87.855, "West Bengal"],
  odisha: [20.9517, 85.0985, "Odisha"],
  punjab: [31.1471, 75.3412, "Punjab"],
  haryana: [29.0588, 76.0856, "Haryana"],
  bihar: [25.0961, 85.3131, "Bihar"],
  madhyapradesh: [22.9734, 78.6569, "Madhya Pradesh"],
  kerala: [10.8505, 76.2711, "Kerala"],
  andhrapradesh: [15.9129, 79.74, "Andhra Pradesh"],
  assam: [26.2006, 92.9376, "Assam"],
  jharkhand: [23.6102, 85.2799, "Jharkhand"],
  chhattisgarh: [21.2787, 81.8661, "Chhattisgarh"],
  uttarakhand: [30.0668, 79.0193, "Uttarakhand"],
  himachalpradesh: [31.1048, 77.1734, "Himachal Pradesh"],
  talpali: [20.844, 84.734, "Talpali"],
  balangir: [20.707, 83.484, "Balangir"],
  sambalpur: [21.466, 83.975, "Sambalpur"],
  cuttack: [20.4625, 85.883, "Cuttack"],
  rourkela: [22.2604, 84.8536, "Rourkela"],
  berhampur: [19.3149, 84.7941, "Berhampur"],
  panindia: [22.5937, 78.9629, "Pan India"],
  india: [22.5937, 78.9629, "India"],
  remotework: [22.5937, 78.9629, "Remote"],
}

/** Spread unmapped jobs slightly so markers do not stack */
function fallbackGeoForJob(job: Job): GeoPoint {
  const label = formatJobLocation(job)
  const display =
    label && label !== "Pan India" && label !== "Remote" ? label : "India (approx.)"
  let hash = 0
  for (let i = 0; i < job.id.length; i++) {
    hash = (hash + job.id.charCodeAt(i) * (i + 3)) % 997
  }
  const lat = 20.2 + (hash % 14) * 0.65
  const lng = 72.8 + (hash % 16) * 0.82
  return { lat, lng, label: display }
}

function normalizeKey(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\./g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function lookupLocation(name: string): GeoPoint | null {
  const key = normalizeKey(name)
  if (!key) return null
  const hit = INDIA_LOCATIONS[key]
  if (hit) return { lat: hit[0], lng: hit[1], label: hit[2] }
  // Partial match (e.g. "Greater Noida" → noida)
  for (const [k, [lat, lng, label]] of Object.entries(INDIA_LOCATIONS)) {
    if (key.includes(k) || k.includes(key)) {
      return { lat, lng, label }
    }
  }
  return null
}

function locationCandidates(job: Job): string[] {
  const raw: string[] = []
  if (job.city_or_town) raw.push(job.city_or_town)
  if (job.district) raw.push(job.district)
  if (job.state) raw.push(job.state)
  if (job.pincode) raw.push(job.pincode)
  if (Array.isArray(job.location)) {
    raw.push(...job.location.map(String))
  } else if (job.location) {
    raw.push(String(job.location))
  }
  const formatted = formatJobLocation(job)
  if (formatted) raw.push(formatted)
  return raw
    .flatMap((c) => c.split(/[,|/;]/).map((s) => s.trim()))
    .filter(Boolean)
}

export function resolveJobGeo(job: Job, options?: { allowFallback?: boolean }): GeoPoint | null {
  const candidates = locationCandidates(job)

  for (const c of candidates) {
    const geo = lookupLocation(c)
    if (geo) return geo
  }

  const pin = job.pincode?.replace(/\D/g, "").slice(0, 6)
  if (pin?.length === 6) {
    const p2 = pin.slice(0, 2)
    const zoneByPin: Record<string, string> = {
      "11": "delhi",
      "12": "haryana",
      "13": "haryana",
      "14": "punjab",
      "15": "punjab",
      "16": "punjab",
      "17": "himachalpradesh",
      "18": "jammu",
      "19": "srinagar",
      "20": "uttarpradesh",
      "21": "uttarpradesh",
      "22": "uttarpradesh",
      "23": "uttarpradesh",
      "24": "uttarpradesh",
      "25": "uttarpradesh",
      "26": "uttarpradesh",
      "27": "uttarpradesh",
      "28": "uttarpradesh",
      "30": "rajasthan",
      "31": "rajasthan",
      "32": "rajasthan",
      "33": "rajasthan",
      "34": "rajasthan",
      "36": "gujarat",
      "37": "gujarat",
      "38": "gujarat",
      "39": "gujarat",
      "40": "mumbai",
      "41": "mumbai",
      "42": "mumbai",
      "43": "mumbai",
      "44": "mumbai",
      "45": "madhyapradesh",
      "46": "madhyapradesh",
      "47": "madhyapradesh",
      "48": "madhyapradesh",
      "49": "chhattisgarh",
      "50": "telangana",
      "51": "telangana",
      "52": "andhrapradesh",
      "53": "andhrapradesh",
      "56": "bengaluru",
      "57": "bengaluru",
      "58": "bengaluru",
      "59": "bengaluru",
      "60": "chennai",
      "61": "chennai",
      "62": "chennai",
      "63": "chennai",
      "64": "chennai",
      "67": "kerala",
      "68": "kerala",
      "69": "kerala",
      "70": "kolkata",
      "71": "kolkata",
      "72": "kolkata",
      "73": "kolkata",
      "74": "kolkata",
      "75": "odisha",
      "76": "odisha",
      "77": "odisha",
      "78": "guwahati",
      "79": "guwahati",
      "80": "bihar",
      "81": "bihar",
      "82": "bihar",
      "83": "bihar",
      "84": "bihar",
      "85": "bihar",
    }
    const hub = zoneByPin[p2]
    if (hub) {
      const zone = lookupLocation(hub)
      if (zone) return zone
    }
  }

  if (options?.allowFallback !== false) {
    return fallbackGeoForJob(job)
  }

  return null
}

export type JobLocationCluster = {
  id: string
  label: string
  lat: number
  lng: number
  jobs: Job[]
}

export function groupJobsByLocation(jobs: Job[]): {
  clusters: JobLocationCluster[]
  unmapped: Job[]
} {
  const bucket = new Map<string, JobLocationCluster>()
  const unmapped: Job[] = []

  for (const job of jobs) {
    const geo = resolveJobGeo(job)
    if (!geo) {
      unmapped.push(job)
      continue
    }
    const id = `${geo.lat.toFixed(2)}_${geo.lng.toFixed(2)}`
    const existing = bucket.get(id)
    if (existing) {
      existing.jobs.push(job)
    } else {
      bucket.set(id, {
        id,
        label: geo.label,
        lat: geo.lat,
        lng: geo.lng,
        jobs: [job],
      })
    }
  }

  return { clusters: Array.from(bucket.values()), unmapped }
}

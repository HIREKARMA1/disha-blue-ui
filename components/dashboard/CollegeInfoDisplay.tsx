import { StudentProfile } from '@/services/profileService'
import { useUniversities } from '@/hooks/useLookup'
interface CollegeInfoDisplayProps {
 profile: StudentProfile
}

export function CollegeInfoDisplay({ profile }: CollegeInfoDisplayProps) {
 const {
 data: universities,
 loading: loadingUniversities
 } = useUniversities({
 enabled: !!profile.university_id && !profile.institution
 })

 const displayInstitution = profile.institution ||
 (profile.university_id ? universities.find(u => u.id === profile.university_id)?.name : null) ||'Institution not specified'// Show if we have institution, degree, or branch info
const hasCollegeInfo = !!(profile.institution || profile.university_id || profile.degree || profile.branch || profile.graduation_year || profile.btech_cgpa)

 if (!hasCollegeInfo) {
 return (
 <div className="p-4 rounded-xl border">
 <div className="text-sm text-blue-700">
 No college details provided yet
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-3">
 <div className="p-4 rounded-xl border">
 <div className="font-medium text-blue-900 mb-2">
 {profile.degree ? `${profile.degree} from ` :''}
 {loadingUniversities && !profile.institution && profile.university_id ? (
 <span className="inline-block w-24 h-4 bg-gray-200 animate-pulse rounded-none align-middle"></span>
 ) : (
 displayInstitution
 )}
 </div>
 <div className="text-sm text-blue-700">
 {profile.branch ? `${profile.branch} • ` :''}
 {profile.graduation_year ? `Graduating in ${profile.graduation_year}` :'Graduation year not specified'}
 </div>
 </div>

 {profile.btech_cgpa && (
 <div className="p-4 rounded-xl border">
 <div className="font-medium text-blue-900 mb-2">
 CGPA
 </div>
 <div className="text-sm text-blue-700">
 {profile.btech_cgpa}
 </div>
 </div>
 )}
 </div>
 )
}

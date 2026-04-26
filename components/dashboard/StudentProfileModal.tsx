"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
 User,
 Mail,
 Phone,
 GraduationCap,
 MapPin,
 Calendar,
 Star,
 Briefcase,
 Award,
 Globe,
 FileText,
 X,
 CheckCircle,
 AlertCircle,
 Camera,
 Eye,
 EyeOff,
 Star as Zap,
 Trophy,
 FileText as Shield,
 ExternalLink,
 Download,
 Building,
 MapPin as LocationIcon,
 Globe as Languages,
 Crosshair as Target,
 Code2 as Code,
 Heart,
 BookOpen,
 FileText as Certificate,
 Printer,
 Share2,
 Copy,
 Search,
 Filter,
 TrendingUp,
 Users,
 Clock,
 DollarSign,
 BarChart3,
 PieChart,
 Activity,
 ArrowUpRight,
 ArrowDownRight,
 Minus
} from 'lucide-react'
import { StudentListItem } from '@/types/university'
import { StudentProfile } from '@/services/profileService'
import { getInitials } from '@/lib/utils'// Extended interface that combines StudentListItem with comprehensive profile data
interface ExtendedStudentProfile extends StudentListItem {
 // Additional fields from StudentProfile that might not be in StudentListItem
 bio?: string
 dob?: string
 gender?: string
 country?: string
 state?: string
 city?: string
 major?: string
 total_percentage?: number
 soft_skills?: string
 certifications?: string
 preferred_industry?: string
 job_roles_of_interest?: string
 location_preferences?: string
 language_proficiency?: string
 extracurricular_activities?: string
 internship_experience?: string
 project_details?: string
 linkedin_profile?: string
 github_profile?: string
 personal_website?: string
 resume?: string
 tenth_certificate?: string
 twelfth_certificate?: string
 internship_certificates?: string
 university_id?: string
 college_id?: string
 twelfth_institution?: string
 twelfth_stream?: string
 twelfth_year?: string
 tenth_institution?: string
 tenth_stream?: string
 tenth_year?: string
 tenth_grade_percentage?: number
 twelfth_grade_percentage?: number
 email_verified?: boolean
 phone_verified?: boolean
 profile_picture?: string
 updated_at?: string
 last_login?: string
}

interface StudentProfileModalProps {
 isOpen: boolean
 onClose: () => void
 student: StudentListItem | null
 // Optional: If you have access to full profile data
 fullProfile?: StudentProfile | null
 isLoading?: boolean
}

export function StudentProfileModal({
 isOpen,
 onClose,
 student,
 fullProfile,
 isLoading = false
}: StudentProfileModalProps) {
 const [activeTab, setActiveTab] = useState('basic')

 console.log('StudentProfileModal rendered with:', { isOpen, student, fullProfile, isLoading })

 if (!isOpen || !student) {
 console.log('StudentProfileModal: Not rendering - isOpen:', isOpen,'student:', student)
 return null
 }

 // Debug: Log the available data
 console.log('StudentProfileModal - student:', student)
 console.log('StudentProfileModal - fullProfile:', fullProfile)

 // Safety check: ensure student has required properties
 if (!student.id || !student.name || !student.email) {
 console.error('StudentProfileModal - Invalid student data:', student)
 return null
 }

 // Combine student data with full profile data if available
const extendedStudent: ExtendedStudentProfile = {
 ...student,
 ...fullProfile,
 // Ensure we have the latest data
 email_verified: fullProfile?.email_verified ?? student.email_verified ?? false,
 phone_verified: fullProfile?.phone_verified ?? student.phone_verified ?? false,
 profile_picture: fullProfile?.profile_picture ?? student.profile_picture,
 // Use student data first, then fullProfile, then empty string as fallback
 technical_skills: student.technical_skills ?? fullProfile?.technical_skills ??'',
 soft_skills: student.soft_skills ?? fullProfile?.soft_skills ??'',
 certifications: student.certifications ?? fullProfile?.certifications ??'',
 preferred_industry: student.preferred_industry ?? fullProfile?.preferred_industry ??'',
 job_roles_of_interest: student.job_roles_of_interest ?? fullProfile?.job_roles_of_interest ??'',
 location_preferences: student.location_preferences ?? fullProfile?.location_preferences ??'',
 language_proficiency: student.language_proficiency ?? fullProfile?.language_proficiency ??'',
 internship_experience: student.internship_experience ?? fullProfile?.internship_experience ??'',
 project_details: student.project_details ?? fullProfile?.project_details ??'',
 extracurricular_activities: student.extracurricular_activities ?? fullProfile?.extracurricular_activities ??'',
 linkedin_profile: student.linkedin_profile ?? fullProfile?.linkedin_profile ??'',
 github_profile: student.github_profile ?? fullProfile?.github_profile ??'',
 personal_website: student.personal_website ?? fullProfile?.personal_website ??'',
 resume: student.resume ?? fullProfile?.resume ??'',
 tenth_certificate: student.tenth_certificate ?? fullProfile?.tenth_certificate ??'',
 twelfth_certificate: student.twelfth_certificate ?? fullProfile?.twelfth_certificate ??'',
 internship_certificates: student.internship_certificates ?? fullProfile?.internship_certificates ??''}

 // Debug: Log the combined data
 console.log('StudentProfileModal - extendedStudent:', extendedStudent)
 console.log(' Document fields check:')
 console.log(' Resume:', extendedStudent.resume)
 console.log(' Tenth certificate:', extendedStudent.tenth_certificate)
 console.log(' Twelfth certificate:', extendedStudent.twelfth_certificate)
 console.log(' Internship certificates:', extendedStudent.internship_certificates)

 // Safety check: ensure extendedStudent has required properties
 if (!extendedStudent.id || !extendedStudent.name || !extendedStudent.email) {
 console.error('StudentProfileModal - Invalid extendedStudent data:', extendedStudent)
 return null
 }

 const handleBackdropClick = (e: React.MouseEvent) => {
 if (e.target === e.currentTarget) {
 onClose()
 }
 }

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString('en-US', {
 year:'numeric',
 month:'long',
 day:'numeric'})
 }

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'placed':
 return 'bg-blue-100 text-blue-800'
 case 'unplaced':
 return 'bg-yellow-100 text-yellow-800'
 default:
 return 'bg-gray-100 text-gray-800'
 }
 }

 const getTabColors = (tabId: string) => {
 switch (tabId) {
 case'basic':
 return {
 active:'border-blue-500 text-blue-600 bg-blue-50',
 indicator:'bg-blue-500',
 icon:'text-blue-600'}
 case'academic':
 return {
 active:'border-purple-500 text-purple-600 bg-purple-50',
 indicator:'bg-purple-500',
 icon:'text-purple-600'}
 case'skills':
 return {
 active:'border-orange-500 text-orange-600 bg-orange-50',
 indicator:'bg-orange-500',
 icon:'text-orange-600'}
 case'experience':
 return {
 active:'border-blue-500 text-blue-600 bg-blue-50',
 indicator:'bg-blue-500',
 icon:'text-blue-600'}
 case'placement':
 return {
 active:'border-indigo-500 text-indigo-600 bg-indigo-50',
 indicator:'bg-indigo-500',
 icon:'text-indigo-600'}
 case'documents':
 return {
 active:'border-red-500 text-red-600 bg-red-50',
 indicator:'bg-red-500',
 icon:'text-red-600'}
 case'social':
 return {
 active:'border-pink-500 text-pink-600 bg-pink-50',
 indicator:'bg-pink-500',
 icon:'text-pink-600'}
 default:
 return {
 active:'border-gray-500 text-gray-600 bg-gray-50',
 indicator:'bg-gray-500',
 icon:'text-gray-600'}
 }
 }

 const tabs = [
 { id:'basic', label:'Basic Info', icon: User },
 { id:'academic', label:'Academic', icon: GraduationCap },
 { id:'skills', label:'Skills', icon: Zap },
 { id:'experience', label:'Experience', icon: Trophy },
 { id:'placement', label:'Placement', icon: TrendingUp },
 { id:'documents', label:'Documents', icon: Shield },
 { id:'social', label:'Social', icon: Globe }
 ]

 const renderTabContent = () => {
 console.log('Rendering tab content for activeTab:', activeTab)
 try {
 switch (activeTab) {
 case'basic':
 console.log('Rendering basic info')
 return renderBasicInfo()
 case'academic':
 console.log('Rendering academic info')
 return renderAcademicInfo()
 case'skills':
 console.log('Rendering skills info')
 return renderSkillsInfo()
 case'experience':
 console.log('Rendering experience info')
 return renderExperienceInfo()
 case'placement':
 console.log('Rendering placement info')
 return renderPlacementInfo()
 case'documents':
 console.log('Rendering documents info')
 return renderDocumentsInfo()
 case'social':
 console.log('Rendering social info')
 return renderSocialInfo()
 default:
 console.log('Rendering default (basic) info')
 return renderBasicInfo()
 }
 } catch (error) {
 console.error('Error rendering tab content for tab:', activeTab, error)
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Content
 </h3>
 <p className="text-sm text-gray-600">
 There was an error loading this tab's content.
 </p>
 <p className="text-xs text-red-600 mt-2">
 Tab: {activeTab}
 </p>
 </div>
 </div>
 )
 }
 }

 // Utility functions for enhanced features
const copyToClipboard = async (text: string) => {
 try {
 await navigator.clipboard.writeText(text)
 // You could add a toast notification here
 } catch (err) {
 console.error('Failed to copy text:', err)
 }
 }

 const printProfile = () => {
 window.print()
 }

 const shareProfile = async () => {
 if (navigator.share) {
 try {
 await navigator.share({
 title: `${extendedStudent.name} - Student Profile`,
 text: `View ${extendedStudent.name}'s comprehensive student profile`,
 url: window.location.href
 })
 } catch (err) {
 console.error('Error sharing:', err)
 }
 } else {
 // Fallback to copying URL
 copyToClipboard(window.location.href)
 }
 }

 const exportProfileData = () => {
 const profileData = {
 name: extendedStudent.name,
 email: extendedStudent.email,
 phone: extendedStudent.phone,
 institution: extendedStudent.institution,
 degree: extendedStudent.degree,
 branch: extendedStudent.branch,
 placement_status: extendedStudent.placement_status,
 placed_company: extendedStudent.placed_company,
 package: extendedStudent.package,
 total_applications: extendedStudent.total_applications,
 interviews_attended: extendedStudent.interviews_attended,
 offers_received: extendedStudent.offers_received,
 profile_completion_percentage: extendedStudent.profile_completion_percentage,
 technical_skills: extendedStudent.technical_skills,
 soft_skills: extendedStudent.soft_skills,
 certifications: extendedStudent.certifications,
 preferred_industry: extendedStudent.preferred_industry,
 job_roles_of_interest: extendedStudent.job_roles_of_interest,
 location_preferences: extendedStudent.location_preferences,
 internship_experience: extendedStudent.internship_experience,
 project_details: extendedStudent.project_details,
 extracurricular_activities: extendedStudent.extracurricular_activities,
 linkedin_profile: extendedStudent.linkedin_profile,
 github_profile: extendedStudent.github_profile,
 personal_website: extendedStudent.personal_website,
 created_at: extendedStudent.created_at,
 last_login: extendedStudent.last_login
 }

 const dataStr = JSON.stringify(profileData, null, 2)
 const dataBlob = new Blob([dataStr], { type:'application/json'})
 const url = URL.createObjectURL(dataBlob)
 const link = document.createElement('a')
 link.href = url
 link.download = `${extendedStudent.name.replace(/\s+/g,'_')}_profile.json`
 link.click()
 URL.revokeObjectURL(url)
 }

 const renderBasicInfo = () => {
 // Safety check: ensure extendedStudent exists
 if (!extendedStudent) {
 console.error('StudentProfileModal - extendedStudent is undefined in renderBasicInfo')
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Basic Info
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load basic information.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Personal Information */}
 <div className="rounded-xl shadow-sm border border-blue-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <User className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-blue-900">
 Personal Information
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-3">
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-blue-100 rounded-xl">
 <Mail className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.email}
 </p>
 <p className="text-xs text-blue-600">Email Address</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-blue-100 rounded-xl">
 <Phone className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.phone ||'Not provided'}
 </p>
 <p className="text-xs text-blue-600">Phone Number</p>
 </div>
 </div>
 {extendedStudent.dob && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-purple-100 rounded-xl">
 <Calendar className="w-4 h-4 text-purple-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {formatDate(extendedStudent.dob)}
 </p>
 <p className="text-xs text-purple-600">Date of Birth</p>
 </div>
 </div>
 )}
 </div>
 <div className="space-y-3">
 {extendedStudent.gender && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-pink-100 rounded-xl">
 <User className="w-4 h-4 text-pink-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.gender}
 </p>
 <p className="text-xs text-pink-600">Gender</p>
 </div>
 </div>
 )}
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-orange-100 rounded-xl">
 <Calendar className="w-4 h-4 text-orange-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.created_at ? formatDate(extendedStudent.created_at) :'Not available'}
 </p>
 <p className="text-xs text-orange-600">Member Since</p>
 </div>
 </div>
 {extendedStudent.last_login && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-indigo-100 rounded-xl">
 <Calendar className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {formatDate(extendedStudent.last_login)}
 </p>
 <p className="text-xs text-indigo-600">Last Login</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Location Information */}
 {(extendedStudent.country || extendedStudent.state || extendedStudent.city) && (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-blue-100 rounded-xl">
 <LocationIcon className="w-5 h-5 text-blue-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Location Information
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {extendedStudent.country && (
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.country}
 </p>
 <p className="text-xs text-gray-500">Country</p>
 </div>
 )}
 {extendedStudent.state && (
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.state}
 </p>
 <p className="text-xs text-gray-500">State</p>
 </div>
 )}
 {extendedStudent.city && (
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.city}
 </p>
 <p className="text-xs text-gray-500">City</p>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Bio */}
 {extendedStudent.bio && (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-purple-100 rounded-xl">
 <FileText className="w-5 h-5 text-purple-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Bio
 </h3>
 </div>
 <p className="text-sm text-gray-700 leading-relaxed">
 {extendedStudent.bio}
 </p>
 </div>
 )}
 </div>
 )
 }

 const renderAcademicInfo = () => {
 // Safety check: ensure extendedStudent exists
 if (!extendedStudent) {
 console.error('StudentProfileModal - extendedStudent is undefined in renderAcademicInfo')
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Academic Info
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load academic information.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Current Education */}
 <div className="rounded-xl shadow-sm border border-purple-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <GraduationCap className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-purple-900">
 Current Education
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-3">
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-blue-100 rounded-xl">
 <Building className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.institution ||'Not specified'}
 </p>
 <p className="text-xs text-blue-600">Institution</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-purple-100 rounded-xl">
 <GraduationCap className="w-4 h-4 text-purple-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.degree ||'Not specified'}
 </p>
 <p className="text-xs text-purple-600">Degree</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-blue-100 rounded-xl">
 <MapPin className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.branch ||'Not specified'}
 </p>
 <p className="text-xs text-blue-600">Branch</p>
 </div>
 </div>
 </div>
 <div className="space-y-3">
 {extendedStudent.graduation_year && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-orange-100 rounded-xl">
 <Calendar className="w-4 h-4 text-orange-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.graduation_year}
 </p>
 <p className="text-xs text-orange-600">Graduation Year</p>
 </div>
 </div>
 )}
 {extendedStudent.btech_cgpa && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-yellow-100 rounded-xl">
 <Star className="w-4 h-4 text-yellow-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.btech_cgpa}
 </p>
 <p className="text-xs text-yellow-600">CGPA</p>
 </div>
 </div>
 )}
 {extendedStudent.major && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-indigo-100 rounded-xl">
 <BookOpen className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.major}
 </p>
 <p className="text-xs text-indigo-600">Major</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Class XII Details */}
 {(extendedStudent.twelfth_institution || extendedStudent.twelfth_stream || extendedStudent.twelfth_year || extendedStudent.twelfth_grade_percentage) && (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-blue-100 rounded-xl">
 <GraduationCap className="w-5 h-5 text-blue-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Class XII Details
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-3">
 {extendedStudent.twelfth_institution && (
 <div className="flex items-center gap-3">
 <Building className="w-4 h-4 text-gray-400"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.twelfth_institution}
 </p>
 <p className="text-xs text-gray-500">Institution</p>
 </div>
 </div>
 )}
 {extendedStudent.twelfth_stream && (
 <div className="flex items-center gap-3">
 <BookOpen className="w-4 h-4 text-gray-400"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.twelfth_stream}
 </p>
 <p className="text-xs text-gray-500">Stream</p>
 </div>
 </div>
 )}
 </div>
 <div className="space-y-3">
 {extendedStudent.twelfth_year && (
 <div className="flex items-center gap-3">
 <Calendar className="w-4 h-4 text-gray-400"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.twelfth_year}
 </p>
 <p className="text-xs text-gray-500">Year</p>
 </div>
 </div>
 )}
 {extendedStudent.twelfth_grade_percentage && (
 <div className="flex items-center gap-3">
 <Star className="w-4 h-4 text-yellow-500"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.twelfth_grade_percentage}%
 </p>
 <p className="text-xs text-gray-500">Percentage</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Class X Details */}
 {(extendedStudent.tenth_institution || extendedStudent.tenth_stream || extendedStudent.tenth_year || extendedStudent.tenth_grade_percentage) && (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-orange-100 rounded-xl">
 <GraduationCap className="w-5 h-5 text-orange-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Class X Details
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-3">
 {extendedStudent.tenth_institution && (
 <div className="flex items-center gap-3">
 <Building className="w-4 h-4 text-gray-400"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.tenth_institution}
 </p>
 <p className="text-xs text-gray-500">Institution</p>
 </div>
 </div>
 )}
 {extendedStudent.tenth_stream && (
 <div className="flex items-center gap-3">
 <BookOpen className="w-4 h-4 text-gray-400"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.tenth_stream}
 </p>
 <p className="text-xs text-gray-500">Stream</p>
 </div>
 </div>
 )}
 </div>
 <div className="space-y-3">
 {extendedStudent.tenth_year && (
 <div className="flex items-center gap-3">
 <Calendar className="w-4 h-4 text-gray-400"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.tenth_year}
 </p>
 <p className="text-xs text-gray-500">Year</p>
 </div>
 </div>
 )}
 {extendedStudent.tenth_grade_percentage && (
 <div className="flex items-center gap-3">
 <Star className="w-4 h-4 text-yellow-500"/>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.tenth_grade_percentage}%
 </p>
 <p className="text-xs text-gray-500">Percentage</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 )
 }

 const renderSkillsInfo = () => {
 // Safety check: ensure extendedStudent exists
 if (!extendedStudent) {
 console.error('StudentProfileModal - extendedStudent is undefined in renderSkillsInfo')
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Skills
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load skills information.
 </p>
 </div>
 </div>
 )
 }

 // Check if any skills data exists
const hasSkillsData = extendedStudent.technical_skills ||
 extendedStudent.soft_skills ||
 extendedStudent.certifications ||
 extendedStudent.preferred_industry ||
 extendedStudent.job_roles_of_interest ||
 extendedStudent.location_preferences ||
 extendedStudent.language_proficiency

 if (!hasSkillsData) {
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <Zap className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Skills Information
 </h3>
 <p className="text-sm text-gray-600">
 This student hasn't added any skills or career preferences yet.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Technical Skills */}
 {extendedStudent.technical_skills && (
 <div className="rounded-xl shadow-sm border border-orange-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Code className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-orange-900">
 Technical Skills
 </h3>
 </div>
 <div className="flex flex-wrap gap-2">
 {extendedStudent.technical_skills.split(',').map((skill, index) => (
 <span
 key={index}
 className="px-3 py-1 bg-orange-200 text-orange-800 text-sm font-medium border border-orange-300">
 {skill.trim()}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Soft Skills */}
 {extendedStudent.soft_skills && (
 <div className="rounded-xl shadow-sm border border-blue-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Heart className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-blue-900">
 Soft Skills
 </h3>
 </div>
 <div className="flex flex-wrap gap-2">
 {extendedStudent.soft_skills.split(',').map((skill, index) => (
 <span
 key={index}
 className="px-3 py-1 bg-blue-200 text-blue-800 text-sm font-medium border border-blue-300">
 {skill.trim()}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Certifications */}
 {extendedStudent.certifications && (
 <div className="rounded-xl shadow-sm border border-purple-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Certificate className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-purple-900">
 Certifications
 </h3>
 </div>
 <div className="space-y-2">
 {extendedStudent.certifications.split(',').map((cert, index) => (
 <div key={index} className="flex items-center gap-3 p-2 rounded-xl">
 <div className="p-1.5 bg-purple-100 rounded-xl">
 <Certificate className="w-4 h-4 text-purple-600"/>
 </div>
 <span className="text-sm text-gray-700 font-medium">
 {cert.trim()}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Career Preferences */}
 {(extendedStudent.preferred_industry || extendedStudent.job_roles_of_interest || extendedStudent.location_preferences) && (
 <div className="rounded-xl shadow-sm border border-indigo-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Target className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-indigo-900">
 Career Preferences
 </h3>
 </div>
 <div className="space-y-4">
 {extendedStudent.preferred_industry && (
 <div>
 <p className="text-sm font-medium text-gray-900 mb-1">
 Preferred Industry
 </p>
 <p className="text-sm text-gray-600">
 {extendedStudent.preferred_industry}
 </p>
 </div>
 )}
 {extendedStudent.job_roles_of_interest && (
 <div>
 <p className="text-sm font-medium text-gray-900 mb-1">
 Job Roles of Interest
 </p>
 <p className="text-sm text-gray-600">
 {extendedStudent.job_roles_of_interest}
 </p>
 </div>
 )}
 {extendedStudent.location_preferences && (
 <div>
 <p className="text-sm font-medium text-gray-900 mb-1">
 Location Preferences
 </p>
 <p className="text-sm text-gray-600">
 {extendedStudent.location_preferences}
 </p>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Language Proficiency */}
 {extendedStudent.language_proficiency && (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-indigo-100 rounded-xl">
 <Languages className="w-5 h-5 text-indigo-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Language Proficiency
 </h3>
 </div>
 <p className="text-sm text-gray-700">
 {extendedStudent.language_proficiency}
 </p>
 </div>
 )}
 </div>
 )
 }

 const renderExperienceInfo = () => {
 // Safety check: ensure extendedStudent exists
 if (!extendedStudent) {
 console.error('StudentProfileModal - extendedStudent is undefined in renderExperienceInfo')
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Experience
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load experience information.
 </p>
 </div>
 </div>
 )
 }

 // Check if any experience data exists
const hasExperienceData = extendedStudent.internship_experience ||
 extendedStudent.project_details ||
 extendedStudent.extracurricular_activities

 if (!hasExperienceData) {
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <Trophy className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Experience Information
 </h3>
 <p className="text-sm text-gray-600">
 This student hasn't added any experience, projects, or activities yet.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Internship Experience */}
 {extendedStudent.internship_experience && (
 <div className="rounded-xl shadow-sm border border-blue-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Briefcase className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-blue-900">
 Internship Experience
 </h3>
 </div>
 <div className="p-4 rounded-xl">
 <p className="text-sm text-gray-700 leading-relaxed">
 {extendedStudent.internship_experience}
 </p>
 </div>
 </div>
 )}

 {/* Project Details */}
 {extendedStudent.project_details && (
 <div className="rounded-xl shadow-sm border border-orange-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Trophy className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-orange-900">
 Project Details
 </h3>
 </div>
 <div className="p-4 rounded-xl">
 <p className="text-sm text-gray-700 leading-relaxed">
 {extendedStudent.project_details}
 </p>
 </div>
 </div>
 )}

 {/* Extracurricular Activities */}
 {extendedStudent.extracurricular_activities && (
 <div className="rounded-xl shadow-sm border border-purple-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Heart className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-purple-900">
 Extracurricular Activities
 </h3>
 </div>
 <div className="p-4 rounded-xl">
 <p className="text-sm text-gray-700 leading-relaxed">
 {extendedStudent.extracurricular_activities}
 </p>
 </div>
 </div>
 )}
 </div>
 )
 }

 const renderPlacementInfo = () => {
 // Safety check: ensure extendedStudent exists
 if (!extendedStudent) {
 console.error('StudentProfileModal - extendedStudent is undefined in renderPlacementInfo')
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Placement
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load placement information.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-4">
 {/* Compact Placement Status */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-blue-100 rounded-xl">
 <TrendingUp className="w-5 h-5 text-blue-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Placement Status
 </h3>
 </div>

 <div className="grid grid-cols-2 gap-4">
 {/* Status */}
 <div className="text-center p-3 bg-gray-50 rounded-xl">
 <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium mb-2 ${getStatusColor(extendedStudent.placement_status)}`}>
 {extendedStudent.placement_status ==='placed'? (
 <CheckCircle className="w-4 h-4"/>
 ) : (
 <Clock className="w-4 h-4"/>
 )}
 {extendedStudent.placement_status}
 </div>
 {extendedStudent.placed_company && (
 <p className="text-sm font-medium text-gray-900">
 {extendedStudent.placed_company}
 </p>
 )}
 {extendedStudent.package && (
 <p className="text-sm text-blue-600 font-semibold">
 ₹{extendedStudent.package.toLocaleString()} LPA
 </p>
 )}
 </div>

 {/* Profile Completion */}
 <div className="text-center p-3 bg-gray-50 rounded-xl">
 <p className="text-sm font-medium text-gray-600 mb-2">Profile Completion</p>
 <div className="w-full bg-gray-200 h-2 mb-2">
 <div
 className="h-2 transition-all duration-300"style={{ width: `${extendedStudent.profile_completion_percentage}%` }}
 ></div>
 </div>
 <p className="text-lg font-bold text-purple-600">
 {Math.round(extendedStudent.profile_completion_percentage)}%
 </p>
 </div>
 </div>
 </div>

 {/* Compact Application Stats */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-orange-100 rounded-xl">
 <BarChart3 className="w-5 h-5 text-orange-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Application Statistics
 </h3>
 </div>

 <div className="grid grid-cols-3 gap-3">
 <div className="text-center p-3 bg-blue-50 rounded-xl">
 <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1"/>
 <p className="text-2xl font-bold text-blue-600">
 {extendedStudent.total_applications}
 </p>
 <p className="text-xs text-gray-500">Applications</p>
 </div>
 <div className="text-center p-3 bg-blue-50 rounded-xl">
 <Users className="w-6 h-6 text-blue-600 mx-auto mb-1"/>
 <p className="text-2xl font-bold text-blue-600">
 {extendedStudent.interviews_attended}
 </p>
 <p className="text-xs text-gray-500">Interviews</p>
 </div>
 <div className="text-center p-3 bg-purple-50 rounded-xl">
 <Award className="w-6 h-6 text-purple-600 mx-auto mb-1"/>
 <p className="text-2xl font-bold text-purple-600">
 {extendedStudent.offers_received}
 </p>
 <p className="text-xs text-gray-500">Offers</p>
 </div>
 </div>
 </div>
 </div>
 )
 }

 const renderDocumentsInfo = () => {
 // Safety check: ensure extendedStudent exists
 if (!extendedStudent) {
 console.error('StudentProfileModal - extendedStudent is undefined in renderDocumentsInfo')
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Documents
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load documents information.
 </p>
 </div>
 </div>
 )
 }

 // Check if any documents exist
const hasDocuments = extendedStudent.resume ||
 extendedStudent.tenth_certificate ||
 extendedStudent.twelfth_certificate ||
 extendedStudent.internship_certificates

 console.log(' Documents check in renderDocumentsInfo:')
 console.log(' hasDocuments:', hasDocuments)
 console.log(' Resume:', extendedStudent.resume)
 console.log(' Tenth cert:', extendedStudent.tenth_certificate)
 console.log(' Twelfth cert:', extendedStudent.twelfth_certificate)
 console.log(' Internship certs:', extendedStudent.internship_certificates)

 if (!hasDocuments) {
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <FileText className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Documents Uploaded
 </h3>
 <p className="text-sm text-gray-600">
 This student hasn't uploaded any documents yet.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Resume */}
 {extendedStudent.resume && (
 <div className="rounded-xl shadow-sm border border-red-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <FileText className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-red-900">
 Resume
 </h3>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-red-100 rounded-xl">
 <FileText className="w-5 h-5 text-red-600"/>
 </div>
 <span className="text-sm text-gray-700 font-medium">
 Resume uploaded
 </span>
 <a
 href={extendedStudent.resume}
 target="_blank"rel="noopener noreferrer"className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium">
 <ExternalLink className="w-4 h-4"/>
 View
 </a>
 </div>
 </div>
 )}

 {/* Academic Certificates */}
 {(extendedStudent.tenth_certificate || extendedStudent.twelfth_certificate) && (
 <div className="rounded-xl shadow-sm border border-blue-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Certificate className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-blue-900">
 Academic Certificates
 </h3>
 </div>
 <div className="space-y-3">
 {extendedStudent.tenth_certificate && (
 <div className="flex items-center gap-3">
 <Certificate className="w-4 h-4 text-gray-400"/>
 <span className="text-sm text-gray-700">
 Class X Certificate
 </span>
 <a
 href={extendedStudent.tenth_certificate}
 target="_blank"rel="noopener noreferrer"className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
 <ExternalLink className="w-4 h-4"/>
 View
 </a>
 </div>
 )}
 {extendedStudent.twelfth_certificate && (
 <div className="flex items-center gap-3">
 <Certificate className="w-4 h-4 text-gray-400"/>
 <span className="text-sm text-gray-700">
 Class XII Certificate
 </span>
 <a
 href={extendedStudent.twelfth_certificate}
 target="_blank"rel="noopener noreferrer"className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
 <ExternalLink className="w-4 h-4"/>
 View
 </a>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Internship Certificates */}
 {extendedStudent.internship_certificates && (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-orange-100 rounded-xl">
 <Briefcase className="w-5 h-5 text-orange-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 Internship Certificates
 </h3>
 </div>
 <div className="flex items-center gap-3">
 <Certificate className="w-4 h-4 text-gray-400"/>
 <span className="text-sm text-gray-700">
 Internship certificates uploaded
 </span>
 <a
 href={extendedStudent.internship_certificates}
 target="_blank"rel="noopener noreferrer"className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
 <ExternalLink className="w-4 h-4"/>
 View
 </a>
 </div>
 </div>
 )}
 </div>
 )
 }

 const renderSocialInfo = () => {
 // Safety check: ensure extendedStudent exists
 if (!extendedStudent) {
 console.error('StudentProfileModal - extendedStudent is undefined in renderSocialInfo')
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Social Profiles
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load social profiles information.
 </p>
 </div>
 </div>
 )
 }

 // Check if any social profiles exist
const hasSocialProfiles = extendedStudent.linkedin_profile ||
 extendedStudent.github_profile ||
 extendedStudent.personal_website

 if (!hasSocialProfiles) {
 return (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <Globe className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Social Profiles
 </h3>
 <p className="text-sm text-gray-600">
 This student hasn't added any social profiles yet.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Social Profiles */}
 <div className="rounded-xl shadow-sm border border-pink-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-xl shadow-lg">
 <Globe className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-pink-900">
 Social Profiles
 </h3>
 </div>
 <div className="space-y-3">
 {extendedStudent.linkedin_profile && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-blue-100 rounded-xl">
 <Globe className="w-4 h-4 text-blue-600"/>
 </div>
 <span className="text-sm text-gray-700 font-medium">
 LinkedIn
 </span>
 <a
 href={extendedStudent.linkedin_profile}
 target="_blank"rel="noopener noreferrer"className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
 <ExternalLink className="w-4 h-4"/>
 Visit
 </a>
 </div>
 )}
 {extendedStudent.github_profile && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-gray-100 rounded-xl">
 <Code className="w-4 h-4 text-gray-800"/>
 </div>
 <span className="text-sm text-gray-700 font-medium">
 GitHub
 </span>
 <a
 href={extendedStudent.github_profile}
 target="_blank"rel="noopener noreferrer"className="ml-auto flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm font-medium">
 <ExternalLink className="w-4 h-4"/>
 Visit
 </a>
 </div>
 )}
 {extendedStudent.personal_website && (
 <div className="flex items-center gap-3 p-3 rounded-xl">
 <div className="p-2 bg-blue-100 rounded-xl">
 <Globe className="w-4 h-4 text-blue-600"/>
 </div>
 <span className="text-sm text-gray-700 font-medium">
 Personal Website
 </span>
 <a
 href={extendedStudent.personal_website}
 target="_blank"rel="noopener noreferrer"className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
 <ExternalLink className="w-4 h-4"/>
 Visit
 </a>
 </div>
 )}
 </div>
 </div>
 </div>
 )
 }

 return (
 <motion.div
 className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={handleBackdropClick}
 >
 <motion.div
 className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-2 sm:mx-4 max-h-[95vh] h-[95vh] overflow-hidden flex flex-col"initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 transition={{ type:"spring", duration: 0.3 }}
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="bg-white border-b border-gray-200 p-3 sm:p-4 lg:p-6 rounded-xl">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 {/* Profile image and name removed from top */}
 </div>
 {/* Quick Actions */}
 <div className="flex items-center gap-2">
 {/* Copy Email */}
 {/* <button
 onClick={() => copyToClipboard(extendedStudent.email)}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"title="Copy Email">
 <Copy className="w-4 h-4 text-gray-500"/>
 </button> */}

 {/* Export Data */}
 {/* <button
 onClick={exportProfileData}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"title="Export Profile Data">
 <Download className="w-4 h-4 text-gray-500"/>
 </button> */}

 {/* Share Profile */}
 {/* <button
 onClick={shareProfile}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"title="Share Profile">
 <Share2 className="w-4 h-4 text-gray-500"/>
 </button> */}

 {/* Print Profile */}
 {/* <button
 onClick={printProfile}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"title="Print Profile">
 <Printer className="w-4 h-4 text-gray-500"/>
 </button> */}

 {/* Close Button */}
 <button
 onClick={onClose}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"title="Close">
 <X className="w-5 h-5 text-gray-500"/>
 </button>
 </div>
 </div>
 </div>

 {/* Profile Overview */}
 <div className="p-3 sm:p-4 lg:p-6 border-b border-blue-200">
 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 lg:gap-6">
 {/* Profile Avatar & Basic Info */}
 <div className="text-center sm:text-left">
 <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0 mb-2 sm:mb-3 relative">
 <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg overflow-hidden">
 {extendedStudent.profile_picture ? (
 <img
 src={extendedStudent.profile_picture}
 alt={extendedStudent.name}
 className="w-16 h-16 sm:w-20 sm:h-20 object-cover"onError={(e) => {
 // Fallback to initials if image fails to load
const target = e.target as HTMLImageElement;
 target.style.display ='none';
 const parent = target.parentElement;
 if (parent) {
 parent.innerHTML = `<span class="text-xl font-bold text-white">${getInitials(extendedStudent.name)}</span>`;
 }
 }}
 />
 ) : (
 <span className="text-xl font-bold text-white">
 {getInitials(extendedStudent.name)}
 </span>
 )}
 </div>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-1">
 {extendedStudent.name}
 </h3>
 <p className="text-gray-600 text-sm">
 {extendedStudent.institution ||'University Student'}
 </p>
 <p className="text-xs text-gray-500">
 {extendedStudent.degree} • {extendedStudent.branch}
 </p>
 </div>

 {/* Profile Stats */}
 <div className="flex-1 w-full">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
 {/* Email Card - Blue Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-xl border">
 <span className="text-xs text-blue-700 font-medium">Email</span>
 {extendedStudent.email_verified ? (
 <div className="p-1.5 bg-blue-500">
 <CheckCircle className="w-3 h-3 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 text-white"/>
 </div>
 )}
 </div>

 {/* Phone Card - Purple Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-xl border">
 <span className="text-xs text-purple-700 font-medium">Phone</span>
 {extendedStudent.phone_verified ? (
 <div className="p-1.5 bg-blue-500">
 <CheckCircle className="w-3 h-3 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 text-white"/>
 </div>
 )}
 </div>

 {/* Status Card - Orange Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-xl border">
 <span className="text-xs text-orange-700 font-medium">Status</span>
 <div className={`px-2 py-1 text-xs font-medium ${getStatusColor(extendedStudent.placement_status)}`}>
 {extendedStudent.placement_status}
 </div>
 </div>

 {/* Profile Card - Green Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-xl border">
 <span className="text-xs text-blue-700 font-medium">Profile</span>
 <span className="text-xs font-medium text-blue-600">
 {Math.round(extendedStudent.profile_completion_percentage)}%
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
 <div className="flex overflow-x-auto scrollbar-hide">
 {tabs.map((tab) => {
 const Icon = tab.icon
 const colors = getTabColors(tab.id)
 return (
 <motion.button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-1 sm:gap-2 lg:gap-3 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm lg:text-base font-medium whitespace-nowrap border-b-2 transition-all duration-200 relative ${activeTab === tab.id
 ? colors.active
 :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <Icon className={`w-4 h-4 ${activeTab === tab.id ? colors.icon :''}`} />
 {tab.label}
 {activeTab === tab.id && (
 <motion.div
 className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.indicator}`}
 layoutId="activeTab"initial={false}
 transition={{ type:"spring", stiffness: 500, damping: 30 }}
 />
 )}
 </motion.button>
 )
 })}
 </div>
 </div>

 {/* Tab Content */}
 <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
 {isLoading ? (
 <div className="flex items-center justify-center py-12">
 <div className="text-center">
 <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Loading profile data...</p>
 </div>
 </div>
 ) : (
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.3, ease:"easeInOut"}}
 >
 {renderTabContent()}
 </motion.div>
 )}
 </div>
 </motion.div>
 </motion.div>
 )
}

export default StudentProfileModal

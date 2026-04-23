"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
 Building2,
 Mail,
 Phone,
 MapPin,
 Calendar,
 Star,
 Globe,
 FileText,
 X,
 CheckCircle,
 AlertCircle,
 Camera,
 Eye,
 EyeOff,
 ExternalLink,
 Download,
 Users,
 GraduationCap,
 Shield,
 Clock,
 BarChart3,
 Award,
 BookOpen,
 Printer,
 Share2,
 Copy,
 User,
 Zap,
 Trophy,
 TrendingUp,
 Shield as ShieldIcon,
 Globe as GlobeIcon,
 CheckCircle2,
 UserCheck,
 XCircle
} from 'lucide-react'
import { UniversityListItem, UniversityProfile } from '@/types/university'
import { getInitials } from '@/lib/utils'// Extended interface that combines UniversityListItem with comprehensive profile data
interface ExtendedUniversityProfile extends UniversityListItem {
 // Additional fields that might not be in UniversityListItem
 bio?: string
 contact_person_name?: string
 contact_designation?: string
 website_url?: string
 established_year?: number
 courses_offered?: string
 departments?: string
 programs_offered?: string
 total_faculty?: number
 placement_rate?: number
 average_package?: number
 top_recruiters?: string
 verification_date?: string
 email_verified?: boolean
 phone_verified?: boolean
 profile_picture?: string
 updated_at?: string
 last_login?: string
}

interface UniversityProfileModalProps {
 isOpen: boolean
 onClose: () => void
 university: UniversityListItem | null
 fullProfile?: UniversityProfile | null
 isLoading?: boolean
}

export function UniversityProfileModal({
 isOpen,
 onClose,
 university,
 fullProfile,
 isLoading = false
}: UniversityProfileModalProps) {
 const [activeTab, setActiveTab] = useState('basic')

 console.log('UniversityProfileModal rendered with:', { isOpen, university, fullProfile, isLoading })

 if (!isOpen || !university) {
 console.log('UniversityProfileModal: Not rendering - isOpen:', isOpen,'university:', university)
 return null
 }

 // Safety check: ensure university has required properties
 if (!university.id || !university.university_name || !university.email) {
 console.error('UniversityProfileModal - Invalid university data:', university)
 return null
 }

 // Combine university data with full profile data if available
const extendedUniversity: ExtendedUniversityProfile = {
 ...university,
 ...fullProfile,
 // Ensure we have the latest data
 email_verified: fullProfile?.email_verified ?? university.email_verified ?? false,
 phone_verified: fullProfile?.phone_verified ?? university.phone_verified ?? false,
 profile_picture: fullProfile?.profile_picture ?? university.profile_picture,
 bio: university.bio ?? fullProfile?.bio ??'',
 contact_person_name: university.contact_person_name ?? fullProfile?.contact_person_name ??'',
 contact_designation: university.contact_designation ?? fullProfile?.contact_designation ??'',
 website_url: university.website_url ?? fullProfile?.website_url ??'',
 established_year: university.established_year ?? fullProfile?.established_year,
 courses_offered: university.courses_offered ?? fullProfile?.courses_offered ??'',
 departments: university.departments ?? fullProfile?.departments ??'',
 programs_offered: university.programs_offered ?? fullProfile?.programs_offered ??'',
 total_students: university.total_students ?? fullProfile?.total_students ?? 0,
 total_faculty: university.total_faculty ?? fullProfile?.total_faculty,
 placement_rate: university.placement_rate ?? fullProfile?.placement_rate,
 average_package: university.average_package ?? fullProfile?.average_package,
 top_recruiters: university.top_recruiters ?? fullProfile?.top_recruiters ??'',
 verification_date: fullProfile?.verification_date,
 placed_students: university.placed_students ?? fullProfile?.placed_students ?? 0,
 shortlisted_students: university.shortlisted_students ?? fullProfile?.shortlisted_students ?? 0,
 rejected_students: university.rejected_students ?? fullProfile?.rejected_students ?? 0
 }

 const handleBackdropClick = (e: React.MouseEvent) => {
 if (e.target === e.currentTarget) {
 onClose()
 }
 }

 const formatDate = (dateString?: string) => {
 if (!dateString) return 'N/A'
 return new Date(dateString).toLocaleDateString('en-US', {
 year:'numeric',
 month:'long',
 day:'numeric'})
 }

 const formatCurrency = (amount?: number) => {
 if (!amount) return 'N/A'
 return new Intl.NumberFormat('en-IN', {
 style:'currency',
 currency:'INR',
 maximumFractionDigits: 0
 }).format(amount * 100000) // Assuming amount is in lakhs
 }

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'bg-green-100 text-green-800'
 case 'inactive':
 return 'bg-yellow-100 text-yellow-800'
 case 'suspended':
 return 'bg-red-100 text-red-800'
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
 case'placement':
 return {
 active:'border-green-500 text-green-600 bg-green-50',
 indicator:'bg-green-500',
 icon:'text-green-600'}
 case'contact':
 return {
 active:'border-orange-500 text-orange-600 bg-orange-50',
 indicator:'bg-orange-500',
 icon:'text-orange-600'}
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
 { id:'placement', label:'Placement', icon: TrendingUp },
 { id:'contact', label:'Contact', icon: Mail }
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
 case'placement':
 console.log('Rendering placement info')
 return renderPlacementInfo()
 case'contact':
 console.log('Rendering contact info')
 return renderContactInfo()
 default:
 console.log('Rendering default (basic) info')
 return renderBasicInfo()
 }
 } catch (error) {
 console.error('Error rendering tab content for tab:', activeTab, error)
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
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

 const renderBasicInfo = () => {
 if (!extendedUniversity) {
 console.error('UniversityProfileModal - extendedUniversity is undefined in renderBasicInfo')
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
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
 {/* University Information */}
 <div className="rounded-none-none shadow-sm border border-blue-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <Building2 className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-blue-900">
 University Information
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-3">
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-blue-100 rounded-none-none">
 <Building2 className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.university_name}
 </p>
 <p className="text-xs text-blue-600">University Name</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-purple-100 rounded-none-none">
 <GraduationCap className="w-4 h-4 text-purple-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.institute_type ||'Not specified'}
 </p>
 <p className="text-xs text-purple-600">Institute Type</p>
 </div>
 </div>
 {extendedUniversity.established_year && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-green-100 rounded-none-none">
 <Calendar className="w-4 h-4 text-green-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.established_year}
 </p>
 <p className="text-xs text-green-600">Established Year</p>
 </div>
 </div>
 )}
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-orange-100 rounded-none-none">
 <Calendar className="w-4 h-4 text-orange-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {formatDate(extendedUniversity.created_at)}
 </p>
 <p className="text-xs text-orange-600">Joined Platform</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-indigo-100 rounded-none-none">
 <Users className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.total_students ?? 0}
 </p>
 <p className="text-xs text-indigo-600">Total Students</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-red-100 rounded-none-none">
 <Shield className="w-4 h-4 text-red-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.verified ?'Verified':'Unverified'}
 </p>
 <p className="text-xs text-red-600">Verification Status</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Additional Information */}
 {extendedUniversity.bio && (
 <div className="rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <FileText className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 About
 </h3>
 </div>
 <p className="text-gray-700 leading-relaxed">
 {extendedUniversity.bio}
 </p>
 </div>
 )}
 </div>
 )
 }

 const renderAcademicInfo = () => {
 if (!extendedUniversity) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
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

 // Check if we have any academic data
const hasAcademicData = extendedUniversity.courses_offered ||
 extendedUniversity.departments ||
 extendedUniversity.programs_offered ||
 extendedUniversity.total_faculty

 if (!hasAcademicData) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <GraduationCap className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Academic Data Available
 </h3>
 <p className="text-sm text-gray-600">
 This university hasn't provided academic information yet.
 </p>
 <p className="text-xs text-gray-500 mt-2">
 Contact the university to add academic details.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Academic Programs */}
 <div className="rounded-none-none shadow-sm border border-purple-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <GraduationCap className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-purple-900">
 Academic Programs
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {extendedUniversity.courses_offered && (
 <div className="space-y-3">
 <h4 className="font-medium text-purple-800">Courses Offered</h4>
 <p className="text-sm text-gray-700 p-3 rounded-none-none">
 {extendedUniversity.courses_offered}
 </p>
 </div>
 )}
 {extendedUniversity.departments && (
 <div className="space-y-3">
 <h4 className="font-medium text-purple-800">Departments</h4>
 <p className="text-sm text-gray-700 p-3 rounded-none-none">
 {extendedUniversity.departments}
 </p>
 </div>
 )}
 {extendedUniversity.programs_offered && (
 <div className="space-y-3 md:col-span-2">
 <h4 className="font-medium text-purple-800">Programs Offered</h4>
 <p className="text-sm text-gray-700 p-3 rounded-none-none">
 {extendedUniversity.programs_offered}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Faculty Information */}
 {extendedUniversity.total_faculty && (
 <div className="rounded-none-none shadow-sm border border-indigo-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <Users className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-indigo-900">
 Faculty Information
 </h3>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-indigo-100 rounded-none-none">
 <Users className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.total_faculty}
 </p>
 <p className="text-xs text-indigo-600">Total Faculty</p>
 </div>
 </div>
 </div>
 )}
 </div>
 )
 }

 const renderPlacementInfo = () => {
 if (!extendedUniversity) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Placement Info
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load placement information.
 </p>
 </div>
 </div>
 )
 }

 // Check if we have any placement data
const hasPlacementData = extendedUniversity.placement_rate ||
 extendedUniversity.average_package ||
 extendedUniversity.total_students ||
 extendedUniversity.top_recruiters ||
 extendedUniversity.placed_students ||
 extendedUniversity.shortlisted_students ||
 extendedUniversity.rejected_students

 if (!hasPlacementData) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <BarChart3 className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Placement Data Available
 </h3>
 <p className="text-sm text-gray-600">
 This university hasn't provided placement statistics yet.
 </p>
 <p className="text-xs text-gray-500 mt-2">
 Contact the university to add placement information.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Student Placement Statistics */}
 <div className="rounded-none-none shadow-sm border border-indigo-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <Users className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-indigo-900">
 Student Placement Statistics
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Placed Students */}
 <div className="rounded-none-none p-4 border border-green-200">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-green-100 rounded-none-none">
 <CheckCircle2 className="w-5 h-5 text-green-600"/>
 </div>
 <h4 className="font-medium text-green-800">Placed Students</h4>
 </div>
 <p className="text-3xl font-bold text-green-600">
 {extendedUniversity.placed_students || 0}
 </p>
 <p className="text-xs text-gray-500 mt-1">
 Students with selected applications
 </p>
 </div>

 {/* Shortlisted Students */}
 <div className="rounded-none-none p-4 border border-blue-200">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-blue-100 rounded-none-none">
 <UserCheck className="w-5 h-5 text-blue-600"/>
 </div>
 <h4 className="font-medium text-blue-800">Shortlisted Students</h4>
 </div>
 <p className="text-3xl font-bold text-blue-600">
 {extendedUniversity.shortlisted_students || 0}
 </p>
 <p className="text-xs text-gray-500 mt-1">
 Students in selection process
 </p>
 </div>

 {/* Rejected Students */}
 <div className="rounded-none-none p-4 border border-red-200">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-red-100 rounded-none-none">
 <XCircle className="w-5 h-5 text-red-600"/>
 </div>
 <h4 className="font-medium text-red-800">Rejected Students</h4>
 </div>
 <p className="text-3xl font-bold text-red-600">
 {extendedUniversity.rejected_students || 0}
 </p>
 <p className="text-xs text-gray-500 mt-1">
 Students with rejected applications
 </p>
 </div>
 </div>
 </div>

 {/* Placement Statistics */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {extendedUniversity.placement_rate && (
 <div className="rounded-none-none shadow-sm border border-green-200 p-6">
 <div className="flex items-center gap-3 mb-3">
 <div className="p-2 bg-green-100 rounded-none-none">
 <BarChart3 className="w-5 h-5 text-green-600"/>
 </div>
 <h4 className="font-medium text-green-800">Placement Rate</h4>
 </div>
 <p className="text-2xl font-bold text-green-600">
 {extendedUniversity.placement_rate}%
 </p>
 </div>
 )}
 {extendedUniversity.average_package && (
 <div className="rounded-none-none shadow-sm border border-blue-200 p-6">
 <div className="flex items-center gap-3 mb-3">
 <div className="p-2 bg-blue-100 rounded-none-none">
 <Award className="w-5 h-5 text-blue-600"/>
 </div>
 <h4 className="font-medium text-blue-800">Average Package</h4>
 </div>
 <p className="text-2xl font-bold text-blue-600">
 {formatCurrency(extendedUniversity.average_package)}
 </p>
 </div>
 )}
 {extendedUniversity.total_students && (
 <div className="rounded-none-none shadow-sm border border-purple-200 p-6">
 <div className="flex items-center gap-3 mb-3">
 <div className="p-2 bg-purple-100 rounded-none-none">
 <Users className="w-5 h-5 text-purple-600"/>
 </div>
 <h4 className="font-medium text-purple-800">Total Students</h4>
 </div>
 <p className="text-2xl font-bold text-purple-600">
 {extendedUniversity.total_students}
 </p>
 </div>
 )}
 </div>

 {/* Top Recruiters */}
 {extendedUniversity.top_recruiters && (
 <div className="rounded-none-none shadow-sm border border-orange-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <Trophy className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-orange-900">
 Top Recruiters
 </h3>
 </div>
 <p className="text-gray-700 p-3 rounded-none-none">
 {extendedUniversity.top_recruiters}
 </p>
 </div>
 )}
 </div>
 )
 }

 const renderContactInfo = () => {
 if (!extendedUniversity) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Contact Info
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load contact information.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Contact Information */}
 <div className="rounded-none-none shadow-sm border border-orange-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <Mail className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-orange-900">
 Contact Information
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-3">
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-blue-100 rounded-none-none">
 <Mail className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.email}
 </p>
 <p className="text-xs text-blue-600">Email Address</p>
 {extendedUniversity.email_verified && (
 <span className="inline-flex items-center text-xs text-green-600">
 <CheckCircle className="w-3 h-3 mr-1"/>
 Verified
 </span>
 )}
 </div>
 </div>
 {extendedUniversity.phone && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-green-100 rounded-none-none">
 <Phone className="w-4 h-4 text-green-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.phone}
 </p>
 <p className="text-xs text-green-600">Phone Number</p>
 {extendedUniversity.phone_verified && (
 <span className="inline-flex items-center text-xs text-green-600">
 <CheckCircle className="w-3 h-3 mr-1"/>
 Verified
 </span>
 )}
 </div>
 </div>
 )}
 {extendedUniversity.website_url && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-purple-100 rounded-none-none">
 <Globe className="w-4 h-4 text-purple-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 <a
 href={extendedUniversity.website_url}
 target="_blank"rel="noopener noreferrer"className="text-blue-600 hover:underline">
 {extendedUniversity.website_url}
 <ExternalLink className="w-3 h-3 inline ml-1"/>
 </a>
 </p>
 <p className="text-xs text-purple-600">Website</p>
 </div>
 </div>
 )}
 </div>
 <div className="space-y-3">
 {extendedUniversity.address && (
 <div className="flex items-start gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-red-100 rounded-none-none">
 <MapPin className="w-4 h-4 text-red-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.address}
 </p>
 <p className="text-xs text-red-600">Address</p>
 </div>
 </div>
 )}
 {extendedUniversity.contact_person_name && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-indigo-100 rounded-none-none">
 <Users className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedUniversity.contact_person_name}
 </p>
 <p className="text-xs text-indigo-600">Contact Person</p>
 {extendedUniversity.contact_designation && (
 <p className="text-xs text-gray-500">
 {extendedUniversity.contact_designation}
 </p>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
 }

 return createPortal(
 <motion.div
 className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={handleBackdropClick}
 >
 <motion.div
 className="bg-white rounded-none-none shadow-2xl max-w-5xl w-full mx-2 sm:mx-4 h-[90vh] sm:h-[80vh] lg:h-[75vh] overflow-hidden flex flex-col"initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 transition={{ type:"spring", duration: 0.3 }}
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="bg-white border-b border-gray-200 p-3 sm:p-4 lg:p-6 rounded-none-none">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 {/* Profile image and name removed from top */}
 </div>
 {/* Quick Actions */}
 <div className="flex items-center gap-2">
 {/* Close Button */}
 <button
 onClick={onClose}
 className="p-2 hover:bg-gray-100 rounded-none-none transition-colors duration-200"title="Close">
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
 {extendedUniversity.profile_picture ? (
 <img
 src={extendedUniversity.profile_picture}
 alt={extendedUniversity.university_name}
 className="w-16 h-16 sm:w-20 sm:h-20 object-cover"onError={(e) => {
 // Fallback to initials if image fails to load
const target = e.target as HTMLImageElement;
 target.style.display ='none';
 const parent = target.parentElement;
 if (parent) {
 parent.innerHTML = `<span class="text-xl font-bold text-white">${getInitials(extendedUniversity.university_name)}</span>`;
 }
 }}
 />
 ) : (
 <span className="text-xl font-bold text-white">
 {getInitials(extendedUniversity.university_name)}
 </span>
 )}
 </div>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-1">
 {extendedUniversity.university_name}
 </h3>
 <p className="text-gray-600 text-sm">
 {extendedUniversity.institute_type ||'Educational Institution'}
 </p>
 <p className="text-xs text-gray-500">
 {extendedUniversity.established_year ? `Est. ${extendedUniversity.established_year}` :'University'}
 </p>
 </div>

 {/* Profile Stats */}
 <div className="flex-1 w-full">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
 {/* Email Card - Blue Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-none-none border">
 <span className="text-xs text-blue-700 font-medium">Email</span>
 {extendedUniversity.email_verified ? (
 <div className="p-1.5 bg-green-500">
 <CheckCircle className="w-3 h-3 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 text-white"/>
 </div>
 )}
 </div>

 {/* Phone Card - Purple Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-none-none border">
 <span className="text-xs text-purple-700 font-medium">Phone</span>
 {extendedUniversity.phone_verified ? (
 <div className="p-1.5 bg-green-500">
 <CheckCircle className="w-3 h-3 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 text-white"/>
 </div>
 )}
 </div>

 {/* Status Card - Orange Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-none-none border">
 <span className="text-xs text-orange-700 font-medium">Status</span>
 <div className={`px-2 py-1 text-xs font-medium ${getStatusColor(extendedUniversity.status)}`}>
 {extendedUniversity.status}
 </div>
 </div>

 {/* Verification Card - Green Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-none-none border">
 <span className="text-xs text-green-700 font-medium">Verified</span>
 <span className="text-xs font-medium text-green-600">
 {extendedUniversity.verified ?'Yes':'No'}
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
 <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
 {isLoading ? (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 ) : (
 renderTabContent()
 )}
 </div>

 </motion.div>
 </motion.div>,
 document.body
 )
}

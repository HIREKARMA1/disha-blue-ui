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
 Globe,
 X,
 CheckCircle,
 AlertCircle,
 Shield,
 Briefcase,
 Users,
 User,
 ExternalLink,
 Clock,
 TrendingUp,
 BarChart3,
 FileText
} from 'lucide-react'
import { CorporateListItem, CorporateProfile } from '@/types/corporate'
import { getInitials } from '@/lib/utils'// Extended interface that combines CorporateListItem with comprehensive profile data
interface ExtendedCorporateProfile extends CorporateListItem {
 // Additional fields that might not be in CorporateListItem
 bio?: string
 contact_person?: string
 contact_designation?: string
 website_url?: string
 founded_year?: number
 description?: string
 email_verified?: boolean
 phone_verified?: boolean
 profile_picture?: string
 updated_at?: string
 last_login?: string
}

interface CorporateProfileModalProps {
 isOpen: boolean
 onClose: () => void
 corporate: CorporateListItem | null
 fullProfile?: CorporateProfile | null
 isLoading?: boolean
}

export function CorporateProfileModal({
 isOpen,
 onClose,
 corporate,
 fullProfile,
 isLoading = false
}: CorporateProfileModalProps) {
 const [activeTab, setActiveTab] = useState('basic')

 console.log('CorporateProfileModal rendered with:', { isOpen, corporate, fullProfile, isLoading })

 if (!isOpen || !corporate) {
 console.log('CorporateProfileModal: Not rendering - isOpen:', isOpen,'corporate:', corporate)
 return null
 }

 // Safety check: ensure corporate has required properties
 if (!corporate.id || !corporate.company_name || !corporate.email) {
 console.error('CorporateProfileModal - Invalid corporate data:', corporate)
 return null
 }

 // Combine corporate data with full profile data if available
const extendedCorporate: ExtendedCorporateProfile = {
 ...corporate,
 ...fullProfile,
 // Ensure we have the latest data
 email_verified: fullProfile?.email_verified ?? corporate.email_verified ?? false,
 phone_verified: fullProfile?.phone_verified ?? corporate.phone_verified ?? false,
 profile_picture: fullProfile?.profile_picture ?? corporate.profile_picture,
 bio: corporate.bio ?? fullProfile?.bio ??'',
 description: corporate.description ?? fullProfile?.description ??'',
 contact_person: corporate.contact_person ?? fullProfile?.contact_person ??'',
 contact_designation: corporate.contact_designation ?? fullProfile?.contact_designation ??'',
 website_url: corporate.website_url ?? fullProfile?.website_url ??'',
 founded_year: corporate.founded_year ?? fullProfile?.founded_year,
 updated_at: fullProfile?.updated_at ?? corporate.updated_at,
 last_login: fullProfile?.last_login ?? corporate.last_login
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
 case'company':
 return {
 active:'border-purple-500 text-purple-600 bg-purple-50',
 indicator:'bg-purple-500',
 icon:'text-purple-600'}
 case'jobs':
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
 { id:'company', label:'Company', icon: Building2 },
 { id:'jobs', label:'Jobs', icon: TrendingUp },
 { id:'contact', label:'Contact', icon: Mail }
 ]

 const renderTabContent = () => {
 console.log('Rendering tab content for activeTab:', activeTab)
 try {
 switch (activeTab) {
 case'basic':
 console.log('Rendering basic info')
 return renderBasicInfo()
 case'company':
 console.log('Rendering company info')
 return renderCompanyInfo()
 case'jobs':
 console.log('Rendering jobs info')
 return renderJobsInfo()
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
 if (!extendedCorporate) {
 console.error('CorporateProfileModal - extendedCorporate is undefined in renderBasicInfo')
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
 {/* Corporate Information */}
 <div className="rounded-none-none shadow-sm border border-blue-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <Building2 className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-blue-900">
 Corporate Information
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
 {extendedCorporate.company_name}
 </p>
 <p className="text-xs text-blue-600">Company Name</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-purple-100 rounded-none-none">
 <Briefcase className="w-4 h-4 text-purple-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.company_type ||'Not specified'}
 </p>
 <p className="text-xs text-purple-600">Company Type</p>
 </div>
 </div>
 {extendedCorporate.founded_year && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-green-100 rounded-none-none">
 <Calendar className="w-4 h-4 text-green-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.founded_year}
 </p>
 <p className="text-xs text-green-600">Founded Year</p>
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
 {formatDate(extendedCorporate.created_at)}
 </p>
 <p className="text-xs text-orange-600">Joined Platform</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-indigo-100 rounded-none-none">
 <Briefcase className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.total_jobs || 0}
 </p>
 <p className="text-xs text-indigo-600">Total Jobs</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-red-100 rounded-none-none">
 <Shield className="w-4 h-4 text-red-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.verified ?'Verified':'Unverified'}
 </p>
 <p className="text-xs text-red-600">Verification Status</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Additional Information */}
 {extendedCorporate.bio && (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <FileText className="w-5 h-5 text-gray-600"/>
 Bio
 </h3>
 <p className="text-sm text-gray-700">
 {extendedCorporate.bio}
 </p>
 </div>
 )}

 {/* Status Information */}
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Shield className="w-5 h-5 text-blue-600"/>
 Status & Verification
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-gray-50 rounded-none-none">
 <p className="text-sm text-gray-600 mb-1">Status</p>
 <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${getStatusColor(extendedCorporate.status)}`}>
 {extendedCorporate.status}
 </span>
 </div>
 <div className="p-4 bg-gray-50 rounded-none-none">
 <p className="text-sm text-gray-600 mb-1">Email Verified</p>
 <div className="flex items-center gap-2">
 {extendedCorporate.email_verified ? (
 <CheckCircle className="w-4 h-4 text-green-600"/>
 ) : (
 <AlertCircle className="w-4 h-4 text-yellow-600"/>
 )}
 <span className="text-sm font-medium text-gray-900">
 {extendedCorporate.email_verified ?'Verified':'Not Verified'}
 </span>
 </div>
 </div>
 <div className="p-4 bg-gray-50 rounded-none-none">
 <p className="text-sm text-gray-600 mb-1">Phone Verified</p>
 <div className="flex items-center gap-2">
 {extendedCorporate.phone_verified ? (
 <CheckCircle className="w-4 h-4 text-green-600"/>
 ) : (
 <AlertCircle className="w-4 h-4 text-yellow-600"/>
 )}
 <span className="text-sm font-medium text-gray-900">
 {extendedCorporate.phone_verified ?'Verified':'Not Verified'}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
 }

 const renderCompanyInfo = () => {
 if (!extendedCorporate) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Company Info
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load company information.
 </p>
 </div>
 </div>
 )
 }

 // Check if we have any company data
const hasCompanyData = extendedCorporate.industry ||
 extendedCorporate.company_size ||
 extendedCorporate.founded_year ||
 extendedCorporate.description ||
 extendedCorporate.website_url ||
 extendedCorporate.address

 if (!hasCompanyData) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <Building2 className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Company Data Available
 </h3>
 <p className="text-sm text-gray-600">
 This corporate hasn't provided company information yet.
 </p>
 <p className="text-xs text-gray-500 mt-2">
 Contact the corporate to add company details.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Company Details */}
 <div className="rounded-none-none shadow-sm border border-purple-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <Building2 className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-purple-900">
 Company Details
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {extendedCorporate.industry && (
 <div className="space-y-3">
 <h4 className="font-medium text-purple-800">Industry</h4>
 <p className="text-sm text-gray-700 p-3 rounded-none-none">
 {extendedCorporate.industry}
 </p>
 </div>
 )}
 {extendedCorporate.company_size && (
 <div className="space-y-3">
 <h4 className="font-medium text-purple-800">Company Size</h4>
 <p className="text-sm text-gray-700 p-3 rounded-none-none">
 {extendedCorporate.company_size}
 </p>
 </div>
 )}
 {extendedCorporate.description && (
 <div className="space-y-3 md:col-span-2">
 <h4 className="font-medium text-purple-800">Description</h4>
 <p className="text-sm text-gray-700 p-3 rounded-none-none">
 {extendedCorporate.description}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Address */}
 {extendedCorporate.address && (
 <div className="rounded-none-none shadow-sm border border-indigo-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 rounded-none-none shadow-lg">
 <MapPin className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-lg font-semibold text-indigo-900">
 Address
 </h3>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-indigo-100 rounded-none-none">
 <MapPin className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.address}
 </p>
 <p className="text-xs text-indigo-600">Company Address</p>
 </div>
 </div>
 </div>
 )}
 </div>
 )
 }

 const renderJobsInfo = () => {
 if (!extendedCorporate) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Error Loading Jobs Info
 </h3>
 <p className="text-sm text-gray-600">
 Unable to load jobs information.
 </p>
 </div>
 </div>
 )
 }

 // Check if we have any jobs data
const hasJobsData = extendedCorporate.total_jobs && extendedCorporate.total_jobs > 0

 if (!hasJobsData) {
 return (
 <div className="bg-white rounded-none-none shadow-sm border border-gray-200 p-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
 <Briefcase className="w-8 h-8 text-gray-400"/>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 No Jobs Posted Yet
 </h3>
 <p className="text-sm text-gray-600">
 This corporate hasn't posted any job opportunities yet.
 </p>
 <p className="text-xs text-gray-500 mt-2">
 Contact the corporate to post job opportunities.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Jobs Statistics */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="rounded-none-none shadow-sm border border-green-200 p-6">
 <div className="flex items-center gap-3 mb-3">
 <div className="p-2 bg-green-100 rounded-none-none">
 <BarChart3 className="w-5 h-5 text-green-600"/>
 </div>
 <h4 className="font-medium text-green-800">Total Jobs</h4>
 </div>
 <p className="text-2xl font-bold text-green-600">
 {extendedCorporate.total_jobs || 0}
 </p>
 </div>
 </div>
 </div>
 )
 }

 const renderContactInfo = () => {
 if (!extendedCorporate) {
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
 {extendedCorporate.email}
 </p>
 <p className="text-xs text-blue-600">Email Address</p>
 {extendedCorporate.email_verified && (
 <span className="inline-flex items-center text-xs text-green-600">
 <CheckCircle className="w-3 h-3 mr-1"/>
 Verified
 </span>
 )}
 </div>
 </div>
 {extendedCorporate.phone && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-green-100 rounded-none-none">
 <Phone className="w-4 h-4 text-green-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.phone}
 </p>
 <p className="text-xs text-green-600">Phone Number</p>
 {extendedCorporate.phone_verified && (
 <span className="inline-flex items-center text-xs text-green-600">
 <CheckCircle className="w-3 h-3 mr-1"/>
 Verified
 </span>
 )}
 </div>
 </div>
 )}
 {extendedCorporate.website_url && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-purple-100 rounded-none-none">
 <Globe className="w-4 h-4 text-purple-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 <a
 href={extendedCorporate.website_url}
 target="_blank"rel="noopener noreferrer"className="text-blue-600 hover:underline">
 {extendedCorporate.website_url}
 <ExternalLink className="w-3 h-3 inline ml-1"/>
 </a>
 </p>
 <p className="text-xs text-purple-600">Website</p>
 </div>
 </div>
 )}
 </div>
 <div className="space-y-3">
 {extendedCorporate.address && (
 <div className="flex items-start gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-red-100 rounded-none-none">
 <MapPin className="w-4 h-4 text-red-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.address}
 </p>
 <p className="text-xs text-red-600">Address</p>
 </div>
 </div>
 )}
 {extendedCorporate.contact_person && (
 <div className="flex items-center gap-3 p-3 rounded-none-none">
 <div className="p-2 bg-indigo-100 rounded-none-none">
 <Users className="w-4 h-4 text-indigo-600"/>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900">
 {extendedCorporate.contact_person}
 </p>
 <p className="text-xs text-indigo-600">Contact Person</p>
 {extendedCorporate.contact_designation && (
 <p className="text-xs text-gray-500">
 {extendedCorporate.contact_designation}
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
 {extendedCorporate.profile_picture ? (
 <img
 src={extendedCorporate.profile_picture}
 alt={extendedCorporate.company_name}
 className="w-16 h-16 sm:w-20 sm:h-20 object-cover"onError={(e) => {
 // Fallback to initials if image fails to load
const target = e.target as HTMLImageElement;
 target.style.display ='none';
 const parent = target.parentElement;
 if (parent) {
 parent.innerHTML = `<span class="text-xl font-bold text-white">${getInitials(extendedCorporate.company_name)}</span>`;
 }
 }}
 />
 ) : (
 <span className="text-xl font-bold text-white">
 {getInitials(extendedCorporate.company_name)}
 </span>
 )}
 </div>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-1">
 {extendedCorporate.company_name}
 </h3>
 <p className="text-gray-600 text-sm">
 {extendedCorporate.company_type ||'Corporate'}
 </p>
 <p className="text-xs text-gray-500">
 {extendedCorporate.founded_year ? `Est. ${extendedCorporate.founded_year}` :'Corporate'}
 </p>
 </div>

 {/* Profile Stats */}
 <div className="flex-1 w-full">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
 {/* Email Card - Blue Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-none-none border">
 <span className="text-xs text-blue-700 font-medium">Email</span>
 {extendedCorporate.email_verified ? (
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
 {extendedCorporate.phone_verified ? (
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
 <div className={`px-2 py-1 text-xs font-medium ${getStatusColor(extendedCorporate.status)}`}>
 {extendedCorporate.status}
 </div>
 </div>

 {/* Verification Card - Green Theme */}
 <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-none-none border">
 <span className="text-xs text-green-700 font-medium">Verified</span>
 <span className="text-xs font-medium text-green-600">
 {extendedCorporate.verified ?'Yes':'No'}
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

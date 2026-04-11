"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
 Building2,
 Globe,
 Zap,
 Shield,
 Trophy,
 ChevronRight,
 CheckCircle,
 AlertCircle,
 Camera,
 FileText,
 Users,
 MapPin,
 Calendar,
 Phone,
 Mail,
 ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CorporateDashboardLayout } from './CorporateDashboardLayout'
import { FileUpload } from '../ui/file-upload'
import { ImageModal } from '../ui/image-modal'
import { cn, getInitials, truncateText } from '@/lib/utils'
import { corporateProfileService } from '@/services/corporateProfileService'
import { type CorporateProfile, type CorporateProfileUpdateData } from '@/types/corporate'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { corporateHeroClass, corporateSurfaceClass } from '@/components/corporate/corporate-ui'// Industry options
const industryOptions = [
 { value:'Technology', label:'Technology'},
 { value:'Finance', label:'Finance'},
 { value:'Healthcare', label:'Healthcare'},
 { value:'Education', label:'Education'},
 { value:'Manufacturing', label:'Manufacturing'},
 { value:'Retail', label:'Retail'},
 { value:'Real Estate', label:'Real Estate'},
 { value:'Consulting', label:'Consulting'},
 { value:'Media & Entertainment', label:'Media & Entertainment'},
 { value:'Telecommunications', label:'Telecommunications'},
 { value:'Automotive', label:'Automotive'},
 { value:'Aerospace', label:'Aerospace'},
 { value:'Energy', label:'Energy'},
 { value:'Government', label:'Government'},
 { value:'Non-Profit', label:'Non-Profit'},
 { value:'E-commerce', label:'E-commerce'},
 { value:'Banking', label:'Banking'},
 { value:'Insurance', label:'Insurance'},
 { value:'Pharmaceuticals', label:'Pharmaceuticals'},
 { value:'Food & Beverage', label:'Food & Beverage'},
 { value:'Transportation', label:'Transportation'},
 { value:'Logistics', label:'Logistics'},
 { value:'Hospitality', label:'Hospitality'},
 { value:'Agriculture', label:'Agriculture'},
 { value:'Construction', label:'Construction'},
 { value:'Human Resources', label:'Human Resources'},
 { value:'Other', label:'Other'}
]

interface ProfileSection {
 id: string
 title: string
 icon: any
 fields: string[]
 completed: boolean
}

export function CorporateProfile() {
 const [profile, setProfile] = useState<CorporateProfile | null>(null)
 const [loading, setLoading] = useState(true)
 const [editing, setEditing] = useState<string | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [saving, setSaving] = useState(false)
 const [activeTab, setActiveTab] = useState('basic')
 const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; altText: string }>({
 isOpen: false,
 imageUrl:'',
 altText:''})

 const profileSections: ProfileSection[] = [
 {
 id:'basic',
 title:'Basic Information',
 icon: Building2,
 fields: ['name','email','phone','contact_person','contact_designation','bio','company_logo'],
 completed: false
 },
 {
 id:'company',
 title:'Company Information',
 icon: Building2,
 fields: ['company_name','website_url','industry','company_size','founded_year','company_type','description'],
 completed: false
 },
 {
 id:'documents',
 title:'Documents & Certificates',
 icon: Shield,
 fields: ['company_logo','mca_gst_certificate'],
 completed: false
 }
 ]

 const tabs = [
 { id:'basic', label:'Basic Info', icon: Building2 },
 { id:'company', label:'Company', icon: Building2 }
 ]

 useEffect(() => {
 loadProfile()
 }, [])

 const loadProfile = async () => {
 try {
 setLoading(true)
 setError(null)

 const profileData = await corporateProfileService.getProfile()
 setProfile(profileData)
 } catch (error: any) {
 setError(error.message)
 } finally {
 setLoading(false)
 }
 }

 const handleSave = async (sectionId: string, formData: CorporateProfileUpdateData) => {
 try {
 setSaving(true)
 setError(null)

 console.log('Saving corporate profile data for section:', sectionId)
 console.log('Form data being sent:', formData)

 const updatedProfile = await corporateProfileService.updateProfile(formData)
 console.log('Profile updated successfully:', updatedProfile)

 setProfile(updatedProfile)
 setEditing(null)
 
 // Show success toast with section name
const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
toast.success(`${sectionName} updated successfully!`)

 } catch (error: any) {
 console.error('Error saving corporate profile:', error)
 setError(error.message)

 // Show error toast with specific message
 if (error.message.includes('network') || error.message.includes('Internet')) {
 toast.error('Network error. Please check your connection and try again.')
 } else if (error.message.includes('auth') || error.message.includes('login')) {
 toast.error('Authentication failed. Please log in again.')
 } else if (error.message.includes('validation') || error.message.includes('invalid')) {
 toast.error('Invalid data provided. Please check your input.')
 } else {
 toast.error(`Failed to save: ${error.message}`)
 }
 } finally {
 setSaving(false)
 }
 }

 if (loading) {
 return (
 <CorporateDashboardLayout>
 <div className="w-full">
 <div className="animate-pulse space-y-4 lg:space-y-6">
 <div className="h-6 w-1/3 rounded-xl bg-slate-200/80 dark:bg-emerald-800/60 lg:h-8"></div>
 <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
 <div className="xl:col-span-1">
 <div className="h-80 rounded-2xl bg-slate-200/80 dark:bg-emerald-800/50 lg:h-96"></div>
 </div>
 <div className="xl:col-span-3 space-y-4 lg:space-y-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-24 rounded-2xl bg-slate-200/80 dark:bg-emerald-800/50 lg:h-32"></div>
 ))}
 </div>
 <aside className="space-y-4 lg:col-span-3">
 <div className={`${corporateSurfaceClass} p-4`}>
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Profile score</p>
 <p className="mt-2 font-display text-3xl font-semibold text-foreground">
 {profile?.verified ?'92':'71'}
 <span className="ml-1 text-base text-muted-foreground">/100</span>
 </p>
 <p className="mt-2 text-sm text-muted-foreground">
 Improve company trust by completing profile, logo, and verification details.
 </p>
 </div>
 <div className={`${corporateSurfaceClass} p-4`}>
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Quick actions</p>
 <div className="mt-3 space-y-2">
 <button onClick={() => setActiveTab('company')} className="w-full rounded-2xl border px-3 py-2 text-left text-sm text-foreground transition">Update company details</button>
 <button onClick={() => setEditing('basic')} className="w-full rounded-2xl border px-3 py-2 text-left text-sm text-foreground transition">Refresh branding info</button>
 <button onClick={() => setEditing('company')} className="w-full rounded-2xl border px-3 py-2 text-left text-sm text-foreground transition">Refine about section</button>
 </div>
 </div>
 <div className={`${corporateSurfaceClass} p-4`}>
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hiring snapshot</p>
 <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
 <li>Ensure profile aligns with current openings</li>
 <li>Keep recruiter contacts updated</li>
 <li>Highlight benefits and culture clearly</li>
 </ul>
 </div>
 </aside>
 </div>
 </div>
 </div>
 </CorporateDashboardLayout>
 )
 }

 if (error && !profile) {
 return (
 <CorporateDashboardLayout>
 <div className="w-full text-center">
 <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-900/40 lg:p-8">
 <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 text-red-500 mx-auto mb-4"/>
 <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-emerald-50 mb-2">
 Unable to Load Profile
 </h2>
 <p className="text-slate-600 dark:text-emerald-200/85 mb-6">
 {error}
 </p>
 <Button onClick={loadProfile} variant="default">
 Try Again
 </Button>
 </div>
 </div>
 </CorporateDashboardLayout>
 )
 }

 if (!profile) {
 return (
 <CorporateDashboardLayout>
 <div className="w-full text-center">
 <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-900/40 lg:p-8">
 <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-500 mx-auto mb-4"/>
 <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-emerald-50 mb-2">
 Profile Not Found
 </h2>
 <p className="text-slate-600 dark:text-emerald-200/85">
 Unable to load your profile. Please try again later.
 </p>
 </div>
 </div>
 </CorporateDashboardLayout>
 )
 }

 return (
 <CorporateDashboardLayout>
 <div className="w-full">
 {/* Header - Consistent with other sections */}
 <div className={`${corporateHeroClass} mb-6`}>
 <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
 <div className="min-w-0 flex-1">
 <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Company</p>
 <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
 Company workspace profile
 </h1>
 <p className="text-muted-foreground text-base max-w-2xl">
 Maintain brand, hiring identity, and company information recruiters and candidates rely on.
 </p>
 </div>
 <div className="shrink-0 border px-3 py-1 text-xs font-medium text-muted-foreground">
 {new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric'})}
 </div>
 </div>
 </div>

 {/* Profile Content */}
 <div className="space-y-6">
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
 {/* Top Horizontal Section - Profile Overview */}
 <div className="lg:col-span-3">
 <div className={`${corporateSurfaceClass} p-4 lg:p-6 transition-shadow duration-300 hover:shadow-lg`}>
 <div className="flex flex-col items-center gap-6 lg:items-start">
 {/* Profile Avatar & Info */}
 <div className="text-center lg:text-left">
 <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto lg:mx-0 mb-4 relative">
 <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg">
 {profile.company_logo ? (
 <img
 src={profile.company_logo}
 alt={profile.company_name}
 className="w-20 h-20 lg:w-24 lg:h-24 object-cover"/>
 ) : (
 <span className="text-xl lg:text-2xl font-bold text-white">
 {getInitials(profile.company_name)}
 </span>
 )}
 </div>
 <button
 className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center border border-slate-200 bg-white text-sage-deep shadow-md transition-all duration-200 hover:scale-110 hover:bg-sage/20 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900/60 lg:h-6 lg:w-6"onClick={() => setEditing('basic')}
 title="Change profile picture">
 <Camera className="w-2.5 h-2.5 lg:w-3 lg:h-3"/>
 </button>
 </div>
 <h3 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-emerald-50 mb-1">
 {profile.company_name}
 </h3>
 <p className="text-slate-600 dark:text-emerald-200/85 text-sm">
 {profile.industry ||'Company'}
 </p>
 <p className="text-xs text-slate-500 dark:text-emerald-400">
 {profile.company_size} • {profile.company_type}
 </p>
 </div>

 {/* Profile Stats */}
 <div className="flex-1">
 <div className="mb-4 grid grid-cols-2 gap-3">
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-emerald-200/90">Email</span>
 {profile.email_verified ? (
 <div className="p-1.5 bg-green-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 )}
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-emerald-200/90">Phone</span>
 {profile.phone_verified ? (
 <div className="p-1.5 bg-green-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 )}
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-emerald-200/90">Logo</span>
 {profile.company_logo ? (
 <div className="p-1.5 bg-green-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 )}
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-emerald-200/90">Verified</span>
 {profile.verified ? (
 <div className="p-1.5 bg-green-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Tab-based Profile Sections */}
 <div className="lg:col-span-6">
 {/* Tab Navigation */}
 <div className="mb-6">
 <div className="border-b border-border">
 <nav className="-mb-px flex space-x-6 overflow-x-auto">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 type="button"onClick={() => setActiveTab(tab.id)}
 className={cn("flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-semibold transition-colors duration-200",
 activeTab === tab.id
 ?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground hover:border-border")}
 >
 <tab.icon className="w-4 h-4"/>
 <span>{tab.label}</span>
 </button>
 ))}
 </nav>
 </div>
 </div>

 {/* Tab Content */}
 <div className="min-h-[600px]">
 {activeTab ==='basic'&& (
 <div className={`${corporateSurfaceClass} p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center space-x-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-deep shadow-sm dark:bg-emerald-600">
 <Building2 className="w-6 h-6 text-white"/>
 </div>
 <div>
 <h3 className="text-xl font-semibold text-slate-900 dark:text-emerald-50">Basic Information</h3>
 <p className="text-sm text-slate-600 dark:text-emerald-200/85">Company details and contact information</p>
 </div>
 </div>
 <Button
 variant="ghost"size="sm"onClick={() => setEditing('basic')}
 className="text-sage-deep hover:text-sage-deep/90 dark:text-emerald-300 dark:hover:text-emerald-200 text-xs transition-all duration-200">
 <ChevronRight className="w-3 h-3 mr-1"/>
 Edit
 </Button>
 </div>

 {editing ==='basic'? (
 <ProfileSectionForm
 section={{ id:'basic', title:'Basic Information', icon: Building2, fields: ['name','email','phone','contact_person','contact_designation','bio','company_logo'], completed: false }}
 profile={profile}
 onSave={(formData) => handleSave('basic', formData)}
 saving={saving}
 onCancel={() => setEditing(null)}
 />
 ) : (
 <div className="space-y-4">
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Company Name
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.company_name ||'Company name not provided'}
 </div>
 </div>

 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Contact Information
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.email ||'Email not provided'}
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85 mt-1">
 Phone: {profile.phone ||'Not provided'}
 </div>
 </div>
 {(profile.contact_person || profile.contact_designation) && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Contact Person Details
 </div>
 {profile.contact_person && (
 <div className="text-sm text-slate-600 dark:text-emerald-200/85 mb-1">
 <span className="font-semibold">Contact Person Name:</span> {profile.contact_person}
 </div>
 )}
 {profile.contact_designation && (
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 <span className="font-semibold">Contact Person Designation:</span> {profile.contact_designation}
 </div>
 )}
 </div>
 )}

 {profile.bio && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Bio
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.bio}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {activeTab ==='company'&& (
 <div className={`${corporateSurfaceClass} p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center space-x-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-deep shadow-sm dark:bg-emerald-600">
 <Building2 className="w-6 h-6 text-white"/>
 </div>
 <div>
 <h3 className="text-xl font-semibold text-slate-900 dark:text-emerald-50">Company Information</h3>
 <p className="text-sm text-slate-600 dark:text-emerald-200/85">Business details and company profile</p>
 </div>
 </div>
 <Button
 variant="ghost"size="sm"onClick={() => setEditing('company')}
 className="text-xs text-sage-deep transition-all duration-200 hover:text-sage-deep/90 dark:text-emerald-300 dark:hover:text-emerald-200">
 <ChevronRight className="w-3 h-3 mr-1"/>
 Edit
 </Button>
 </div>

 {editing ==='company'? (
 <ProfileSectionForm
 section={{ id:'company', title:'Company Information', icon: Building2, fields: ['company_name','website_url','industry','company_size','founded_year','company_type','description'], completed: false }}
 profile={profile}
 onSave={(formData) => handleSave('company', formData)}
 saving={saving}
 onCancel={() => setEditing(null)}
 />
 ) : (
 <div className="space-y-4">
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Industry & Size
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.industry ||'Industry not specified'} • {profile.company_size ||'Size not specified'}
 </div>
 </div>

 {profile.company_type && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Company Type
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.company_type}
 </div>
 </div>
 )}

 {profile.founded_year && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Founded Year
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.founded_year}
 </div>
 </div>
 )}

 {profile.website_url && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Website
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 <a
 href={profile.website_url}
 target="_blank"rel="noopener noreferrer"className="flex items-center space-x-1 hover:text-sage-deep dark:hover:text-emerald-300">
 <span>{profile.website_url}</span>
 <ExternalLink className="w-3 h-3"/>
 </a>
 </div>
 </div>
 )}

 {profile.description && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-emerald-50 mb-2">
 Description
 </div>
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.description}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 )}


 </div>
 </div>
 </div>
 </div>

 {/* Image Modal */}
 <ImageModal
 isOpen={imageModal.isOpen}
 imageUrl={imageModal.imageUrl}
 altText={imageModal.altText}
 onClose={() => setImageModal({ isOpen: false, imageUrl:'', altText:''})}
 />
 </div>
 </CorporateDashboardLayout>
 )
}

// Inline ProfileSectionForm Component for Corporate Profile
interface ProfileSectionFormProps {
 section: {
 id: string
 title: string
 icon: any
 fields: string[]
 completed: boolean
 }
 profile: CorporateProfile
 onSave: (formData: any) => void
 saving: boolean
 onCancel: () => void
}

function ProfileSectionForm({ section, profile, onSave, saving, onCancel }: ProfileSectionFormProps) {
 const { getToken } = useAuth()
 const [formData, setFormData] = useState<any>({})
 const [uploading, setUploading] = useState<string | null>(null)
 const [uploadError, setUploadError] = useState<string | null>(null)
 const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

 useEffect(() => {
 if (profile && section) {
 // Initialize form data with current profile values
const initialData: any = {}
 section.fields.forEach(field => {
 initialData[field] = profile[field as keyof CorporateProfile] ||''})
 setFormData(initialData)
 }
 }, [profile, section])

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 
 // Validation errors array
const validationErrors: string[] = []
 let hasValidationErrors = false
 
 // Validate phone number if provided
 if (formData.phone && formData.phone.length !== 10) {
 validationErrors.push('Phone number must be exactly 10 digits')
 hasValidationErrors = true
 }
 
 // Validate name field if provided
 if (formData.name && formData.name.trim().length < 2) {
 validationErrors.push('Name must be at least 2 characters long')
 hasValidationErrors = true
 }

 // Validate contact_person field if provided
 if (formData.contact_person) {
 if (formData.contact_person.trim().length < 2) {
 validationErrors.push('Contact person name must be at least 2 characters long')
 hasValidationErrors = true
 }
 // Check if it contains only numbers
 if (/^\d+$/.test(formData.contact_person.trim())) {
 validationErrors.push('Contact person name cannot contain only numbers')
 hasValidationErrors = true
 }
 // Check if it contains at least one letter
 if (!/[a-zA-Z]/.test(formData.contact_person.trim())) {
 validationErrors.push('Contact person name must contain at least one letter')
 hasValidationErrors = true
 }
 }

 // Validate contact_designation field if provided
 if (formData.contact_designation) {
 if (formData.contact_designation.trim().length < 2) {
 validationErrors.push('Contact person designation must be at least 2 characters long')
 hasValidationErrors = true
 }
 // Check if it contains only numbers
 if (/^\d+$/.test(formData.contact_designation.trim())) {
 validationErrors.push('Contact person designation cannot contain only numbers')
 hasValidationErrors = true
 }
 // Check if it contains at least one letter
 if (!/[a-zA-Z]/.test(formData.contact_designation.trim())) {
 validationErrors.push('Contact person designation must contain at least one letter')
 hasValidationErrors = true
 }
 }
 
 // Validate company name if provided (for company section)
 if (formData.company_name && formData.company_name.trim().length < 2) {
 validationErrors.push('Company name must be at least 2 characters long')
 hasValidationErrors = true
 }
 
 // Validate website URL if provided
 if (formData.website_url && formData.website_url.trim()) {
 const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
 if (!urlPattern.test(formData.website_url)) {
 validationErrors.push('Please enter a valid website URL')
 hasValidationErrors = true
 }
 }
 
 // Validate founded year if provided
 if (formData.founded_year && (formData.founded_year < 1800 || formData.founded_year > new Date().getFullYear())) {
 validationErrors.push(`Founded year must be between 1800 and ${new Date().getFullYear()}`)
 hasValidationErrors = true
 }
 
 // If there are validation errors, show toast and return
 if (hasValidationErrors) {
 if (validationErrors.length > 0) {
 validationErrors.forEach(error => {
 toast.error(error)
 })
 } else {
 toast.error('Please fix the validation errors before saving')
 }
 return
 }
 
 const cleanedFormData = { ...formData }
 Object.keys(cleanedFormData).forEach(key => {
 if (cleanedFormData[key] ==='') {
 cleanedFormData[key] = null
 } else if (key ==='founded_year'&& cleanedFormData[key] !== null) {
 // Ensure founded_year is converted to number
 cleanedFormData[key] = parseInt(cleanedFormData[key]) || null
 }
 })
 onSave(cleanedFormData)
 }

 const handleFileUpload = async (field: string, file: File) => {
 setUploading(field)
 setUploadError(null)
 try {
 console.log('Starting file upload for field:', field)
 console.log('File details:', { name: file.name, size: file.size, type: file.type })

 let response
 switch (field) {
 case'company_logo':
 response = await corporateProfileService.uploadCompanyLogo(file)
 break
 case'mca_gst_certificate':
 response = await corporateProfileService.uploadCertificate(file)
 break
 default:
 throw new Error('Unknown field type')
 }
 const fileUrl = response.file_url || ''
 setFormData({ ...formData, [field]: fileUrl })
 setUploadSuccess(field)
 setUploadError(null)
 
 // Show success toast
const fieldName = field.replace('_','').replace(/\b\w/g, l => l.toUpperCase())
 toast.success(`${fieldName} uploaded successfully!`)
 
 setTimeout(() => setUploadSuccess(null), 3000)
 } catch (error) {
 console.error('File upload error:', error)
 const errorMessage = error instanceof Error ? error.message : 'Upload failed'
 setUploadError(errorMessage)
 setUploadSuccess(null)
 
 // Show error toast
const fieldName = field.replace('_','').replace(/\b\w/g, l => l.toUpperCase())
 toast.error(`Failed to upload ${fieldName}: ${errorMessage}`)
 } finally {
 setUploading(null)
 }
 }

 const handleFileRemove = (field: string) => {
 setFormData({ ...formData, [field]:''})
 setUploadError(null)
 
 // Show info toast
const fieldName = field.replace('_','').replace(/\b\w/g, l => l.toUpperCase())
 toast.success(`${fieldName} removed successfully!`)
 }

 const renderField = (field: string) => {
 const value = formData[field] || ''
 // Handle file upload fields
 if (field ==='company_logo') {
 return (
 <div className="space-y-3">
 <FileUpload
 type="image"onFileSelect={(file) => handleFileUpload(field, file)}
 onFileRemove={() => handleFileRemove(field)}
 currentFile={value}
 placeholder={`Upload your ${field.replace(/_/g,'')}`}
 disabled={uploading === field}
 />
 {uploading === field && (
 <div className="flex items-center space-x-2 text-sm text-sage-deep dark:text-emerald-300">
 <div className="w-4 h-4 border-2 border-sage-deep dark:border-emerald-400 border-t-transparent animate-spin"></div>
 <span>Uploading...</span>
 </div>
 )}
 </div>
 )
 }

 if (field ==='mca_gst_certificate') {
 return (
 <div className="space-y-3">
 <FileUpload
 type="document"onFileSelect={(file) => handleFileUpload(field, file)}
 onFileRemove={() => handleFileRemove(field)}
 currentFile={value}
 placeholder="Upload MCA/GST certificate (PDF only)"disabled={uploading === field}
 />
 {uploading === field && (
 <div className="flex items-center space-x-2 text-sm text-sage-deep dark:text-emerald-300">
 <div className="w-4 h-4 border-2 border-sage-deep dark:border-emerald-400 border-t-transparent animate-spin"></div>
 <span>Uploading...</span>
 </div>
 )}
 </div>
 )
 }

 if (field.includes('bio') || field.includes('description')) {
 return (
 <textarea
 value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 rows={4}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder={`Enter your ${field.replace(/_/g,'')}`}
 />
 )
 }

 if (field ==='website_url') {
 return (
 <input
 type="url"value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder="Enter your website URL"/>
 )
 }

 if (field ==='founded_year') {
 return (
 <input
 type="number"min="1800"max="2024"value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value ===''? null : parseInt(e.target.value) || null })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder="Enter founded year"/>
 )
 }

 if (field ==='company_size') {
 return (
 <select
 value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent">
 <option value="">Select company size</option>
 <option value="1-10">1-10 employees</option>
 <option value="11-50">11-50 employees</option>
 <option value="51-200">51-200 employees</option>
 <option value="201-500">201-500 employees</option>
 <option value="501-1000">501-1000 employees</option>
 <option value="1000+">1000+ employees</option>
 </select>
 )
 }

 if (field ==='company_type') {
 return (
 <select
 value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent">
 <option value="">Select company type</option>
 <option value="startup">Startup</option>
 <option value="mnc">MNC</option>
 <option value="sme">SME</option>
 <option value="enterprise">Enterprise</option>
 <option value="government">Government</option>
 <option value="ngo">NGO</option>
 </select>
 )
 }


 // Handle name field with alphabet-only validation
 if (field ==='name') {
 return (
 <input
 type="text"value={value}
 onChange={(e) => {
 const inputValue = e.target.value
 // Only allow alphabets, spaces, and common punctuation
const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g,'')
 setFormData({ ...formData, [field]: sanitizedValue })
 }}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder="Enter your name (alphabets only)"maxLength={50}
 />
 )
 }

 // Handle contact_person field with alphabet-only validation
 if (field ==='contact_person') {
 return (
 <input
 type="text"value={value}
 onChange={(e) => {
 const inputValue = e.target.value
 // Only allow alphabets, spaces, and common punctuation (no numbers)
const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g,'')
 setFormData({ ...formData, [field]: sanitizedValue })
 }}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder="Enter contact person name (alphabets only)"maxLength={50}
 />
 )
 }

 // Handle contact_designation field with alphabet-only validation
 if (field ==='contact_designation') {
 return (
 <input
 type="text"value={value}
 onChange={(e) => {
 const inputValue = e.target.value
 // Only allow alphabets, spaces, and common punctuation (no numbers)
const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g,'')
 setFormData({ ...formData, [field]: sanitizedValue })
 }}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder="Enter contact person designation (alphabets only)"maxLength={50}
 />
 )
 }

 // Handle email field - make it read-only
 if (field ==='email') {
 return (
 <div className="space-y-2">
 <input
 type="email"value={value}
 readOnly
 disabled
 className="w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"placeholder="Email cannot be edited"/>
 <p className="text-xs text-slate-500 dark:text-emerald-400">
 Email cannot be changed for security reasons
 </p>
 </div>
 )
 }

 // Handle phone field with numeric validation and max length
 if (field ==='phone') {
 return (
 <input
 type="tel"value={value}
 onChange={(e) => {
 const inputValue = e.target.value
 // Only allow numbers and limit to 10 digits
const numericValue = inputValue.replace(/[^0-9]/g,'').slice(0, 10)
 setFormData({ ...formData, [field]: numericValue })
 }}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder="Enter 10-digit phone number"maxLength={10}
 />
 )
 }

 if (field ==='industry') {
 return (
 <select
 value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent">
 <option value="">Select industry</option>
 {industryOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 )
 }

 // Handle specific field labels
 let fieldLabel = field.replace(/_/g,'')
 let placeholder = `Enter your ${field.replace(/_/g,'')}`
 
 if (field === 'name') {
 fieldLabel = 'Company Name'
 placeholder = 'Enter company name'
 } else if (field === 'contact_person') {
 fieldLabel = 'Contact Person Name'
 placeholder = 'Enter contact person name'
 } else if (field === 'contact_designation') {
 fieldLabel = 'Contact Person Designation'
 placeholder = 'Enter contact person designation'
 } else if (field === 'address') {
 fieldLabel = 'Email Address'
 placeholder = 'Enter email address'
 }

 return (
 <input
 type="text"value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-sage-deep dark:focus:ring-emerald-500 focus:border-transparent"placeholder={placeholder}
 />
 )
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Display upload errors */}
 {uploadError && (
 <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
 <div className="flex items-center space-x-2 text-sm text-red-600">
 <AlertCircle className="w-4 h-4"/>
 <span>{uploadError}</span>
 </div>
 </div>
 )}

 {/* Display upload success */}
 {uploadSuccess && (
 <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
 <div className="flex items-center space-x-2 text-sm text-green-600">
 <CheckCircle className="w-4 h-4"/>
 <span>File uploaded successfully!</span>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {section.fields.map((field) => {
 // Handle specific field labels
 let fieldLabel = field.replace(/_/g,'')
 
 if (field ==='name') {
 fieldLabel ='Company Name'} else if (field ==='contact_person') {
 fieldLabel ='Contact Person Name'} else if (field ==='contact_designation') {
 fieldLabel ='Contact Person Designation'} else if (field ==='address') {
 fieldLabel ='Email Address'}
 
 return (
 <div key={field} className={field.includes('bio') || field.includes('description') ?'md:col-span-2':''}>
 <label className="block text-sm font-medium text-slate-700 dark:text-emerald-200/90 mb-2">
 {fieldLabel}
 </label>
 {renderField(field)}
 </div>
 )
 })}
 </div>

 <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200/90 dark:border-emerald-800/70">
 <Button
 type="button"variant="outline"onClick={onCancel}
 disabled={saving}
 >
 Cancel
 </Button>
 <Button
 type="submit"disabled={saving}
 className="bg-sage-deep text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500">
 {saving ? (
 <div className="flex items-center space-x-2">
 <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>
 <span>Saving...</span>
 </div>
 ) : ('Save Changes')}
 </Button>
 </div>
 </form>
 )
}

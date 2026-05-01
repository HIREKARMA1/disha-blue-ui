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
 ExternalLink,
 User,
 Settings,
 Crown,
 Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminDashboardLayout } from './AdminDashboardLayout'
import { FileUpload } from '../ui/file-upload'
import { ImageModal } from '../ui/image-modal'
import { cn, getInitials, truncateText } from '@/lib/utils'
import { adminProfileService } from '@/services/adminProfileService'
import { type AdminProfile, type AdminProfileUpdateData } from '@/types/admin'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface ProfileSection {
 id: string
 title: string
 icon: any
 fields: string[]
 completed: boolean
}

export function AdminProfile() {
 const [profile, setProfile] = useState<AdminProfile | null>(null)
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
 icon: User,
 fields: ['name','email','phone','bio','profile_picture'],
 completed: false
 }
 // {
 // id:'admin',
 // title:'Admin Settings',
 // icon: Shield,
 // fields: ['role','permissions'],
 // completed: false
 // }
 ]

 const tabs = [
 { id:'basic', label:'Basic Info', icon: User }
 // { id:'admin', label:'Admin Settings', icon: Shield }
 ]

 useEffect(() => {
 loadProfile()
 }, [])

 const loadProfile = async () => {
 try {
 setLoading(true)
 setError(null)
 const profileData = await adminProfileService.getProfile()
 setProfile(profileData)
 } catch (error: any) {
 setError(error.message)
 } finally {
 setLoading(false)
 }
 }

 const handleSave = async (sectionId: string, formData: AdminProfileUpdateData) => {
 try {
 setSaving(true)
 setError(null)

 console.log('Saving admin profile data for section:', sectionId)
 console.log('Form data being sent:', formData)

 const updatedProfile = await adminProfileService.updateProfile(formData)
 console.log('Profile updated successfully:', updatedProfile)

 setProfile(updatedProfile)
 setEditing(null) // Exit edit mode after saving
 
 // Show success toast
const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
toast.success(`${sectionName} updated successfully!`)
 
 } catch (error: any) {
 console.error('Error saving admin profile:', error)
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
 <AdminDashboardLayout>
 <div className="w-full text-center">
 <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-blue-800/70 dark:bg-blue-900/40 lg:p-8">
 <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
 <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-blue-50 mb-2">
 Loading Profile
 </h2>
 <p className="text-slate-600 dark:text-blue-200/85">
 Please wait while we load your admin profile...
 </p>
 </div>
 </div>
 </AdminDashboardLayout>
 )
 }

 if (error && !profile) {
 return (
 <AdminDashboardLayout>
 <div className="w-full text-center">
 <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-blue-800/70 dark:bg-blue-900/40 lg:p-8">
 <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 text-red-500 mx-auto mb-4"/>
 <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-blue-50 mb-2">
 Unable to Load Profile
 </h2>
 <p className="text-slate-600 dark:text-blue-200/85 mb-6">
 {error}
 </p>
 <Button onClick={loadProfile} variant="default">
 Try Again
 </Button>
 </div>
 </div>
 </AdminDashboardLayout>
 )
 }

 if (!profile) {
 return (
 <AdminDashboardLayout>
 <div className="w-full text-center">
 <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-blue-800/70 dark:bg-blue-900/40 lg:p-8">
 <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-500 mx-auto mb-4"/>
 <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-blue-50 mb-2">
 Profile Not Found
 </h2>
 <p className="text-slate-600 dark:text-blue-200/85">
 Unable to load your profile. Please try again later.
 </p>
 </div>
 </div>
 </AdminDashboardLayout>
 )
 }

 return (
 <AdminDashboardLayout>
 <div className="w-full">
 {/* Header - Consistent with other sections */}
 <div className="rounded-2xl p-6 border border-primary-200 mb-6">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-blue-50 mb-2">
 Admin Profile 
 </h1>
 <p className="text-slate-600 dark:text-blue-200/85 text-lg mb-3">
 Manage your admin profile and platform oversight access.
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800">
  {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </span>
 <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800">
  Admin Access
 </span>
 <span className="inline-flex items-center rounded-full border border-blue-50/40 bg-blue-50/15 px-3 py-1 text-sm font-medium text-blue-600 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
  Ecosystem Oversight
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Profile Content */}
 <div className="space-y-6">
 <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
 {/* Top Horizontal Section - Profile Overview */}
 <div className="xl:col-span-4">
 <div className="rounded-2xl shadow-sm border p-4 lg:p-6 hover:shadow-md transition-all duration-300">
 <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
 {/* Profile Avatar & Info */}
 <div className="text-center lg:text-left">
 <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto lg:mx-0 mb-4 relative">
 <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg">
 {profile.profile_picture ? (
 <img
 src={profile.profile_picture}
 alt={profile.name}
 className="w-20 h-20 lg:w-24 lg:h-24 object-cover"/>
 ) : (
 <span className="text-xl lg:text-2xl font-bold text-white">
 {getInitials(profile.name)}
 </span>
 )}
 </div>
 <button
 className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center border border-slate-200 bg-white text-blue-600 shadow-md transition-all duration-200 hover:scale-110 hover:bg-blue-50/20 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900/60 lg:h-6 lg:w-6"onClick={() => setEditing('basic')}
 title="Change profile picture">
 <Camera className="w-2.5 h-2.5 lg:w-3 lg:h-3"/>
 </button>
 </div>
 <h3 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-blue-50 mb-1">
 {profile.name}
 </h3>
 <p className="text-slate-600 dark:text-blue-200/85 text-sm">
 {profile.role ||'Administrator'}
 </p>
 <p className="text-xs text-slate-500 dark:text-blue-400">
 Admin • {profile.tenant_id ||'System'}
 </p>
 </div>

 {/* Profile Stats */}
 <div className="flex-1">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-blue-200/90">Email</span>
 {profile.email_verified ? (
 <div className="p-1.5 bg-blue-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 )}
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-blue-200/90">Phone</span>
 {profile.phone_verified ? (
 <div className="p-1.5 bg-blue-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 )}
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-blue-200/90">Profile</span>
 {profile.profile_picture ? (
 <div className="p-1.5 bg-blue-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 ) : (
 <div className="p-1.5 bg-yellow-500">
 <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 )}
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-xs lg:text-sm text-slate-700 dark:text-blue-200/90">Status</span>
 <div className="p-1.5 bg-blue-500">
 <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white"/>
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>

 {/* Tab-based Profile Sections */}
 <div className="xl:col-span-4">
 {/* Tab Navigation */}
 <div className="mb-6">
 <div className="border-b border-slate-200 dark:border-blue-800">
 <nav className="-mb-px flex space-x-8 overflow-x-auto">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={cn("flex items-center space-x-2 py-3 px-1 border-b-2 font-bold text-l transition-colors duration-200",
 activeTab === tab.id
 ?"border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300":"border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-blue-400 dark:hover:border-blue-600 dark:hover:text-blue-200")}
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
 <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center space-x-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-sm dark:bg-blue-600">
 <User className="w-6 h-6 text-white"/>
 </div>
 <div>
 <h3 className="text-xl font-semibold text-slate-900 dark:text-blue-50">Basic Information</h3>
 <p className="text-sm text-slate-600 dark:text-blue-200/85">Personal details and contact information</p>
 </div>
 </div>
 <Button
 variant="ghost"size="sm"onClick={() => setEditing('basic')}
 className="text-xs text-blue-600 transition-all duration-200 hover:text-blue-600/90 dark:text-blue-300 dark:hover:text-blue-200">
 <ChevronRight className="w-3 h-3 mr-1"/>
 Edit
 </Button>
 </div>

 {editing ==='basic'? (
 <ProfileSectionForm
 section={{ id:'basic', title:'Basic Information', icon: User, fields: ['name','email','phone','bio','profile_picture'], completed: false }}
 profile={profile}
 onSave={(formData) => handleSave('basic', formData)}
 saving={saving}
 onCancel={() => setEditing(null)}
 />
 ) : (
 <div className="space-y-4">
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Name
 </div>
 <div className="text-sm text-slate-600 dark:text-blue-200/85">
 {profile.name}
 </div>
 </div>

 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Email
 </div>
 <div className="text-sm text-slate-600 dark:text-blue-200/85">
 {profile.email}
 </div>
 </div>

 {profile.phone && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Phone
 </div>
 <div className="text-sm text-slate-600 dark:text-blue-200/85">
 {profile.phone}
 </div>
 </div>
 )}

 {profile.bio && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Bio
 </div>
 <div className="text-sm text-slate-600 dark:text-blue-200/85">
 {profile.bio}
 </div>
 </div>
 )}

 {profile.profile_picture && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Profile Picture
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <img
 src={profile.profile_picture}
 alt="Profile Picture"className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-blue-800"/>
 <span className="text-sm text-blue-600"> Uploaded</span>
 </div>
 <Button
 variant="outline"size="sm"onClick={() => setImageModal({
 isOpen: true,
 imageUrl: profile.profile_picture!,
 altText:'Profile Picture'})}
 className="text-blue-600 hover:bg-blue-50/15 hover:text-blue-600/90 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200">
 <Camera className="w-4 h-4 mr-2"/>
 View Image
 </Button>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {/* {activeTab ==='admin'&& (
 <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center space-x-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-sm dark:bg-blue-600">
 <Shield className="w-6 h-6 text-white"/>
 </div>
 <div>
 <h3 className="text-xl font-semibold text-slate-900 dark:text-blue-50">Admin Settings</h3>
 <p className="text-sm text-slate-600 dark:text-blue-200/85">Role and permissions information</p>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Role
 </div>
 <div className="text-sm text-slate-600 dark:text-blue-200/85">
 {profile.role ||'Admin'}
 </div>
 </div>

 {profile.permissions && profile.permissions.length > 0 && (
 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Permissions
 </div>
 <div className="flex flex-wrap gap-2">
 {profile.permissions.map((permission, index) => (
 <span
 key={index}
 className="rounded-2xl bg-blue-50/20 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900/50 dark:text-blue-200">
 {permission}
 </span>
 ))}
 </div>
 </div>
 )}

 <div className="p-4 rounded-2xl border">
 <div className="font-medium text-slate-900 dark:text-blue-50 mb-2">
 Tenant ID
 </div>
 <div className="text-sm text-slate-600 dark:text-blue-200/85">
 {profile.tenant_id ||'default'}
 </div>
 </div>
 </div>
 </div>
 )} */}
 </div>
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
 </AdminDashboardLayout>
 )
}

// Inline ProfileSectionForm Component for Admin Profile
interface ProfileSectionFormProps {
 section: {
 id: string
 title: string
 icon: any
 fields: string[]
 completed: boolean
 }
 profile: AdminProfile
 onSave: (formData: any) => void
 saving: boolean
 onCancel: () => void
}

function ProfileSectionForm({ section, profile, onSave, saving, onCancel }: ProfileSectionFormProps) {
 const { getToken } = useAuth()
 const [formData, setFormData] = useState<any>({})
 const [uploading, setUploading] = useState<string | null>(null)
 const [uploadError, setUploadError] = useState<string | null>(null)
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

 useEffect(() => {
 if (profile && section) {
 const initialData: any = {}
 section.fields.forEach(field => {
 initialData[field] = profile[field as keyof AdminProfile] ||''})
 setFormData(initialData)
 }
 }, [profile, section])

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 
 // Clear previous errors
 setFieldErrors({})
 
 // Validation errors
const errors: Record<string, string> = {}
 let hasValidationErrors = false
 
 // Name validation
 if (formData.name && formData.name.trim().length < 2) {
 errors.name = 'Name must be at least 2 characters long'
 hasValidationErrors = true
 }
 
 // Phone validation - exactly 10 digits
 if (formData.phone && formData.phone.trim()) {
 const phoneRegex = /^\d{10}$/
 if (!phoneRegex.test(formData.phone)) {
 errors.phone = 'Phone number must be exactly 10 digits'
 hasValidationErrors = true
 }
 }
 
 // If there are validation errors, set field errors and return
 if (hasValidationErrors) {
 setFieldErrors(errors)
 return
 }
 
 const cleanedFormData = { ...formData }
 Object.keys(cleanedFormData).forEach(key => {
 if (cleanedFormData[key] ==='') {
 cleanedFormData[key] = null
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

 // Validate file size (max 5MB)
 if (file.size > 5 * 1024 * 1024) {
 toast.error('File size must be less than 5MB')
 return
 }

 // Validate file type for profile pictures
 if (field ==='profile_picture') {
 const allowedTypes = ['image/jpeg','image/jpg','image/png','image/gif','image/webp']
 if (!allowedTypes.includes(file.type)) {
 toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
 return
 }
 }

 let response
 switch (field) {
 case'profile_picture':
 response = await adminProfileService.uploadProfilePicture(file)
 break
 default:
 throw new Error('Unknown field type for upload')
 }
 const fileUrl = response.file_url || ''
 setFormData({ ...formData, [field]: fileUrl })
 setUploadError(null)

 console.log('File uploaded to S3:', fileUrl)
 toast.success('Profile picture uploaded successfully!')
 } catch (error: any) {
 console.error('File upload error:', error)
 setUploadError(error.message ||'Failed to upload file.')
 
 // Show specific error messages
 if (error.message.includes('network') || error.message.includes('Internet')) {
 toast.error('Network error. Please check your connection and try again.')
 } else if (error.message.includes('auth') || error.message.includes('login')) {
 toast.error('Authentication failed. Please log in again.')
 } else if (error.message.includes('size') || error.message.includes('large')) {
 toast.error('File is too large. Please upload a smaller image.')
 } else if (error.message.includes('format') || error.message.includes('type')) {
 toast.error('Invalid file format. Please upload a valid image.')
 } else {
 toast.error(`Failed to upload image: ${error.message}`)
 }
 } finally {
 setUploading(null)
 }
 }

 const handleFileRemove = (field: string) => {
 setFormData({ ...formData, [field]: null })
 }

 const renderField = (field: string) => {
 const value = formData[field] ||''// Handle file upload fields
 if (field ==='profile_picture') {
 return (
 <div className="space-y-3">
 <FileUpload
 type="image"onFileSelect={(file) => handleFileUpload(field, file)}
 onFileRemove={() => handleFileRemove(field)}
 currentFile={value}
 placeholder="Upload your profile picture"disabled={uploading === field}
 />
 {uploading === field && (
 <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-300">
 <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin"></div>
 <span>Uploading...</span>
 </div>
 )}
 {uploadError && uploading === field && (
 <div className="flex items-center space-x-2 text-sm text-red-600">
 <AlertCircle className="w-4 h-4"/>
 <span>{uploadError}</span>
 </div>
 )}
 </div>
 )
 }

 // Handle textarea fields
 if (field ==='bio') {
 return (
 <textarea
 value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-blue-700 rounded-2xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent"rows={4}
 placeholder="Tell us about yourself..."/>
 )
 }

 // Handle readonly fields
 if (field ==='email') {
 return (
 <input
 type="email"value={value}
 disabled
 className="w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-400"placeholder="Email address"/>
 )
 }

 // Handle phone field with numeric validation and max length
 if (field ==='phone') {
 return (
 <div>
 <input
 type="tel"value={value}
 onChange={(e) => {
 const inputValue = e.target.value
 // Only allow numbers and limit to 10 digits
const numericValue = inputValue.replace(/[^0-9]/g,'').slice(0, 10)
 setFormData({ ...formData, [field]: numericValue })
 // Clear error when user starts typing
 if (fieldErrors[field]) {
 setFieldErrors({ ...fieldErrors, [field]:''})
 }
 }}
 className={`w-full rounded-2xl border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:bg-blue-950/70 dark:text-blue-50 dark:focus:ring-blue-500 ${
 fieldErrors[field] 
 ?'border-red-500 focus:border-red-500':'border-slate-300 dark:border-blue-700'}`}
 placeholder="Enter 10-digit phone number"maxLength={10}
 />
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 // Handle name field with alphabetic validation
 if (field ==='name') {
 return (
 <div>
 <input
 type="text"value={value}
 onChange={(e) => {
 let inputValue = e.target.value
 
 // Name field validation - only alphabets, spaces, and common punctuation
const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g,'')
 if (sanitizedValue !== inputValue) {
 toast.error('Only letters, spaces, periods, and hyphens are allowed')
 }
 inputValue = sanitizedValue
 
 setFormData({ ...formData, [field]: inputValue })
 // Clear error when user starts typing
 if (fieldErrors[field]) {
 setFieldErrors({ ...fieldErrors, [field]:''})
 }
 }}
 className={`w-full rounded-2xl border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:bg-blue-950/70 dark:text-blue-50 dark:focus:ring-blue-500 ${
 fieldErrors[field] 
 ?'border-red-500 focus:border-red-500':'border-slate-300 dark:border-blue-700'}`}
 placeholder={`Enter your ${field.replace(/_/g,'')}`}
 maxLength={50}
 />
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 // Handle regular input fields
 return (
 <input
 type="text"value={value}
 onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 dark:border-blue-700 rounded-2xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent"placeholder={`Enter your ${field.replace(/_/g,'')}`}
 />
 )
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 {uploadError && (
 <div className="p-3 bg-red-50 border border-red-200 rounded-2xl">
 <p className="text-red-600 text-sm">{uploadError}</p>
 </div>
 )}


 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {section.fields.map((field) => (
 <div key={field} className="space-y-2">
 <label className="block text-sm font-medium text-slate-700 dark:text-blue-200/90">
 {field.replace(/_/g,'').replace(/\b\w/g, l => l.toUpperCase())}
 </label>
 {renderField(field)}
 </div>
 ))}
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-blue-800">
 <Button
 type="button"variant="outline"onClick={onCancel}
 disabled={saving}
 >
 Cancel
 </Button>
 <Button
 type="submit"disabled={saving}
 className="bg-blue-600 hover:bg-blue-600/90 dark:bg-blue-600 dark:hover:bg-blue-500">
 {saving ?'Saving...':'Save Changes'}
 </Button>
 </div>
 </form>
 )
}
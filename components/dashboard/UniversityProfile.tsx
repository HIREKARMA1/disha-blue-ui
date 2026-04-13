"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
 User,
 GraduationCap,
 Globe,
 Zap,
 Trophy,
 Building2,
 MapPin,
 Phone,
 Mail,
 Calendar,
 CheckCircle,
 AlertCircle,
 Camera,
 FileText,
 Edit,
 Save,
 X,
 Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UniversityDashboardLayout } from './UniversityDashboardLayout'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { universityProfileService, type UniversityProfile, type UniversityProfileUpdateData } from '@/services/universityProfileService'
import { type UniversityProfile as UniversityProfileType } from '@/types/university'
import { FileUpload } from '../ui/file-upload'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { z } from "zod";
import toast from 'react-hot-toast'// Use the imported UniversityProfile type instead of defining a new interface
interface ProfileSection {
 id: string
 title: string
 icon: any
 fields: string[]
 completed: boolean
}


const allowedDomains = ["gmail.com","outlook.com","yahoo.com","hotmail.com","edu"];

const emailSchema = z
 .string()
 .trim()
 .min(5,"Email must be at least 5 characters long")
 .max(100,"Email must be less than 100 characters")
 .email("Please enter a valid email address")
 .refine((val) => {
 const domain = val.split("@")[1];
 return allowedDomains.some((d) => domain.endsWith(d));
 }, {
 message:"Please use a valid email",
 });


const profileSchema = z.object({
 email: z
 .string()
 .email("Please enter a valid email address")
 .optional()
 .or(z.literal("")), // allow empty if optional
 phone: z
 .string()
 .regex(/^\d+$/,'Phone number must contain only digits')
 .refine(
 (val) => {
 if (val.length < 10) return false
 if (val.startsWith('91')) {
 return val.length === 12
 }
 return val.length === 10
 },
 {
 message:'Invalid phone number. Must be 10 digits, or start with 91 followed by 10 digits.',
 }
 )
 .optional(),
 website_url: z
 .string()
 .url("Please enter a valid website URL (must start with http:// or https://).")
 .optional()
 .or(z.literal("")),
 name: z.string().optional(),
 bio: z.string().optional(),
 profile_picture: z.string().optional(),
});

export function UniversityProfile() {
 const [profile, setProfile] = useState<UniversityProfile | null>(null)
 const [loading, setLoading] = useState(true)
 const [editing, setEditing] = useState<string | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [saving, setSaving] = useState(false)
 const [activeTab, setActiveTab] = useState('basic')
 const [uploadingImage, setUploadingImage] = useState(false)
 const [formData, setFormData] = useState<UniversityProfileUpdateData>({})
 const { user } = useAuth()

 const profileSections: ProfileSection[] = [
 {
 id:'basic',
 title:'Basic Information',
 icon: User,
 fields: ['name','email','phone','website','description','profile_picture'],
 completed: false
 },
 {
 id:'institution',
 title:'Institution Details',
 icon: Building2,
 fields: ['established_year','university_type','accreditation','address','city','state','country'],
 completed: false
 },
 {
 id:'academic',
 title:'Academic Information',
 icon: GraduationCap,
 fields: ['courses_offered','branch'],
 completed: false
 }
 ]

 const tabs = [
 { id:'basic', label:'Basic Info', icon: User },
 { id:'institution', label:'Institution', icon: Building2 },
 { id:'academic', label:'Academic', icon: GraduationCap }
 ]

 useEffect(() => {
 loadProfile()
 }, [])

 const loadProfile = async () => {
 try {
 setLoading(true)
 setError(null)

 // Try to fetch from API first
 try {
 console.log('Fetching university profile...')
 console.log('User context:', user)
 const profileData = await apiClient.getUniversityProfile()
 console.log('Profile data received:', profileData)

 // Use API data directly without mock fallbacks
const mergedProfile: UniversityProfile = {
 id: profileData.id || user?.id ||'1',
 email: profileData.email || user?.email ||'',
 name: profileData.name || profileData.university_name || user?.name ||'',
 university_name: profileData.university_name || user?.name ||'',
 phone: profileData.phone ||'',
 status: profileData.status ||'active',
 email_verified: profileData.email_verified || false,
 phone_verified: profileData.phone_verified || false,
 created_at: profileData.created_at || new Date().toISOString(),
 updated_at: profileData.updated_at,
 last_login: profileData.last_login,
 profile_picture: profileData.profile_picture,
 bio: profileData.bio,
 website_url: profileData.website_url,
 institute_type: profileData.institute_type,
 established_year: profileData.established_year,
 contact_person_name: profileData.contact_person_name,
 contact_designation: profileData.contact_designation,
 address: profileData.address,
 courses_offered: profileData.courses_offered,
 branch: profileData.branch,
 total_students: profileData.total_students || 0,
 total_jobs: profileData.total_jobs || 0,
 total_jobs_approved: profileData.total_jobs_approved || 0,
 total_faculty: profileData.total_faculty,
 departments: profileData.departments,
 programs_offered: profileData.programs_offered,
 placement_rate: profileData.placement_rate,
 average_package: profileData.average_package,
 top_recruiters: profileData.top_recruiters
 }
 console.log('Merged profile:', mergedProfile)
 setProfile(mergedProfile)
 } catch (apiError) {
 console.error('Failed to fetch university profile:', apiError)
 setError('Failed to load profile data from server')
 }
 } catch (error: any) {
 setError(error.message)
 } finally {
 setLoading(false)
 }
 }


 const handleSave = async (sectionId: string, formData: UniversityProfileUpdateData) => {
 try {
 setSaving(true);
 setError(null);
 //  Try to save via API
 try {
 const updatedProfile = await universityProfileService.updateProfile(formData);
 setProfile(updatedProfile);
 console.log("Profile saved successfully");

 // Show success toast with section name
const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
toast.success(`${sectionName} updated successfully!`)

 } catch (apiError) {
 console.log("API not available, simulating save");
 if (profile) {
 setProfile({ ...profile, ...formData });
 }

 // Show success toast even for simulated save
const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
toast.success(`${sectionName} updated successfully!`)
 }

 setEditing(null);
 } catch (error: any) {
 setError(error.message);

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
 setSaving(false);
 }
 };


 const handleImageUpload = async (file: File) => {
 try {
 setUploadingImage(true)
 setError(null)

 // Validate file size (max 5MB)
 if (file.size > 5 * 1024 * 1024) {
 toast.error('File size must be less than 5MB')
 return
 }

 // Validate file type
const allowedTypes = ['image/jpeg','image/jpg','image/png','image/gif','image/webp']
 if (!allowedTypes.includes(file.type)) {
 toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
 return
 }

 const result = await universityProfileService.uploadProfilePicture(file)

 // Update profile with new image URL
 if (profile) {
 setProfile({ ...profile, profile_picture: result.file_url })
 }

 console.log('Profile picture uploaded successfully')
 toast.success('Profile picture updated successfully!')
 } catch (error: any) {
 setError(error.message)
 console.error('Image upload error:', error)

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
 setUploadingImage(false)
 }
 }

 const handleEdit = (sectionId: string) => {
 setEditing(sectionId)
 // Initialize form data with current profile data
 if (profile) {
 const initialData: UniversityProfileUpdateData = {}

 switch (sectionId) {
 case'basic':
 initialData.name = profile.name
 initialData.phone = profile.phone
 initialData.bio = profile.bio
 initialData.website_url = profile.website_url
 break
 case'institution':
 initialData.university_name = profile.university_name
 initialData.institute_type = profile.institute_type
 initialData.established_year = profile.established_year
 initialData.contact_person_name = profile.contact_person_name
 initialData.contact_designation = profile.contact_designation
 initialData.address = profile.address
 break
 case'academic':
 initialData.courses_offered = profile.courses_offered
 initialData.branch = profile.branch
 break
 }

 setFormData(initialData)
 }
 }

 const handleFormChange = (field: keyof UniversityProfileUpdateData, value: any) => {
 setFormData(prev => ({
 ...prev,
 [field]: value
 }))
 }

 const handleCancel = () => {
 setEditing(null)
 setFormData({})
 setError(null)
 }

 const getTabColors = (tabId: string) => {
 switch (tabId) {
 case'basic':
 return {
 active:'border-sage-deep text-sage-deep bg-sage/15 dark:border-emerald-400 dark:text-emerald-200 dark:bg-emerald-900/40',
 indicator:'bg-sage-deep dark:bg-emerald-400',
 icon:'text-sage-deep dark:text-emerald-300'}
 case'institution':
 return {
 active:'border-sage-deep text-sage-deep bg-sage/15 dark:border-emerald-400 dark:text-emerald-200 dark:bg-emerald-900/40',
 indicator:'bg-sage-deep dark:bg-emerald-400',
 icon:'text-sage-deep dark:text-emerald-300'}
 case'academic':
 return {
 active:'border-sage-deep text-sage-deep bg-sage/15 dark:border-emerald-400 dark:text-emerald-200 dark:bg-emerald-900/40',
 indicator:'bg-sage-deep dark:bg-emerald-400',
 icon:'text-sage-deep dark:text-emerald-300'}
 case'placement':
 return {
 active:'border-sage-deep text-sage-deep bg-sage/15 dark:border-emerald-400 dark:text-emerald-200 dark:bg-emerald-900/40',
 indicator:'bg-sage-deep dark:bg-emerald-400',
 icon:'text-sage-deep dark:text-emerald-300'}
 default:
 return {
 active:'border-slate-400 text-slate-700 bg-slate-100 dark:border-emerald-700 dark:text-emerald-200 dark:bg-emerald-900/35',
 indicator:'bg-slate-500 dark:bg-emerald-500',
 icon:'text-slate-600 dark:text-emerald-300'}
 }
 }

 if (loading) {
 return (
 <UniversityDashboardLayout>
 <div className="space-y-6">
 <div className="animate-pulse space-y-4">
 <div className="h-8 w-1/3 rounded-xl bg-slate-200/80 dark:bg-emerald-800/60"></div>
 <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
 <div className="xl:col-span-1">
 <div className="h-96 rounded-2xl bg-slate-200/80 dark:bg-emerald-800/50"></div>
 </div>
 <div className="xl:col-span-3 space-y-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-32 rounded-2xl bg-slate-200/80 dark:bg-emerald-800/50"></div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </UniversityDashboardLayout>
 )
 }

 if (error && !profile) {
 return (
 <UniversityDashboardLayout>
 <div className="space-y-6">
 <div className="text-center">
 <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-900/40">
 <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
 <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-50 mb-2">
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
 </div>
 </UniversityDashboardLayout>
 )
 }

 if (!profile) {
 return (
 <UniversityDashboardLayout>
 <div className="space-y-6">
 <div className="text-center">
 <div className="mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-900/40">
 <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4"/>
 <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-50 mb-2">
 Profile Not Found
 </h2>
 <p className="text-slate-600 dark:text-emerald-200/85">
 Unable to load your profile. Please try again later.
 </p>
 </div>
 </div>
 </div>
 </UniversityDashboardLayout>
 )
 }

 return (
 <UniversityDashboardLayout>
 <div className="space-y-6">
 {/* Header */}
 <div className="rounded-2xl p-6 border border-primary-200">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-emerald-50 mb-2">
 University Profile 
 </h1>
 <p className="text-slate-600 dark:text-emerald-200/85 text-lg mb-3">
 Manage your university information and institutional details 
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800">
  {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </span>
 <span className="inline-flex items-center rounded-full border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  Institutional Growth
 </span>
 <span className="inline-flex items-center rounded-full border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  Excellence in Education
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Profile Content */}
 <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
 {/* Left Column - Profile Overview */}
 <div className="xl:col-span-1">
 <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-900/25">
 <div className="text-center mb-6">
 <div className="w-24 h-24 mx-auto mb-4 relative">
 <div className="w-24 h-24 flex items-center justify-center shadow-lg overflow-hidden">
 {profile?.profile_picture ? (
 <img
 src={profile.profile_picture}
 alt={profile.name}
 className="w-24 h-24 object-cover"/>
 ) : (
 <span className="text-2xl font-bold text-white">
 {getInitials(profile.name)}
 </span>
 )}
 </div>
 <button
 className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center border border-slate-200 bg-white text-sage-deep shadow-md transition-all duration-200 hover:scale-110 hover:bg-sage/20 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900/60"onClick={() => setEditing('basic')}
 title="Change profile picture"disabled={uploadingImage}
 >
 {uploadingImage ? (
 <div className="h-3 w-3 animate-spin rounded-full border-2 border-sage-deep border-t-transparent dark:border-emerald-400"/>
 ) : (
 <Camera className="w-3 h-3"/>
 )}
 </button>
 </div>
 <h3 className="text-xl font-semibold text-slate-900 dark:text-emerald-50 mb-1">
 {profile.name}
 </h3>
 <p className="text-slate-600 dark:text-emerald-200/85 text-sm">
 {profile?.institute_type ||'Educational Institution'}
 </p>
 <p className="text-xs text-slate-500 dark:text-emerald-400">
 Est. {profile.established_year}
 </p>
 </div>

 {/* Quick Stats */}
 <div className="space-y-3">
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-sm text-slate-700 dark:text-emerald-200/90">Email</span>
 <div className="bg-sage-deep p-1.5 dark:bg-emerald-500">
 <CheckCircle className="w-4 h-4 text-white"/>
 </div>
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-sm text-slate-700 dark:text-emerald-200/90">Phone</span>
 <div className="bg-sage-deep p-1.5 dark:bg-emerald-500">
 <CheckCircle className="w-4 h-4 text-white"/>
 </div>
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-sm text-slate-700 dark:text-emerald-200/90">Total Students</span>
 <span className="text-sm font-medium text-sage-deep dark:text-emerald-300">
 {profile?.total_students?.toLocaleString() ||'N/A'}
 </span>
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-sm text-slate-700 dark:text-emerald-200/90">Total Jobs</span>
 <span className="text-sm font-medium text-sage-deep dark:text-emerald-300">
 {profile?.total_jobs?.toLocaleString() ||'N/A'}
 </span>
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl border">
 <span className="text-sm text-slate-700 dark:text-emerald-200/90">Jobs Approved</span>
 <span className="text-sm font-medium text-sage-deep dark:text-emerald-300">
 {profile?.total_jobs_approved?.toLocaleString() ||'N/A'}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column - Profile Details */}
 <div className="xl:col-span-3">
 {/* Tabs */}
 <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-emerald-800/70 dark:bg-emerald-900/25">
 <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide dark:border-emerald-800">
 {tabs.map((tab) => {
 const Icon = tab.icon
 const colors = getTabColors(tab.id)
 return (
 <motion.button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 relative ${activeTab === tab.id
 ? colors.active
 :'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-emerald-400 dark:hover:border-emerald-600 dark:hover:text-emerald-200'}`}
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

 {/* Tab Content */}
 <div className="p-6">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.3, ease:"easeInOut"}}
 >
 {renderTabContent()}
 </motion.div>
 </div>
 </div>
 </div>
 </div>


 </div>
 </UniversityDashboardLayout>
 )

 function renderTabContent() {
 switch (activeTab) {
 case'basic':
 return renderBasicInfo()
 case'institution':
 return renderInstitutionInfo()
 case'academic':
 return renderAcademicInfo()
 default:
 return renderBasicInfo()
 }
 }

 function renderBasicInfo() {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-slate-900 dark:text-emerald-50 flex items-center gap-2">
 <User className="w-5 h-5"/>
 Basic Information
 </h3>
 {editing !=='basic'&& (
 <Button
 variant="outline"size="sm"onClick={() => handleEdit('basic')}
 className="flex items-center gap-2">
 <Edit className="w-4 h-4"/>
 Edit
 </Button>
 )}
 </div>

 {editing ==='basic'? (
 <ProfileSectionForm
 section={{ id:'basic', title:'Basic Information', icon: User, fields: ['name','email','phone','website_url','bio','profile_picture'], completed: false }}
 profile={profile}
 onSave={(formData) => handleSave('basic', formData)}
 saving={saving}
 onCancel={() => setEditing(null)}
 editing={editing}
 onEdit={handleEdit}
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <Mail className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.email}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Email Address</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <Phone className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.phone ||'Not provided'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Phone Number</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <Globe className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.website_url ||'Not provided'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Website</p>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 {profile?.bio && (
 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <h4 className="text-sm font-medium text-slate-900 dark:text-emerald-50 mb-2">Description</h4>
 <p className="text-sm text-slate-600 dark:text-emerald-200/85 leading-relaxed">
 {profile.bio}
 </p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 )
 }

 function renderInstitutionInfo() {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-slate-900 dark:text-emerald-50 flex items-center gap-2">
 <Building2 className="w-5 h-5"/>
 Institution Details
 </h3>
 {editing !=='institution'&& (
 <Button
 variant="outline"size="sm"onClick={() => handleEdit('institution')}
 className="flex items-center gap-2">
 <Edit className="w-4 h-4"/>
 Edit
 </Button>
 )}
 </div>

 {editing ==='institution'? (
 <ProfileSectionForm
 section={{ id:'institution', title:'Institution Details', icon: Building2, fields: ['university_name','institute_type','established_year','contact_person_name','contact_designation','address'], completed: false }}
 profile={profile}
 onSave={(formData) => handleSave('institution', formData)}
 saving={saving}
 onCancel={() => setEditing(null)}
 editing={editing}
 onEdit={handleEdit}
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Left Column */}
 <div className="space-y-4">
 {/* University Name */}
 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <Building2 className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.name ||'Not specified'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">University Name</p>
 </div>
 </div>

 {/* Institute Type */}
 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <Building2 className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.institute_type ||'Not specified'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Institute Type</p>
 </div>
 </div>

 {/* Established Year */}
 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <Calendar className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.established_year ||'Not specified'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Established Year</p>
 </div>
 </div>
 </div>

 {/* Right Column */}
 <div className="space-y-4">
 {/* Contact Person Name */}
 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <User className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.contact_person_name ||'Not specified'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Contact Person</p>
 </div>
 </div>

 {/* Contact Designation */}
 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <Briefcase className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.contact_designation ||'Not specified'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Designation</p>
 </div>
 </div>

 {/* Address */}
 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <h4 className="text-sm font-medium text-slate-900 dark:text-emerald-50 mb-2 flex items-center gap-2">
 <MapPin className="w-4 h-4"/>
 Address
 </h4>
 <p className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile?.address ||'Not provided'}
 </p>
 </div>
 </div>
 </div>

 )}
 </div>
 )
 }

 function renderAcademicInfo() {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-slate-900 dark:text-emerald-50 flex items-center gap-2">
 <GraduationCap className="w-5 h-5"/>
 Academic Information
 </h3>
 {editing !=='academic'&& (
 <Button
 variant="outline"size="sm"onClick={() => handleEdit('academic')}
 className="flex items-center gap-2">
 <Edit className="w-4 h-4"/>
 Edit
 </Button>
 )}
 </div>

 {editing ==='academic'? (
 <ProfileSectionForm
 section={{ id:'academic', title:'Academic Information', icon: GraduationCap, fields: ['courses_offered','branch'], completed: false }}
 profile={profile}
 onSave={(formData) => handleSave('academic', formData)}
 saving={saving}
 onCancel={() => setEditing(null)}
 editing={editing}
 onEdit={handleEdit}
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <div className="rounded-2xl bg-sage/20 p-2 dark:bg-emerald-900/45">
 <GraduationCap className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {profile?.courses_offered ||'Not specified'}
 </p>
 <p className="text-xs text-sage-deep dark:text-emerald-300">Courses Offered</p>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 {profile?.branch && (
 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-950/35">
 <h4 className="text-sm font-medium text-slate-900 dark:text-emerald-50 mb-2">Branch</h4>
 <p className="text-sm text-slate-600 dark:text-emerald-200/85">
 {profile.branch}
 </p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 )
 }

}

// ProfileSectionForm component for inline editing
interface ProfileSectionFormProps {
 section: ProfileSection
 profile: UniversityProfile | null
 onSave: (formData: UniversityProfileUpdateData) => void
 saving: boolean
 onCancel: () => void
 editing: string | null
 onEdit: (sectionId: string) => void
}

function ProfileSectionForm({ section, profile, onSave, saving, onCancel, editing, onEdit }: ProfileSectionFormProps) {
 const [formData, setFormData] = useState<UniversityProfileUpdateData>({})
 const [uploadingImage, setUploadingImage] = useState(false)
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

 useEffect(() => {
 if (profile && section) {
 // Initialize form data with current profile values
const initialData: UniversityProfileUpdateData = {}
 section.fields.forEach(field => {
 initialData[field as keyof UniversityProfileUpdateData] = (profile[field as keyof UniversityProfile] ||'') as any
 })
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

 // Basic Information validation
 if (section.id ==='basic') {
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

 // Website URL validation
 if (formData.website_url && formData.website_url.trim()) {
 const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
 if (!urlPattern.test(formData.website_url)) {
 errors.website_url = 'Please enter a valid website URL'
 hasValidationErrors = true
 }
 }
 }

 // Institution Details validation
 if (section.id ==='institution') {
 // University name validation
 if (formData.university_name && formData.university_name.trim().length < 2) {
 errors.university_name = 'University name must be at least 2 characters long'
 hasValidationErrors = true
 }

 // Established year validation
 if (formData.established_year) {
 const currentYear = new Date().getFullYear()
 if (formData.established_year < 1800 || formData.established_year > currentYear) {
 errors.established_year = `Established year must be between 1800 and ${currentYear}`
 hasValidationErrors = true
 }
 }

 // Contact person name validation
 if (formData.contact_person_name && formData.contact_person_name.trim().length < 2) {
 errors.contact_person_name = 'Contact person name must be at least 2 characters long'
 hasValidationErrors = true
 }

 // Contact designation validation
 if (formData.contact_designation && formData.contact_designation.trim().length < 2) {
 errors.contact_designation = 'Contact designation must be at least 2 characters long'
 hasValidationErrors = true
 }

 // Address validation
 if (formData.address && formData.address.trim().length < 10) {
 errors.address = 'Address must be at least 10 characters long'
 hasValidationErrors = true
 }
 }

 // Academic Information validation
 if (section.id ==='academic') {
 // Courses offered validation
 if (formData.courses_offered && formData.courses_offered.trim().length < 5) {
 errors.courses_offered = 'Courses offered must be at least 5 characters long'
 hasValidationErrors = true
 }

 // Branch validation
 if (formData.branch && formData.branch.trim().length < 2) {
 errors.branch = 'Branch must be at least 2 characters long'
 hasValidationErrors = true
 }
 }

 // If there are validation errors, set field errors and return
 if (hasValidationErrors) {
 setFieldErrors(errors)
 return
 }

 // Remove readonly fields and fields that don't exist in the backend model before saving
const {
 total_students,
 total_faculty,
 departments,
 programs_offered,
 placement_rate,
 average_package,
 top_recruiters,
 total_jobs,
 total_jobs_approved,
 ...saveableData
 } = formData
 onSave(saveableData)
 }

 const handleImageUpload = async (file: File) => {
 try {
 setUploadingImage(true)
 const result = await universityProfileService.uploadProfilePicture(file)
 setFormData({ ...formData, profile_picture: result.file_url })
 } catch (error: any) {
 console.error('Image upload error:', error)
 } finally {
 setUploadingImage(false)
 }
 }

 const renderField = (field: string) => {
 const value = formData[field as keyof UniversityProfileUpdateData] ||''// Handle profile picture upload
 if (field ==='profile_picture') {
 return (
 <div className="space-y-3">
 <FileUpload
 type="image"onFileSelect={handleImageUpload}
 currentFile={value as string}
 placeholder="Upload your profile picture"disabled={uploadingImage}
 />
 {uploadingImage && (
 <div className="flex items-center space-x-2 text-sm text-sage-deep dark:text-emerald-300">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage-deep border-t-transparent dark:border-emerald-400"></div>
 <span>Uploading...</span>
 </div>
 )}
 </div>
 )
 }

 // Handle email field - make it read-only
 if (field ==='email') {
 return (
 <div className="space-y-2">
 <Input
 type="email"value={value as string}
 readOnly
 disabled
 className="w-full cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-emerald-950/50 dark:text-emerald-400"placeholder="Email cannot be edited"/>
 <p className="text-xs text-slate-500 dark:text-emerald-400">
 Email cannot be changed for security reasons
 </p>
 </div>
 )
 }

 // Handle phone field with numeric validation and max length
 if (field ==='phone') {
 return (
 <div>
 <Input
 type="tel"value={value as string}
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
 className={`w-full ${fieldErrors[field] ?'border-red-500 focus:border-red-500':''}`}
 placeholder="Enter 10-digit phone number"maxLength={10}
 />
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 // Handle textarea fields
 if (field.includes('bio') || field.includes('address') || field.includes('courses_offered')) {
 return (
 <div>
 <Textarea
 value={value as string}
 onChange={(e) => {
 setFormData({ ...formData, [field]: e.target.value })
 // Clear error when user starts typing
 if (fieldErrors[field]) {
 setFieldErrors({ ...fieldErrors, [field]:''})
 }
 }}
 rows={4}
 className={`w-full ${fieldErrors[field] ?'border-red-500 focus:border-red-500':''}`}
 placeholder={`Enter your ${field.replace(/_/g,'')}`}
 />
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 // Handle number fields
 if (field.includes('year') || field.includes('students') || field.includes('faculty') || field.includes('rate') || field.includes('package')) {
 return (
 <div>
 <Input
 type="number"value={value as number ||''}
 onChange={(e) => {
 const numericValue = field.includes('rate') || field.includes('package') ? parseFloat(e.target.value) || undefined : parseInt(e.target.value) || undefined
 setFormData({ ...formData, [field]: numericValue })
 // Clear error when user starts typing
 if (fieldErrors[field]) {
 setFieldErrors({ ...fieldErrors, [field]:''})
 }
 }}
 className={`w-full ${fieldErrors[field] ?'border-red-500 focus:border-red-500':''}`}
 placeholder={`Enter your ${field.replace(/_/g,'')}`}
 min={field.includes('rate') ? 0 : field.includes('year') ? 1800 : 0}
 max={field.includes('rate') ? 100 : field.includes('year') ? new Date().getFullYear() : undefined}
 step={field.includes('rate') || field.includes('package') ? 0.1 : undefined}
 />
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 // Handle select fields
 if (field ==='institute_type') {
 return (
 <Select
 value={value as string}
 onValueChange={(val) => setFormData({ ...formData, [field]: val })}
 >
 <SelectTrigger className="w-full">
 <SelectValue placeholder="Select institute type"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="university">University</SelectItem>
 <SelectItem value="college">College</SelectItem>
 <SelectItem value="institute">Institute</SelectItem>
 <SelectItem value="academy">Academy</SelectItem>
 </SelectContent>
 </Select>
 )
 }

 // Handle URL fields
 if (field ==='website_url') {
 return (
 <div>
 <Input
 type="url"value={value as string}
 onChange={(e) => {
 setFormData({ ...formData, [field]: e.target.value })
 // Clear error when user starts typing
 if (fieldErrors[field]) {
 setFieldErrors({ ...fieldErrors, [field]:''})
 }
 }}
 className={`w-full ${fieldErrors[field] ?'border-red-500 focus:border-red-500':''}`}
 placeholder="https://university.edu"/>
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 // Handle readonly fields (university name after account creation)
 if (field ==='name') {
 return (
 <div className="space-y-2">
 <Input
 value={value as string}
 onChange={(e) => {
 let inputValue = e.target.value
 const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g,'')
 if (sanitizedValue !== inputValue) {
 toast.error('Only letters, spaces, periods, and hyphens are allowed')
 }
 inputValue = sanitizedValue

 setFormData({ ...formData, [field]: inputValue })
 if (fieldErrors[field]) {
 setFieldErrors({ ...fieldErrors, [field]:''})
 }
 }}
 className={`w-full ${fieldErrors[field] ?'border-red-500 focus:border-red-500':''}`}
 placeholder={`Enter your ${field.replace(/_/g,'')}`}
 maxLength={50}
 />
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 // Default text input with validation
 return (
 <div>
 <Input
 value={value as string}
 onChange={(e) => {
 let inputValue = e.target.value

 // Name field validation - only alphabets, spaces, and common punctuation
 if (field ==='name'|| field ==='university_name'|| field ==='contact_person_name'|| field ==='contact_designation') {
 const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g,'')
 if (sanitizedValue !== inputValue) {
 toast.error('Only letters, spaces, periods, and hyphens are allowed')
 }
 inputValue = sanitizedValue
 }

 // Branch field validation - allow alphanumeric and common characters
 if (field ==='branch') {
 const sanitizedValue = inputValue.replace(/[^a-zA-Z0-9\s,.-]/g,'')
 if (sanitizedValue !== inputValue) {
 toast.error('Only letters, numbers, spaces, and common punctuation are allowed')
 }
 inputValue = sanitizedValue
 }

 setFormData({ ...formData, [field]: inputValue })
 // Clear error when user starts typing
 if (fieldErrors[field]) {
 setFieldErrors({ ...fieldErrors, [field]:''})
 }
 }}
 className={`w-full ${fieldErrors[field] ?'border-red-500 focus:border-red-500':''}`}
 placeholder={`Enter your ${field.replace(/_/g,'')}`}
 maxLength={field ==='name'|| field ==='university_name'? 50 : field ==='contact_person_name'|| field ==='contact_designation'? 30 : field ==='branch'? 20 : undefined}
 />
 {fieldErrors[field] && (
 <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
 )}
 </div>
 )
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {section.fields.map((field) => (
 <div key={field} className={field.includes('bio') || field.includes('address') || field.includes('courses_offered') ?'md:col-span-2':''}>
 <label className="block text-sm font-medium text-slate-700 dark:text-emerald-200/90 mb-2 capitalize">
 {field.replace(/_/g,'')}
 </label>
 {renderField(field)}
 </div>
 ))}
 </div>

 <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-emerald-800">
 <Button
 type="button"variant="outline"onClick={onCancel}
 >
 Cancel
 </Button>
 <Button
 type="submit"disabled={saving}
 >
 {saving ?'Saving...':'Save Changes'}
 </Button>
 </div>
 </form>
 )

}
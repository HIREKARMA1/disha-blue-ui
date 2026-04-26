"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { StudentProfile } from '@/services/profileService'
import { getClientLocale, t, type SupportedLocale } from '@/lib/i18n'
interface ProfileSectionFormProps {
 section: {
 id: string
 title: string
 icon: any
 fields: string[]
 completed: boolean
 }
 profile: StudentProfile
 onSave: (formData: any) => void
 saving: boolean
}

export function ProfileSectionForm({ section, profile, onSave, saving }: ProfileSectionFormProps) {
 const [formData, setFormData] = useState<any>({})
 const [locale, setLocale] = useState<SupportedLocale>('en')

 useEffect(() => {
 setLocale(getClientLocale())
 }, [])

 useEffect(() => {
 if (profile && section) {
 // Initialize form data with current profile values
const initialData: any = {}
 section.fields.forEach(field => {
 initialData[field] = profile[field as keyof StudentProfile] ||''})
 setFormData(initialData)
 }
 }, [profile, section])

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 onSave(formData)
 }

 const renderField = (field: string) => {
 const value = formData[field] || ''
 if (field.includes('bio') || field.includes('experience') || field.includes('details') || field.includes('activities')) {
 return (
 <Textarea
 value={value}
 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, [field]: e.target.value })}
 rows={4}
 className="w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-50 dark:focus:ring-blue-500"placeholder={`${t(locale,'profile.form.enterYour')} ${field.replace(/_/g,'')}`}
 />
 )
 }

 if (field.includes('year')) {
 return (
 <Input
 type="number"value={value}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-50 dark:focus:ring-blue-500"placeholder={`${t(locale,'profile.form.enterYour')} ${field.replace(/_/g,'')}`}
 />
 )
 }

 if (field.includes('cgpa') || field.includes('percentage')) {
 return (
 <Input
 type="number"step="0.01"min="0"max="10"value={value}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-50 dark:focus:ring-blue-500"placeholder={`${t(locale,'profile.form.enterYour')} ${field.replace(/_/g,'')}`}
 />
 )
 }

 return (
 <Input
 type="text"value={value}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [field]: e.target.value })}
 className="w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-50 dark:focus:ring-blue-500"placeholder={`${t(locale,'profile.form.enterYour')} ${field.replace(/_/g,'')}`}
 />
 )
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="flex items-center space-x-3 mb-6">
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 shadow-sm dark:bg-blue-600">
 <section.icon className="h-5 w-5 text-white"/>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-slate-900 dark:text-blue-50">{section.title}</h3>
 <p className="text-sm text-slate-600 dark:text-blue-200/85">{t(locale,'profile.form.updateSectionInfoPrefix')} {section.title.toLowerCase()} {t(locale,'profile.form.updateSectionInfoSuffix')}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {section.fields.map((field) => (
 <div key={field} className={field.includes('bio') || field.includes('experience') || field.includes('details') || field.includes('activities') ?'md:col-span-2':''}>
 <label className="mb-2 block text-sm font-medium capitalize text-slate-700 dark:text-blue-200/90">
 {field.replace(/_/g,'')}
 </label>
 {renderField(field)}
 </div>
 ))}
 </div>

 <div className="flex justify-end space-x-3 border-t border-slate-200 pt-6 dark:border-blue-800">
 <Button
 type="button"variant="outline"onClick={() => window.history.back()}
 className="px-6 py-2">
 {t(locale,'common.cancel')}
 </Button>
 <Button
 type="submit"disabled={saving}
 className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-600/90 dark:bg-blue-600 dark:hover:bg-blue-500">
 {saving ? t(locale,'profile.form.saving') : t(locale,'profile.form.saveChanges')}
 </Button>
 </div>
 </form>
 )
}

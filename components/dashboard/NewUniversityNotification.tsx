"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Bell, ArrowRight } from 'lucide-react'
import { universityManagementService } from '@/services/universityManagementService'
import { UniversityListItem } from '@/types/university'
import { useRouter } from 'next/navigation'
interface NewUniversityNotificationProps {
 isOpen: boolean
 onClose: () => void
 newUniversities: UniversityListItem[]
}

export function NewUniversityNotification({ isOpen, onClose, newUniversities }: NewUniversityNotificationProps) {
 const router = useRouter()

 const handleViewUniversities = () => {
 onClose()
 router.push('/dashboard/admin/universities')
 }

 if (!isOpen || newUniversities.length === 0) return null

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black z-40"onClick={onClose}
 />

 {/* Notification Modal */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
 <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
 {/* Header */}
 <div className="px-6 py-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2">
 <Bell className="w-6 h-6 text-white"/>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-white">
 New University Registration
 </h3>
 <p className="text-sm">
 {newUniversities.length} new universit{newUniversities.length === 1 ?'y':'ies'} registered
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="text-white p-1 transition-colors">
 <X className="w-5 h-5"/>
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="p-6 max-h-96 overflow-y-auto">
 <div className="space-y-3">
 {newUniversities.map((university) => (
 <motion.div
 key={university.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
 <div className="flex-shrink-0">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center">
 <Building2 className="w-5 h-5 text-white"/>
 </div>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-sm font-medium text-gray-900 truncate">
 {university.university_name}
 </p>
 <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">
 Inactive
 </span>
 </div>
 <p className="text-xs text-gray-500 mt-1">
 {university.email}
 </p>
 {university.contact_person_name && (
 <p className="text-xs text-gray-500">
 Contact: {university.contact_person_name}
 </p>
 )}
 </div>
 </motion.div>
 ))}
 </div>
 </div>

 {/* Footer */}
 <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
 <div className="flex items-center justify-between">
 <p className="text-sm text-gray-600">
 Review and update their status in the Universities panel
 </p>
 <button
 onClick={handleViewUniversities}
 className="flex items-center space-x-2 px-4 py-2 text-white rounded-xl transition-all duration-200 font-medium text-sm">
 <span>View Universities</span>
 <ArrowRight className="w-4 h-4"/>
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 )
}


"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { AlertTriangle, Archive, Eye, X } from 'lucide-react'
interface ArchiveConfirmationModalProps {
 isOpen: boolean
 onClose: () => void
 onConfirm: () => void
 studentName: string
 isArchiving: boolean // true if archiving, false if unarchiving
 isLoading?: boolean
}

export function ArchiveConfirmationModal({
 isOpen,
 onClose,
 onConfirm,
 studentName,
 isArchiving,
 isLoading = false
}: ArchiveConfirmationModalProps) {
 const [mounted, setMounted] = useState(false)

 useEffect(() => {
 setMounted(true)
 }, [])

 if (!isOpen || !mounted) return null

 const handleBackdropClick = (e: React.MouseEvent) => {
 if (e.target === e.currentTarget) {
 onClose()
 }
 }

 const handleConfirm = () => {
 onConfirm()
 }

 const modalContent = (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
 {/* Backdrop - Full Screen */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black"onClick={handleBackdropClick}
 />
 
 {/* Modal Content */}
 <motion.div
 className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 transition={{ type:"spring", duration: 0.3 }}
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="flex items-center justify-between p-6 border-b border-gray-200">
 <div className="flex items-center gap-3">
 <div className={`p-2 ${isArchiving
 ?'bg-orange-100':'bg-blue-100'}`}>
 {isArchiving ? (
 <Archive className="w-5 h-5 text-orange-600"/>
 ) : (
 <Eye className="w-5 h-5 text-blue-600"/>
 )}
 </div>
 <div>
 <h3 className="text-lg font-semibold text-gray-900">
 {isArchiving ?'Archive Student':'Unarchive Student'}
 </h3>
 <p className="text-sm text-gray-500">
 Confirm this action
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"disabled={isLoading}
 >
 <X className="w-5 h-5 text-gray-500"/>
 </button>
 </div>

 {/* Content */}
 <div className="p-6">
 <div className="flex items-start gap-4 mb-6">
 <div className="p-2 bg-yellow-100 flex-shrink-0">
 <AlertTriangle className="w-5 h-5 text-yellow-600"/>
 </div>
 <div className="flex-1">
 <p className="text-gray-900 mb-2">
 {isArchiving ? (
 <>
 Are you sure you want to <strong>archive</strong> <span className="font-semibold text-orange-600">{studentName}</span>?
 </>
 ) : (
 <>
 Are you sure you want to <strong>unarchive</strong> <span className="font-semibold text-blue-600">{studentName}</span>?
 </>
 )}
 </p>
 <div className="text-sm text-gray-600 space-y-1">
 {isArchiving ? (
 <>
 <p>• The student will be moved to archived status</p>
 <p>• They won't appear in active student lists by default</p>
 <p>• You can unarchive them later if needed</p>
 </>
 ) : (
 <>
 <p>• The student will be restored to active status</p>
 <p>• They will appear in active student lists</p>
 <p>• All their data will remain intact</p>
 </>
 )}
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex gap-3 justify-end">
 <button
 onClick={onClose}
 disabled={isLoading}
 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
 Cancel
 </button>
 <button
 onClick={handleConfirm}
 disabled={isLoading}
 className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isArchiving
 ?'bg-orange-600 hover:bg-orange-700':'bg-blue-600 hover:bg-blue-700'}`}
 >
 {isLoading ? (
 <>
 <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>
 {isArchiving ?'Archiving...':'Unarchiving...'}
 </>
 ) : (
 <>
 {isArchiving ? (
 <>
 <Archive className="w-4 h-4"/>
 Archive Student
 </>
 ) : (
 <>
 <Eye className="w-4 h-4"/>
 Unarchive Student
 </>
 )}
 </>
 )}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )

 return createPortal(modalContent, document.body)
}

"use client"

import { motion } from 'framer-motion'
import { Activity, User, Briefcase, FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { AdminActivity } from '@/types/admin'
interface AdminRecentActivitiesProps {
 activities: AdminActivity[]
}

export function AdminRecentActivities({ activities }: AdminRecentActivitiesProps) {
 // Mock data for now - in real implementation, this would come from API
const mockActivities: AdminActivity[] = [
 {
 id:'1',
 type:'user_registration',
 title:'New Student Registration',
 description:'John Doe registered as a student from MIT',
 timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
 user_id:'user_123',
 user_name:'John Doe'},
 {
 id:'2',
 type:'job_posted',
 title:'New Job Posted',
 description:'Software Engineer position posted by TechCorp',
 timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
 user_id:'corp_456',
 user_name:'TechCorp'},
 {
 id:'3',
 type:'application_submitted',
 title:'Application Submitted',
 description:'Sarah Wilson applied for Data Scientist role',
 timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
 user_id:'user_789',
 user_name:'Sarah Wilson'},
 {
 id:'4',
 type:'system_alert',
 title:'System Alert',
 description:'High server load detected on database cluster',
 timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
 },
 {
 id:'5',
 type:'admin_action',
 title:'Admin Action',
 description:'University profile approved by admin',
 timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
 user_id:'uni_101',
 user_name:'Stanford University'}
 ]

 const displayActivities = activities.length > 0 ? activities : mockActivities

 const getActivityIcon = (type: AdminActivity['type']) => {
 switch (type) {
 case'user_registration':
 return User
 case'job_posted':
 return Briefcase
 case'application_submitted':
 return FileText
 case'system_alert':
 return AlertTriangle
 case'admin_action':
 return CheckCircle
 default:
 return Activity
 }
 }

 const getActivityColor = (type: AdminActivity['type']) => {
 switch (type) {
 case 'user_registration':
 return 'text-blue-600 bg-blue-50'
 case 'job_posted':
 return 'text-blue-600 bg-blue-50'
 case 'application_submitted':
 return 'text-purple-600 bg-purple-50'
 case 'system_alert':
 return 'text-red-600 bg-red-50'
 case 'admin_action':
 return 'text-orange-600 bg-orange-50'
 default:
 return 'text-gray-600 bg-gray-50'
 }
 }

 const formatTimestamp = (timestamp: string) => {
 const date = new Date(timestamp)
 const now = new Date()
 const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

 if (diffInMinutes < 1) return 'Just now'
 if (diffInMinutes < 60) return `${diffInMinutes}m ago`
 if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
 return date.toLocaleDateString()
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="dashboard-overview-card p-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-lg font-semibold text-gray-900">
 Recent Activities
 </h3>
 <p className="text-sm text-gray-600">
 Latest platform activities and events
 </p>
 </div>
 <div className="flex items-center space-x-2 text-sm text-gray-500">
 <Clock className="w-4 h-4"/>
 <span>Live updates</span>
 </div>
 </div>

 <div className="space-y-4">
 {displayActivities.map((activity, index) => {
 const IconComponent = getActivityIcon(activity.type)
 const colorClasses = getActivityColor(activity.type)

 return (
 <motion.div
 key={activity.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.4, delay: index * 0.1 }}
 className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
 <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${colorClasses.split('')[1]}`}>
 <IconComponent className={`w-5 h-5 ${colorClasses.split('')[0]}`} />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-1">
 <h4 className="text-sm font-medium text-gray-900 truncate">
 {activity.title}
 </h4>
 <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
 {formatTimestamp(activity.timestamp)}
 </span>
 </div>

 <p className="text-sm text-gray-600 mb-2">
 {activity.description}
 </p>

 {activity.user_name && (
 <div className="flex items-center space-x-2">
 <span className="text-xs text-gray-500">
 by {activity.user_name}
 </span>
 </div>
 )}
 </div>
 </motion.div>
 )
 })}
 </div>

 {displayActivities.length === 0 && (
 <div className="text-center py-8">
 <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
 <p className="text-gray-500">
 No recent activities to display
 </p>
 </div>
 )}

 <div className="mt-6 pt-4 border-t border-gray-200">
 <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
 View All Activities
 </button>
 </div>
 </motion.div>
 )
}

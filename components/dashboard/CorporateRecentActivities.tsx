"use client"

import { motion } from 'framer-motion'
import { Clock, User, Briefcase, Calendar, ArrowRight } from 'lucide-react'
import { dashboardSolidSurfaceClass } from '@/components/dashboard/dashboard-ui'
import { cn } from '@/lib/utils'
interface CorporateRecentActivitiesProps {
 className?: string
}

export function CorporateRecentActivities({ className =''}: CorporateRecentActivitiesProps) {
 // Mock data for now - will be replaced with actual API data
const mockActivities = [
 {
 id: 1,
 type:'application',
 title:'New application received',
 description:'Sarah Johnson applied for Software Engineer position',
 time:'2 minutes ago',
 icon: User,
 color:'text-blue-600',
 bgColor:'bg-blue-100'},
 {
 id: 2,
 type:'interview',
 title:'Interview scheduled',
 description:'Technical interview with Mike Chen for Data Scientist role',
 time:'1 hour ago',
 icon: Calendar,
 color:'text-blue-600',
 bgColor:'bg-blue-100'},
 {
 id: 3,
 type:'job',
 title:'Job posted',
 description:'Frontend Developer position published successfully',
 time:'3 hours ago',
 icon: Briefcase,
 color:'text-purple-600',
 bgColor:'bg-purple-100'},
 {
 id: 4,
 type:'candidate',
 title:'Profile viewed',
 description:'Viewed Emily Davis profile for UX Designer role',
 time:'5 hours ago',
 icon: User,
 color:'text-orange-600',
 bgColor:'bg-orange-100'},
 {
 id: 5,
 type:'application',
 title:'Application reviewed',
 description:'Reviewed 15 applications for Product Manager position',
 time:'1 day ago',
 icon: User,
 color:'text-indigo-600',
 bgColor:'bg-indigo-100'}
 ]

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className={cn(dashboardSolidSurfaceClass,'p-6 relative', className)}
 >
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
 <div className="flex items-center space-x-3">
 <div className="rounded-xl bg-blue-50/40 p-2.5 dark:bg-blue-900/50">
 <Clock className="w-6 h-6 text-primary"/>
 </div>
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-foreground">
 Recent Activities
 </h3>
 <p className="text-sm text-muted-foreground">
 Latest updates and notifications
 </p>
 </div>
 </div>
 <button type="button"className="text-sm font-medium text-primary flex items-center space-x-1 transition-colors">
 <span>View All</span>
 <ArrowRight className="w-4 h-4"/>
 </button>
 </div>

 <div className="space-y-4 blur-sm pointer-events-none">
 {mockActivities.map((activity, index) => (
 <motion.div
 key={activity.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6, delay: index * 0.1 }}
 className="flex items-start space-x-3 p-3 rounded-xl border border-transparent transition-all cursor-default group">
 <div className={`p-2 rounded-xl ${activity.bgColor} group-hover:scale-105 transition-transform duration-200`}>
 <activity.icon className={`w-4 h-4 ${activity.color}`} />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
 {activity.title}
 </h4>
 <p className="text-sm text-muted-foreground mt-1">
 {activity.description}
 </p>
 <div className="flex items-center space-x-2 mt-2">
 <Clock className="w-3 h-3 text-muted-foreground"/>
 <span className="text-xs text-muted-foreground">
 {activity.time}
 </span>
 </div>
 </div>
 </motion.div>
 ))}
 </div>

 {/* Coming Soon Overlay */}
 <div className="absolute inset-0 flex items-center justify-center rounded-xl">
 <div className="text-center px-4">
 <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
 <Clock className="w-8 h-8 text-primary"/>
 </div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 Coming Soon
 </h3>
 <p className="text-sm text-muted-foreground max-w-xs mx-auto">
 Recent Activities functionality is under development. Stay tuned for updates!
 </p>
 </div>
 </div>
 </motion.div>
 )
}



"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { cn } from '@/lib/utils'
interface LibraryTopic {
 id: number
 name: string
 description?: string
 link: string
 thumbnail?: string
 is_featured: boolean
 subcategory_id: number
 subcategory?: {
 name: string
 category?: {
 name: string
 }
 }
}

interface LibraryCategory {
 id: number
 name: string
 description?: string
 subcategories: any[]
}

// Subtle alternating surfaces aligned with sage / emerald dashboard theme
const getCardBackgroundColor = (topicId: number): string => {
 const colors = [
 'bg-white dark:bg-emerald-900/25',
 'bg-sage/10 dark:bg-emerald-900/30',
 'bg-white dark:bg-emerald-900/25',
 'bg-sage/5 dark:bg-emerald-900/20',
 'bg-white dark:bg-emerald-900/25',
 'bg-sage/10 dark:bg-emerald-900/30',
 'bg-white dark:bg-emerald-900/25',
 'bg-sage/5 dark:bg-emerald-900/20',
 'bg-white dark:bg-emerald-900/25',
 'bg-sage/10 dark:bg-emerald-900/30',
 ]

 return colors[topicId % colors.length]
}

export default function LibraryPage() {
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedCategory, setSelectedCategory] = useState<{ id: number, name: string } | null>(null)
 const [topics, setTopics] = useState<LibraryTopic[]>([])
 const [categories, setCategories] = useState<LibraryCategory[]>([])
 const [loading, setLoading] = useState(false)
 const [currentPage, setCurrentPage] = useState(1)
 const [totalCount, setTotalCount] = useState(0)
 const [totalPages, setTotalPages] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(20)
 const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)

 const searchTopics = async (query: string ='', categoryId: number | null = null) => {
 console.log('searchTopics called with query:', query,'categoryId:', categoryId,'page:', currentPage,'limit:', itemsPerPage)
 setLoading(true)
 try {
 // Check if user is authenticated
 if (!apiClient.isAuthenticated()) {
 console.error('User not authenticated. Please log in.')
 // Could redirect to login here
 return
 }

 // Fetch topics and categories using apiClient
const [searchData, categoriesData] = await Promise.all([
 apiClient.searchLibraryTopics(currentPage, itemsPerPage, query, categoryId),
 apiClient.getLibraryCategories()
 ])

 console.log('Search response:', searchData)
 setTopics(searchData.topics || [])
 setCategories(categoriesData || [])
 setTotalCount(searchData.total_count || 0)
 setTotalPages(searchData.total_pages || 1)

 } catch (error: any) {
 console.error('Failed to fetch library data:', error)

 if (error.response?.status === 401) {
 console.error('Authentication failed - please log in again')
 // Could redirect to login page here
 window.location.href ='/auth/login'} else if (error.response?.status === 403) {
 console.error('Access denied - insufficient permissions')
 } else {
 console.error('Failed to fetch library data:', error.response?.data?.detail || error.message)
 }
 } finally {
 setLoading(false)
 }
 }

 const handleSearch = async () => {
 console.log('Searching for:', searchQuery,'category:', selectedCategory)
 setCurrentPage(1) // Reset to first page when searching
 await searchTopics(searchQuery, selectedCategory?.id || null)
 }

 const handleCategoryChange = (category: LibraryCategory | null) => {
 setSelectedCategory(category)
 setIsCategoryDropdownOpen(false)
 }

 useEffect(() => {
 searchTopics()
 }, [currentPage, itemsPerPage])



 return (
 <StudentDashboardLayout>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="space-y-6">
 {/* Header — card chrome from globals + sage tint */}
 <div className="dashboard-overview-card mb-6 !bg-sage/10 p-6 dark:!bg-emerald-900/30">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
 <div className="min-w-0 flex-1">
 <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-emerald-50">
 Library </h1>
 <p className="mb-3 text-lg text-slate-600 dark:text-emerald-200/85">
 Discover educational videos, tutorials, and learning resources
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="inline-flex items-center border border-sage/40 bg-white px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
  {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric'})}
 </span>
 <span className="inline-flex items-center border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  Career Growth
 </span>
 <span className="inline-flex items-center border border-sage/40 bg-sage/15 px-3 py-1 text-sm font-medium text-sage-deep dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
  New Opportunities
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Search and filters */}
 <div className="dashboard-overview-card mb-6 p-6">
 {/* Search Bar */}
 <div className="flex flex-col gap-3 sm:flex-row">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-emerald-500/80"/>
 <input
 type="text"placeholder="Search topics, skills, or categories..."value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 onKeyPress={(e) => e.key ==='Enter'&& handleSearch()}
 className="w-full rounded-2xl border border-slate-200/90 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:placeholder:text-emerald-400/70 dark:focus:ring-emerald-500"/>
 </div>

 {/* Category Filter */}
 <div className="relative">
 <button
 type="button"onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
 className="flex min-w-[140px] w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-4 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:focus:ring-emerald-500 sm:w-auto">
 <span>{selectedCategory?.name ||'All Categories'}</span>
 <svg className="ml-2 h-4 w-4 text-slate-400 dark:text-emerald-500/80"fill="none"stroke="currentColor"viewBox="0 0 24 24">
 <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 9l-7 7-7-7"/>
 </svg>
 </button>

 {/* Category Dropdown */}
 {isCategoryDropdownOpen && (
 <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-lg dark:border-emerald-800 dark:bg-emerald-950">
 <button
 onClick={() => handleCategoryChange(null)}
 className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-sage/15 dark:hover:bg-emerald-900/50 ${!selectedCategory ?'bg-sage/20 font-medium text-sage-deep dark:bg-emerald-900/40 dark:text-emerald-200':'text-slate-900 dark:text-emerald-100'}`}
 >
 All Categories
 </button>
 {categories.map((category) => (
 <button
 key={category.id}
 onClick={() => handleCategoryChange(category)}
 className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-sage/15 dark:hover:bg-emerald-900/50 ${selectedCategory?.id === category.id ?'bg-sage/20 font-medium text-sage-deep dark:bg-emerald-900/40 dark:text-emerald-200':'text-slate-900 dark:text-emerald-100'}`}
 >
 {category.name}
 </button>
 ))}
 </div>
 )}
 </div>

 <Button
 onClick={handleSearch}
 disabled={loading}
 className="h-10 w-full bg-sage-deep px-6 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sage-deep/90 hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto">
 {loading ? (
 <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
 ) : (
 <Search className="mr-2 h-4 w-4"/>
 )}
 {loading ?'Searching...':'Search'}
 </Button>
 {(searchQuery || selectedCategory) && (
 <Button
 onClick={() => {
 setSearchQuery('')
 setSelectedCategory(null)
 searchTopics('', null)
 }}
 variant="outline"className="h-10 w-full border-slate-200/90 px-4 transition-all duration-200 hover:bg-sage/10 hover:shadow-md dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40 sm:w-auto">
 Clear
 </Button>
 )}
 </div>
 </div>



 {/* Results Summary - Only show when loading or has results */}
 {(loading || topics.length > 0) && (
 <div className="dashboard-overview-card mb-6 p-4">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {loading ? (
 <span className="flex items-center gap-2">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage-deep border-t-transparent dark:border-emerald-400"></div>
 Loading topics...
 </span>
 ) : topics.length > 0 ? (
 <span className="flex items-center gap-2">
  <span className="font-semibold text-sage-deep dark:text-emerald-300">
 Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} topics
 </span>
 {(searchQuery || selectedCategory) && (
 <span className="text-slate-500 dark:text-emerald-400/90">
 for"{searchQuery || selectedCategory?.name}"</span>
 )}
 </span>
 ) : null}
 </div>
 {totalCount > 0 && (
 <div className="text-xs font-medium text-sage-deep dark:text-emerald-400">
  Page {currentPage} of {totalPages} • {itemsPerPage} topics per page
 </div>
 )}
 </div>
 </div>
 )}

 {/* Topics Grid */}
 {loading ? (
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
 {[...Array(20)].map((_, index) => (
 <div key={index}
 className={cn(
 'dashboard-overview-card overflow-hidden animate-pulse',
 getCardBackgroundColor(index),
 )}
 >
 <div className="p-3">
 {/* Play Button Skeleton */}
 <div className="mb-2 flex justify-center">
 <div className="h-8 w-8"></div>
 </div>

 {/* Topic Name Skeleton */}
 <div className="mx-auto mb-2 h-4 w-3/4 rounded-xl bg-slate-200/80 dark:bg-emerald-800/50"></div>

 {/* Category Skeleton */}
 <div className="mx-auto mb-1 h-3 w-1/2 rounded-lg bg-slate-200/70 dark:bg-emerald-800/40"></div>
 <div className="mx-auto h-3 w-2/3 rounded-lg bg-slate-200/70 dark:bg-emerald-800/40"></div>
 </div>
 </div>
 ))}
 </div>
 ) : topics.length > 0 ? (
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
 {topics.map((topic) => (
 <div
 key={topic.id}
 className={cn(
 'dashboard-overview-card-interactive group cursor-pointer overflow-hidden p-0 transition-transform duration-200 hover:scale-[1.02]',
 getCardBackgroundColor(topic.id),
 )}
 onClick={() => window.open(topic.link,'_blank')}
 >
 <div className="relative p-3">
 {/* Play Button - Centered */}
 <div className="mb-2 flex justify-center">
 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20 shadow-sm transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-800/60">
 <Play className="h-4 w-4 text-sage-deep dark:text-emerald-300"/>
 </div>
 </div>

 {/* Featured Badge */}
 {topic.is_featured && (
 <div className="absolute right-2 top-2 bg-sage-deep px-1.5 py-0.5 text-xs font-medium text-white shadow-sm dark:bg-emerald-500">
 Featured
 </div>
 )}

 {/* Topic Name */}
 <h3 className="mb-2 line-clamp-2 text-center text-sm font-medium leading-tight text-slate-900 transition-colors group-hover:text-sage-deep dark:text-emerald-50 dark:group-hover:text-emerald-300">
 {topic.name}
 </h3>

 {/* Category Info */}
 {topic.subcategory && (
 <div className="flex flex-col items-center gap-1 text-xs text-slate-600 dark:text-emerald-200/80">
 <span className="border border-slate-200/90 px-2 py-1 font-medium text-sage-deep dark:border-emerald-800 dark:text-emerald-300">
 {topic.subcategory.category?.name ||'Unknown Category'}
 </span>
 <span className="text-slate-400 dark:text-emerald-500/80">—</span>
 <span className="text-slate-800 dark:text-emerald-100">{topic.subcategory.name}</span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="py-12 text-center">
 <div className="mb-4 text-slate-400 dark:text-emerald-500/70">
 <Search className="mx-auto h-16 w-16"/>
 </div>
 <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-emerald-50">
 {searchQuery ?'No results found':'No topics available'}
 </h3>
 <p className="text-slate-600 dark:text-emerald-200/80">
 {searchQuery
 ? `No topics found for"${searchQuery}". Try a different search term.`
 :'There are no library topics available at the moment.'}
 </p>
 {(searchQuery || selectedCategory) && (
 <Button
 onClick={() => {
 setSearchQuery('')
 setSelectedCategory(null)
 searchTopics('', null)
 }}
 variant="outline"className="mt-4 border-slate-200/90 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40">
 Clear Search
 </Button>
 )}
 </div>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="mt-8 flex justify-center">
 <div className="flex gap-2">
 <Button
 variant="outline"onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
 disabled={currentPage <= 1}
 className="border-slate-200/90 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
 >
 Previous
 </Button>
 <span className="px-4 py-2 text-slate-600 dark:text-emerald-200/85">
 Page {currentPage} of {totalPages}
 </span>
 <Button
 variant="outline"onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
 disabled={currentPage >= totalPages}
 className="border-slate-200/90 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </motion.div>
 </StudentDashboardLayout>
 )
}

"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Clock, Eye, Loader2, X, ThumbsUp, Share2, Bookmark, MoreVertical, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { cn } from '@/lib/utils'
interface Video {
 id: string
 title: string
 description: string
 channel: string
 duration: string
 views: number
 published_at: string
 url: string
 thumbnail: string
 likes: number
}

interface VideoSearchResponse {
 videos: Video[]
 total_count: number
 query: string
 skip: number
 limit: number
 has_more: boolean
 current_page: number
 total_pages: number
}

export default function VideoSearchPage() {
 const [searchQuery, setSearchQuery] = useState('')
 const [videos, setVideos] = useState<Video[]>([])
 const [loading, setLoading] = useState(false)
 const [currentPage, setCurrentPage] = useState(1)
 const [totalCount, setTotalCount] = useState(0)
 const [totalPages, setTotalPages] = useState(1)
 const [hasMore, setHasMore] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [itemsPerPage, setItemsPerPage] = useState(12)
 const [isDropdownOpen, setIsDropdownOpen] = useState(false)
 const [hasSearched, setHasSearched] = useState(false)

 // Popular search suggestions
const popularSearches = ['python tutorial for beginners','react hooks tutorial','coding interview preparation','javascript es6 tutorial','system design interview','docker tutorial','aws cloud computing','git version control','resume writing tips','career change to tech']

 // Video categories for quick filters
const categories = [
 { name:'Programming', query:'programming tutorial'},
 { name:'Interviews', query:'coding interview'},
 { name:'Career', query:'career advice'},
 { name:'Skills', query:'technical skills'},
 { name:'Web Dev', query:'web development'},
 { name:'Data Science', query:'data science tutorial'}
 ]

 const searchVideos = async (query: string, page: number = 1) => {
 if (!query.trim()) return

 setLoading(true)
 setError(null)
 setHasSearched(true)

 try {
 const skip = (page - 1) * itemsPerPage
 const data: VideoSearchResponse = await apiClient.searchVideos(query.trim(), skip, itemsPerPage)

 setVideos(data.videos)
 setTotalCount(data.total_count)
 setTotalPages(data.total_pages)
 setHasMore(data.has_more)
 setCurrentPage(data.current_page)
 } catch (err: any) {
 setError(err.response?.data?.detail ||'Failed to search videos')
 setVideos([])
 setTotalCount(0)
 setTotalPages(1)
 setHasMore(false)
 } finally {
 setLoading(false)
 }
 }

 const handleSearch = (e?: React.SyntheticEvent) => {
 e?.preventDefault()
 if (searchQuery.trim()) {
 searchVideos(searchQuery, 1)
 }
 }

 const handleCategoryClick = (categoryQuery: string) => {
 setSearchQuery(categoryQuery)
 searchVideos(categoryQuery, 1)
 }

 const handlePageChange = (newPage: number) => {
 if (searchQuery.trim()) {
 searchVideos(searchQuery, newPage)
 }
 }

 const handleVideoClick = (video: Video) => {
 setSelectedVideo(video)
 setIsModalOpen(true)
 }

 const closeModal = () => {
 setIsModalOpen(false)
 setSelectedVideo(null)
 }

 const handleItemsPerPageChange = (newItemsPerPage: number) => {
 setItemsPerPage(newItemsPerPage)
 // Automatically search with new items per page if there's a search query OR if there are existing videos
 if (searchQuery.trim()) {
 searchVideos(searchQuery.trim(), 1) // Reset to page 1 when changing items per page
 } else if (videos.length > 0) {
 // If no search query but there are videos, use the last search query or default
const lastQuery = searchQuery ||'c'// Use'c'as default since that's what's shown in the search box
 searchVideos(lastQuery, 1)
 }
 }

 // Handle keyboard events
 useEffect(() => {
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key ==='Escape'&& isModalOpen) {
 closeModal()
 }
 }

 if (isModalOpen) {
 document.addEventListener('keydown', handleKeyDown)
 document.body.style.overflow ='hidden'}

 return () => {
 document.removeEventListener('keydown', handleKeyDown)
 document.body.style.overflow ='unset'}
 }, [isModalOpen])

 // Handle click outside dropdown
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (isDropdownOpen && !(event.target as Element).closest('.relative')) {
 setIsDropdownOpen(false)
 }
 }

 if (isDropdownOpen) {
 document.addEventListener('mousedown', handleClickOutside)
 }

 return () => {
 document.removeEventListener('mousedown', handleClickOutside)
 }
 }, [isDropdownOpen])

 const formatViews = (views: number | string) => {
 const num = typeof views ==='number'? views : parseInt(views.toString().replace(/[^\d]/g,''))
 if (isNaN(num) || num === 0) return '0'
 if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
 if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
 return num.toString()
 }

 const formatDate = (dateString: string) => {
 if (!dateString) return'Unknown date'
const date = new Date(dateString)
 if (isNaN(date.getTime())) return'Invalid date'
const now = new Date()
 const diffTime = Math.abs(now.getTime() - date.getTime())
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

 if (diffDays === 1) return '1 day ago'
 if (diffDays < 7) return `${diffDays} days ago`
 if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
 if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
 return `${Math.ceil(diffDays / 365)} years ago`
 }

 return (
 <StudentDashboardLayout>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="space-y-6">
 {/* Header */}
 <div className="dashboard-overview-card mb-6 !bg-sage/10 p-6 dark:!bg-emerald-900/30">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
 <div className="min-w-0 flex-1">
 <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-emerald-50">
 Video Search
 </h1>
 <p className="mb-3 text-lg text-slate-600 dark:text-emerald-200/85">
 Discover career-related videos, tutorials, and educational content
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
 <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-emerald-500/80"/>
 <input
 type="text"placeholder="Search videos by title, skills, or category..."value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==='Enter') {
 e.preventDefault()
 if (searchQuery.trim()) searchVideos(searchQuery.trim(), 1)
 }
 }}
 className="w-full rounded-2xl border border-slate-200/90 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:placeholder:text-emerald-400/70 dark:focus:ring-emerald-500"/>
 </div>

 {/* Items per page selector */}
 <div className="flex items-center gap-3">
 <label className="whitespace-nowrap text-sm text-slate-600 dark:text-emerald-200/85">
 Videos per page:
 </label>
 <div className="relative">
 <button
 type="button"onClick={() => setIsDropdownOpen(!isDropdownOpen)}
 className="flex min-w-[80px] w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-4 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:focus:ring-emerald-500">
 <span>{itemsPerPage}</span>
 <svg className="ml-2 h-4 w-4 text-slate-400 dark:text-emerald-500/80"fill="none"stroke="currentColor"viewBox="0 0 24 24">
 <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 9l-7 7-7-7"/>
 </svg>
 </button>

 {/* Dropdown menu */}
 {isDropdownOpen && (
 <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-2xl border border-slate-200/90 bg-white shadow-lg dark:border-emerald-800 dark:bg-emerald-950">
 {[6, 12, 24, 48].map((value) => (
 <button
 key={value}
 type="button"onClick={() => {
 handleItemsPerPageChange(value);
 setIsDropdownOpen(false);
 }}
 className={cn(
 'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-sage/15 dark:hover:bg-emerald-900/50',
 itemsPerPage === value
 ?'bg-sage/20 font-medium text-sage-deep dark:bg-emerald-900/40 dark:text-emerald-200':'text-slate-900 dark:text-emerald-100',
 )}
 >
 {value}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 <Button
 onClick={handleSearch}
 disabled={loading || !searchQuery.trim()}
 className="h-10 w-full bg-sage-deep px-6 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sage-deep/90 hover:shadow-md disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto">
 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
 Search
 </Button>
 </div>
 </div>



 {/* Main Content */}
 <div>
 {/* Results Summary - Only show when loading or has results */}
 {(loading || videos.length > 0) && (
 <div className="dashboard-overview-card mb-6 p-4">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="text-sm text-slate-600 dark:text-emerald-200/85">
 {loading ? (
 <span className="flex items-center gap-2">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage-deep border-t-transparent dark:border-emerald-400"></div>
 Loading videos...
 </span>
 ) : videos.length > 0 ? (
 <span className="flex items-center gap-2">
  <span className="font-semibold text-sage-deep dark:text-emerald-300">
 Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} videos
 </span>
 </span>
 ) : null}
 </div>
 {totalCount > 0 && (
 <div className="text-xs font-medium text-sage-deep dark:text-emerald-400">
  Page {currentPage} of {totalPages} • {itemsPerPage} videos per page
 </div>
 )}
 </div>
 </div>
 )}

 {/* Videos Grid - Exact match to Job Opportunities */}
 {loading ? (
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 {[...Array(12)].map((_, i) => (
 <div key={i} className="dashboard-overview-card overflow-hidden animate-pulse p-0">
 {/* Thumbnail skeleton */}
 <div className="aspect-video bg-slate-200/90 dark:bg-emerald-900/50"></div>
 {/* Content skeleton */}
 <div className="space-y-2 p-3">
 <div className="h-3 w-full rounded-lg bg-slate-200/80 dark:bg-emerald-800/50"></div>
 <div className="h-3 w-3/4 rounded-lg bg-slate-200/80 dark:bg-emerald-800/50"></div>
 <div className="h-2 w-1/2 rounded bg-slate-200/70 dark:bg-emerald-800/40"></div>
 <div className="h-2 w-2/3 rounded bg-slate-200/70 dark:bg-emerald-800/40"></div>
 </div>
 </div>
 ))}
 </div>
 ) : videos.length > 0 ? (
 <>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 {videos.map((video, index) => (
 <motion.div
 key={video.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: index * 0.1 }}
 className="group dashboard-overview-card-interactive cursor-pointer overflow-hidden p-0 transition-transform duration-200 hover:scale-[1.02]"onClick={() => handleVideoClick(video)}
 >
 {/* Thumbnail - YouTube style */}
 <div className="relative aspect-video bg-slate-200 dark:bg-emerald-900/50">
 <img
 src={video.thumbnail}
 alt={video.title}
 className="h-full w-full object-cover"onError={(e) => {
 const target = e.target as HTMLImageElement
 target.src ='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjkwIiByPSIzMCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTQ1IDc1TDE3NSA5MEwxNDUgMTA1Vjc1WiIgZmlsbD0id2hpdGUiLz4KPHN2Zz4K'}}
 />
 {/* Duration badge */}
 <div className="absolute bottom-2 right-2 rounded-md bg-black/85 px-1.5 py-0.5 text-xs font-medium text-white">
 {video.duration}
 </div>
 {/* Play button overlay */}
 <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100">
 <div className="rounded-full bg-black/70 p-3">
 <Play className="h-6 w-6 text-white"/>
 </div>
 </div>
 </div>

 {/* Content - YouTube style compact */}
 <div className="p-3">
 {/* Title */}
 <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-tight text-slate-900 group-hover:text-sage-deep dark:text-emerald-50 dark:group-hover:text-emerald-300">
 {video.title}
 </h3>

 {/* Channel name */}
 <div className="mb-1 flex items-center text-xs text-slate-600 dark:text-emerald-200/80">
 <span className="truncate">{video.channel}</span>
 </div>

 {/* Views and date */}
 <div className="flex items-center text-xs text-slate-500 dark:text-emerald-400/90">
 <span>{formatViews(video.views)} views</span>
 <span className="mx-1">•</span>
 <span>{formatDate(video.published_at)}</span>
 </div>

 {/* Likes count */}
 <div className="mt-1 flex items-center text-xs text-slate-500 dark:text-emerald-400/90">
 <span className="mr-1"></span>
 <span>{formatViews(video.likes)} likes</span>
 </div>
 </div>
 </motion.div>
 ))}
 </div>

 {/* Simple Pagination - Exact match to Job Opportunities */}
 {totalPages > 1 && (
 <div className="mt-8 flex items-center justify-center">
 <div className="dashboard-overview-card p-4">
 <div className="flex items-center gap-2">
 {/* Previous Button */}
 <Button
 variant="outline"size="sm"onClick={() => handlePageChange(currentPage - 1)}
 disabled={currentPage <= 1 || loading}
 className="border-slate-200/90 px-3 py-2 transition-all duration-200 hover:border-sage-deep/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:hover:border-emerald-600">
 ←
 </Button>

 {/* Page Numbers */}
 <div className="flex items-center gap-1">
 {[...Array(totalPages)].map((_, i) => {
 const pageNum = i + 1
 const isCurrentPage = pageNum === currentPage
 const isNearCurrent = Math.abs(pageNum - currentPage) <= 1
 const isFirstOrLast = pageNum === 1 || pageNum === totalPages

 if (isFirstOrLast || isNearCurrent) {
 return (
 <Button
 key={pageNum}
 variant={isCurrentPage ?"default":"outline"}
 size="sm"onClick={() => handlePageChange(pageNum)}
 disabled={loading}
 className={cn(
 'h-8 min-w-[32px]',
 isCurrentPage
 ?'bg-sage-deep text-white shadow-md hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500':'border-slate-200/90 transition-all duration-200 hover:border-sage-deep/40 hover:shadow-md dark:border-emerald-800 dark:hover:border-emerald-600',
 )}
 >
 {pageNum}
 </Button>
 )
 } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
 return <span key={pageNum} className="px-2 text-sage-deep/50 dark:text-emerald-500/70">...</span>
 }
 return null
 })}
 </div>

 {/* Next Button */}
 <Button
 variant="outline"size="sm"onClick={() => handlePageChange(currentPage + 1)}
 disabled={!hasMore || loading}
 className="border-slate-200/90 px-3 py-2 transition-all duration-200 hover:border-sage-deep/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:hover:border-emerald-600">
 →
 </Button>
 </div>
 </div>
 </div>
 )}
 </>
 ) : (
 <div className="py-12 text-center">
 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sage/20 dark:bg-emerald-900/45">
 <Search className="h-8 w-8 text-sage-deep dark:text-emerald-300"/>
 </div>
 <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-emerald-50">
 {hasSearched ?'No videos found':'Try searching to get started'}
 </h3>
 <p className="mb-4 text-slate-600 dark:text-emerald-200/85">
 {hasSearched
 ?'Try adjusting your search criteria':'Start watching videos to learn and grow'}
 </p>
 {hasSearched && (
 <Button
 onClick={() => {
 setSearchQuery('')
 setHasSearched(false)
 }}
 variant="outline"className="border-slate-200/90 px-6 py-2 transition-all duration-200 hover:bg-sage/10 hover:shadow-md dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40">
  Clear Search
 </Button>
 )}
 </div>
 )}
 </div>

 {/* Video Modal */}
 {isModalOpen && selectedVideo && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"onClick={closeModal}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className="dashboard-overview-card max-h-[95vh] w-full max-w-6xl overflow-hidden !p-0 dark:!bg-emerald-950/95"onClick={(e) => e.stopPropagation()}
 >
 {/* Modal Header */}
 <div className="flex items-center justify-between border-b border-slate-200/90 p-4 dark:border-emerald-800">
 <h2 className="truncate pr-4 text-lg font-semibold text-slate-900 dark:text-emerald-50">
 {selectedVideo.title}
 </h2>
 <button
 type="button"onClick={closeModal}
 className="flex-shrink-0 rounded-xl p-2 transition-colors hover:bg-sage/15 dark:hover:bg-emerald-900/60">
 <X className="h-5 w-5 text-slate-500 dark:text-emerald-400"/>
 </button>
 </div>

 {/* Modal Content */}
 <div className="max-h-[calc(95vh-80px)] overflow-y-auto p-4">
 {/* Video Player */}
 <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-black">
 <iframe
 src={`https://www.youtube.com/embed/${selectedVideo.url.split('v=')[1]?.split('&')[0]}`}
 title={selectedVideo.title}
 className="w-full h-full"allowFullScreen
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
 </div>

 {/* Video Info */}
 <div className="space-y-4">
 {/* Title and Channel */}
 <div>
 <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-emerald-50">
 {selectedVideo.title}
 </h1>
 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-emerald-200/85">
 <span className="font-medium">{selectedVideo.channel}</span>
 <span className="hidden sm:inline">•</span>
 <span>{formatViews(selectedVideo.views)} views</span>
 <span>•</span>
 <span>{formatDate(selectedVideo.published_at)}</span>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex flex-wrap items-center gap-3">
 <Button
 variant="outline"size="sm"className="flex items-center gap-2 border-slate-200/90 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40">
 <ThumbsUp className="h-4 w-4"/>
 {formatViews(selectedVideo.likes)} Likes
 </Button>
 <Button
 variant="outline"size="sm"className="flex items-center gap-2 border-slate-200/90 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40"onClick={() => {
 navigator.clipboard.writeText(selectedVideo.url)
 // You could add a toast notification here
 }}
 >
 <Share2 className="h-4 w-4"/>
 Share
 </Button>
 <Button
 variant="outline"size="sm"className="flex items-center gap-2 border-slate-200/90 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40">
 <Bookmark className="h-4 w-4"/>
 Save
 </Button>
 <Button
 variant="outline"size="sm"className="flex items-center gap-2 border-slate-200/90 bg-sage-deep text-white hover:bg-sage-deep/90 dark:border-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"onClick={() => window.open(selectedVideo.url,'_blank')}
 >
 <Play className="h-4 w-4"/>
 Watch on YouTube
 </Button>
 <Button
 variant="outline"size="sm"className="flex items-center gap-2 border-slate-200/90 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40">
 <MoreVertical className="h-4 w-4"/>
 </Button>
 </div>

 {/* Description */}
 <div className="rounded-2xl bg-slate-50 p-4 dark:bg-emerald-900/35">
 <h3 className="mb-2 font-semibold text-slate-900 dark:text-emerald-50">
 Description
 </h3>
 <p className="text-sm leading-relaxed text-slate-600 dark:text-emerald-200/85">
 {selectedVideo.description ||'No description available for this video.'}
 </p>
 </div>

 {/* Video Stats */}
 <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
 <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-emerald-900/35">
 <Eye className="mx-auto mb-1 h-5 w-5 text-slate-500 dark:text-emerald-400"/>
 <div className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {formatViews(selectedVideo.views)}
 </div>
 <div className="text-xs text-slate-500 dark:text-emerald-400/90">Views</div>
 </div>
 <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-emerald-900/35">
 <ThumbsUp className="mx-auto mb-1 h-5 w-5 text-slate-500 dark:text-emerald-400"/>
 <div className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {formatViews(selectedVideo.likes)}
 </div>
 <div className="text-xs text-slate-500 dark:text-emerald-400/90">Likes</div>
 </div>
 <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-emerald-900/35">
 <Clock className="mx-auto mb-1 h-5 w-5 text-slate-500 dark:text-emerald-400"/>
 <div className="text-sm font-medium text-slate-900 dark:text-emerald-50">
 {selectedVideo.duration}
 </div>
 <div className="text-xs text-slate-500 dark:text-emerald-400/90">Duration</div>
 </div>
 <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-emerald-900/35">
 <Heart className="mx-auto mb-1 h-5 w-5 text-slate-500 dark:text-emerald-400"/>
 <div className="truncate text-sm font-medium text-slate-900 dark:text-emerald-50">
 {selectedVideo.channel}
 </div>
 <div className="text-xs text-slate-500 dark:text-emerald-400/90">Channel</div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </motion.div>
 </StudentDashboardLayout>
 )
}

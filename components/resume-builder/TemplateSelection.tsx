"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Check } from 'lucide-react'
import { resumeService } from '@/services/resumeService'

interface TemplateInfo {
  id: string
  name: string
  description: string
  category: string
  preview_image?: string
  structure?: any
  layout?: string
  font_family?: string
  font_size?: string
  sections?: number
}

interface TemplateSelectionProps {
  onTemplateSelect: (templateId: string) => void
}

export function TemplateSelection({ onTemplateSelect }: TemplateSelectionProps) {
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateInfo[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [categories, setCategories] = useState([
  { id: 'all', name: 'All Templates', count: 0 },
  { id: 'professional', name: 'Professional', count: 0 },
  { id: 'creative', name: 'Creative', count: 0 },
  { id: 'minimalist', name: 'Minimalist', count: 0 },
  { id: 'executive', name: 'Executive', count: 0 }
  ])

  useEffect(() => {
  const loadTemplates = async () => {
  try {
  const response = await resumeService.getTemplates()
  setTemplates(response.templates)
  setFilteredTemplates(response.templates)

  // Update category counts
  const updatedCategories = categories.map(cat => ({
  ...cat,
  count: cat.id === 'all' ? response.templates.length : response.templates.filter((t: TemplateInfo) => t.category === cat.id).length
  }))
  setCategories(updatedCategories)
  } catch (error) {
  console.error('Error loading templates:', error)
  } finally {
  setLoading(false)
  }
  }

  loadTemplates()
  }, [])

  useEffect(() => {
  let filtered = templates

  // Filter by category
  if (selectedCategory !== 'all') {
  filtered = filtered.filter(template => template.category === selectedCategory)
  }

  // Filter by search query
  if (searchQuery) {
  filtered = filtered.filter(template =>
  template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  }

  setFilteredTemplates(filtered)
  }, [templates, selectedCategory, searchQuery])

  const handleTemplateSelect = (templateId: string) => {
  setSelectedTemplate(templateId)
  // Add a small delay for visual feedback
  setTimeout(() => {
  onTemplateSelect(templateId)
  }, 300)
  }

  const getCategoryColor = (category: string) => {
  switch (category) {
  case 'professional':
  return 'bg-sage/25 text-sage-deep dark:bg-emerald-900/50 dark:text-emerald-200'
  case 'creative':
  return 'bg-slate-100 text-slate-800 dark:bg-emerald-950/60 dark:text-emerald-200'
  case 'minimalist':
  return 'bg-slate-50 text-slate-700 dark:bg-emerald-950/40 dark:text-emerald-300'
  case 'executive':
  return 'bg-sage/35 text-slate-900 dark:bg-emerald-900/55 dark:text-emerald-100'
  default:
  return 'bg-slate-100 text-slate-700 dark:bg-emerald-950/50 dark:text-emerald-200'
  }
  }

  const getTemplateCardColor = (templateId: string) => {
  const colors = [
  'bg-gradient-to-br from-sage/20 to-sage/40 border border-sage/35',
  'bg-gradient-to-br from-slate-50 to-sage/25 border border-slate-200/90',
  'bg-gradient-to-br from-sage/15 to-slate-100 border border-sage/30',
  'bg-gradient-to-br from-slate-100 to-sage/20 border border-slate-200/80',
  'bg-gradient-to-br from-sage/25 to-slate-50 border border-sage/40',
  ]
  let hash = 0
  for (let i = 0; i < templateId.length; i++) {
  hash = (hash + templateId.charCodeAt(i) * (i + 1)) % 10007
  }
  return colors[hash % colors.length]
  }

  if (loading) {
  return (
  <div className="flex h-64 items-center justify-center">
  <div className="h-12 w-12 animate-spin rounded-full border-2 border-sage/30 border-t-sage-deep dark:border-emerald-800 dark:border-t-emerald-400" />
  </div>
  )
  }

  return (
  <div className="space-y-4 sm:space-y-6">

  {/* Search and Filters */}
  <div className="dashboard-overview-card p-4 sm:p-6">
  <div className="flex flex-col gap-4 sm:flex-row">
  {/* Search */}
  <div className="relative w-full sm:flex-1">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-emerald-500/80" />
  <input
  type="text"
  placeholder="Search templates..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full rounded-2xl border border-slate-200/90 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:placeholder:text-emerald-400/70 dark:focus:ring-emerald-500"
  />
  </div>

  {/* Category Filter */}
  <div className="flex w-full items-center space-x-2 sm:w-auto">
  <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="min-w-[150px] flex-1 rounded-2xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:focus:ring-emerald-500 sm:flex-none"
  >
  {categories.map(category => (
  <option key={category.id} value={category.id}>
  {category.name} ({category.count})
  </option>
  ))}
  </select>
  </div>
  </div>
  </div>

  {/* Templates Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
  {filteredTemplates.map((template, index) => (
  <motion.div
  key={template.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  className={`cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.09)] transition-all duration-200 hover:shadow-lg dark:border-emerald-800/65 ${selectedTemplate === template.id
  ? 'ring-2 ring-sage-deep ring-offset-2 ring-offset-white dark:ring-emerald-400 dark:ring-offset-emerald-950'
  : 'hover:scale-[1.02]'
  }`}
  onClick={() => handleTemplateSelect(template.id)}
  >
  {/* Card Background with Different Colors */}
  <div className={`p-4 ${getTemplateCardColor(template.id)}`}>
  {/* Preview Image Container */}
  <div className="relative bg-white rounded-lg shadow-inner overflow-hidden">
  <img
  src={template.preview_image}
  alt={template.name}
  className="w-full h-80 sm:h-96 lg:h-[28rem] xl:h-[32rem] object-contain rounded-lg"
  />
  {selectedTemplate === template.id && (
  <div className="absolute right-3 top-3 rounded-full bg-sage-deep p-2 text-white shadow-lg dark:bg-emerald-600">
  <Check className="w-4 h-4" />
  </div>
  )}
  </div>

  {/* Template Info */}
  <div className="mt-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
  <h3 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-emerald-50">
  {template.name}
  </h3>
  <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getCategoryColor(template.category)}`}>
  {template.category}
  </span>
  </div>

  <p className="mb-2 line-clamp-1 text-xs text-slate-600 sm:text-sm dark:text-emerald-200/85">
  {template.description}
  </p>

  {/* Template Details */}
  <div className="space-y-1 text-xs text-slate-500 dark:text-emerald-400/75">
  <div className="flex items-center space-x-2">
  <span>Layout:</span>
  <span className="font-medium">{template.layout}</span>
  </div>
  <div className="flex items-center space-x-2">
  <span>Font:</span>
  <span className="font-medium">{template.font_family}</span>
  </div>
  <div className="flex items-center space-x-2">
  <span>Sections:</span>
  <span className="font-medium">{template.sections}</span>
  </div>
  </div>
  </div>
  </div>
  </motion.div>
  ))}
  </div>

  {/* No Results */}
  {filteredTemplates.length === 0 && (
  <div className="text-center py-12">
  <div className="mb-4 text-slate-400 dark:text-emerald-500/60">
  <Search className="mx-auto h-16 w-16" />
  </div>
  <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-emerald-50">
  No templates found
  </h3>
  <p className="text-slate-600 dark:text-emerald-200/85">
  Try adjusting your search or filter criteria
  </p>
  </div>
  )}
  </div>
  )
}

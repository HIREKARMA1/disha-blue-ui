"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, Brain, MessageCircle, Code, Trophy, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { useUniversities } from '@/hooks/useUniversities'
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/MultiSelectDropdown'
import { BRANCH_MULTI_SELECT_OPTIONS } from '@/components/ui/BranchSelection'

export type PracticeCategory = 'all' | 'ai-mock-tests' | 'ai-mock-interviews' | 'coding-practice' | 'challenges-engagement'

interface PracticeFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: PracticeCategory
  onCategoryChange: (category: PracticeCategory) => void
  selectedUniversities: string[]
  onUniversitiesChange: (universities: string[]) => void
  selectedBranches: string[]
  onBranchesChange: (branches: string[]) => void
  onSearch: () => void
  onClearFilters: () => void
}

const categories = [
  {
  id: 'all' as PracticeCategory,
  label: 'All Practice',
  icon: Brain,
  description: 'View all practice materials',
  color: 'from-sage-deep to-emerald-700',
  },
  {
  id: 'ai-mock-tests' as PracticeCategory,
  label: 'AI-Powered Mock Tests',
  icon: Brain,
  description: 'Comprehensive mock tests with AI evaluation',
  color: 'from-emerald-700 to-sage-deep',
  },
  {
  id: 'ai-mock-interviews' as PracticeCategory,
  label: 'AI-Powered Mock Interviews',
  icon: MessageCircle,
  description: 'Practice interviews with AI feedback',
  color: 'from-sage-deep via-emerald-700 to-emerald-800',
  },
  {
  id: 'coding-practice' as PracticeCategory,
  label: 'Coding Practice',
  icon: Code,
  description: 'Programming challenges and coding exercises',
  color: 'from-emerald-800 to-sage-deep',
  },
  {
  id: 'challenges-engagement' as PracticeCategory,
  label: 'Challenges & Engagement',
  icon: Trophy,
  description: 'Interactive challenges and engagement activities',
  color: 'from-emerald-600 to-sage-deep',
  },
]


export function PracticeFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedUniversities,
  onUniversitiesChange,
  selectedBranches,
  onBranchesChange,
  onSearch,
  onClearFilters
}: PracticeFilterProps) {
  const [showFilters, setShowFilters] = useState(false)
  const { profile } = useStudentProfile()
  const { data: universities, isLoading: universitiesLoading } = useUniversities()
  
  // Convert universities to MultiSelectOption format
  const universityOptions: MultiSelectOption[] = universities.map(uni => ({
  id: uni.id,
  label: uni.university_name,
  value: uni.id
  }))

  return (
  <div className="dashboard-overview-card p-6 transition-shadow duration-300 hover:shadow-md">
  {/* Search Bar */}
  <div className="mb-4 flex flex-col gap-3 sm:flex-row">
  <div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-emerald-500/80" />
  <Input
  type="text"
  placeholder="Search practice tests by title, role, or skills..."
  value={searchTerm}
  onChange={(e) => onSearchChange(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
  className="border-slate-200/90 bg-white pl-10 focus:border-transparent focus:ring-2 focus:ring-sage-deep dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-50 dark:focus:ring-emerald-500"
  />
  </div>
  <Button
  variant="outline"
  onClick={() => setShowFilters(!showFilters)}
  className="flex w-full items-center gap-2 border-slate-200/90 transition-all duration-200 hover:bg-sage/10 hover:shadow-md dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40 sm:w-auto"
  >
  <Filter className="h-4 w-4" />
  {showFilters ? 'Hide' : 'Show'} Filters
  </Button>
  <Button
  onClick={onSearch}
  className="h-10 w-full bg-sage-deep px-6 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sage-deep/90 hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto"
  >
  Search
  </Button>
  </div>

  {/* Category Filters */}
  {showFilters && (
  <motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  className="border-t border-slate-200/90 pt-4 dark:border-emerald-800/70"
  >
  <div className="space-y-4">
  <div className="flex items-center justify-between">
  <h3 className="text-lg font-semibold text-slate-900 dark:text-emerald-50">
  Practice Categories
  </h3>
  <Button
  variant="outline"
  size="sm"
  onClick={onClearFilters}
  className="text-slate-500 transition-all duration-200 hover:bg-sage/10 hover:text-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200"
  >
  <X className="w-4 h-4 mr-1" />
  Clear All
  </Button>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
  {categories.map((category) => {
  const Icon = category.icon
  const isSelected = selectedCategory === category.id
  
  return (
  <motion.button
  key={category.id}
  onClick={() => onCategoryChange(category.id)}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className={`rounded-xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-1 ${
  isSelected
  ? `bg-gradient-to-br ${category.color} border-transparent text-white shadow-lg`
  : 'border-slate-200/90 bg-white/80 text-slate-900 hover:border-sage-deep/40 hover:shadow-md dark:border-emerald-800/60 dark:bg-emerald-900/25 dark:text-emerald-50 dark:hover:border-emerald-600'
  }`}
  >
  <div className="mb-2 flex items-center gap-3">
  <div className={`rounded-lg p-2 ${
  isSelected
  ? 'bg-white/20'
  : 'bg-sage/15 dark:bg-emerald-900/50'
  }`}>
  <Icon className={`h-5 w-5 ${
  isSelected
  ? 'text-white'
  : 'text-sage-deep dark:text-emerald-300'
  }`} />
  </div>
  <span className="font-medium text-sm">
  {category.label}
  </span>
  </div>
  <p className={`text-xs ${
  isSelected
  ? 'text-white/90'
  : 'text-slate-500 dark:text-emerald-200/75'
  }`}>
  {category.description}
  </p>
  </motion.button>
  )
  })}
  </div>
  
  {/* University and Branch Filters */}
  <div className="border-t border-slate-200/90 pt-4 dark:border-emerald-800/70">
  <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-emerald-50">
  Additional Filters
  </h3>
  
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {/* University Filter */}
  <div className="space-y-2">
  <label className="block text-sm font-medium text-slate-700 dark:text-emerald-200/90">
  Filter by University
  </label>
  <MultiSelectDropdown
  options={universityOptions}
  selectedValues={selectedUniversities}
  onSelectionChange={onUniversitiesChange}
  placeholder="Select universities..."
  disabled={universitiesLoading}
  className="w-full"
  />
  {universitiesLoading && (
  <p className="text-xs text-slate-500 dark:text-emerald-400/80">
  Loading universities...
  </p>
  )}
  </div>
  
  {/* Branch Filter */}
  <div className="space-y-2">
  <label className="block text-sm font-medium text-slate-700 dark:text-emerald-200/90">
  Filter by Branch
  </label>
  <MultiSelectDropdown
  options={BRANCH_MULTI_SELECT_OPTIONS}
  selectedValues={selectedBranches}
  onSelectionChange={onBranchesChange}
  placeholder="Select branches..."
  className="w-full"
  />
  </div>
  </div>
  
  {/* Filter Info */}
  <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-emerald-900/30">
  <p className="text-sm text-slate-600 dark:text-emerald-200/80">
  <strong>Note:</strong> These filters work in addition to the automatic filtering based on your profile. 
  You can manually select specific universities and branches to see tests targeted to them.
  </p>
  </div>
  </div>
  
  {/* Automatic Filtering Info */}
  <div className="border-t border-slate-200/90 pt-4 dark:border-emerald-800/70">
  <div className="rounded-lg border border-sage/40 bg-sage/10 p-4 dark:border-emerald-800 dark:bg-emerald-900/35">
  <div className="mb-2 flex items-center gap-2">
  <GraduationCap className="h-5 w-5 text-sage-deep dark:text-emerald-300" />
  <h4 className="text-sm font-medium text-sage-deep dark:text-emerald-200">
  Smart Filtering
  </h4>
  </div>
  <p className="text-sm text-slate-700 dark:text-emerald-200/85">
  Tests are automatically filtered based on your university ({profile?.institution || 'Not set'}) and branch ({profile?.branch || 'Not set'}). 
  You'll only see tests that are relevant to your academic profile.
  </p>
  </div>
  </div>
  </div>
  </motion.div>
  )}
  </div>
  )
}

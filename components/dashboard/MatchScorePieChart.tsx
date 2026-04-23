"use client"

import { motion } from 'framer-motion'

interface MatchScorePieChartProps {
  score: number
  size?: number
  className?: string
}

export function MatchScorePieChart({ score, size = 60, className = '' }: MatchScorePieChartProps) {
  const radius = size / 2 - 6
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreColor = (value: number) => {
  if (value >= 80) return 'text-green-600'
  if (value >= 60) return 'text-orange-600'
  return 'text-red-600'
  }

  const getStrokeColor = (value: number) => {
  if (value >= 80) return 'stroke-green-500'
  if (value >= 60) return 'stroke-orange-500'
  return 'stroke-red-500'
  }

  const getBgColor = (value: number) => {
  if (value >= 80) return 'bg-green-50'
  if (value >= 60) return 'bg-orange-50'
  return 'bg-red-50'
  }

  return (
  <div className={`relative inline-flex items-center justify-center p-2 ${getBgColor(score)} ${className}`}>
  <svg width={size} height={size} className="transform -rotate-90">
  <circle
  cx={size / 2}
  cy={size / 2}
  r={radius}
  stroke="currentColor"
  strokeWidth="6"
  fill="none"
  className="text-gray-200"
  />
  <motion.circle
  cx={size / 2}
  cy={size / 2}
  r={radius}
  stroke="currentColor"
  strokeWidth="6"
  fill="none"
  strokeLinecap="round"
  className={getStrokeColor(score)}
  initial={{ strokeDasharray, strokeDashoffset: circumference }}
  animate={{ strokeDashoffset }}
  transition={{ duration: 1.5, ease: 'easeOut' }}
  />
  </svg>
  <div className="absolute inset-0 flex items-center justify-center">
  <span className={`text-sm font-bold ${getScoreColor(score)}`}>{Math.round(score)}%</span>
  </div>
  </div>
  )
}

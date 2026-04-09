"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Calendar, DollarSign, Send, Building, MapPin, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface Job {
    id: string
    title: string
    company_name?: string
    location: string | string[]
    job_type: string
    salary_min?: number
    salary_max?: number
    salary_currency: string
}

interface ApplicationData {
    cover_letter: string
    expected_salary?: string
    availability_date: string
}

interface ApplicationModalProps {
    job: Job
    onClose: () => void
    onSubmit: (data: ApplicationData) => void
    isApplying: boolean
}

export function ApplicationModal({ job, onClose, onSubmit, isApplying }: ApplicationModalProps) {
    const [formData, setFormData] = useState<ApplicationData>({
        cover_letter: `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company_name || 'your company'}. 

With my background and skills, I believe I would be an excellent fit for this role. I am particularly drawn to this opportunity because [mention specific aspects of the company/role that interest you].

I am available to start [mention your availability] and would welcome the opportunity to discuss how my experience and skills align with your needs.

Thank you for considering my application. I look forward to the possibility of contributing to your team.

Best regards,
[Your Name]`,
        expected_salary: '',
        availability_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    
    const [salaryError, setSalaryError] = useState<string>('')

    const validateSalary = (salary: string): boolean => {
        if (!salary.trim()) return true // Empty salary is allowed
        
        // Check if it contains range indicators (dash, hyphen, "to", etc.)
        const rangePatterns = [
            /-/,  // Contains dash
            /to/i,  // Contains "to"
            /range/i,  // Contains "range"
            /between/i,  // Contains "between"
            /upto/i,  // Contains "upto"
            /up to/i,  // Contains "up to"
            /,/  // Contains comma (multiple values)
        ]
        
        if (rangePatterns.some(pattern => pattern.test(salary))) {
            return false
        }
        
        // Check if it's a valid number
        const numericValue = parseFloat(salary.replace(/[,\s]/g, ''))
        return !isNaN(numericValue) && numericValue > 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate expected salary
        if (formData.expected_salary && !validateSalary(formData.expected_salary)) {
            toast.error('Invalid salary format!')
            return
        }
        
        onSubmit(formData)
    }

    const handleInputChange = (field: keyof ApplicationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        
        // Real-time validation for salary
        if (field === 'expected_salary') {
            if (value.trim() && !validateSalary(value)) {
                setSalaryError('Invalid format! Enter a single amount like 30000. No ranges or multiple values.')
            } else {
                setSalaryError('')
            }
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_32px_100px_-40px_hsl(var(--primary)/0.4)]"
                >
                    <div className="border-b border-border/80 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/[0.08] px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                                    Apply
                                </p>
                                <h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                                    {job.title}
                                </h2>
                                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Building className="h-4 w-4 text-primary" />
                                        {job.company_name || 'Company'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {Array.isArray(job.location) ? job.location.join(', ') : job.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                        <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="shrink-0 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="max-h-[calc(90vh-220px)] space-y-6 overflow-y-auto p-6 sm:p-8"
                    >
                        {/* Cover Letter */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-foreground">
                                <FileText className="mr-2 inline h-4 w-4 text-primary" />
                                Cover letter *
                            </label>
                            <textarea
                                value={formData.cover_letter}
                                onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                                className="min-h-[8rem] w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Write your cover letter..."
                                required
                            />
                        </div>

                        {/* Salary and Availability */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    <DollarSign className="mr-2 inline h-4 w-4 text-primary" />
                                    Expected salary ({job.salary_currency})
                                </label>
                                <Input
                                    type="text"
                                    value={formData.expected_salary}
                                    onChange={(e) => handleInputChange('expected_salary', e.target.value)}
                                    placeholder="e.g. 30000"
                                    className={cn('rounded-xl', salaryError && 'border-destructive')}
                                />
                                {salaryError && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {salaryError}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    <Calendar className="mr-2 inline h-4 w-4 text-primary" />
                                    Available from *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.availability_date}
                                    onChange={(e) => handleInputChange('availability_date', e.target.value)}
                                    className="rounded-xl"
                                    required
                                />
                            </div>
                        </div>



                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-11 flex-1 rounded-xl font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="gradient"
                                disabled={isApplying || !!salaryError}
                                className="h-11 flex-1 rounded-xl font-semibold shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {isApplying ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Application
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}


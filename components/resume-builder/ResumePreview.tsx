"use client"

import { useState, useEffect } from 'react'
import { getTemplateComponent, getTemplateInfo, TemplateInfo } from './templates/TemplateRegistry'
import type { FullResumeSchema } from '@/hooks/useResumeAI'

interface ResumePreviewProps {
    resumeData: any
    templateId: string | null
    onReady?: () => void
}

export function ResumePreview({ resumeData, templateId, onReady }: ResumePreviewProps) {
    const [currentTemplate, setCurrentTemplate] = useState<TemplateInfo | null>(null)
    const [TemplateComponent, setTemplateComponent] = useState<any>(null)

    useEffect(() => {
        if (templateId) {
            const templateInfo = getTemplateInfo(templateId)
            const TemplateComponent = getTemplateComponent(templateId)

            setCurrentTemplate(templateInfo)
            setTemplateComponent(() => TemplateComponent)
        } else {
            // Default to Classic ATS if no template selected
            const defaultTemplateId = 'classic-ats'
            const templateInfo = getTemplateInfo(defaultTemplateId)
            const TemplateComponent = getTemplateComponent(defaultTemplateId)

            setCurrentTemplate(templateInfo)
            setTemplateComponent(() => TemplateComponent)
        }
    }, [templateId])

    // Notify parent when the template component is ready so that external
    // consumers (like the dashboard PDF download) can safely snapshot the DOM.
    useEffect(() => {
        if (TemplateComponent && onReady) {
            onReady()
        }
    }, [TemplateComponent, onReady])

    const renderPreviewContent = () => {
        if (!TemplateComponent) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Loading template...
                    </div>
                </div>
            )
        }

        return <TemplateComponent resumeData={resumeData} />
    }

    return (
        <div className="h-full">
            {/* Preview Content */}
            <div className="h-full overflow-y-auto">
                {renderPreviewContent()}
            </div>

            {/* Template Info */}
            {currentTemplate && (
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Template:</span> {currentTemplate.name} |
                        <span className="font-medium ml-1">Layout:</span> {currentTemplate.layout} |
                        <span className="font-medium ml-1">Font:</span> {currentTemplate.font_family} {currentTemplate.font_size}
                    </div>
                </div>
            )}
        </div>
    )
}

interface ExecutiveResumePreviewProps {
    resume: FullResumeSchema
    sectionLabels?: {
        summary?: string
        experience?: string
        education?: string
        skills?: string
        projects?: string
        certifications?: string
    }
    emptyHint?: string
}

export function ExecutiveResumePreview({ resume, sectionLabels, emptyHint }: ExecutiveResumePreviewProps) {
    const hasContent =
        Boolean(resume.personal_info.name || resume.personal_info.summary) ||
        resume.experience.length > 0 ||
        resume.education.length > 0 ||
        resume.skills.length > 0 ||
        resume.projects.length > 0 ||
        resume.certifications.length > 0

    if (!hasContent) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                {emptyHint || 'Generate a resume draft to preview your document here.'}
            </div>
        )
    }

    return (
        <article
            className="resume-print-area mx-auto max-w-[860px] rounded-xl border border-border bg-white p-8 text-[#111827] shadow-soft"
            data-resume-print
        >
            <header className="border-b border-[#E5E7EB] pb-4">
                <h1 className="text-3xl font-semibold tracking-tight">{resume.personal_info.name || 'Your Name'}</h1>
                <p className="mt-1 text-sm text-[#374151]">
                    {[
                        resume.personal_info.email,
                        resume.personal_info.phone,
                        resume.personal_info.location,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </p>
                {(resume.personal_info.linkedin || resume.personal_info.github || resume.personal_info.portfolio) && (
                    <p className="mt-1 text-xs text-[#4B5563]">
                        {[resume.personal_info.linkedin, resume.personal_info.github, resume.personal_info.portfolio]
                            .filter(Boolean)
                            .join('  |  ')}
                    </p>
                )}
            </header>

            {resume.personal_info.summary && (
                <section className="mt-5">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {sectionLabels?.summary || 'Professional Summary'}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#1F2937]">{resume.personal_info.summary}</p>
                </section>
            )}

            {resume.experience.length > 0 && (
                <section className="mt-5">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {sectionLabels?.experience || 'Work Experience'}
                    </h2>
                    <div className="mt-2 space-y-3">
                        {resume.experience.map((item, idx) => (
                            <div key={`${item.company}-${idx}`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-[#111827]">{item.role} · {item.company}</p>
                                    <p className="text-xs text-[#4B5563]">{item.start_date} - {item.end_date}</p>
                                </div>
                                <p className="text-xs text-[#6B7280]">{item.location}</p>
                                {item.bullets.length > 0 && (
                                    <ul className="mt-1 list-disc pl-5 text-sm text-[#1F2937]">
                                        {item.bullets.map((bullet, bulletIdx) => (
                                            <li key={`${idx}-${bulletIdx}`}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {resume.education.length > 0 && (
                <section className="mt-5">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {sectionLabels?.education || 'Education'}
                    </h2>
                    <div className="mt-2 space-y-2">
                        {resume.education.map((item, idx) => (
                            <div key={`${item.institution}-${idx}`}>
                                <p className="text-sm font-semibold text-[#111827]">{item.degree} {item.field_of_study ? `in ${item.field_of_study}` : ''}</p>
                                <p className="text-xs text-[#4B5563]">{item.institution} · {item.start_date} - {item.end_date} {item.score ? `· ${item.score}` : ''}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {resume.skills.length > 0 && (
                <section className="mt-5">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {sectionLabels?.skills || 'Skills'}
                    </h2>
                    <p className="mt-2 text-sm text-[#1F2937]">{resume.skills.join(' · ')}</p>
                </section>
            )}

            {resume.projects.length > 0 && (
                <section className="mt-5">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {sectionLabels?.projects || 'Projects'}
                    </h2>
                    <div className="mt-2 space-y-3">
                        {resume.projects.map((project, idx) => (
                            <div key={`${project.name}-${idx}`}>
                                <p className="text-sm font-semibold text-[#111827]">{project.name}</p>
                                {project.description && <p className="text-sm text-[#374151]">{project.description}</p>}
                                {project.bullets.length > 0 && (
                                    <ul className="mt-1 list-disc pl-5 text-sm text-[#1F2937]">
                                        {project.bullets.map((bullet, bulletIdx) => (
                                            <li key={`${idx}-${bulletIdx}`}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {resume.certifications.length > 0 && (
                <section className="mt-5">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {sectionLabels?.certifications || 'Certifications'}
                    </h2>
                    <ul className="mt-2 list-disc pl-5 text-sm text-[#1F2937]">
                        {resume.certifications.map((cert, idx) => (
                            <li key={`${cert}-${idx}`}>{cert}</li>
                        ))}
                    </ul>
                </section>
            )}

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    [data-resume-print],
                    [data-resume-print] * {
                        visibility: visible;
                    }
                    [data-resume-print] {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: none;
                        border: none !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        margin: 0;
                        padding: 14mm;
                    }
                    [data-hide-on-print] {
                        display: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 12mm;
                    }
                }
            `}</style>
        </article>
    )
}

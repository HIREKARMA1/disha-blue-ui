"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How do I create my profile?",
    answer:
      "Sign up, verify your email, and complete your profile with education, skills, and preferences. The more structured your profile, the better your matches.",
  },
  {
    question: "Can I apply outside my immediate city?",
    answer:
      "Yes. You can explore roles across districts and regions based on eligibility and employer requirements.",
  },
  {
    question: "How does hyperlocal discovery work?",
    answer:
      "Employers publish structured locations; you filter by state, district, and locality to find truly nearby opportunities.",
  },
  {
    question: "What do recruiters see on their side?",
    answer:
      "A modern pipeline with stages, applicant history, and operational visibility—similar to premium ATS experiences.",
  },
  {
    question: "Is the platform available in regional languages?",
    answer: "Yes. The interface supports English, Hindi, and Odia with more languages planned.",
  },
]

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        onClick={onClick}
      >
        <span
          className={`font-display text-base font-semibold sm:text-lg ${isOpen ? "text-foreground" : "text-foreground/90"}`}
        >
          {question}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-muted/20 py-16 md:py-24 dark:bg-muted/5">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
            Answers for candidates and hiring teams
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Straightforward guidance—no fine print maze.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card px-4 shadow-soft sm:px-6 md:px-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

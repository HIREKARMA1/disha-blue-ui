"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    name: "HR Manager",
    role: "HR Manager",
    image: "/home/testimonial/testimonialicon1.png",
    content: "We reduced time-to-fill by 40% after moving to a single pipeline—no more fragmented spreadsheets.",
  },
  {
    id: 2,
    name: "Placement Officer",
    role: "Placement Officer",
    image: "/home/testimonial/testimonialicon2.png",
    content: "We track student applications and placement status without spreadsheets. The workflow is clear and fast.",
  },
  {
    id: 3,
    name: "Recruiter",
    role: "Recruiter",
    image: "/home/testimonial/testimonialicon3.png",
    content: "Shortlisting became easier with filters and eligibility checks. We focus only on qualified candidates.",
  },
  {
    id: 4,
    name: "Career Services Head",
    role: "Career Services Head",
    image: "/home/testimonial/testimonialicon4.png",
    content: "Candidates discover more relevant roles; engagement and completion rates are noticeably higher.",
  },
]

const TestimonialCard = ({ testimonial }: { testimonial: (typeof testimonials)[0] }) => (
  <div className="flex flex-col rounded-none border border-slate-200 bg-white p-6 dark:border-emerald-800 dark:bg-emerald-900/40 md:p-8">
    <p className="mb-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-emerald-400/90">
      Rated 5 of 5
    </p>
    <p className="mb-8 font-sans text-base leading-relaxed text-slate-600 md:text-lg dark:text-emerald-200/85">
      {testimonial.content}
    </p>
    <div className="mt-auto flex items-center gap-4">
      <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full">
        <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
      </div>
      <div className="flex flex-col gap-[2px]">
        <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-emerald-50">{testimonial.name}</h4>
        <p className="text-sm text-slate-600 dark:text-emerald-300/90">{testimonial.role}</p>
      </div>
    </div>
  </div>
)

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="w-full border-t border-slate-200 bg-sage/10 py-16 dark:border-emerald-900 dark:bg-emerald-900/20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-semibold text-slate-900 md:text-4xl dark:text-emerald-50"
          >
            Trusted by hiring teams and talent
          </motion.h2>
        </div>

        <div className="hidden gap-x-28 gap-y-24 md:grid md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[343px]"
            >
              <TestimonialCard testimonial={testimonials[currentIndex]} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={prevTestimonial}
              className="rounded-none border border-sage-deep/40 bg-sage-deep px-4 py-2 text-sm font-medium text-white shadow-none transition-opacity hover:opacity-90 dark:bg-emerald-600"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={nextTestimonial}
              className="rounded-none border border-sage-deep/40 bg-sage-deep px-4 py-2 text-sm font-medium text-white shadow-none transition-opacity hover:opacity-90 dark:bg-emerald-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection

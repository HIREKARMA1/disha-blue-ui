"use client"

import { motion } from "framer-motion"
import {
  Cpu,
  HeartPulse,
  Landmark,
  Factory,
  ShoppingBag,
  LineChart,
  GraduationCap,
  Truck,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const categories = [
  { icon: Cpu, label: "Technology", sub: "Engineering · Product · Data" },
  { icon: HeartPulse, label: "Healthcare", sub: "Clinical · Ops · Research" },
  { icon: Landmark, label: "Finance", sub: "Banking · Fintech · Accounting" },
  { icon: Factory, label: "Manufacturing", sub: "Ops · Supply · Quality" },
  { icon: ShoppingBag, label: "Retail & CX", sub: "Sales · Support · Merch" },
  { icon: LineChart, label: "Consulting", sub: "Strategy · Advisory" },
  { icon: GraduationCap, label: "Education", sub: "Teaching · EdTech" },
  { icon: Truck, label: "Logistics", sub: "Field · Warehouse" },
]

export default function JobCategoriesSection() {
  return (
    <section className="bg-white py-16 dark:bg-emerald-950 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep dark:text-emerald-300">Explore</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 md:text-4xl dark:text-emerald-50">
              Roles across every major industry
            </h2>
            <p className="mt-3 text-slate-600 md:text-lg dark:text-emerald-200/85">
              Structured discovery helps candidates move faster—and gives recruiters cleaner pipelines.
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="outline" className="w-full rounded-none border-sage-deep/40 md:w-auto dark:border-emerald-600">
              Browse all jobs
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col rounded-none border border-slate-200 bg-sage/5 p-5 shadow-none transition-all hover:-translate-y-0.5 hover:border-sage-deep/35 dark:border-emerald-800 dark:bg-emerald-900/30 dark:hover:border-emerald-600"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-none border border-sage-deep/25 bg-white text-sage-deep dark:border-emerald-600 dark:bg-emerald-900 dark:text-emerald-200">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-emerald-50">{c.label}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-emerald-200/85">{c.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

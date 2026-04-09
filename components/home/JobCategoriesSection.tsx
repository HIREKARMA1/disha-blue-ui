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
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Explore
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl">
              Roles across every major industry
            </h2>
            <p className="mt-3 text-muted-foreground md:text-lg">
              Structured discovery helps candidates move faster—and gives recruiters cleaner
              pipelines.
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="secondary" className="w-full md:w-auto">
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
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

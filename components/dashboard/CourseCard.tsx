"use client"

type Course = {
  title: string
  category: string
  location: string
  reason: string
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-base font-semibold">{course.title}</h3>
      <p className="text-sm text-muted-foreground">{course.category} · {course.location}</p>
      <p className="mt-2 text-sm">{course.reason}</p>
    </div>
  )
}

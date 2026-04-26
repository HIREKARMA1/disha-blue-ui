"use client"

import { CourseCard } from "@/components/courses/CourseCard"
import { CourseItem } from "@/components/courses/types"

interface CourseListProps {
  courses: CourseItem[]
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={`${course.title}-${course.link}`} course={course} />
      ))}
    </div>
  )
}

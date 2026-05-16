export type ProfileSection = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  fields: string[]
  completed: boolean
}

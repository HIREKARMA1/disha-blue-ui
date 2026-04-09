'use client'

import { usePathname } from 'next/navigation'
import { ChatBot } from '@/components/chat/ChatBot'

export function ChatBotMount() {
  const pathname = usePathname()
  if (!pathname?.startsWith('/dashboard')) return null
  return <ChatBot />
}

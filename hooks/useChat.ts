'use client'

import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { streamChatCompletion } from '@/services/chat.service'
import type { ChatAttachment, ChatMessage, StreamPayload } from '@/types/chat'

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [controller, setController] = useState<AbortController | null>(null)

  const mutation = useMutation({
    mutationFn: async ({
      userMessage,
      hyperLocalPreferences,
      language,
    }: {
      userMessage: string
      hyperLocalPreferences?: Record<string, unknown>
      language?: 'en' | 'hi' | 'or'
    }) => {
      const nextMessages: ChatMessage[] = [
        ...messages,
        { id: id(), role: 'user', content: userMessage, createdAt: new Date().toISOString() },
      ]
      const assistantId = id()
      const pendingAssistant: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }
      setMessages([...nextMessages, pendingAssistant])
      setStreamingId(assistantId)
      setError(null)

      const payload: StreamPayload = {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        language,
        hyper_local_preferences: hyperLocalPreferences,
        attachments: attachments.map((file) => ({
          id: file.id,
          name: file.name,
          relativePath: file.relativePath,
          kind: file.kind,
        })),
      }

      const abort = new AbortController()
      setController(abort)
      await streamChatCompletion(
        payload,
        attachments,
        {
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((entry) =>
                entry.id === assistantId ? { ...entry, content: `${entry.content}${token}` } : entry
              )
            )
          },
          onDone: () => {
            setStreamingId(null)
          },
          onError: (message) => {
            setError(message)
            setStreamingId(null)
          },
        },
        abort.signal
      )

      setAttachments([])
      setController(null)
    },
  })

  const canSend = useMemo(
    () => !mutation.isPending && !streamingId,
    [mutation.isPending, streamingId]
  )

  return {
    messages,
    attachments,
    setAttachments,
    sendMessage: mutation.mutateAsync,
    isPending: mutation.isPending || Boolean(streamingId),
    canSend,
    error,
    stop: () => {
      controller?.abort()
      setStreamingId(null)
    },
  }
}

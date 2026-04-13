import { config } from '@/lib/config'
import type { ChatAttachment, StreamPayload } from '@/types/chat'

interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (message: string) => void
}

const safeAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  const storage = window.localStorage as Storage | undefined
  if (!storage || typeof storage.getItem !== 'function') return null
  return storage.getItem('access_token')
}

export async function streamChatCompletion(
  payload: StreamPayload,
  files: ChatAttachment[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
) {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(payload))
  files.forEach((attachment) => formData.append('files', attachment.file))

  const token = safeAccessToken()
  const response = await fetch(`${config.api.fullUrl}/chat/stream`, {
  method: 'POST',
  headers: {
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: formData,
  signal,
  })

  if (!response.ok || !response.body) {
  let details = `Request failed with status ${response.status}`
  try {
  const body = await response.text()
  if (body) details = `${details}: ${body.slice(0, 240)}`
  } catch {
  // keep default message
  }
  callbacks.onError(details)
  return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
  const { done, value } = await reader.read()
  if (done) {
  callbacks.onDone()
  break
  }
  buffer += decoder.decode(value, { stream: true })
  const events = buffer.split('\n\n')
  buffer = events.pop() || ''

  for (const eventChunk of events) {
  const line = eventChunk
  .split('\n')
  .find((entry) => entry.startsWith('data: '))
  if (!line) continue
  try {
  const data = JSON.parse(line.replace(/^data:\s*/, ''))
  if (data.type === 'token' && data.token) callbacks.onToken(data.token)
  if (data.type === 'error') callbacks.onError(data.message || 'Streaming error')
  if (data.type === 'done') callbacks.onDone()
  } catch {
  callbacks.onError('Failed to parse stream event')
  }
  }
  }
}

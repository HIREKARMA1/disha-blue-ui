export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export interface ChatAttachment {
  id: string
  file: File
  name: string
  relativePath?: string
  kind: 'file' | 'folder'
}

export interface StreamPayload {
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>
  language?: 'en' | 'hi' | 'or'
  hyper_local_preferences?: Record<string, unknown>
  attachments: Array<{
  id: string
  name: string
  relativePath?: string
  kind: 'file' | 'folder'
  }>
}

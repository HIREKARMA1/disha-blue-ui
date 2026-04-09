'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {
  Bot,
  ChevronDown,
  FolderUp,
  Image,
  Mic,
  Paperclip,
  Send,
  Square,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import type { ChatAttachment } from '@/types/chat'
import { useLocale } from '@/contexts/LocaleContext'
import { t } from '@/lib/i18n'

interface SpeechRecognitionResultItem {
  transcript: string
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionResultItem
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionType = {
  new (): SpeechRecognitionLike
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionType
    webkitSpeechRecognition?: SpeechRecognitionType
  }
}

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const safeGetLocalStorage = (key: string, fallback = ''): string => {
  if (typeof window === 'undefined') return fallback
  const storage = window.localStorage as Storage | undefined
  if (!storage || typeof storage.getItem !== 'function') return fallback
  return storage.getItem(key) || fallback
}

export function ChatBot() {
  const { user } = useAuth()
  const { locale } = useLocale()
  const { messages, attachments, setAttachments, sendMessage, isPending, canSend, error, stop } = useChat()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const hyperLocalPreferences = useMemo(
    () => ({
      preferred_location: safeGetLocalStorage('preferred_location', ''),
      nearby_radius_km: safeGetLocalStorage('nearby_radius_km', '25'),
      preferred_industry: safeGetLocalStorage('preferred_industry', ''),
    }),
    [open]
  )

  const onDrop = (acceptedFiles: File[]) => {
    const mapped: ChatAttachment[] = acceptedFiles.map((file) => {
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || undefined
      return {
        id: mkId(),
        file,
        name: file.name,
        relativePath,
        kind: relativePath ? 'folder' : 'file',
      }
    })
    setAttachments([...attachments, ...mapped])
  }

  const { getRootProps, getInputProps, open: openFilePicker } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    onDrop,
  })

  useEffect(() => {
    const container = listRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (!folderInputRef.current) return
    folderInputRef.current.setAttribute('webkitdirectory', '')
  }, [open])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || !canSend) return
    setInput('')
    await sendMessage({ userMessage: content, hyperLocalPreferences, language: locale })
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Speech) return
    const recognition = new Speech()
    recognition.lang = locale === 'hi' ? 'hi-IN' : locale === 'or' ? 'or-IN' : 'en-IN'
    recognition.interimResults = true
    recognition.onresult = (event) => {
      const nextText = Array.from(event.results)
        .map((res) => res[0]?.transcript || '')
        .join(' ')
      setInput(nextText)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id))
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="fixed bottom-6 right-5 z-[80] inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-large transition hover:scale-[1.02]"
          aria-label="Open Opportunity Assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="fixed bottom-5 right-5 z-[100] flex h-[78vh] w-[min(94vw,520px)] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/70 shadow-[0_30px_80px_rgba(35,18,66,0.25)] backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{t(locale, 'chat.assistant')}</p>
                    <h3 className="font-display text-lg font-semibold text-foreground">{t(locale, 'chat.opportunityAssistant')}</h3>
                    <p className="text-xs text-muted-foreground">{user?.user_type || 'user'} mode · {locale.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-muted/60">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div
                  ref={listRef}
                  onScroll={(e) => {
                    const node = e.currentTarget
                    setShowScrollDown(node.scrollTop + node.clientHeight < node.scrollHeight - 120)
                  }}
                  className="flex-1 space-y-3 overflow-y-auto p-4"
                >
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl border px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'ml-10 border-primary/30 bg-primary/10 text-foreground'
                          : 'mr-10 border-border bg-background/80'
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            if (!inline && match) {
                              return (
                                <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              )
                            }
                            return <code className="rounded bg-muted px-1 py-0.5" {...props}>{children}</code>
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </motion.div>
                  ))}
                  {isPending && messages[messages.length - 1]?.role !== 'assistant' && (
                    <p className="text-xs text-muted-foreground">{t(locale, 'chat.thinking')}</p>
                  )}
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                {showScrollDown && (
                  <button
                    className="absolute bottom-28 right-4 rounded-full border border-border bg-card px-3 py-1 text-xs shadow-soft"
                    onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })}
                  >
                    {t(locale, 'chat.scrollToBottom')}
                  </button>
                )}

                <div {...getRootProps()} className="border-t border-border/70 bg-background/70 p-3">
                  <input {...getInputProps()} />
                  <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(event) => onDrop(Array.from(event.target.files || []))}
                  />
                  {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachments.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
                        >
                          {item.kind === 'folder' ? <FolderUp className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                          {item.relativePath || item.name}
                          <button onClick={() => removeAttachment(item.id)} className="rounded-full p-0.5 hover:bg-muted">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <textarea
                      value={input}
                      rows={1}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          void handleSend()
                        }
                      }}
                      placeholder={t(locale, 'chat.askPlaceholder')}
                      className="max-h-36 min-h-[44px] flex-1 resize-y rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none ring-primary/25 focus:ring-2"
                    />
                    <button className="rounded-xl border border-border p-2.5 hover:bg-muted/60" onClick={openFilePicker}>
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button className="rounded-xl border border-border p-2.5 hover:bg-muted/60" onClick={openFilePicker}>
                      <Image className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-xl border border-border p-2.5 hover:bg-muted/60"
                      onClick={() => folderInputRef.current?.click()}
                    >
                      <FolderUp className="h-4 w-4" />
                    </button>
                    <button
                      className={`relative rounded-xl border border-border p-2.5 ${isRecording ? 'bg-red-500/15 text-red-600' : 'hover:bg-muted/60'}`}
                      onClick={toggleRecording}
                    >
                      {isRecording && <span className="absolute inset-0 animate-ping rounded-xl bg-red-400/25" />}
                      <Mic className="relative h-4 w-4" />
                    </button>
                    {isPending ? (
                      <button className="rounded-xl border border-border p-2.5 hover:bg-muted/60" onClick={stop}>
                        <Square className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        disabled={!input.trim() || !canSend}
                        className="rounded-xl bg-gradient-to-r from-primary to-secondary p-2.5 text-primary-foreground disabled:opacity-50"
                        onClick={() => void handleSend()}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

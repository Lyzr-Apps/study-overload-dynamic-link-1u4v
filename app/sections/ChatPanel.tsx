'use client'

import React, { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  FiSend,
  FiBookOpen,
  FiTarget,
  FiCalendar,
  FiClock,
} from 'react-icons/fi'
import { PiLeaf } from 'react-icons/pi'

interface Topic {
  id: string
  name: string
  difficulty: string
  priority: number
  estimated_hours: number
  completed: boolean
  notes: string
}

interface ScheduleBlock {
  time: string
  topic: string
  activity: string
}

interface ScheduleDay {
  day: string
  blocks: ScheduleBlock[]
}

interface Resource {
  name: string
  type: string
  topic: string
  url: string
  description: string
}

interface StudyPlan {
  title: string
  goal: string
  deadline: string
  overall_progress: number
  topics: Topic[]
  schedule: ScheduleDay[]
  resources: Resource[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  studyPlan?: StudyPlan | null
  suggestions?: string[]
}

interface ChatPanelProps {
  messages: ChatMessage[]
  loading: boolean
  inputValue: string
  onInputChange: (val: string) => void
  onSendMessage: (msg: string) => void
  onSuggestionClick: (suggestion: string) => void
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-foreground">
              {line.slice(4)}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-semibold text-base mt-3 mb-1 text-foreground">
              {line.slice(3)}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-bold text-lg mt-4 mb-2 text-foreground">
              {line.slice(2)}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-4 list-disc text-sm text-foreground/90 leading-[1.55]">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-4 list-decimal text-sm text-foreground/90 leading-[1.55]">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-sm text-foreground/90 leading-[1.55]">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

const EXAMPLE_PROMPTS = [
  { icon: FiBookOpen, text: 'I need to prepare for my Physics final in 3 weeks' },
  { icon: FiTarget, text: 'Help me learn Python from scratch' },
  { icon: FiCalendar, text: 'Create a study plan for the GRE exam' },
  { icon: FiClock, text: 'I want to master Calculus in 2 months' },
]

export default function ChatPanel({
  messages,
  loading,
  inputValue,
  onInputChange,
  onSendMessage,
  onSuggestionClick,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !loading) {
        onSendMessage(inputValue.trim())
      }
    }
  }

  const handleSubmit = () => {
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim())
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
              <PiLeaf className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 font-sans tracking-[-0.01em]">
              Plan Your Study Journey
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-[1.55]">
              Tell me what you are studying and I will build your perfect plan with topics, schedules, and resources.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick(prompt.text)}
                  className="flex items-start gap-3 p-4 rounded-[0.875rem] bg-card/80 backdrop-blur-[16px] border border-white/[0.18] shadow-md text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30"
                >
                  <prompt.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground leading-[1.55]">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-[0.875rem] px-4 py-3 shadow-md',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/80 backdrop-blur-[16px] border border-white/[0.18] text-foreground'
                  )}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm leading-[1.55]">{msg.content}</p>
                  ) : (
                    <div>
                      {renderMarkdown(msg.content)}
                      {msg.studyPlan && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            <FiTarget className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-semibold text-primary">
                              Study plan generated!
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Check the sidebar to view your full plan with topics, schedule, and resources.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Suggestion chips after the last assistant message */}
            {messages.length > 0 && (() => {
              const lastMsg = messages[messages.length - 1]
              if (lastMsg?.role === 'assistant' && Array.isArray(lastMsg?.suggestions) && lastMsg.suggestions.length > 0) {
                return (
                  <div className="flex flex-wrap gap-2 pl-2">
                    {lastMsg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )
              }
              return null
            })()}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card/80 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] px-4 py-3 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border px-4 py-3 bg-card/50 backdrop-blur-[16px]">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to study..."
              rows={1}
              className="w-full resize-none rounded-[0.875rem] border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent leading-[1.55] max-h-32 overflow-y-auto"
              style={{ minHeight: '40px' }}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || loading}
            size="sm"
            className="rounded-[0.875rem] h-10 w-10 p-0 flex-shrink-0"
          >
            <FiSend className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

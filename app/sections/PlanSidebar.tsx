'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  FiChevronDown,
  FiChevronRight,
  FiTarget,
  FiCalendar,
  FiClock,
  FiBook,
  FiBookOpen,
  FiVideo,
  FiEdit3,
  FiMonitor,
  FiFileText,
  FiExternalLink,
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

interface PlanSidebarProps {
  plan: StudyPlan | null
  onToggleTopic: (topicId: string, topicName: string) => void
  activeAgentId: string | null
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 100
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const safeProgress = Math.min(100, Math.max(0, progress || 0))
  const offset = circumference - (safeProgress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{safeProgress}%</span>
        <span className="text-[10px] text-muted-foreground">complete</span>
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  icon: Icon,
  count,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ElementType
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border/50 rounded-[0.875rem] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{title}</span>
          {typeof count === 'number' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {count}
            </Badge>
          )}
        </div>
        {open ? (
          <FiChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <FiChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'hard':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-secondary text-secondary-foreground'
  }
}

function getResourceIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'video':
      return FiVideo
    case 'book':
      return FiBookOpen
    case 'practice':
      return FiEdit3
    case 'course':
      return FiMonitor
    case 'article':
      return FiFileText
    default:
      return FiBook
  }
}

function getResourceColor(type: string): string {
  switch (type?.toLowerCase()) {
    case 'video':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'book':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'practice':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'course':
      return 'bg-teal-100 text-teal-700 border-teal-200'
    case 'article':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    default:
      return 'bg-secondary text-secondary-foreground'
  }
}

const DAY_COLORS: Record<string, string> = {
  monday: 'border-l-green-500',
  tuesday: 'border-l-blue-500',
  wednesday: 'border-l-purple-500',
  thursday: 'border-l-amber-500',
  friday: 'border-l-red-500',
  saturday: 'border-l-teal-500',
  sunday: 'border-l-pink-500',
}

export default function PlanSidebar({ plan, onToggleTopic, activeAgentId }: PlanSidebarProps) {
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-4">
          <PiLeaf className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No Study Plan Yet</h3>
        <p className="text-xs text-muted-foreground leading-[1.55] max-w-[200px]">
          Start a conversation to generate your personalized study plan.
        </p>
      </div>
    )
  }

  const topics = Array.isArray(plan?.topics) ? plan.topics : []
  const schedule = Array.isArray(plan?.schedule) ? plan.schedule : []
  const resources = Array.isArray(plan?.resources) ? plan.resources : []
  const completedTopics = topics.filter((t) => t?.completed).length
  const topicProgress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0

  return (
    <div className="h-full overflow-y-auto px-4 py-5 space-y-5">
      {/* Plan header */}
      <div className="text-center space-y-3">
        <h2 className="text-base font-semibold text-foreground tracking-[-0.01em] font-sans">
          {plan?.title ?? 'Study Plan'}
        </h2>
        {plan?.goal && (
          <div className="flex items-start gap-2 bg-secondary/50 rounded-[0.875rem] p-3">
            <FiTarget className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-[1.55] text-left">{plan.goal}</p>
          </div>
        )}
        <ProgressRing progress={plan?.overall_progress ?? topicProgress} />
        {plan?.deadline && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <FiCalendar className="w-3 h-3" />
            <span>Deadline: {plan.deadline}</span>
          </div>
        )}
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <CollapsibleSection
          title="Topics"
          icon={FiBook}
          count={topics.length}
          defaultOpen={true}
        >
          <div className="space-y-2">
            {/* Topic progress bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{completedTopics} of {topics.length} complete</span>
              <span>{topicProgress}%</span>
            </div>
            <Progress value={topicProgress} className="h-2 mb-3" />

            {topics.map((topic) => {
              const topicId = topic?.id ?? ''
              const topicName = topic?.name ?? 'Untitled Topic'
              return (
                <div
                  key={topicId || topicName}
                  className={cn(
                    'flex items-start gap-2.5 p-2.5 rounded-lg transition-all duration-200',
                    topic?.completed ? 'opacity-60' : 'hover:bg-secondary/40'
                  )}
                >
                  <Checkbox
                    checked={topic?.completed ?? false}
                    onCheckedChange={() => onToggleTopic(topicId, topicName)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-sm font-medium text-foreground',
                          topic?.completed && 'line-through'
                        )}
                      >
                        {topicName}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full border font-medium',
                          getDifficultyColor(topic?.difficulty ?? '')
                        )}
                      >
                        {topic?.difficulty ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {typeof topic?.estimated_hours === 'number' && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <FiClock className="w-2.5 h-2.5" />
                          {topic.estimated_hours}h
                        </span>
                      )}
                      {typeof topic?.priority === 'number' && (
                        <span className="text-[10px] text-muted-foreground">
                          Priority: {topic.priority}
                        </span>
                      )}
                    </div>
                    {topic?.notes && (
                      <p className="text-[10px] text-muted-foreground mt-1 leading-[1.55]">
                        {topic.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Schedule */}
      {schedule.length > 0 && (
        <CollapsibleSection
          title="Schedule"
          icon={FiCalendar}
          count={schedule.length}
          defaultOpen={false}
        >
          <div className="space-y-3">
            {schedule.map((day, dayIdx) => {
              const dayName = day?.day ?? `Day ${dayIdx + 1}`
              const blocks = Array.isArray(day?.blocks) ? day.blocks : []
              const dayColor = DAY_COLORS[dayName.toLowerCase()] ?? 'border-l-primary'

              return (
                <div key={dayIdx} className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    {dayName}
                  </h4>
                  {blocks.length > 0 ? (
                    <div className="space-y-1">
                      {blocks.map((block, blockIdx) => (
                        <div
                          key={blockIdx}
                          className={cn(
                            'flex items-start gap-2 pl-3 py-1.5 border-l-2 bg-secondary/20 rounded-r-lg',
                            dayColor
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                                {block?.time ?? ''}
                              </span>
                              <span className="text-xs font-medium text-foreground truncate">
                                {block?.topic ?? ''}
                              </span>
                            </div>
                            {block?.activity && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {block.activity}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">No blocks scheduled</p>
                  )}
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <CollapsibleSection
          title="Resources"
          icon={FiBookOpen}
          count={resources.length}
          defaultOpen={false}
        >
          <div className="space-y-2.5">
            {resources.map((resource, idx) => {
              const ResIcon = getResourceIcon(resource?.type ?? '')
              const resourceName = resource?.name ?? 'Untitled Resource'
              const hasUrl = resource?.url && resource.url !== '' && resource.url !== '#'

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors duration-200"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 mt-0.5',
                        getResourceColor(resource?.type ?? '')
                      )}
                    >
                      <ResIcon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {hasUrl ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 truncate"
                          >
                            {resourceName}
                            <FiExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs font-medium text-foreground truncate">
                            {resourceName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0 rounded-full border font-medium',
                            getResourceColor(resource?.type ?? '')
                          )}
                        >
                          {resource?.type ?? 'Resource'}
                        </span>
                        {resource?.topic && (
                          <span className="text-[9px] text-muted-foreground">
                            {resource.topic}
                          </span>
                        )}
                      </div>
                      {resource?.description && (
                        <p className="text-[10px] text-muted-foreground mt-1 leading-[1.55]">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Agent status */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              activeAgentId ? 'bg-amber-400 animate-pulse' : 'bg-green-500'
            )}
          />
          <span>
            Study Planner Agent {activeAgentId ? '(processing...)' : '(ready)'}
          </span>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import Header from './sections/Header'
import ChatPanel from './sections/ChatPanel'
import PlanSidebar from './sections/PlanSidebar'

// --- Types ---

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

// --- Constants ---

const AGENT_ID = '69a16c3edb8e0879c3c8f2a7'

const THEME_VARS = {
  '--background': '120 15% 98%',
  '--foreground': '150 30% 10%',
  '--card': '120 15% 96%',
  '--card-foreground': '150 30% 10%',
  '--popover': '120 15% 94%',
  '--popover-foreground': '150 30% 10%',
  '--primary': '142 76% 26%',
  '--primary-foreground': '120 15% 98%',
  '--secondary': '120 15% 92%',
  '--secondary-foreground': '150 30% 15%',
  '--accent': '160 60% 30%',
  '--accent-foreground': '120 15% 98%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--muted': '120 12% 90%',
  '--muted-foreground': '150 20% 45%',
  '--border': '120 15% 88%',
  '--input': '120 12% 80%',
  '--ring': '142 76% 26%',
  '--radius': '0.875rem',
  '--sidebar-background': '120 15% 95%',
  '--sidebar-foreground': '150 30% 10%',
  '--sidebar-border': '120 15% 88%',
  '--sidebar-primary': '142 76% 26%',
  '--sidebar-primary-foreground': '120 15% 98%',
  '--sidebar-accent': '120 15% 90%',
  '--sidebar-accent-foreground': '150 30% 10%',
  '--chart-1': '142 76% 26%',
  '--chart-2': '160 60% 30%',
  '--chart-3': '100 50% 40%',
  '--chart-4': '180 55% 35%',
  '--chart-5': '80 60% 45%',
} as React.CSSProperties

// --- Sample Data ---

const SAMPLE_PLAN: StudyPlan = {
  title: 'Physics Final: Electromagnetism Focus',
  goal: 'Ace the Grade 12 Physics final exam with strong mastery of Electromagnetism, supported by solid review of Mechanics, Waves, and Modern Physics',
  deadline: '3 weeks from today',
  overall_progress: 30,
  topics: [
    {
      id: 'topic-1',
      name: 'Electric Fields & Coulombs Law',
      difficulty: 'Hard',
      priority: 1,
      estimated_hours: 12,
      completed: false,
      notes: 'Master electric field lines, point charges, superposition principle, and field calculations',
    },
    {
      id: 'topic-2',
      name: 'DC Circuits & Ohms Law',
      difficulty: 'Medium',
      priority: 2,
      estimated_hours: 10,
      completed: false,
      notes: 'Series and parallel circuits, Kirchhoffs laws, internal resistance, and power dissipation',
    },
    {
      id: 'topic-3',
      name: 'Magnetic Fields & Forces',
      difficulty: 'Hard',
      priority: 3,
      estimated_hours: 10,
      completed: false,
      notes: 'Magnetic field around conductors, force on current-carrying wires, right-hand rule, and solenoids',
    },
    {
      id: 'topic-4',
      name: 'Electromagnetic Induction',
      difficulty: 'Hard',
      priority: 4,
      estimated_hours: 8,
      completed: true,
      notes: 'Faradays law, Lenzs law, motional EMF, generators, and transformers',
    },
    {
      id: 'topic-5',
      name: 'Mechanics Review',
      difficulty: 'Medium',
      priority: 5,
      estimated_hours: 6,
      completed: true,
      notes: 'Kinematics, Newtons laws, work-energy theorem, and momentum conservation',
    },
    {
      id: 'topic-6',
      name: 'Waves & Modern Physics',
      difficulty: 'Medium',
      priority: 6,
      estimated_hours: 5,
      completed: false,
      notes: 'Wave properties, interference, diffraction, photoelectric effect, and atomic models',
    },
  ],
  schedule: [
    {
      day: 'Monday',
      blocks: [
        { time: '9:00 AM - 10:30 AM', topic: 'Electric Fields & Coulombs Law', activity: 'Review textbook chapter on electric fields and solve worked examples' },
        { time: '11:00 AM - 12:00 PM', topic: 'Electric Fields & Coulombs Law', activity: 'Practice Coulombs law calculation problems' },
        { time: '2:00 PM - 3:30 PM', topic: 'DC Circuits & Ohms Law', activity: 'Watch Khan Academy video on series-parallel circuits and take notes' },
      ],
    },
    {
      day: 'Tuesday',
      blocks: [
        { time: '9:00 AM - 10:30 AM', topic: 'DC Circuits & Ohms Law', activity: 'Solve circuit analysis problems using Kirchhoffs laws' },
        { time: '11:00 AM - 12:30 PM', topic: 'Magnetic Fields & Forces', activity: 'Study magnetic field theory and right-hand rule applications' },
      ],
    },
    {
      day: 'Wednesday',
      blocks: [
        { time: '9:00 AM - 10:30 AM', topic: 'Magnetic Fields & Forces', activity: 'Practice force on current-carrying conductors and solenoid problems' },
        { time: '11:00 AM - 12:00 PM', topic: 'Electromagnetic Induction', activity: 'Review Faradays law derivations and solve EMF problems' },
        { time: '2:00 PM - 3:30 PM', topic: 'Electric Fields & Coulombs Law', activity: 'Work through past exam questions on electric fields' },
      ],
    },
    {
      day: 'Thursday',
      blocks: [
        { time: '9:00 AM - 10:30 AM', topic: 'Electromagnetic Induction', activity: 'Practice transformer and generator calculations' },
        { time: '11:00 AM - 12:30 PM', topic: 'Mechanics Review', activity: 'Solve kinematics and dynamics review problems' },
      ],
    },
    {
      day: 'Friday',
      blocks: [
        { time: '9:00 AM - 10:30 AM', topic: 'Waves & Modern Physics', activity: 'Review wave properties and photoelectric effect theory' },
        { time: '11:00 AM - 12:00 PM', topic: 'Waves & Modern Physics', activity: 'Solve interference and diffraction problems' },
      ],
    },
    {
      day: 'Saturday',
      blocks: [
        { time: '9:00 AM - 12:00 PM', topic: 'Practice Exam', activity: 'Complete a full-length timed physics practice exam' },
        { time: '2:00 PM - 3:30 PM', topic: 'Practice Exam', activity: 'Review incorrect answers and identify weak areas' },
      ],
    },
    {
      day: 'Sunday',
      blocks: [
        { time: '10:00 AM - 11:30 AM', topic: 'Electric Fields & Coulombs Law', activity: 'Revisit weak areas identified from practice exam' },
        { time: '12:00 PM - 1:00 PM', topic: 'DC Circuits & Ohms Law', activity: 'Quick circuit problem set for reinforcement' },
      ],
    },
  ],
  resources: [
    {
      name: 'Khan Academy: Electrostatics & Electric Fields',
      type: 'Video',
      topic: 'Electric Fields & Coulombs Law',
      url: 'https://www.khanacademy.org/science/physics/electric-charge-electric-force-and-voltage',
      description: 'Clear video explanations of electric fields, Coulombs law, and electric potential',
    },
    {
      name: 'PhET Circuit Construction Kit',
      type: 'Practice',
      topic: 'DC Circuits & Ohms Law',
      url: 'https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc',
      description: 'Interactive circuit simulator to build and analyze DC circuits hands-on',
    },
    {
      name: 'Flipping Physics: Magnetism Playlist',
      type: 'Video',
      topic: 'Magnetic Fields & Forces',
      url: '',
      description: 'Engaging short videos covering magnetic fields, forces on wires, and right-hand rules',
    },
    {
      name: 'OpenStax College Physics Textbook',
      type: 'Book',
      topic: 'All Topics',
      url: 'https://openstax.org/details/books/college-physics-2e',
      description: 'Free open-access physics textbook with clear explanations and end-of-chapter problems',
    },
    {
      name: 'Physics Classroom: Electromagnetic Induction',
      type: 'Article',
      topic: 'Electromagnetic Induction',
      url: 'https://www.physicsclassroom.com/class/circuits',
      description: 'Detailed tutorials on Faradays law, Lenzs law, and practical applications',
    },
    {
      name: 'Past Physics Final Exams Collection',
      type: 'Practice',
      topic: 'All Topics',
      url: '',
      description: 'Compilation of previous years physics final exams with answer keys for timed practice',
    },
  ],
}

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: 'sample-1',
    role: 'user',
    content: 'I have my Grade 12 Physics final exam in 3 weeks. I need to focus on Electromagnetism but also review other topics. I can study about 4 hours a day.',
    timestamp: new Date(),
  },
  {
    id: 'sample-2',
    role: 'assistant',
    content:
      "I have built your **Physics Final Exam Study Plan** with a strong focus on Electromagnetism! Here is the breakdown:\n\n### Plan Overview\n- **Goal:** Master Electromagnetism and review all exam topics in 3 weeks\n- **Daily commitment:** ~4 hours of focused study\n- **6 topics** covering the full exam syllabus\n\n### Key Highlights\n- **Electric Fields & Coulombs Law** is your top priority with 12 hours allocated\n- **DC Circuits** and **Magnetic Fields** follow closely as core Electromagnetism units\n- **Saturday practice exams** simulate real exam conditions with post-test reviews\n- **Mechanics and Waves** get targeted review sessions so nothing is left uncovered\n\nYou can check off topics in the sidebar as you complete them, and I will adjust your remaining schedule accordingly. Let me know if you want to shift any focus areas!",
    timestamp: new Date(),
    studyPlan: SAMPLE_PLAN,
    suggestions: [
      'Add more practice problems for circuits',
      'I struggle with right-hand rule, help me',
      'Move study sessions to evening hours',
      'What are the most common exam question types?',
    ],
  },
]

// --- Agent Response Parser ---

function tryParseJSON(val: any): any {
  if (typeof val !== 'string') return val
  try {
    return JSON.parse(val)
  } catch {
    return val
  }
}

function extractStudyPlan(raw: any): StudyPlan | null {
  if (!raw || raw === 'null') return null
  let plan = typeof raw === 'string' ? tryParseJSON(raw) : raw
  if (!plan || typeof plan !== 'object') return null

  // Validate it has at least a title or topics to be a real plan
  const hasContent =
    plan.title || plan.goal || (Array.isArray(plan.topics) && plan.topics.length > 0)
  if (!hasContent) return null

  return {
    title: plan.title || 'Study Plan',
    goal: plan.goal || '',
    deadline: plan.deadline || '',
    overall_progress:
      typeof plan.overall_progress === 'number' ? plan.overall_progress : 0,
    topics: Array.isArray(plan.topics)
      ? plan.topics.map((t: any, i: number) => ({
          id: t?.id || `topic-${i + 1}`,
          name: t?.name || `Topic ${i + 1}`,
          difficulty: t?.difficulty || 'Medium',
          priority: typeof t?.priority === 'number' ? t.priority : i + 1,
          estimated_hours:
            typeof t?.estimated_hours === 'number' ? t.estimated_hours : 5,
          completed: Boolean(t?.completed),
          notes: t?.notes || '',
        }))
      : [],
    schedule: Array.isArray(plan.schedule)
      ? plan.schedule.map((d: any) => ({
          day: d?.day || 'Day',
          blocks: Array.isArray(d?.blocks)
            ? d.blocks.map((b: any) => ({
                time: b?.time || '',
                topic: b?.topic || '',
                activity: b?.activity || '',
              }))
            : [],
        }))
      : [],
    resources: Array.isArray(plan.resources)
      ? plan.resources.map((r: any) => ({
          name: r?.name || 'Resource',
          type: r?.type || 'Article',
          topic: r?.topic || '',
          url: r?.url || '',
          description: r?.description || '',
        }))
      : [],
  }
}

/**
 * Recursively unwrap a value that might be JSON-string-encoded multiple times.
 * e.g. "\"{ ... }\"" -> parse -> "{ ... }" -> parse -> { ... }
 */
function deepParseJSON(val: any, depth = 0): any {
  if (depth > 5) return val
  if (typeof val !== 'string') return val
  const trimmed = val.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[') && !trimmed.startsWith('"')) return val
  try {
    const parsed = JSON.parse(trimmed)
    // If we got another string, keep unwrapping
    if (typeof parsed === 'string') return deepParseJSON(parsed, depth + 1)
    return parsed
  } catch {
    return val
  }
}

/**
 * Extract the best structured data from the full API result.
 * Handles the known Lyzr response patterns:
 *
 * Pattern A (direct): result.response.result = { message, study_plan, suggestions }
 * Pattern B (text-only): result.response.result = { text: "..." }
 *   with the full structured data buried in result.raw_response
 *   raw_response = '{"response": "{...JSON string with study_plan...}", "module_outputs": {}}'
 */
function extractStructuredData(apiResult: any): any {
  // Attempt 1: Direct path - result.response.result
  let data = apiResult?.response?.result
  data = deepParseJSON(data)

  // Check if we already have study_plan at this level
  if (data && typeof data === 'object' && data.study_plan) {
    return data
  }

  // Unwrap one more level if there's a nested result
  if (data?.result && typeof data.result === 'object') {
    if (data.result.study_plan) return data.result
  }

  // Attempt 2: Parse raw_response which often contains the full structured JSON
  const rawResponse = apiResult?.raw_response
  if (rawResponse) {
    const parsedRaw = deepParseJSON(rawResponse)
    if (parsedRaw && typeof parsedRaw === 'object') {
      // raw_response = { response: "{...stringified JSON...}", module_outputs: {} }
      if (parsedRaw.response) {
        const innerResponse = deepParseJSON(parsedRaw.response)
        if (innerResponse && typeof innerResponse === 'object') {
          if (innerResponse.study_plan) return innerResponse
          // Maybe nested one more level
          if (innerResponse.result) {
            const innerResult = deepParseJSON(innerResponse.result)
            if (innerResult && typeof innerResult === 'object' && innerResult.study_plan) {
              return innerResult
            }
          }
        }
      }
      // raw_response itself might be the structured data
      if (parsedRaw.study_plan) return parsedRaw
    }
  }

  // Attempt 3: Check result.response.message for embedded JSON
  const respMessage = apiResult?.response?.message
  if (respMessage) {
    const parsedMsg = deepParseJSON(respMessage)
    if (parsedMsg && typeof parsedMsg === 'object' && parsedMsg.study_plan) {
      return parsedMsg
    }
  }

  // Fallback: return whatever we have from the direct path
  return data
}

function parseAgentResponse(result: any): {
  message: string
  study_plan: StudyPlan | null
  suggestions: string[]
} {
  // Use the deep extractor to find structured data from any nesting level
  let data = extractStructuredData(result)

  // Handle empty/missing data
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    const fallbackMsg =
      result?.response?.message ||
      result?.response?.result?.text ||
      'I could not process that. Please try again.'
    return {
      message: typeof fallbackMsg === 'string' ? fallbackMsg : String(fallbackMsg),
      study_plan: null,
      suggestions: [],
    }
  }

  // If data is still a string after all parsing, treat as plain message
  if (typeof data === 'string') {
    return { message: data, study_plan: null, suggestions: [] }
  }

  // Extract study_plan with deep parsing and normalization
  const studyPlan = extractStudyPlan(data.study_plan)

  // Extract message from multiple possible keys
  const directResult = result?.response?.result
  const directText = typeof directResult === 'object' ? directResult?.text : undefined
  const message =
    data.message ||
    data.text ||
    directText ||
    result?.response?.message ||
    (studyPlan ? 'Here is your study plan!' : '') ||
    ''

  // Extract suggestions safely
  let suggestions: string[] = []
  if (Array.isArray(data.suggestions)) {
    suggestions = data.suggestions.filter((s: any) => typeof s === 'string' && s.trim())
  }

  return { message, study_plan: studyPlan, suggestions }
}

// --- ErrorBoundary ---

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Main Page ---

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)
  const [userId, setUserId] = useState('')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    setUserId(crypto.randomUUID())
    setSessionId(crypto.randomUUID())
  }, [])

  const handleToggleSampleData = useCallback((val: boolean) => {
    setShowSampleData(val)
    if (val) {
      setMessages(SAMPLE_MESSAGES)
      setCurrentPlan(SAMPLE_PLAN)
    } else {
      setMessages([])
      setCurrentPlan(null)
    }
  }, [])

  const handleNewPlan = useCallback(() => {
    setMessages([])
    setCurrentPlan(null)
    setInputValue('')
    setShowSampleData(false)
    setSessionId(crypto.randomUUID())
  }, [])

  const handleSendMessage = useCallback(
    async (msg: string) => {
      if (!msg.trim() || loading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: msg,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setLoading(true)
      setActiveAgentId(AGENT_ID)

      try {
        // Count user messages to determine if we should nudge plan generation
        const userMsgCount = messages.filter((m) => m.role === 'user').length + 1
        let finalMsg = msg
        if (userMsgCount >= 2 && !currentPlan) {
          finalMsg = `${msg}\n\n[SYSTEM NOTE: The student has now provided ${userMsgCount} messages. You MUST generate a complete study plan NOW with all fields populated (title, goal, deadline, overall_progress, topics, schedule, resources). Do not ask any more clarifying questions. Generate the plan immediately based on available information, making reasonable assumptions for any missing details.]`
        }

        const result = await callAIAgent(finalMsg, AGENT_ID, {
          user_id: userId,
          session_id: sessionId,
        })

        if (result.success) {
          const parsed = parseAgentResponse(result)

          // If a plan is returned, update the sidebar
          if (parsed.study_plan) {
            setCurrentPlan(parsed.study_plan)
            setSidebarOpen(true)
          }

          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: parsed.message || 'I have processed your request.',
            timestamp: new Date(),
            studyPlan: parsed.study_plan,
            suggestions:
              parsed.suggestions.length > 0
                ? parsed.suggestions
                : parsed.study_plan
                  ? [
                      'Adjust the schedule',
                      'Show more resources',
                      'Change study hours',
                      'Add more topics',
                    ]
                  : [],
          }

          setMessages((prev) => [...prev, assistantMessage])
        } else {
          // Even on error, try to parse the response in case it has partial data
          const parsed = parseAgentResponse(result)
          if (parsed.study_plan) {
            setCurrentPlan(parsed.study_plan)
            setSidebarOpen(true)
          }

          const errorMsg =
            parsed.message ||
            result?.error ||
            result?.response?.message ||
            'Something went wrong. Please try again.'
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: parsed.study_plan
              ? errorMsg
              : `I encountered an issue: ${errorMsg}. Please try rephrasing your request.`,
            timestamp: new Date(),
            studyPlan: parsed.study_plan,
            suggestions: parsed.suggestions,
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      } catch (err) {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'A network error occurred. Please check your connection and try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setLoading(false)
        setActiveAgentId(null)
      }
    },
    [loading, userId, sessionId, messages, currentPlan]
  )

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (showSampleData) {
        setShowSampleData(false)
        setMessages([])
        setCurrentPlan(null)
        setSessionId(crypto.randomUUID())
        setTimeout(() => {
          handleSendMessage(suggestion)
        }, 100)
        return
      }
      handleSendMessage(suggestion)
    },
    [showSampleData, handleSendMessage]
  )

  const handleToggleTopic = useCallback(
    (topicId: string, topicName: string) => {
      if (!currentPlan) return

      setCurrentPlan((prev) => {
        if (!prev) return prev
        const updatedTopics = Array.isArray(prev.topics)
          ? prev.topics.map((t) =>
              t?.id === topicId ? { ...t, completed: !t.completed } : t
            )
          : []
        const completedCount = updatedTopics.filter((t) => t?.completed).length
        const newProgress = updatedTopics.length > 0
          ? Math.round((completedCount / updatedTopics.length) * 100)
          : 0

        return {
          ...prev,
          topics: updatedTopics,
          overall_progress: newProgress,
        }
      })

      if (!showSampleData) {
        const topic = Array.isArray(currentPlan?.topics)
          ? currentPlan.topics.find((t) => t?.id === topicId)
          : null
        const isCompleting = topic ? !topic.completed : true
        const statusMsg = isCompleting
          ? `I completed the topic "${topicName}"`
          : `I need to revisit the topic "${topicName}", marking it as incomplete`
        handleSendMessage(statusMsg)
      }
    },
    [currentPlan, showSampleData, handleSendMessage]
  )

  return (
    <ErrorBoundary>
      <div
        style={THEME_VARS}
        className="min-h-screen bg-background text-foreground"
      >
        <div
          className="min-h-screen flex flex-col"
          style={{
            background:
              'linear-gradient(135deg, hsl(120 25% 96%) 0%, hsl(140 30% 94%) 35%, hsl(160 25% 95%) 70%, hsl(100 20% 96%) 100%)',
          }}
        >
          {/* Header */}
          <Header
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            hasPlan={!!currentPlan}
            onNewPlan={handleNewPlan}
            showSampleData={showSampleData}
            onToggleSampleData={handleToggleSampleData}
          />

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Chat Panel */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
              <ChatPanel
                messages={messages}
                loading={loading}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSendMessage={handleSendMessage}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>

            {/* Sidebar */}
            <div
              className={cn(
                'border-l border-border bg-card/60 backdrop-blur-[16px] transition-all duration-300 overflow-hidden',
                sidebarOpen
                  ? 'w-full md:w-[380px] absolute md:relative inset-0 md:inset-auto z-10 md:z-auto'
                  : 'w-0 md:w-0'
              )}
            >
              {sidebarOpen && (
                <div className="h-full flex flex-col">
                  {/* Mobile close button */}
                  <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Study Plan</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <PlanSidebar
                      plan={currentPlan}
                      onToggleTopic={handleToggleTopic}
                      activeAgentId={activeAgentId}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar toggle for desktop when plan exists and sidebar is closed */}
            {!sidebarOpen && currentPlan && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex items-center justify-center w-8 border-l border-border bg-card/60 backdrop-blur-[16px] hover:bg-secondary/50 transition-colors duration-200"
                title="Show study plan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FiMenu, FiX, FiPlus } from 'react-icons/fi'
import { PiTreeEvergreen } from 'react-icons/pi'

interface HeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  hasPlan: boolean
  onNewPlan: () => void
  showSampleData: boolean
  onToggleSampleData: (val: boolean) => void
}

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  hasPlan,
  onNewPlan,
  showSampleData,
  onToggleSampleData,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/80 backdrop-blur-[16px]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-[0.875rem] bg-primary text-primary-foreground">
          <PiTreeEvergreen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-[-0.01em] leading-[1.55] text-foreground font-sans">
            StudyPilot
          </h1>
          <p className="text-xs text-muted-foreground leading-[1.55]">AI Study Planner</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs text-muted-foreground font-medium">Sample Data</span>
          <Switch checked={showSampleData} onCheckedChange={onToggleSampleData} />
        </div>
        {hasPlan && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNewPlan}
            className="gap-1.5 rounded-[0.875rem] text-xs"
          >
            <FiPlus className="w-3.5 h-3.5" />
            New Plan
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="md:hidden rounded-[0.875rem]"
        >
          {sidebarOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  )
}

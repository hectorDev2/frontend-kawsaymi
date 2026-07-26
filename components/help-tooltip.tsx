'use client'

import { CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function HelpTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Más información"
        >
          <CircleHelp className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-64 text-sm leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}

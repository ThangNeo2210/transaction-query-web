'use client'

import { useTheme } from "next-themes"
import { Sun, Moon } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="data-[state=checked]:bg-primary"
            />
            <Moon className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle dark mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 
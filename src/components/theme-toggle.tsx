'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />
    } else if (theme === 'dark') {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />
    } else {
      return <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center text-xs">💻</span>
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={cycleTheme}>
      {getThemeIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
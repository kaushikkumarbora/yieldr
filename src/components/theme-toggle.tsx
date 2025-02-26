"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Only show the toggle after client-side hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 h-5">
        <Sun className="h-4 w-4" />
        <div className="w-9 h-5" /> {/* Placeholder for unmounted switch */}
        <Moon className="h-4 w-4" />
      </div>
    )
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch 
        checked={theme === "dark"} 
        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <Moon className="h-4 w-4" />
    </div>
  )
}
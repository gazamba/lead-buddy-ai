"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface BackHeaderProps {
  backTo?: string
  backLabel?: string
}

export function BackHeader({ backTo = "/", backLabel = "Back to Home" }: BackHeaderProps) {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={backTo} className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <span className="font-medium">{backLabel}</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}

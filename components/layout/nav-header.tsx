"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAccount } from "@/components/layout/user-account";

export function NavHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <MessageSquare className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          <span>LeadBuddy</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Features
          </Link>
          <Link
            href="#scenarios"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Scenarios
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Testimonials
          </Link>
          {
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Dashboard
            </Link>
          }
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserAccount />
        </div>
      </div>
    </header>
  );
}

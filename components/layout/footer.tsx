import Link from "next/link"
import { MessageSquare } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 px-4 md:px-6">
        <div className="flex flex-col gap-2 md:gap-4 md:flex-1">
          <div className="flex items-center gap-2 font-bold">
            <MessageSquare className="h-5 w-5" />
            <span>LeadBuddy</span>
          </div>
          <p className="text-sm text-gray-500">
            Helping managers become better communicators through AI-powered practice.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex-1">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-sm text-gray-500">
        <div className="container px-4 md:px-6">© {new Date().getFullYear()} LeadBuddy. All rights reserved.</div>
      </div>
    </footer>
  )
}

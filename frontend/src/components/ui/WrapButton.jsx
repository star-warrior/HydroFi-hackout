import * as React from "react"
import { cn } from "../../lib/utils"

export function WrapButton({ className, href, children, ...props }) {
  return (
    <a
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full bg-black px-6 py-3 font-medium text-white transition hover:bg-emerald-700 gap-2",
        className
      )}
      {...props}
    >
      {/* Hydrogen H2 Icon as text */}
     

      {children}
    </a>
  )
}

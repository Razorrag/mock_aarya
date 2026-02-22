import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Input - Premium styled input component with luxury theme
 * 
 * Features:
 * - Glass morphism effect
 * - Focus glow animation
 * - Premium border styling
 * - Smooth transitions
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-[#B76E79]/30 bg-[#0B0608]/40 backdrop-blur-md px-4 py-3 text-sm text-[#EAE0D5] shadow-lg transition-all duration-400",
        "placeholder:text-[#8B7D77]/70 placeholder:font-light",
        "focus:outline-none focus:border-[#F2C29A]/50 focus:bg-[#0B0608]/60",
        "focus:shadow-[0_0_20px_rgba(183,110,121,0.2),0_0_40px_rgba(242,194,154,0.1)]",
        "hover:border-[#B76E79]/50 hover:bg-[#0B0608]/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Conditionally join class names together.
 *
 * @param inputs
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

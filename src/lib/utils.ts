import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal class merging
 * This utility function is used throughout the UI components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

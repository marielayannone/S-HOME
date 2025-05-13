import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "MXN"
    notation?: Intl.NumberFormatOptions["notation"]
  } = {},
) {
  const { currency = "MXN", notation = "standard" } = options

  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

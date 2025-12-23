import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseNumber(value: string | number | undefined | null): number {
  if (!value) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }

  const formattedValue = value.replace(",", ".");
  const parsed = Number.parseFloat(formattedValue);

  return Number.isNaN(parsed) ? 0 : parsed;
}

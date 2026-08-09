import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

export function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function parseDate(dateString: string): string {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
}

export function generateMonthOptions(pastMonths = 12, futureMonths = 12): string[] {
  const options: string[] = [];
  const today = new Date();

  for (let i = pastMonths; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    options.push(getMonthKey(date));
  }

  for (let i = 1; i <= futureMonths; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    options.push(getMonthKey(date));
  }

  return options;
}

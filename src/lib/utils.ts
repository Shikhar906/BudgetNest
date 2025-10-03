import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndianNumber(value: number): string {
  // Round to 2 decimal places
  const roundedValue = Number(value.toFixed(2));
  const numStr = Math.abs(roundedValue).toString();
  
  // Split into whole and decimal parts
  const [wholePart, decimalPart = "00"] = numStr.split(".");
  let result = "";
  
  // Handle numbers less than 1000
  if (wholePart.length <= 3) {
    result = wholePart;
  } else {
    // Extract the last 3 digits
    result = wholePart.slice(-3);
    
    // Process remaining digits in groups of 2 from right to left
    let remaining = wholePart.slice(0, -3);
    while (remaining.length > 0) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    
    // Remove leading comma if the remaining slice was only 1 digit
    if (result.startsWith(",")) {
      result = result.slice(1);
    }
  }
  
  // Add decimals and handle negative numbers
  const formattedNumber = `${result}.${decimalPart.padEnd(2, "0")}`;
  return value < 0 ? `-${formattedNumber}` : formattedNumber;
}

export function formatIndianCurrency(amount: number): string {
  return `₹${formatIndianNumber(amount)}`;
}

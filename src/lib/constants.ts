export const EXPENSE_CATEGORIES = [
  // Housing & Utilities (Essential living expenses)
  "Housing/Rent",
  "Utilities",

  // Food & Groceries
  "Groceries",
  "Dining & Food",

  // Transportation
  "Transportation",
  
  // Health & Personal Care
  "Healthcare",
  "Personal Care",
  
  // Bills & EMI
  "Bills & EMI",
  
  // Miscellaneous
  "Others"
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
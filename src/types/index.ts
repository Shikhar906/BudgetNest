export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  age?: number;
  sex?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contactNumber: string;
  alternateContact?: string;
  occupation?: string;
  monthlyIncome?: number;
  profilePicture?: string;
}

import { EXPENSE_CATEGORIES } from '@/lib/constants';

export interface Budget {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM
  totalBudget: number;
  remaining: number;
  createdAt: string;
  previousMonthSavings?: number; // Savings carried over from previous month
  currentMonthSavings?: number;  // Savings from current month's remaining amount
  isCompleted?: boolean;         // Whether this month's budget is completed
  finalSavings?: number;         // Final savings amount when month is completed
  completedAt?: string;          // When the month was completed
}

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: string;
  userId: string;
  budgetId: string;
  item: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
}

export interface LendingBorrowing {
  id: string;
  userId: string;
  type: 'lent' | 'borrowed';
  amount: number;
  personName: string;
  phoneNumber: string;
  date: string;
  settled: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (profile: UserProfile) => void;
}

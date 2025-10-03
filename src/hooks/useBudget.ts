import { useState, useEffect } from 'react';
import { Budget, Expense } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLending } from './useLending';

export const useBudget = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load budgets from localStorage
    const budgetsData = localStorage.getItem(`budgets_${user.id}`);
    if (budgetsData) {
      const loadedBudgets = JSON.parse(budgetsData);
      setBudgets(loadedBudgets);
      
      // Set current month's budget
      const currentMonth = new Date().toISOString().slice(0, 7);
      const current = loadedBudgets.find((b: Budget) => b.month === currentMonth);
      setCurrentBudget(current || null);
    }

    // Load expenses from localStorage
    const expensesData = localStorage.getItem(`expenses_${user.id}`);
    if (expensesData) {
      setExpenses(JSON.parse(expensesData));
    }
  }, [user]);

  const createBudget = (totalBudget: number, previousSavings: number = 0) => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const newBudget: Budget = {
      id: `budget_${Date.now()}`,
      userId: user.id,
      month: currentMonth,
      totalBudget,
      previousMonthSavings: previousSavings,
      currentMonthSavings: 0,
      remaining: totalBudget,
      createdAt: new Date().toISOString(),
    };

    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);
    setCurrentBudget(newBudget);
    localStorage.setItem(`budgets_${user.id}`, JSON.stringify(updatedBudgets));
  };

  const updateBudget = (budgetId: string, updates: Partial<Budget>) => {
    if (!user) return;

    const updatedBudgets = budgets.map(b => 
      b.id === budgetId ? { ...b, ...updates } : b
    );
    setBudgets(updatedBudgets);
    localStorage.setItem(`budgets_${user.id}`, JSON.stringify(updatedBudgets));
    
    if (currentBudget?.id === budgetId) {
      setCurrentBudget({ ...currentBudget, ...updates });
    }
  };

  const { getTotalLendingImpact } = useLending();

  const addExpense = (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !currentBudget) return;

    const newExpense: Expense = {
      ...expense,
      id: `expense_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));

    // Update budget remaining including lending impact
    const totalExpenses = updatedExpenses
      .filter(e => e.budgetId === currentBudget.id)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const lendingImpact = getTotalLendingImpact();
    updateBudget(currentBudget.id, {
      remaining: currentBudget.totalBudget - totalExpenses + lendingImpact
    });
    updateMonthlySavings();
  };

  const deleteExpense = (expenseId: string) => {
    if (!user || !currentBudget) return;

    const updatedExpenses = expenses.filter(e => e.id !== expenseId);
    setExpenses(updatedExpenses);
    localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));

    // Recalculate budget remaining
    const totalExpenses = updatedExpenses
      .filter(e => e.budgetId === currentBudget.id)
      .reduce((sum, e) => sum + e.amount, 0);
    
    updateBudget(currentBudget.id, {
      remaining: currentBudget.totalBudget - totalExpenses
    });
    updateMonthlySavings();
  };

  const updateExpense = (updatedExpense: Expense) => {
    if (!user || !currentBudget) return;

    const updatedExpenses = expenses.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    setExpenses(updatedExpenses);
    localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));

    // Recalculate budget remaining
    const totalExpenses = updatedExpenses
      .filter(e => e.budgetId === currentBudget.id)
      .reduce((sum, e) => sum + e.amount, 0);
    
    updateBudget(currentBudget.id, {
      remaining: currentBudget.totalBudget - totalExpenses
    });
    updateMonthlySavings();
  };

  const getCurrentMonthExpenses = () => {
    if (!currentBudget) return [];
    return expenses.filter(e => e.budgetId === currentBudget.id);
  };

  const calculateSavings = () => {
    if (!currentBudget) return 0;
    return currentBudget.remaining;
  };

  const updateMonthlySavings = () => {
    if (!currentBudget || !user) return;

    const currentDate = new Date();
    const budgetMonth = new Date(currentBudget.month + '-01');
    const isMonthEnd = 
      currentDate.getMonth() !== budgetMonth.getMonth() || 
      currentDate.getFullYear() !== budgetMonth.getFullYear();

    if (isMonthEnd) {
      // When month ends, move current savings to previous month
      const savings = calculateSavings();
      updateBudget(currentBudget.id, {
        previousMonthSavings: currentBudget.currentMonthSavings,
        currentMonthSavings: savings
      });
    } else {
      // During the month, just update current month savings
      const savings = calculateSavings();
      updateBudget(currentBudget.id, {
        currentMonthSavings: savings
      });
    }
  };

  return {
    budgets,
    currentBudget,
    expenses,
    createBudget,
    updateBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    getCurrentMonthExpenses,
    calculateSavings,
    updateMonthlySavings,
  };
};

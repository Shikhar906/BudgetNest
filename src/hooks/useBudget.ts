import { useState, useEffect } from 'react';
import { Budget, Expense } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLending } from './useLending';
import { collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useBudget = () => {
  const { user } = useAuth();
  const { getTotalLendingImpact } = useLending();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setBudgets([]);
      setCurrentBudget(null);
      setExpenses([]);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load budgets from Firestore
      const budgetsQuery = query(
        collection(db, 'budgets'), 
        where('userId', '==', user.id)
      );
      const budgetsSnapshot = await getDocs(budgetsQuery);
      const userBudgets = budgetsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      
      setBudgets(userBudgets);
      
      // Set current month's budget
      const currentMonth = new Date().toISOString().slice(0, 7);
      const current = userBudgets.find(budget => budget.month === currentMonth);
      setCurrentBudget(current || null);

      // Load expenses from Firestore
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', user.id)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const userExpenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      
      setExpenses(userExpenses);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createBudget = async (totalBudget: number, previousSavings: number = 0) => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgetId = `${user.id}_${currentMonth}`;
    
    const newBudget: Budget = {
      id: budgetId,
      userId: user.id,
      month: currentMonth,
      totalBudget,
      previousMonthSavings: previousSavings,
      currentMonthSavings: 0,
      remaining: totalBudget,
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to Firestore
      await setDoc(doc(db, 'budgets', budgetId), newBudget);
      
      const updatedBudgets = [...budgets, newBudget];
      setBudgets(updatedBudgets);
      setCurrentBudget(newBudget);
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  };
  const updateBudget = async (budgetId: string, updates: Partial<Budget>) => {
    if (!user) return;

    try {
      // Update in Firestore
      await updateDoc(doc(db, 'budgets', budgetId), updates);
      
      const updatedBudgets = budgets.map(b => 
        b.id === budgetId ? { ...b, ...updates } : b
      );
      setBudgets(updatedBudgets);
      
      if (currentBudget?.id === budgetId) {
        setCurrentBudget({ ...currentBudget, ...updates });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !currentBudget) return;

    const expenseId = `${user.id}_${Date.now()}`;
    const newExpense: Expense = {
      ...expense,
      id: expenseId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to Firestore
      await setDoc(doc(db, 'expenses', expenseId), newExpense);
      
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);

      // Update budget remaining including lending impact
      const totalExpenses = updatedExpenses
        .filter(e => e.budgetId === currentBudget.id)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const lendingImpact = getTotalLendingImpact();
      const newRemaining = currentBudget.totalBudget - totalExpenses + lendingImpact;
      
      // If remaining is negative, deduct from savings
      if (newRemaining < 0) {
        const totalSavings = currentBudget.previousMonthSavings + currentBudget.currentMonthSavings;
        const deductFromSavings = Math.abs(newRemaining);
        
        if (totalSavings >= deductFromSavings) {
          await updateBudget(currentBudget.id, {
            remaining: 0,
            currentMonthSavings: currentBudget.currentMonthSavings - deductFromSavings
          });
        } else {
          await updateBudget(currentBudget.id, {
            remaining: -(deductFromSavings - totalSavings),
            currentMonthSavings: 0,
            previousMonthSavings: 0
          });
        }
      } else {
        await updateBudget(currentBudget.id, {
          remaining: newRemaining,
          currentMonthSavings: newRemaining
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
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

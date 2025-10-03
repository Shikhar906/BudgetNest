import { useState, useEffect } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { useLending } from '@/hooks/useLending';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Pencil, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatIndianCurrency } from '@/lib/utils';
import { CurrencyInput } from '@/components/ui/currency-input';

export const DashboardTab = () => {
  const { currentBudget, updateBudget, getCurrentMonthExpenses } = useBudget();
  const { getTotalLendingImpact } = useLending();
  const expenses = getCurrentMonthExpenses();
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  // Update remaining amount when expenses or total budget changes
  useEffect(() => {
    if (!currentBudget) return;
    
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const newRemaining = currentBudget.totalBudget - totalExpenses;
    const newCurrentSavings = newRemaining; // Current savings is whatever is remaining
    
    if (currentBudget.remaining !== newRemaining || currentBudget.currentMonthSavings !== newCurrentSavings) {
      updateBudget(currentBudget.id, {
        remaining: newRemaining,
        currentMonthSavings: newCurrentSavings
      });
    }
  }, [currentBudget?.totalBudget, expenses]);

  const handleAddMoney = () => {
    if (!currentBudget) return;
    
    const newAmount = parseFloat(newBudgetAmount);
    if (newAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Update total budget - remaining will be auto-calculated by useEffect
    updateBudget(currentBudget.id, {
      totalBudget: newAmount
    });
    
    toast.success(`Budget updated to ${formatIndianCurrency(newAmount)}`);
    setNewBudgetAmount('');
    setShowEditBudget(false);
  };

  if (!currentBudget) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Budget Found</CardTitle>
            <CardDescription>Please set up your monthly budget first</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate total expenses for current budget
  const totalExpenses = expenses
    .filter(e => e.budgetId === currentBudget.id)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Get the total budget amount (₹40,00,20,000)
  const totalBudgetAmount = Number(currentBudget.totalBudget);
  
  // Calculate percentage used (if spent ₹1,00,000 out of ₹40,00,20,000 = 0.25%)
  // If spending exceeds budget, cap at 100%
  const percentageUsed = totalBudgetAmount > 0 
    ? Math.min(100, (totalExpenses / totalBudgetAmount) * 100)
    : 0;
  
  // Calculate category-wise expenses
  const categoryData = expenses.reduce((acc: any[], expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatIndianCurrency(currentBudget.totalBudget + getTotalLendingImpact())}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setShowEditBudget(true)}
                className="hover:bg-muted"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <div className="mt-2 text-xs">
              <p className="text-muted-foreground">Monthly budget allocation</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatIndianCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatIndianCurrency(currentBudget.previousMonthSavings + currentBudget.currentMonthSavings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianCurrency(currentBudget.remaining)}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Usage</CardTitle>
          <CardDescription>
            You've spent {formatIndianCurrency(totalExpenses)} of {formatIndianCurrency(totalBudgetAmount)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress 
            value={Math.min(100, percentageUsed)} 
            className="h-3"
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {Math.min(100, ((totalExpenses / totalBudgetAmount) * 100)).toFixed(2)}% used
            </span>
            <span className="font-medium">
              {Math.max(0, (100 - ((totalExpenses / totalBudgetAmount) * 100))).toFixed(2)}% remaining
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatIndianCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Budget Dialog */}
      <Dialog open={showEditBudget} onOpenChange={setShowEditBudget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Monthly Budget</DialogTitle>
            <DialogDescription>Adjust your monthly budget allocation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">New Budget Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder={currentBudget.totalBudget.toString()}
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddMoney} className="flex-1">
                Update Budget
              </Button>
              <Button variant="outline" onClick={() => setShowEditBudget(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

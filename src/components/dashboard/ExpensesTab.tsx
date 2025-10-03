import { useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatIndianCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { EditExpenseDialog } from './EditExpenseDialog';
import { Expense, ExpenseCategory } from '@/types';

export const ExpensesTab = () => {
  const { currentBudget, addExpense, deleteExpense, updateExpense, getCurrentMonthExpenses } = useBudget();
  const expenses = getCurrentMonthExpenses();
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [formData, setFormData] = useState<{
    item: string;
    amount: string;
    category: ExpenseCategory;
    date: string;
  }>({
    item: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
  });

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBudget) {
      toast.error('No active budget found');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addExpense({
      ...formData,
      amount,
      budgetId: currentBudget.id,
    });

    toast.success('Expense added successfully');
    setFormData({
      item: '',
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddExpense(false);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    toast.success('Expense deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track your monthly expenses</p>
        </div>
        <Button onClick={() => setShowAddExpense(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No expenses recorded yet</p>
              <p className="text-sm">Add your first expense to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{expense.item}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">{formatIndianCurrency(expense.amount)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingExpense(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Record a new expense for this month</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item/Description</Label>
              <Input
                id="item"
                placeholder="Groceries"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <CurrencyInput
                id="amount"
                placeholder="500"
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
                required
              >
                <SelectTrigger className="text-muted-foreground">
                  <SelectValue placeholder="Click here to choose expense category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Expense
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddExpense(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          onSave={updateExpense}
        />
      )}
    </div>
  );
};

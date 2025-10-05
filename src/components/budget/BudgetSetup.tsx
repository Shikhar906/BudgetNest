import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudget } from '@/hooks/useBudget';
import { toast } from 'sonner';
import { TrendingUp } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { formatIndianCurrency } from '@/lib/utils';

interface BudgetSetupProps {
  onComplete: () => void;
}

export const BudgetSetup = ({ onComplete }: BudgetSetupProps) => {
  const { createBudget, getLastMonthSavings } = useBudget();
  const [totalBudget, setTotalBudget] = useState('');
  const [previousSavings, setPreviousSavings] = useState('');
  const [autoSavings, setAutoSavings] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Automatically fetch previous month's savings
  useEffect(() => {
    const fetchPreviousSavings = async () => {
      try {
        const savings = await getLastMonthSavings();
        setAutoSavings(savings);
        setPreviousSavings(savings.toString());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching previous savings:', error);
        setLoading(false);
      }
    };
    
    fetchPreviousSavings();
  }, [getLastMonthSavings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const budget = parseFloat(totalBudget);
    const savings = previousSavings ? parseFloat(previousSavings) : 0;

    if (budget <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    if (savings < 0) {
      toast.error('Previous savings cannot be negative');
      return;
    }

    createBudget(budget, savings);
    toast.success('Budget created successfully!');
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-success rounded-2xl">
              <TrendingUp className="h-8 w-8 text-success-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Setup Your Budget</CardTitle>
          <CardDescription>
            Let's start by setting up your monthly budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Monthly Budget (₹)</Label>
              <CurrencyInput
                id="totalBudget"
                placeholder="50,000"
                value={totalBudget}
                onChange={setTotalBudget}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your total available money for this month
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="previousSavings">Previous Savings (₹)</Label>
              <CurrencyInput
                id="previousSavings"
                placeholder="0"
                value={previousSavings}
                onChange={setPreviousSavings}
              />
              {autoSavings > 0 && (
                <p className="text-xs text-success">
                  ✓ Auto-detected {formatIndianCurrency(autoSavings)} from last month
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Savings carried over from previous month
              </p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Available for expenses:</span>
                <span className="text-lg font-bold text-primary">
                  {formatIndianCurrency(totalBudget ? parseFloat(totalBudget) : 0)}
                </span>
              </div>
              {previousSavings && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Total savings:</span>
                  <span className="text-sm font-bold text-success">
                    {formatIndianCurrency(previousSavings ? parseFloat(previousSavings) : 0)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button type="submit" className="w-full" size="lg">
              Create Budget
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

import { useBudget } from '@/hooks/useBudget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/utils';

export const MonthlyTab = () => {
  const { budgets } = useBudget();

  const sortedBudgets = [...budgets].sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  );

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monthly Budgets</h1>
        <p className="text-muted-foreground">View and compare your budget history</p>
      </div>

      {sortedBudgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No budget history yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedBudgets.map((budget) => {
            const spent = budget.totalBudget - budget.remaining;
            const spentPercentage = ((spent / budget.totalBudget) * 100).toFixed(2);
            const isCurrent = budget.month === new Date().toISOString().slice(0, 7);

            return (
              <Card key={budget.id} className={isCurrent ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{formatMonth(budget.month)}</CardTitle>
                    {isCurrent && <Badge>Current</Badge>}
                  </div>
                  <CardDescription>Budget Summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Budget</span>
                      <span className="font-medium">{formatIndianCurrency(budget.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Savings</span>
                      <span className="font-medium text-success">{formatIndianCurrency(budget.previousMonthSavings + budget.currentMonthSavings)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium text-destructive">{formatIndianCurrency(spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">{formatIndianCurrency(budget.remaining)}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Budget Used</span>
                      <span className="text-sm font-bold">{spentPercentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

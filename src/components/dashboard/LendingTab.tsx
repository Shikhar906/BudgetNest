import { useState } from 'react';
import { useLending } from '@/hooks/useLending';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatIndianCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';

export const LendingTab = () => {
  const { records, addRecord, toggleSettled, deleteRecord } = useLending();
  const [showAddRecord, setShowAddRecord] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'lent' as 'lent' | 'borrowed',
    amount: '',
    personName: '',
    phoneNumber: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addRecord({
      ...formData,
      amount,
    });

    toast.success('Record added successfully');
    setFormData({
      type: 'lent',
      amount: '',
      personName: '',
      phoneNumber: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddRecord(false);
  };

  const totalLent = records
    .filter(r => r.type === 'lent' && !r.settled)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalBorrowed = records
    .filter(r => r.type === 'borrowed' && !r.settled)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lending & Borrowing</h1>
          <p className="text-muted-foreground">Track money lent to and borrowed from others</p>
        </div>
        <Button onClick={() => setShowAddRecord(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Lent</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatIndianCurrency(totalLent)}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount to receive</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Borrowed</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatIndianCurrency(totalBorrowed)}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount to pay</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {records.length} {records.length === 1 ? 'record' : 'records'} in total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No lending/borrowing records yet</p>
              <p className="text-sm">Add your first record to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} className={record.settled ? 'opacity-50' : ''}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{record.personName}</TableCell>
                    <TableCell>{record.phoneNumber}</TableCell>
                    <TableCell>
                      <Badge variant={record.type === 'lent' ? 'default' : 'destructive'}>
                        {record.type === 'lent' ? 'Lent' : 'Borrowed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatIndianCurrency(record.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={record.settled}
                          onCheckedChange={() => toggleSettled(record.id)}
                        />
                        <span className="text-sm">{record.settled ? 'Settled' : 'Pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRecord(record.id)}
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

      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lending/Borrowing Record</DialogTitle>
            <DialogDescription>Track money you've lent or borrowed</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'lent' | 'borrowed') => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lent">Lent (Money Given)</SelectItem>
                  <SelectItem value="borrowed">Borrowed (Money Taken)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personName">Person's Name</Label>
              <Input
                id="personName"
                placeholder="John Doe"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
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
                Add Record
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddRecord(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

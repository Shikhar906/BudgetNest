import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface EditExpenseDialogProps {
  expense: {
    id: string;
    item: string;
    amount: number;
    category: string;
    date: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExpense: any) => void;
}

export function EditExpenseDialog({
  expense,
  isOpen,
  onClose,
  onSave,
}: EditExpenseDialogProps) {
  const [editedExpense, setEditedExpense] = useState({
    ...expense,
    amount: expense.amount.toString(),
  });

  const handleSave = () => {
    onSave({
      ...editedExpense,
      amount: parseFloat(editedExpense.amount),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-item">Item/Description</Label>
            <Input
              id="edit-item"
              value={editedExpense.item}
              onChange={(e) =>
                setEditedExpense({ ...editedExpense, item: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount (₹)</Label>
            <CurrencyInput
              id="edit-amount"
              value={editedExpense.amount}
              onChange={(value) =>
                setEditedExpense({ ...editedExpense, amount: value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={editedExpense.category}
              onValueChange={(value) =>
                setEditedExpense({ ...editedExpense, category: value })
              }
            >
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={editedExpense.date}
              onChange={(e) =>
                setEditedExpense({ ...editedExpense, date: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
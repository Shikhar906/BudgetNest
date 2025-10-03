import { useState, useEffect } from 'react';
import { LendingBorrowing } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useLending = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<LendingBorrowing[]>([]);

  useEffect(() => {
    if (!user) return;

    const data = localStorage.getItem(`lending_${user.id}`);
    if (data) {
      setRecords(JSON.parse(data));
    }
  }, [user]);

  const addRecord = (record: Omit<LendingBorrowing, 'id' | 'userId' | 'createdAt' | 'settled'>) => {
    if (!user) return;

    const newRecord: LendingBorrowing = {
      ...record,
      id: `lending_${Date.now()}`,
      userId: user.id,
      settled: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    localStorage.setItem(`lending_${user.id}`, JSON.stringify(updated));
  };

  const toggleSettled = (id: string) => {
    if (!user) return;

    const updated = records.map(r =>
      r.id === id ? { ...r, settled: !r.settled } : r
    );
    setRecords(updated);
    localStorage.setItem(`lending_${user.id}`, JSON.stringify(updated));
  };

  const deleteRecord = (id: string) => {
    if (!user) return;

    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem(`lending_${user.id}`, JSON.stringify(updated));
  };

  const getTotalLendingImpact = () => {
    // Only consider unsettled transactions
    const unsettledRecords = records.filter(r => !r.settled);
    
    // Sum up the impact:
    // - When lending (type: 'lend'), subtract from budget
    // - When borrowing (type: 'borrow'), add to budget
    return unsettledRecords.reduce((sum, record) => {
      if (record.type === 'lent') {
        return sum - record.amount;
      } else { // type === 'borrowed'
        return sum + record.amount;
      }
    }, 0);
  };

  return {
    records,
    addRecord,
    toggleSettled,
    deleteRecord,
    getTotalLendingImpact,
  };
};

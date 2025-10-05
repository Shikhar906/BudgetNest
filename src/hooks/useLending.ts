import { useState, useEffect } from 'react';
import { LendingBorrowing } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, setDoc, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useLending = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<LendingBorrowing[]>([]);

  useEffect(() => {
    if (user) {
      loadLendingData();
    } else {
      setRecords([]);
    }
  }, [user]);

  const loadLendingData = async () => {
    if (!user) return;

    try {
      const lendingQuery = query(
        collection(db, 'lending'),
        where('userId', '==', user.id)
      );
      const lendingSnapshot = await getDocs(lendingQuery);
      const userLending = lendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LendingBorrowing[];
      
      setRecords(userLending);
    } catch (error) {
      console.error('Error loading lending data:', error);
    }
  };

  const addRecord = async (record: Omit<LendingBorrowing, 'id' | 'userId' | 'createdAt' | 'settled'>) => {
    if (!user) return;

    const recordId = `${user.id}_${Date.now()}`;
    const newRecord: LendingBorrowing = {
      ...record,
      id: recordId,
      userId: user.id,
      settled: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'lending', recordId), newRecord);
      const updated = [...records, newRecord];
      setRecords(updated);
    } catch (error) {
      console.error('Error adding lending record:', error);
      throw error;
    }
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

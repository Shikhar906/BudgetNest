import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SignIn } from '@/components/auth/SignIn';
import { SignUp } from '@/components/auth/SignUp';
import { BudgetSetup } from '@/components/budget/BudgetSetup';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { ExpensesTab } from '@/components/dashboard/ExpensesTab';
import { MonthlyTab } from '@/components/dashboard/MonthlyTab';
import { SavingsTab } from '@/components/dashboard/SavingsTab';
import { LendingTab } from '@/components/dashboard/LendingTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { useBudget } from '@/hooks/useBudget';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { currentBudget } = useBudget();
  const [showSignIn, setShowSignIn] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Check if user needs budget setup after authentication
    if (isAuthenticated && !currentBudget) {
      setNeedsSetup(true);
    } else {
      setNeedsSetup(false);
    }
  }, [isAuthenticated, currentBudget]);

  // Show authentication screens
  if (!isAuthenticated) {
    return showSignIn ? (
      <SignIn onToggle={() => setShowSignIn(false)} />
    ) : (
      <SignUp onToggle={() => setShowSignIn(true)} />
    );
  }

  // Show budget setup for new users
  if (needsSetup) {
    return <BudgetSetup onComplete={() => setNeedsSetup(false)} />;
  }

  // Show dashboard with tabs
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'expenses':
        return <ExpensesTab />;
      case 'monthly':
        return <MonthlyTab />;
      case 'savings':
        return <SavingsTab />;
      case 'lending':
        return <LendingTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;

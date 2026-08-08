import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatCards from './components/StatCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionList from './components/TransactionList';
import BudgetTracker from './components/BudgetTracker';
import TransactionModal from './components/TransactionModal';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import AiAssistantModal from './components/AiAssistantModal';
import AuthGate from './components/AuthGate';

import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from './utils/sampleData';
import api, { apiService } from './services/api';
import { convertCurrency, fetchLiveExchangeRates } from './utils/formatters';

const DEFAULT_USER = {
  id: 101,
  name: 'Prem Agrawal',
  email: 'agrawalprem00@gmail.com',
  role: 'PRO_MEMBER',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  createdAt: 'Aug 2026'
};

const DEFAULT_SAVINGS_GOALS = [
  { id: 1, title: '🏖️ Summer Vacation', savedAmount: 0, targetAmount: 2000, currency: 'USD' },
  { id: 2, title: '💻 New Work Laptop', savedAmount: 0, targetAmount: 2400, currency: 'USD' },
  { id: 3, title: '🛡️ Emergency Fund', savedAmount: 0, targetAmount: 5000, currency: 'USD' }
];

const getVirtualUserId = () => {
  let virtualId = localStorage.getItem('spendwise_virtual_user_id');
  if (!virtualId) {
    virtualId = String(Math.floor(Math.random() * 900000000) + 100000000);
    localStorage.setItem('spendwise_virtual_user_id', virtualId);
  }
  return Number(virtualId);
};

const getDemoUser = () => {
  const vId = getVirtualUserId();
  return {
    ...DEFAULT_USER,
    id: vId
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('spendwise_theme') === 'dark' || true; // Dark mode by default
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('spendwise_currency') || 'USD';
  });
  
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id === 101 || parsed.id === '101' || parsed.id === 1 || parsed.id === '1' || parsed.email === 'alex.morgan@spendwise.io' || parsed.email === 'bansalprem900@gmail.com') {
          const demoUser = getDemoUser();
          localStorage.setItem('spendwise_user', JSON.stringify(demoUser));
          return demoUser;
        }
        return parsed;
      }
      const demoUser = getDemoUser();
      localStorage.setItem('spendwise_user', JSON.stringify(demoUser));
      return demoUser;
    } catch (e) {
      return getDemoUser();
    }
  });

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isBackend, setIsBackend] = useState(false);

  const [savingsGoals, setSavingsGoals] = useState(() => {
    const isDemoUser = (user?.id === 101 || user?.id === '101' || user?.id === 1 || user?.id === '1');
    const storageKey = `spendwise_savings_goals_${user?.id || 101}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      return isDemoUser ? DEFAULT_SAVINGS_GOALS : [];
    } catch (e) {
      return isDemoUser ? DEFAULT_SAVINGS_GOALS : [];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync Dark Mode Class & Fetch Real-Time Live FX Rates
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    fetchLiveExchangeRates();
  }, [darkMode]);

  // Load Transactions, Budgets & Savings Goals scoped by User ID
  const loadData = async () => {
    if (!user) return;
    const isVirtualUser = user.id !== 101 && user.id !== 1 && String(user.id).length >= 8;

    let txRes = await apiService.getTransactions({}, user.id);
    let txData = txRes.data || [];

    // Auto-seed default transactions if virtual user has no database transactions yet
    if (isVirtualUser && txRes.isBackend && txData.length === 0) {
      for (const tx of INITIAL_TRANSACTIONS) {
        const txPayload = { ...tx, id: null };
        await apiService.createTransaction(txPayload, user.id);
      }
      txRes = await apiService.getTransactions({}, user.id);
      txData = txRes.data || [];
    }

    setTransactions(txData);
    setIsBackend(txRes.isBackend);

    let bRes = await apiService.getBudgets(user.id);
    let budgetData = bRes || [];

    // Auto-seed default budgets into database if virtual user has not seeded budgets yet
    const budgetSeededKey = `spendwise_budgets_seeded_${user.id}`;
    if (isVirtualUser && txRes.isBackend && !localStorage.getItem(budgetSeededKey)) {
      for (const b of INITIAL_BUDGETS) {
        await apiService.updateBudget(b.category, b.monthlyLimit, user.id, 'USD', 'MONTHLY');
      }
      localStorage.setItem(budgetSeededKey, 'true');
      bRes = await apiService.getBudgets(user.id);
      budgetData = bRes || [];
    }

    setBudgets(budgetData);

    try {
      let cloudGoals = await apiService.getSavingsGoals(user.id);

      // Auto-seed default savings goals if virtual user has no database goals yet
      if (isVirtualUser && txRes.isBackend && (!cloudGoals || cloudGoals.length === 0)) {
        for (const goal of DEFAULT_SAVINGS_GOALS) {
          const goalPayload = { title: goal.title, targetAmount: goal.targetAmount, savedAmount: goal.savedAmount, currency: goal.currency };
          await apiService.createSavingsGoal(user.id, goalPayload);
        }
        cloudGoals = await apiService.getSavingsGoals(user.id);
      }

      if (cloudGoals && Array.isArray(cloudGoals)) {
        setSavingsGoals(cloudGoals);
        const storageKey = `spendwise_savings_goals_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(cloudGoals));
      }
    } catch (e) {
      console.warn('[SpendWise] Failed to load/seed savings goals in loadData:', e.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Continuous Real-Time Data Synchronization (polls every 8 seconds)
  useEffect(() => {
    if (!user?.id) return;

    const intervalId = setInterval(async () => {
      try {
        const txRes = await apiService.getTransactions({}, user.id);
        if (txRes && Array.isArray(txRes.data)) {
          setTransactions(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(txRes.data)) {
              return txRes.data;
            }
            return prev;
          });
          setIsBackend(txRes.isBackend);
        }

        const bRes = await apiService.getBudgets(user.id);
        if (bRes && Array.isArray(bRes)) {
          setBudgets(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(bRes)) {
              return bRes;
            }
            return prev;
          });
        }

        const gRes = await apiService.getSavingsGoals(user.id);
        if (gRes && Array.isArray(gRes)) {
          setSavingsGoals(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(gRes)) {
              return gRes;
            }
            return prev;
          });
        }
      } catch (e) {
        console.warn('[SpendWise Continuous Sync] Background sync skipped:', e.message);
      }
    }, 8000); // 8-second continuous polling interval

    return () => clearInterval(intervalId);
  }, [user?.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    localStorage.setItem('spendwise_user', JSON.stringify(userObj));
    showToast(`👋 Welcome, ${userObj.name}! Workspace loaded.`);
  };

  const handleLogout = () => {
    const virtualId = localStorage.getItem('spendwise_virtual_user_id');
    if (virtualId) {
      const vId = Number(virtualId);
      // Clean up the virtual user's data from PostgreSQL database to keep it clean!
      apiService.resetSampleData(vId);
      try {
        apiService.getSavingsGoals(vId).then(goals => {
          if (Array.isArray(goals)) {
            goals.forEach(g => apiService.deleteSavingsGoal(g.id));
          }
        });
      } catch (e) {}

      localStorage.removeItem(`spendwise_transactions_${vId}`);
      localStorage.removeItem(`spendwise_budgets_${vId}`);
      localStorage.removeItem(`spendwise_savings_goals_${vId}`);
      localStorage.removeItem(`spendwise_deleted_goals_${vId}`);
      localStorage.removeItem(`spendwise_budgets_seeded_${vId}`);
      localStorage.removeItem('spendwise_virtual_user_id');
    }

    localStorage.removeItem('spendwise_transactions_101');
    localStorage.removeItem('spendwise_budgets_101');
    localStorage.removeItem('spendwise_savings_goals_101');
    localStorage.removeItem('spendwise_deleted_goals_101');
    localStorage.removeItem('spendwise_transactions_1');
    localStorage.removeItem('spendwise_budgets_1');
    localStorage.removeItem('spendwise_savings_goals_1');
    localStorage.removeItem('spendwise_deleted_goals_1');

    setUser(null);
    localStorage.removeItem('spendwise_user');
    setTransactions([]);
    setBudgets([]);
    showToast('🔒 Signed out of SpendWise account');
  };

  // Synchronize Active Savings Goals when deposit transactions are updated or deleted
  const syncSavingsGoalsWithTransaction = (userId, action, transaction, oldTransaction = null) => {
    if (!userId || !transaction) return;

    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_savings_goals_${userId}`;
    let goals = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) goals = JSON.parse(saved);
    } catch (e) {
      return;
    }

    if (!goals || goals.length === 0) return;

    // Match transaction title or notes against savings goal titles
    const titleLower = (transaction.title || '').toLowerCase();
    const notesLower = (transaction.notes || '').toLowerCase();

    let matchedIdx = goals.findIndex(g => {
      const cleanGoalTitle = (g.title || '').toLowerCase().replace(/^[^\w\s]+/, '').trim();
      return cleanGoalTitle && (titleLower.includes(cleanGoalTitle) || notesLower.includes(cleanGoalTitle));
    });

    if (matchedIdx === -1) return;

    const matchedGoal = { ...goals[matchedIdx] };

    if (action === 'DELETE') {
      const amountInUSD = convertCurrency(transaction.amount, transaction.currency || 'USD', 'USD');
      matchedGoal.savedAmount = Math.max(0, (matchedGoal.savedAmount || 0) - amountInUSD);
      showToast(`🐷 Active Savings Goal "${matchedGoal.title}" updated after transaction deletion!`);
    } else if (action === 'UPDATE' && oldTransaction) {
      const oldInUSD = convertCurrency(oldTransaction.amount, oldTransaction.currency || 'USD', 'USD');
      const newInUSD = convertCurrency(transaction.amount, transaction.currency || 'USD', 'USD');
      const diff = newInUSD - oldInUSD;
      matchedGoal.savedAmount = Math.max(0, (matchedGoal.savedAmount || 0) + diff);
      showToast(`🐷 Active Savings Goal "${matchedGoal.title}" updated after transaction edit!`);
    }

    goals[matchedIdx] = matchedGoal;
    setSavingsGoals([...goals]);
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch (e) {}
  };

  // Direct Create Transaction (guaranteed non-edit path)
  const handleCreateTransactionDirect = async (data) => {
    if (!user) return;
    const dataToSave = {
      ...data,
      amount: Number(data.amount),
      currency: data.currency || currency || 'USD'
    };
    await apiService.createTransaction(dataToSave, user.id);
    showToast('🎉 New transaction recorded!');
    await loadData();
  };

  // Add / Edit Transaction
  const handleSaveTransaction = async (data) => {
    if (!user) return;

    const dataToSave = {
      ...data,
      amount: Number(data.amount),
      currency: data.currency || currency || 'USD'
    };

    if (editingTransaction) {
      await apiService.updateTransaction(editingTransaction.id, dataToSave, user.id);
      syncSavingsGoalsWithTransaction(user.id, 'UPDATE', dataToSave, editingTransaction);
      showToast('✅ Transaction updated successfully');
    } else {
      await apiService.createTransaction(dataToSave, user.id);
      showToast('🎉 New transaction recorded!');
    }
    setEditingTransaction(null);
    await loadData();
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (!user) return;
    const targetTx = transactions.find(t => String(t.id) === String(id));
    if (window.confirm('Delete this transaction record?')) {
      await apiService.deleteTransaction(id, user.id);
      if (targetTx) {
        syncSavingsGoalsWithTransaction(user.id, 'DELETE', targetTx);
      }
      showToast('🗑️ Transaction deleted');
      loadData();
    }
  };

  const handleEditTransaction = (item) => {
    setEditingTransaction(item);
    setIsAddModalOpen(true);
  };

  const handleUpdateBudget = async (category, monthlyLimit, period = 'MONTHLY', fedCurrency = currency) => {
    if (!user) return;
    await apiService.updateBudget(category, monthlyLimit, user.id, fedCurrency, period);
    showToast(`🎯 Budget cap for ${category} updated in ${fedCurrency}`);
    loadData();
  };

  const handleResetData = async () => {
    if (!user) return;
    showToast('⏳ Reloading all sample category transactions...');
    await apiService.resetSampleData(user.id);
    await loadData();
    showToast('🔄 All 11 category sample transactions reloaded!');
  };

  // Sync profile picture & user details with cloud database across all devices
  useEffect(() => {
    if (user?.id) {
      const avatarKey = `spendwise_avatar_${user.id}`;
      const savedLocalAvatar = localStorage.getItem(avatarKey);
      if (savedLocalAvatar && user.avatarUrl !== savedLocalAvatar) {
        setUser(prev => ({ ...prev, avatarUrl: savedLocalAvatar }));
      }

      apiService.getUserProfile(user.id).then(profile => {
        if (profile && profile.avatarUrl) {
          setUser(prev => {
            const finalAvatar = savedLocalAvatar || profile.avatarUrl;
            const merged = { ...prev, ...profile, avatarUrl: finalAvatar };
            localStorage.setItem('spendwise_user', JSON.stringify(merged));
            return merged;
          });
        }
      });
    }
  }, [user?.id]);

  const handleUpdateAvatar = async (newAvatarUrl) => {
    if (!user) return;
    const avatarKey = `spendwise_avatar_${user.id}`;
    localStorage.setItem(avatarKey, newAvatarUrl);

    const updatedUser = { ...user, avatarUrl: newAvatarUrl };
    setUser(updatedUser);
    localStorage.setItem('spendwise_user', JSON.stringify(updatedUser));
    showToast('📸 Profile picture updated successfully!');

    // Persist updated photo to backend cloud database
    try {
      const res = await apiService.updateUserProfile(user.id, { avatarUrl: newAvatarUrl });
      if (res && res.avatarUrl) {
        const synced = { ...updatedUser, avatarUrl: res.avatarUrl };
        setUser(synced);
        localStorage.setItem('spendwise_user', JSON.stringify(synced));
      }
    } catch (e) {
      console.warn('[SpendWise] Avatar cloud sync failed:', e.message);
    }
  };

  // Enforce Auth Gate for Signed-Out Visitors
  if (!user) {
    return (
      <div className="app-container">
        <AuthGate onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAddModal={() => { setEditingTransaction(null); setIsAddModalOpen(true); }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isBackend={isBackend}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onLogout={handleLogout}
        budgets={budgets}
        transactions={transactions}
      />

      {/* Main View Content by Tab */}
      <main>
        {activeTab !== 'budgets' && (
          <StatCards transactions={transactions} currency={currency} />
        )}

        {activeTab === 'dashboard' && (
          <>
            <AnalyticsCharts transactions={transactions} currency={currency} darkMode={darkMode} />
            <TransactionList
              transactions={transactions}
              currency={currency}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onResetData={handleResetData}
            />
          </>
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            currency={currency}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts transactions={transactions} currency={currency} darkMode={darkMode} />
        )}

        {activeTab === 'budgets' && (
          <BudgetTracker
            userId={user?.id}
            budgets={budgets}
            currency={currency}
            onUpdateBudget={handleUpdateBudget}
            transactions={transactions}
            onCreateTransaction={handleCreateTransactionDirect}
            savingsGoals={savingsGoals}
            setSavingsGoals={setSavingsGoals}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currency={currency}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        onResetData={handleResetData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={handleLogout}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        transactions={transactions}
        budgets={budgets}
        currency={currency}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--bg-card-solid)',
          color: 'var(--text-primary)',
          border: '1px solid var(--primary)',
          boxShadow: 'var(--shadow-lg)',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          zIndex: 1100,
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(12px)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Glassmorphism Author Footer */}
      <footer style={{
        marginTop: '3rem',
        padding: '1.5rem 1rem',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card-solid)',
        backdropFilter: 'blur(12px)',
        textAlign: 'center',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
      }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          SpendWise Expense Tracker • Designed & Developed by Prem Agrawal
        </div>
        <div className="flex items-center gap-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>📧 Contact: <a href="mailto:bansalprem900@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>bansalprem900@gmail.com</a></span>
          <span>•</span>
          <span>Spring Boot REST Engine + React Vite Web UI</span>
        </div>
      </footer>

    </div>
  );
}

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
        if (parsed.email === 'alex.morgan@spendwise.io' || parsed.email === 'bansalprem900@gmail.com') {
          const updated = { ...DEFAULT_USER, ...parsed, name: 'Prem Agrawal', email: 'agrawalprem00@gmail.com' };
          localStorage.setItem('spendwise_user', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
      localStorage.setItem('spendwise_user', JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch (e) {
      return DEFAULT_USER;
    }
  });

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isBackend, setIsBackend] = useState(false);

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

  // Load Transactions & Budgets scoped by User ID
  const loadData = async () => {
    if (!user) return;
    const txRes = await apiService.getTransactions({}, user.id);
    setTransactions(txRes.data || []);
    setIsBackend(txRes.isBackend);

    const bRes = await apiService.getBudgets(user.id);
    setBudgets(bRes || []);
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

    const matchedGoal = goals[matchedIdx];

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

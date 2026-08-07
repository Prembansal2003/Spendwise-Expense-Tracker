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
import { apiService } from './services/api';
import { convertCurrency } from './utils/formatters';

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
          localStorage.setItem('spendwise_user', JSON.stringify(DEFAULT_USER));
          return DEFAULT_USER;
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

  // Sync Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  // Add / Edit Transaction
  const handleSaveTransaction = async (data) => {
    if (!user) return;

    // Convert entered amount in active view currency -> USD base storage currency
    const usdAmount = convertCurrency(data.amount, currency, 'USD');
    const dataInUSD = {
      ...data,
      amount: usdAmount,
      currency: 'USD'
    };

    if (editingTransaction) {
      await apiService.updateTransaction(editingTransaction.id, dataInUSD, user.id);
      showToast('✅ Transaction updated successfully');
    } else {
      await apiService.createTransaction(dataInUSD, user.id);
      showToast('🎉 New transaction recorded!');
    }
    setEditingTransaction(null);
    await loadData();
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (!user) return;
    if (window.confirm('Delete this transaction record?')) {
      await apiService.deleteTransaction(id, user.id);
      showToast('🗑️ Transaction deleted');
      loadData();
    }
  };

  const handleEditTransaction = (item) => {
    setEditingTransaction(item);
    setIsAddModalOpen(true);
  };

  const handleUpdateBudget = async (category, monthlyLimit) => {
    if (!user) return;
    await apiService.updateBudget(category, monthlyLimit, user.id, currency);
    showToast(`🎯 Budget cap for ${category} updated`);
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
      apiService.getUserProfile(user.id).then(profile => {
        if (profile && profile.avatarUrl) {
          setUser(prev => {
            // Keep local custom avatarUrl if profile returned default sample avatar
            const isLocalCustom = prev?.avatarUrl && !prev.avatarUrl.includes('unsplash.com');
            const finalAvatar = isLocalCustom ? prev.avatarUrl : profile.avatarUrl;
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

        {activeTab === 'budgets' && (
          <BudgetTracker
            budgets={budgets}
            currency={currency}
            onUpdateBudget={handleUpdateBudget}
            transactions={transactions}
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
          <span>📧 Contact: <a href="mailto:agrawalprem00@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>agrawalprem00@gmail.com</a></span>
          <span>•</span>
          <span>Spring Boot REST Engine + React Vite Web UI</span>
        </div>
      </footer>

    </div>
  );
}

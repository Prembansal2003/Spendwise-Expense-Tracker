import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatCards from './components/StatCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import BudgetTracker from './components/BudgetTracker';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import AiAssistantModal from './components/AiAssistantModal';
import AuthGate from './components/AuthGate';
import { apiService } from './services/api';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from './utils/sampleData';
import { fetchLiveExchangeRates } from './utils/formatters';

const DEFAULT_USER = {
  id: 101,
  name: 'Prem Agrawal',
  email: 'bansalprem900@gmail.com',
  role: 'PRO_MEMBER',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  createdAt: 'Aug 2026'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [ratesTick, setRatesTick] = useState(0);

  // Fetch Live Real-Time Market Exchange Rates on startup
  useEffect(() => {
    fetchLiveExchangeRates().then(updated => {
      if (updated) {
        setRatesTick(prev => prev + 1);
      }
    });
  }, []);
  
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'alex.morgan@spendwise.io') {
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
    setTransactions(txRes.data);
    setIsBackend(txRes.isBackend);

    const bRes = await apiService.getBudgets(user.id);
    setBudgets(bRes);
  };

  useEffect(() => {
    // Ensure fresh sample dataset for Prem Agrawal if needed
    if (user?.id === 101) {
      const storageKey = `spendwise_transactions_${user.id}`;
      const budgetKey = `spendwise_budgets_${user.id}`;
      const existingTx = localStorage.getItem(storageKey);
      if (!existingTx || existingTx.includes('Tech Corp Salary') || existingTx.includes('Alex Morgan')) {
        localStorage.setItem(storageKey, JSON.stringify(INITIAL_TRANSACTIONS));
        localStorage.setItem(budgetKey, JSON.stringify(INITIAL_BUDGETS));
      }
    }
    loadData();
  }, [user?.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

    // Store the raw amount in the currently selected currency — no lossy conversion
    const dataWithCurrency = { ...data, currency };

    if (editingTransaction) {
      await apiService.updateTransaction(editingTransaction.id, dataWithCurrency, user.id);
      showToast('✅ Transaction updated successfully');
    } else {
      await apiService.createTransaction(dataWithCurrency, user.id);
      showToast('🎉 New transaction recorded!');
    }
    setEditingTransaction(null);
    loadData();
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

  const handleResetData = () => {
    if (!user) return;
    const storageKey = `spendwise_transactions_${user.id}`;
    const budgetKey = `spendwise_budgets_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(budgetKey, JSON.stringify(INITIAL_BUDGETS));
    loadData();
    showToast('🔄 All category transactions reloaded!');
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
            />
          </>
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            currency={currency}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
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
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.875rem',
          zIndex: 2000,
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Modern Footer with Prem Agrawal Name & Email */}
      <footer className="glass-card" style={{
        textAlign: 'center',
        margin: '2.5rem 0 1rem 0',
        padding: '1.25rem 1rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
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

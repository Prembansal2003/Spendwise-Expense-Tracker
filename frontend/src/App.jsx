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
import { apiService } from './services/api';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from './utils/sampleData';

const DEFAULT_USER = {
  id: 101,
  name: 'Alex Morgan',
  email: 'alex.morgan@spendwise.io',
  role: 'PRO_MEMBER',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  createdAt: 'Aug 2026'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('USD');
  
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
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

  // Load Transactions & Budgets
  const loadData = async () => {
    const txRes = await apiService.getTransactions();
    setTransactions(txRes.data);
    setIsBackend(txRes.isBackend);

    const bRes = await apiService.getBudgets();
    setBudgets(bRes);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    localStorage.setItem('spendwise_user', JSON.stringify(userObj));
    showToast(`👋 Welcome back, ${userObj.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('spendwise_user');
    showToast('👋 You have been logged out');
  };

  // Add / Edit Transaction
  const handleSaveTransaction = async (data) => {
    if (editingTransaction) {
      await apiService.updateTransaction(editingTransaction.id, data);
      showToast('✅ Transaction updated successfully');
    } else {
      await apiService.createTransaction(data);
      showToast('🎉 New transaction recorded!');
    }
    setEditingTransaction(null);
    loadData();
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction record?')) {
      await apiService.deleteTransaction(id);
      showToast('🗑️ Transaction deleted');
      loadData();
    }
  };

  const handleEditTransaction = (item) => {
    setEditingTransaction(item);
    setIsAddModalOpen(true);
  };

  const handleUpdateBudget = async (category, monthlyLimit) => {
    await apiService.updateBudget(category, monthlyLimit);
    showToast(`🎯 Budget cap for ${category} updated`);
    loadData();
  };

  const handleResetData = () => {
    localStorage.setItem('spendwise_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem('spendwise_budgets', JSON.stringify(INITIAL_BUDGETS));
    loadData();
    showToast('🔄 Demo dataset reloaded!');
  };

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
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
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

      <footer style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        SpendWise Full Stack Java Application • Spring Boot REST API + React Vite Web UI
      </footer>

    </div>
  );
}

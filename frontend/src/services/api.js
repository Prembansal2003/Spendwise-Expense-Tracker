import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from '../utils/sampleData';

const API_BASE_URL = '/api/v1';

// Helper to check local storage
const getLocalData = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocalData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
};

export const apiService = {
  // Fetch transactions from Java REST API or LocalStorage fallback
  async getTransactions(filters = {}) {
    try {
      const query = new URLSearchParams();
      if (filters.type) query.append('type', filters.type);
      if (filters.category) query.append('category', filters.category);
      if (filters.search) query.append('search', filters.search);

      const res = await fetch(`${API_BASE_URL}/transactions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return { data, isBackend: true };
      }
    } catch (err) {
      // Backend not running, use client fallback
    }

    // Local fallback
    let list = getLocalData('spendwise_transactions', INITIAL_TRANSACTIONS);
    if (filters.type) {
      list = list.filter(t => t.type === filters.type);
    }
    if (filters.category) {
      list = list.filter(t => t.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }
    return { data: list, isBackend: false };
  },

  async createTransaction(transaction) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}

    // Fallback
    const list = getLocalData('spendwise_transactions', INITIAL_TRANSACTIONS);
    const newTx = { ...transaction, id: Date.now() };
    const updated = [newTx, ...list];
    setLocalData('spendwise_transactions', updated);
    return newTx;
  },

  async updateTransaction(id, transaction) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}

    // Fallback
    const list = getLocalData('spendwise_transactions', INITIAL_TRANSACTIONS);
    const updated = list.map(t => (t.id === id ? { ...transaction, id } : t));
    setLocalData('spendwise_transactions', updated);
    return { ...transaction, id };
  },

  async deleteTransaction(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return true;
    } catch (err) {}

    // Fallback
    const list = getLocalData('spendwise_transactions', INITIAL_TRANSACTIONS);
    const updated = list.filter(t => t.id !== id);
    setLocalData('spendwise_transactions', updated);
    return true;
  },

  // Get Budgets
  async getBudgets() {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/progress`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}

    // Fallback calculation
    const budgets = getLocalData('spendwise_budgets', INITIAL_BUDGETS);
    const transactions = getLocalData('spendwise_transactions', INITIAL_TRANSACTIONS);

    return budgets.map(b => {
      const actualSpend = transactions
        .filter(t => t.type === 'EXPENSE' && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const limit = Number(b.monthlyLimit || 0);
      const remaining = limit - actualSpend;
      const pct = limit > 0 ? (actualSpend / limit) * 100 : 0;

      let status = 'NORMAL';
      if (pct > 100) status = 'EXCEEDED';
      else if (pct >= 80) status = 'WARNING';

      return {
        id: b.id,
        category: b.category,
        monthlyLimit: limit,
        currentSpend: actualSpend,
        remainingAmount: remaining,
        percentageUsed: Math.round(pct * 10) / 10,
        status
      };
    });
  },

  async updateBudget(category, monthlyLimit) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, monthlyLimit })
      });
      if (res.ok) return await res.json();
    } catch (err) {}

    // Fallback
    const budgets = getLocalData('spendwise_budgets', INITIAL_BUDGETS);
    const existingIdx = budgets.findIndex(b => b.category === category);
    if (existingIdx >= 0) {
      budgets[existingIdx].monthlyLimit = Number(monthlyLimit);
    } else {
      budgets.push({ id: Date.now(), category, monthlyLimit: Number(monthlyLimit) });
    }
    setLocalData('spendwise_budgets', budgets);
    return true;
  }
};

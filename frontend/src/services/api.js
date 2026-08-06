import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from '../utils/sampleData';

// Connect to deployed Render Java Spring Boot API if local proxy is not active
const BACKEND_CLOUD_URL = 'https://spendwise-backend-api-rje3.onrender.com/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || BACKEND_CLOUD_URL;

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
  // Fetch transactions scoped per user ID
  async getTransactions(filters = {}, userId = 101) {
    try {
      const query = new URLSearchParams();
      if (filters.type) query.append('type', filters.type);
      if (filters.category) query.append('category', filters.category);
      if (filters.search) query.append('search', filters.search);
      query.append('userId', userId);

      const res = await fetch(`${API_BASE_URL}/transactions?${query.toString()}`, {
        headers: { 'X-User-Id': String(userId) }
      });
      if (res.ok) {
        const data = await res.json();
        return { data, isBackend: true };
      }
    } catch (err) {
      console.warn('Backend API unreachable, using LocalStorage fallback');
    }

    // Local Storage Scoped Fallback per user
    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    let list = getLocalData(storageKey, defaultData);

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

  async createTransaction(transaction, userId = 101) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({ ...transaction, userId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API create error', err);
    }

    // Local Storage Scoped Fallback
    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    const list = getLocalData(storageKey, defaultData);

    const newTx = { ...transaction, id: Date.now(), userId };
    const updated = [newTx, ...list];
    setLocalData(storageKey, updated);
    return newTx;
  },

  async updateTransaction(id, transaction, userId = 101) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({ ...transaction, userId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}

    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    const list = getLocalData(storageKey, defaultData);
    const updated = list.map(t => (t.id === id ? { ...transaction, id, userId } : t));
    setLocalData(storageKey, updated);
    return { ...transaction, id, userId };
  },

  async deleteTransaction(id, userId = 101) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(userId) }
      });
      if (res.ok) return true;
    } catch (err) {}

    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    const list = getLocalData(storageKey, defaultData);
    const updated = list.filter(t => t.id !== id);
    setLocalData(storageKey, updated);
    return true;
  },

  // Get Budgets Scoped per User ID
  async getBudgets(userId = 101) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/progress?userId=${userId}`, {
        headers: { 'X-User-Id': String(userId) }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}

    const budgetKey = `spendwise_budgets_${userId}`;
    const txKey = `spendwise_transactions_${userId}`;

    const defaultBudgets = INITIAL_BUDGETS;
    const defaultTx = userId === 101 ? INITIAL_TRANSACTIONS : [];

    const budgets = getLocalData(budgetKey, defaultBudgets);
    const transactions = getLocalData(txKey, defaultTx);

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

  async updateBudget(category, monthlyLimit, userId = 101) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({ category, monthlyLimit, userId })
      });
      if (res.ok) return await res.json();
    } catch (err) {}

    const budgetKey = `spendwise_budgets_${userId}`;
    const budgets = getLocalData(budgetKey, INITIAL_BUDGETS);
    const existingIdx = budgets.findIndex(b => b.category === category);
    if (existingIdx >= 0) {
      budgets[existingIdx].monthlyLimit = Number(monthlyLimit);
    } else {
      budgets.push({ id: Date.now(), category, monthlyLimit: Number(monthlyLimit) });
    }
    setLocalData(budgetKey, budgets);
    return true;
  }
};

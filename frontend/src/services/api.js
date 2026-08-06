import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from '../utils/sampleData';

const BACKEND_CLOUD_URL = 'https://spendwise-backend-api-rje3.onrender.com/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || BACKEND_CLOUD_URL;

console.log('[SpendWise API] Base URL:', API_BASE_URL);

const fetchApi = async (url, options = {}) => {
  console.log(`[SpendWise API] ${options.method || 'GET'} ${url}`);
  if (options.body) console.log('[SpendWise API] Payload:', options.body);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    console.log(`[SpendWise API] Response: ${res.status} ${res.statusText}`);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[SpendWise API] FETCH FAILED:`, err.message);
    throw err;
  }
};

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
  // ========== AUTH ==========
  async registerUser(name, email, password) {
    try {
      const res = await fetchApi(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const text = await res.text();
      console.log('[SpendWise API] Register raw response:', text);
      try {
        const data = JSON.parse(text);
        if (res.ok) return data;
        return { error: data.message || data.error || 'Registration failed' };
      } catch (parseErr) {
        console.error('[SpendWise API] JSON parse error:', parseErr);
        return { error: 'Server returned invalid response' };
      }
    } catch (err) {
      console.error('[SpendWise API] Register network error:', err);
      return null;
    }
  },

  async loginUser(email, password) {
    try {
      const res = await fetchApi(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      console.log('[SpendWise API] Login raw response:', text);
      try {
        const data = JSON.parse(text);
        if (res.ok) return data;
        return { error: data.message || data.error || 'Login failed' };
      } catch (parseErr) {
        console.error('[SpendWise API] JSON parse error:', parseErr);
        return { error: 'Server returned invalid response' };
      }
    } catch (err) {
      console.error('[SpendWise API] Login network error:', err);
      return null;
    }
  },

  // ========== TRANSACTIONS ==========
  async getTransactions(filters = {}, userId = 101) {
    try {
      const query = new URLSearchParams();
      if (filters.type) query.append('type', filters.type);
      if (filters.category) query.append('category', filters.category);
      if (filters.search) query.append('search', filters.search);
      query.append('userId', userId);

      const res = await fetchApi(`${API_BASE_URL}/transactions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[SpendWise API] Loaded ${data.length} transactions from BACKEND DB`);
        return { data, isBackend: true };
      }
      console.warn('[SpendWise API] getTransactions non-OK:', res.status);
    } catch (err) {
      console.warn('[SpendWise API] getTransactions failed, using localStorage fallback:', err.message);
    }

    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    let list = getLocalData(storageKey, defaultData);
    console.log(`[SpendWise API] Loaded ${list.length} transactions from LOCAL STORAGE (fallback)`);

    if (filters.type) list = list.filter(t => t.type === filters.type);
    if (filters.category) list = list.filter(t => t.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }
    return { data: list, isBackend: false };
  },

  async createTransaction(transaction, userId = 101) {
    const txDate = transaction.date || transaction.transactionDate || new Date().toISOString().split('T')[0];
    const payload = {
      title: transaction.title,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      transactionDate: txDate,
      date: txDate,
      paymentMethod: transaction.paymentMethod || 'Credit Card',
      notes: transaction.notes || '',
      userId
    };

    try {
      const res = await fetchApi(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[SpendWise API] Transaction SAVED TO DB:', data);
        return data;
      }
      const errText = await res.text();
      console.error('[SpendWise API] createTransaction server error:', res.status, errText);
    } catch (err) {
      console.error('[SpendWise API] createTransaction network error:', err.message);
    }

    // Local Storage Fallback
    console.warn('[SpendWise API] createTransaction falling back to localStorage');
    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    const list = getLocalData(storageKey, defaultData);
    const newTx = { ...transaction, id: Date.now(), userId };
    const updated = [newTx, ...list];
    setLocalData(storageKey, updated);
    return newTx;
  },

  async updateTransaction(id, transaction, userId = 101) {
    const txDate = transaction.date || transaction.transactionDate || new Date().toISOString().split('T')[0];
    const payload = {
      title: transaction.title,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      transactionDate: txDate,
      date: txDate,
      paymentMethod: transaction.paymentMethod || 'Credit Card',
      notes: transaction.notes || '',
      userId
    };

    try {
      const res = await fetchApi(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[SpendWise API] Transaction UPDATED IN DB:', data);
        return data;
      }
      const errText = await res.text();
      console.error('[SpendWise API] updateTransaction server error:', res.status, errText);
    } catch (err) {
      console.error('[SpendWise API] updateTransaction network error:', err.message);
    }

    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    const list = getLocalData(storageKey, defaultData);
    const updated = list.map(t => (t.id === id ? { ...transaction, id, userId } : t));
    setLocalData(storageKey, updated);
    return { ...transaction, id, userId };
  },

  async deleteTransaction(id, userId = 101) {
    try {
      const res = await fetchApi(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        console.log('[SpendWise API] Transaction DELETED FROM DB:', id);
        return true;
      }
    } catch (err) {
      console.error('[SpendWise API] deleteTransaction network error:', err.message);
    }

    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = userId === 101 ? INITIAL_TRANSACTIONS : [];
    const list = getLocalData(storageKey, defaultData);
    const updated = list.filter(t => t.id !== id);
    setLocalData(storageKey, updated);
    return true;
  },

  // ========== BUDGETS ==========
  async getBudgets(userId = 101) {
    try {
      const res = await fetchApi(`${API_BASE_URL}/budgets/progress?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[SpendWise API] Loaded ${data.length} budgets from BACKEND DB`);
        return data;
      }
    } catch (err) {
      console.warn('[SpendWise API] getBudgets failed, using localStorage fallback:', err.message);
    }

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
        id: b.id, category: b.category, monthlyLimit: limit,
        currentSpend: actualSpend, remainingAmount: remaining,
        percentageUsed: Math.round(pct * 10) / 10, status
      };
    });
  },

  async updateBudget(category, monthlyLimit, userId = 101) {
    try {
      const res = await fetchApi(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, monthlyLimit, userId })
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[SpendWise API] Budget SAVED TO DB:', data);
        return data;
      }
    } catch (err) {
      console.error('[SpendWise API] updateBudget network error:', err.message);
    }

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

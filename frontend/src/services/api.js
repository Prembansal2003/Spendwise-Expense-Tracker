import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from '../utils/sampleData';

const BACKEND_CLOUD_URL = 'https://spendwise-backend-api-rje3.onrender.com/api/v1';

// Ensure API_BASE_URL always ends with /api/v1
let _baseUrl = import.meta.env.VITE_API_BASE_URL || BACKEND_CLOUD_URL;
if (!_baseUrl.endsWith('/api/v1')) {
  _baseUrl = _baseUrl.replace(/\/+$/, '') + '/api/v1';
}
const API_BASE_URL = _baseUrl;

console.log('[SpendWise API] Base URL:', API_BASE_URL);

// Auto wake-up ping: fires immediately on app load to warm Render free-tier container
const _wakeUp = () => {
  fetch(`${API_BASE_URL}/auth/profile/1`, { method: 'GET', signal: AbortSignal.timeout(90000) })
    .then(() => console.log('[SpendWise API] ✅ Backend is awake and ready'))
    .catch(() => console.log('[SpendWise API] ⏳ Backend waking up (Render cold start)...'));
};
_wakeUp();

const fetchApi = async (url, options = {}) => {
  console.log(`[SpendWise API] ${options.method || 'GET'} ${url}`);
  if (options.body) console.log('[SpendWise API] Payload:', options.body);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s for Render cold start

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
        let data = await res.json();
        console.log(`[SpendWise API] Loaded ${data.length} transactions from BACKEND DB`);
        if ((!data || data.length === 0) && (userId === 101 || userId === '101')) {
          data = INITIAL_TRANSACTIONS;
        }
        return { data, isBackend: true };
      }
      console.warn('[SpendWise API] getTransactions non-OK:', res.status);
    } catch (err) {
      console.warn('[SpendWise API] getTransactions failed, using localStorage fallback:', err.message);
    }

    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = (userId === 101 || userId === '101') ? INITIAL_TRANSACTIONS : [];
    let list = getLocalData(storageKey, defaultData);
    if ((!list || list.length === 0) && (userId === 101 || userId === '101')) {
      list = INITIAL_TRANSACTIONS;
      setLocalData(storageKey, INITIAL_TRANSACTIONS);
    }
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
      paymentMethod: transaction.paymentMethod || 'Bank Transfer',
      notes: transaction.notes || '',
      currency: transaction.currency || 'USD'
    };

    try {
      const res = await fetchApi(`${API_BASE_URL}/transactions?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[SpendWise API] createTransaction failed, saving to localStorage:', err.message);
    }

    const storageKey = `spendwise_transactions_${userId}`;
    const list = getLocalData(storageKey, INITIAL_TRANSACTIONS);
    const newTx = { ...payload, id: Date.now() };
    list.unshift(newTx);
    setLocalData(storageKey, list);
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
      paymentMethod: transaction.paymentMethod || 'Bank Transfer',
      notes: transaction.notes || '',
      currency: transaction.currency || 'USD'
    };

    try {
      const res = await fetchApi(`${API_BASE_URL}/transactions/${id}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[SpendWise API] updateTransaction failed, updating localStorage:', err.message);
    }

    const storageKey = `spendwise_transactions_${userId}`;
    let list = getLocalData(storageKey, INITIAL_TRANSACTIONS);
    list = list.map(t => t.id === id ? { ...t, ...payload } : t);
    setLocalData(storageKey, list);
    return { ...payload, id };
  },

  async deleteTransaction(id, userId = 101) {
    try {
      const res = await fetchApi(`${API_BASE_URL}/transactions/${id}?userId=${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('[SpendWise API] deleteTransaction failed, removing from localStorage:', err.message);
    }

    const storageKey = `spendwise_transactions_${userId}`;
    let list = getLocalData(storageKey, INITIAL_TRANSACTIONS);
    list = list.filter(t => t.id !== id);
    setLocalData(storageKey, list);
    return true;
  },

  // Reset sample dataset for demo user
  async resetSampleData(userId = 101) {
    const storageKey = `spendwise_transactions_${userId}`;
    const budgetKey = `spendwise_budgets_${userId}`;

    setLocalData(storageKey, INITIAL_TRANSACTIONS);
    setLocalData(budgetKey, INITIAL_BUDGETS);

    try {
      const res = await fetchApi(`${API_BASE_URL}/transactions?userId=${userId}`);
      if (res.ok) {
        const list = await res.json();
        for (const t of list) {
          try {
            await fetchApi(`${API_BASE_URL}/transactions/${t.id}?userId=${userId}`, { method: 'DELETE' });
          } catch (e) {}
        }
        for (const tx of INITIAL_TRANSACTIONS) {
          try {
            await fetchApi(`${API_BASE_URL}/transactions?userId=${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...tx, id: null })
            });
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('[SpendWise API] Backend reset skipped:', e.message);
    }
  },

  // ========== BUDGETS ==========
  async getBudgets(userId = 101) {
    try {
      const res = await fetchApi(`${API_BASE_URL}/budgets/progress?userId=${userId}`);
      if (res.ok) {
        let data = await res.json();
        if ((!data || data.length === 0) && (userId === 101 || userId === '101')) {
          data = INITIAL_BUDGETS;
        }
        return data;
      }
    } catch (err) {
      console.warn('[SpendWise API] getBudgets failed, using localStorage fallback');
    }

    const storageKey = `spendwise_budgets_${userId}`;
    let list = getLocalData(storageKey, INITIAL_BUDGETS);
    if ((!list || list.length === 0) && (userId === 101 || userId === '101')) {
      list = INITIAL_BUDGETS;
      setLocalData(storageKey, INITIAL_BUDGETS);
    }
    return list;
  },

  async updateBudget(category, monthlyLimit, userId = 101, currency = 'USD') {
    try {
      const res = await fetchApi(`${API_BASE_URL}/budgets?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, monthlyLimit: Number(monthlyLimit), currency })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[SpendWise API] updateBudget failed, updating localStorage');
    }

    const storageKey = `spendwise_budgets_${userId}`;
    let list = getLocalData(storageKey, INITIAL_BUDGETS);
    const existingIdx = list.findIndex(b => b.category === category);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], monthlyLimit: Number(monthlyLimit), currency };
    } else {
      list.push({ id: Date.now(), category, monthlyLimit: Number(monthlyLimit), currency });
    }
    setLocalData(storageKey, list);
    return list;
  }
};

import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, CLEAN_DEFAULT_BUDGETS } from '../utils/sampleData';

const DEFAULT_SAVINGS_GOALS = [
  { id: 1, title: '🏖️ Summer Vacation', savedAmount: 0, targetAmount: 2000, currency: 'USD' },
  { id: 2, title: '💻 New Work Laptop', savedAmount: 0, targetAmount: 2400, currency: 'USD' },
  { id: 3, title: '🛡️ Emergency Fund', savedAmount: 0, targetAmount: 5000, currency: 'USD' }
];


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
  fetch(`${API_BASE_URL}/transactions?userId=101`, { method: 'GET', signal: AbortSignal.timeout(90000) })
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
  // ========== AUTH & PROFILE ==========
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

  async getUserProfile(userId = 101) {
    const targetUserId = (userId === 101 || userId === '101' || userId === 1 || userId === '1') ? 1 : userId;
    try {
      const res = await fetchApi(`${API_BASE_URL}/auth/profile/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[SpendWise API] getUserProfile failed:', err.message);
    }
    return null;
  },

  async updateUserProfile(userId = 101, payload = {}) {
    const targetUserId = (userId === 101 || userId === '101' || userId === 1 || userId === '1') ? 1 : userId;
    try {
      const res = await fetchApi(`${API_BASE_URL}/auth/profile/${targetUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[SpendWise API] updateUserProfile failed:', err.message);
    }
    return null;
  },

  // ========== TRANSACTIONS ==========
  async getTransactions(filters = {}, userId = 101) {
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_transactions_${userId}`;
    const defaultData = isDemoUser ? INITIAL_TRANSACTIONS : [];
    let localList = getLocalData(storageKey, defaultData);
    if (!isDemoUser && !localStorage.getItem(storageKey)) {
      localList = [];
      setLocalData(storageKey, []);
    }

    let isBackend = false;
    let combinedList = isDemoUser ? [...localList] : (Array.isArray(localList) ? [...localList] : []);

    if (!isDemoUser) {
      try {
        const query = new URLSearchParams();
        if (filters.type) query.append('type', filters.type);
        if (filters.category) query.append('category', filters.category);
        if (filters.search) query.append('search', filters.search);
        query.append('userId', userId);

        const res = await fetchApi(`${API_BASE_URL}/transactions?${query.toString()}`);
        if (res.ok) {
          const backendData = await res.json();
          isBackend = true;
          if (Array.isArray(backendData)) {
            combinedList = backendData;
            setLocalData(storageKey, combinedList);
          }
        }
      } catch (err) {
        console.warn('[SpendWise API] getTransactions backend fetch skipped:', err.message);
      }
    } else {
      isBackend = true; // Local emulator mode is always considered active/connected
    }

    if (filters.type) combinedList = combinedList.filter(t => t.type === filters.type);
    if (filters.category) combinedList = combinedList.filter(t => t.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      combinedList = combinedList.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }
    return { data: combinedList, isBackend };
  },

  async createTransaction(transaction, userId = 101) {
    const txDate = transaction.date || transaction.transactionDate || new Date().toISOString().split('T')[0];
    const tempId = Date.now();
    const payload = {
      id: tempId,
      userId: Number(userId) || 101,
      title: transaction.title,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      transactionDate: txDate,
      paymentMethod: transaction.paymentMethod || 'Bank Transfer',
      notes: transaction.notes || '',
      currency: transaction.currency || 'USD'
    };

    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_transactions_${userId}`;
    const list = getLocalData(storageKey, isDemoUser ? INITIAL_TRANSACTIONS : []);
    list.unshift(payload);
    setLocalData(storageKey, list);

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/transactions?userId=${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          const idx = list.findIndex(t => String(t.id) === String(tempId));
          if (idx >= 0) list[idx] = data;
          setLocalData(storageKey, list);
          return data;
        }
      } catch (err) {
        console.warn('[SpendWise API] createTransaction backend sync skipped:', err.message);
      }
    }

    return payload;
  },

  async updateTransaction(id, transaction, userId = 101) {
    const txDate = transaction.date || transaction.transactionDate || new Date().toISOString().split('T')[0];
    const payload = {
      userId: Number(userId) || 101,
      title: transaction.title,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      transactionDate: txDate,
      paymentMethod: transaction.paymentMethod || 'Bank Transfer',
      notes: transaction.notes || '',
      currency: transaction.currency || 'USD'
    };

    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_transactions_${userId}`;
    let list = getLocalData(storageKey, isDemoUser ? INITIAL_TRANSACTIONS : []);
    const existingIdx = list.findIndex(t => String(t.id) === String(id));
    let updatedItem = { ...payload, id };
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...payload, id };
    } else {
      list.unshift(updatedItem);
    }
    setLocalData(storageKey, list);

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/transactions/${id}?userId=${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const backendResult = await res.json();
          const idx = list.findIndex(t => String(t.id) === String(id));
          if (idx >= 0) list[idx] = backendResult;
          setLocalData(storageKey, list);
          return backendResult;
        }
      } catch (err) {
        console.warn('[SpendWise API] updateTransaction backend sync skipped:', err.message);
      }
    }

    return updatedItem;
  },

  async deleteTransaction(id, userId = 101) {
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_transactions_${userId}`;
    let list = getLocalData(storageKey, isDemoUser ? INITIAL_TRANSACTIONS : []);
    list = list.filter(t => String(t.id) !== String(id));
    setLocalData(storageKey, list);

    if (!isDemoUser) {
      try {
        await fetchApi(`${API_BASE_URL}/transactions/${id}?userId=${userId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('[SpendWise API] deleteTransaction backend sync skipped:', err.message);
      }
    }

    return true;
  },

  // Reset transactions & sample dataset for user
  async resetSampleData(userId = 101) {
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_transactions_${userId}`;
    const budgetKey = `spendwise_budgets_${userId}`;

    if (isDemoUser) {
      setLocalData(storageKey, INITIAL_TRANSACTIONS);
      setLocalData(budgetKey, INITIAL_BUDGETS);
    } else {
      setLocalData(storageKey, []);
      setLocalData(budgetKey, CLEAN_DEFAULT_BUDGETS);
    }

    try {
      await fetchApi(`${API_BASE_URL}/transactions/reset?userId=${userId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[SpendWise API] Backend reset skipped:', e.message);
    }
  },

  // ========== BUDGETS ==========
  async getBudgets(userId = 101) {
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_budgets_${userId}`;
    const defaultData = isDemoUser ? INITIAL_BUDGETS : CLEAN_DEFAULT_BUDGETS;

    const deduplicateBudgets = (rawList) => {
      if (!Array.isArray(rawList)) return [];
      const map = new Map();
      rawList.forEach(b => {
        if (b && b.category) map.set(b.category, b);
      });
      return Array.from(map.values());
    };

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/budgets/progress?userId=${userId}`);
        if (res.ok) {
          let data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const cleanData = deduplicateBudgets(data);
            setLocalData(storageKey, cleanData);
            return cleanData;
          }
        }
      } catch (err) {
        console.warn('[SpendWise API] getBudgets failed, using localStorage fallback');
      }
    }

    let list = getLocalData(storageKey, defaultData);
    return deduplicateBudgets(list);
  },

  async updateBudget(category, monthlyLimit, userId = 101, currency = 'USD', period = 'MONTHLY') {
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const yearlyLimit = period === 'YEARLY' ? Number(monthlyLimit) * 12 : Number(monthlyLimit) * 12;

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/budgets?userId=${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: Number(userId) || 101, category, monthlyLimit: Number(monthlyLimit), currency, period, yearlyLimit })
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.warn('[SpendWise API] updateBudget failed, updating localStorage');
      }
    }

    const storageKey = `spendwise_budgets_${userId}`;
    const defaultData = isDemoUser ? INITIAL_BUDGETS : CLEAN_DEFAULT_BUDGETS;
    let list = getLocalData(storageKey, defaultData);
    const existingIdx = list.findIndex(b => b.category === category);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], monthlyLimit: Number(monthlyLimit), currency, period, yearlyLimit };
    } else {
      list.push({ id: Date.now(), category, monthlyLimit: Number(monthlyLimit), currency, period, yearlyLimit });
    }
    setLocalData(storageKey, list);
    return list;
  },

  // ========== SAVINGS GOALS DEDICATED DATABASE TABLE API ==========
  async getSavingsGoals(userId = 101) {
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_savings_goals_${userId}`;

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/savings-goals?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.warn('[SpendWise API] getSavingsGoals backend fetch skipped:', err.message);
      }
      return null;
    }

    return getLocalData(storageKey, DEFAULT_SAVINGS_GOALS);
  },

  async createSavingsGoal(userId = 101, goalData = {}) {
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_savings_goals_${userId}`;
    const payload = {
      id: Date.now(),
      userId: Number(userId) || 101,
      title: goalData.title,
      targetAmount: Number(goalData.targetAmount || 5000),
      savedAmount: Number(goalData.savedAmount || 0),
      currency: goalData.currency || 'USD'
    };

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/savings-goals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: Number(userId) || 101, ...goalData })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[SpendWise API] createSavingsGoal backend sync skipped:', err.message);
      }
    } else {
      let list = getLocalData(storageKey, DEFAULT_SAVINGS_GOALS);
      list.push(payload);
      setLocalData(storageKey, list);
    }

    return payload;
  },

  async depositToSavingsGoal(goalId, amount) {
    let currentUser = getLocalData('spendwise_user', { id: 101 });
    const userId = currentUser.id;
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_savings_goals_${userId}`;

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(amount) })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[SpendWise API] depositToSavingsGoal backend sync skipped:', err.message);
      }
    } else {
      let list = getLocalData(storageKey, DEFAULT_SAVINGS_GOALS);
      const idx = list.findIndex(g => String(g.id) === String(goalId));
      if (idx >= 0) {
        list[idx].savedAmount = (list[idx].savedAmount || 0) + Number(amount);
        setLocalData(storageKey, list);
        return list[idx];
      }
    }
    return null;
  },

  async deleteSavingsGoal(goalId) {
    let currentUser = getLocalData('spendwise_user', { id: 101 });
    const userId = currentUser.id;
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_savings_goals_${userId}`;

    if (!isDemoUser) {
      try {
        await fetchApi(`${API_BASE_URL}/savings-goals/${goalId}`, { method: 'DELETE' });
        return true;
      } catch (err) {
        console.warn('[SpendWise API] deleteSavingsGoal backend sync skipped:', err.message);
      }
      return false;
    } else {
      let list = getLocalData(storageKey, DEFAULT_SAVINGS_GOALS);
      list = list.filter(g => String(g.id) !== String(goalId));
      setLocalData(storageKey, list);
      return true;
    }
  },

  async updateSavingsGoal(goalId, goalData = {}) {
    let currentUser = getLocalData('spendwise_user', { id: 101 });
    const userId = currentUser.id;
    const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
    const storageKey = `spendwise_savings_goals_${userId}`;

    if (!isDemoUser) {
      try {
        const res = await fetchApi(`${API_BASE_URL}/savings-goals/${goalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[SpendWise API] updateSavingsGoal backend sync skipped:', err.message);
      }
    } else {
      let list = getLocalData(storageKey, DEFAULT_SAVINGS_GOALS);
      const idx = list.findIndex(g => String(g.id) === String(goalId));
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...goalData };
        setLocalData(storageKey, list);
        return list[idx];
      }
    }
    return null;
  }
};

export const api = apiService;
export default apiService;

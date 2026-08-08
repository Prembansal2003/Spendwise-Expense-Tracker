import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle, Edit3, Plus, ShieldAlert, Calendar, RefreshCw, Trash2, PiggyBank, PlusCircle, Check } from 'lucide-react';
import { CATEGORY_META, formatCurrency, convertCurrency, getCurrencySymbol, CURRENCIES } from '../utils/formatters';
import api from '../services/api';

const DEFAULT_SAVINGS_GOALS = [
  { id: 1, title: '🏖️ Summer Vacation', savedAmount: 0, targetAmount: 2000, currency: 'USD' },
  { id: 2, title: '💻 New Work Laptop', savedAmount: 0, targetAmount: 2400, currency: 'USD' },
  { id: 3, title: '🛡️ Emergency Fund', savedAmount: 0, targetAmount: 5000, currency: 'USD' }
];

export default function BudgetTracker({
  userId = 101,
  budgets = [],
  currency,
  onUpdateBudget,
  transactions = [],
  onCreateTransaction
}) {
  const [budgetPeriod, setBudgetPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [editPeriod, setEditPeriod] = useState('MONTHLY');
  const [editCurrency, setEditCurrency] = useState('USD');

  const isDemoUser = (userId === 101 || userId === '101' || userId === 1 || userId === '1');
  const storageKey = `spendwise_savings_goals_${userId}`;

  // Interactive Savings Goals State & User-Scoped Persistence
  const [savingsGoals, setSavingsGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      return isDemoUser ? DEFAULT_SAVINGS_GOALS : [];
    } catch (e) {
      return isDemoUser ? DEFAULT_SAVINGS_GOALS : [];
    }
  });

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalSaved, setNewGoalSaved] = useState('');

  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editSavedAddAmount, setEditSavedAddAmount] = useState('');

  // Target Goal Inline Edit State
  const [editingTargetGoalId, setEditingTargetGoalId] = useState(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalTargetVal, setEditGoalTargetVal] = useState('');
  const [editGoalCurrency, setEditGoalCurrency] = useState('USD');

  useEffect(() => {
    async function loadCloudGoals() {
      try {
        const cloudGoals = await api.getSavingsGoals(userId);
        if (cloudGoals && Array.isArray(cloudGoals) && cloudGoals.length > 0) {
          setSavingsGoals(cloudGoals);
          localStorage.setItem(storageKey, JSON.stringify(cloudGoals));
          return;
        }
      } catch (e) {}

      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setSavingsGoals(JSON.parse(saved));
        } else {
          setSavingsGoals(isDemoUser ? DEFAULT_SAVINGS_GOALS : []);
        }
      } catch (e) {
        setSavingsGoals(isDemoUser ? DEFAULT_SAVINGS_GOALS : []);
      }
    }
    loadCloudGoals();
  }, [userId, storageKey, isDemoUser]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savingsGoals));
    } catch (e) {}
  }, [savingsGoals, storageKey]);

  // Filter transactions for current month vs current year
  const currentDate = new Date();
  const currentYearStr = String(currentDate.getFullYear());
  const currentMonthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${currentYearStr}-${currentMonthStr}`;

  const handleEditClick = (b) => {
    setEditingCategory(b.category);
    setEditPeriod(b.period || 'MONTHLY');
    setEditCurrency(b.currency || currency || 'USD');
    const storedLimit = b.period === 'YEARLY' ? (b.yearlyLimit || b.monthlyLimit * 12) : b.monthlyLimit;
    setNewLimit(storedLimit != null ? storedLimit.toString() : '');
  };

  const handleSaveBudget = (cat) => {
    if (!newLimit || Number(newLimit) < 0) return;

    const fedValue = Number(newLimit);
    const monthlyLimit = editPeriod === 'YEARLY' ? fedValue / 12 : fedValue;
    
    // Save with the fed currency selected by the user!
    onUpdateBudget(cat, monthlyLimit, editPeriod, editCurrency);
    setEditingCategory(null);
  };

  // Add New Savings Goal
  const handleCreateSavingsGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalTarget || Number(newGoalTarget) <= 0) return;

    const fedSavedVal = Number(newGoalSaved || 0);
    const targetInUSD = convertCurrency(Number(newGoalTarget), currency, 'USD');
    const savedInUSD = convertCurrency(fedSavedVal, currency, 'USD');

    // 1. Sync directly to PostgreSQL cloud database table savings_goals!
    let createdGoal = null;
    try {
      createdGoal = await api.createSavingsGoal(userId, {
        title: newGoalTitle.trim(),
        targetAmount: targetInUSD,
        savedAmount: savedInUSD,
        currency: 'USD'
      });
    } catch (err) {
      console.warn('[BudgetTracker] Cloud DB goal creation skipped:', err.message);
    }

    const newGoal = createdGoal || {
      id: Date.now(),
      title: newGoalTitle.trim(),
      savedAmount: savedInUSD,
      targetAmount: targetInUSD,
      currency: 'USD'
    };

    setSavingsGoals(prev => [...prev, newGoal]);

    // Automatically create a deduction expense transaction if initial deposit > 0
    if (fedSavedVal > 0 && onCreateTransaction) {
      await onCreateTransaction({
        title: `Savings Deposit: ${newGoalTitle.trim()}`,
        amount: fedSavedVal,
        type: 'EXPENSE',
        category: 'OTHER',
        paymentMethod: 'Bank Transfer',
        notes: `[GoalID:${newGoal.id}][Target:${targetInUSD}] Initial deposit allocated towards ${newGoalTitle.trim()} savings goal`,
        transactionDate: new Date().toISOString().split('T')[0]
      });
    }

    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalSaved('');
    setShowAddGoalModal(false);
  };

  // Add Deposit to Goal & Deduct Amount from Available Balance
  const handleAddDeposit = async (goal) => {
    if (!editSavedAddAmount || Number(editSavedAddAmount) <= 0) return;
    const fedDepositVal = Number(editSavedAddAmount);
    const depositInUSD = convertCurrency(fedDepositVal, currency, 'USD');

    // 1. Sync deposit to PostgreSQL cloud DB table savings_goals!
    if (goal.id && (typeof goal.id === 'number' || !String(goal.id).startsWith('auto_'))) {
      try {
        await api.depositToSavingsGoal(goal.id, depositInUSD);
      } catch (e) {}
    }

    // 2. Update local state
    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goal.id) {
        return { ...g, savedAmount: (g.savedAmount || 0) + depositInUSD };
      }
      return g;
    }));

    // 3. Automatically create an Outflow Expense Transaction to deduct from main cash balance!
    if (onCreateTransaction) {
      await onCreateTransaction({
        title: `Savings Deposit: ${goal.title}`,
        amount: fedDepositVal,
        type: 'EXPENSE',
        category: 'OTHER',
        paymentMethod: 'Bank Transfer',
        notes: `[GoalID:${goal.id}][Target:${goal.targetAmount || 5000}] Deposit deducted from available cash and allocated to ${goal.title}`,
        transactionDate: new Date().toISOString().split('T')[0]
      });
    }

    setEditingGoalId(null);
    setEditSavedAddAmount('');
  };

  // Delete Savings Goal
  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Delete this savings goal?')) {
      if (typeof goalId === 'number') {
        try {
          await api.deleteSavingsGoal(goalId);
        } catch (e) {}
      }
      setSavingsGoals(prev => prev.filter(g => g.id !== goalId));
    }
  };

  const handleStartEditTargetGoal = (goal) => {
    setEditingTargetGoalId(goal.id);
    setEditGoalTitle(goal.title || '');
    setEditGoalTargetVal(goal.targetAmount != null ? goal.targetAmount.toString() : '');
    setEditGoalCurrency(goal.currency || currency || 'USD');
  };

  const handleSaveTargetGoalEdit = async (goalId) => {
    if (!editGoalTargetVal || Number(editGoalTargetVal) <= 0) return;

    const fedTargetVal = Number(editGoalTargetVal);
    const targetInUSD = convertCurrency(fedTargetVal, editGoalCurrency, 'USD');

    if (typeof goalId === 'number') {
      try {
        await api.updateSavingsGoal(goalId, {
          title: editGoalTitle.trim(),
          targetAmount: targetInUSD,
          currency: editGoalCurrency
        });
      } catch (e) {}
    }

    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          title: editGoalTitle.trim(),
          targetAmount: targetInUSD,
          currency: editGoalCurrency
        };
      }
      return g;
    }));

    setEditingTargetGoalId(null);
  };

  // Compute stat card totals in active view currency
  const totalBudgetedInViewCurrency = budgets.reduce((sum, b) => {
    const storedCurr = b.currency || 'USD';
    const storedCap = b.period === 'YEARLY' ? (b.yearlyLimit || b.monthlyLimit * 12) : b.monthlyLimit;
    let effectiveCap = storedCap;
    if (budgetPeriod === 'yearly' && b.period !== 'YEARLY') {
      effectiveCap = storedCap * 12;
    } else if (budgetPeriod === 'monthly' && b.period === 'YEARLY') {
      effectiveCap = storedCap / 12;
    }
    return sum + convertCurrency(effectiveCap, storedCurr, currency);
  }, 0);

  const totalSpentInViewCurrency = transactions
    .filter(t => {
      if (t.type !== 'EXPENSE') return false;
      const d = t.transactionDate || '2026-08-01';
      return budgetPeriod === 'monthly' ? d.startsWith(currentMonthKey) : d.startsWith(currentYearStr);
    })
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);

  // Auto-reconstruct Active Savings Goals from existing deposit transactions if missing from state
  const mergedSavingsGoals = [...savingsGoals];

  transactions.forEach(t => {
    if (t.type !== 'EXPENSE' || !t.title) return;
    const titleLower = t.title.toLowerCase();
    let goalName = '';

    if (titleLower.startsWith('savings deposit:')) {
      goalName = t.title.replace(/^savings deposit:/i, '').trim();
    } else if (titleLower.startsWith('savings goal deposit:')) {
      goalName = t.title.replace(/^savings goal deposit:/i, '').trim();
    }

    if (goalName) {
      const cleanGoalName = goalName.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      const exists = mergedSavingsGoals.some(g => {
        const cleanGTitle = (g.title || '').toLowerCase().replace(/[^\w\s]/gi, '').trim();
        return cleanGTitle === cleanGoalName || (cleanGTitle && cleanGoalName.includes(cleanGoalName)) || (cleanGTitle && cleanGTitle.includes(cleanGoalName));
      });

      if (!exists && cleanGoalName) {
        let targetAmount = 5000.00;
        if (t.notes) {
          const targetMatch = t.notes.match(/\[Target:([\d\.]+)\]/i);
          if (targetMatch && targetMatch[1]) {
            targetAmount = Number(targetMatch[1]);
          }
        }

        mergedSavingsGoals.push({
          id: `auto_${cleanGoalName.replace(/\s+/g, '_')}`,
          title: goalName.charAt(0).toUpperCase() + goalName.slice(1),
          savedAmount: 0,
          targetAmount: targetAmount,
          currency: 'USD'
        });
      }
    }
  });

  const totalRemainingInViewCurrency = totalBudgetedInViewCurrency - totalSpentInViewCurrency;

  return (
    <div className="flex flex-col gap-6" style={{ marginBottom: '1.5rem' }}>
      
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {budgetPeriod === 'monthly' ? 'Total Monthly Cap' : 'Total Annual Cap'}
            </span>
            <Target size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {formatCurrency(totalBudgetedInViewCurrency, currency, currency)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {budgetPeriod === 'monthly' ? 'Current Month Spent' : 'Current Year Spent'}
            </span>
            <RefreshCw size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: totalSpentInViewCurrency > totalBudgetedInViewCurrency ? 'var(--danger)' : 'var(--text-primary)' }}>
            {formatCurrency(totalSpentInViewCurrency, currency, currency)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Budget Cushion
            </span>
            <ShieldAlert size={18} color={totalRemainingInViewCurrency >= 0 ? 'var(--success)' : 'var(--danger)'} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: totalRemainingInViewCurrency >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(totalRemainingInViewCurrency, currency, currency)}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} className="text-primary" />
              <span>{budgetPeriod === 'monthly' ? 'Monthly Category Budgets' : 'Yearly Category Budgets'}</span>
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Real-time multi-currency budget limits with live exchange rate conversion
            </p>
          </div>

          <div className="segmented-control" style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <button
              className={`btn btn-sm ${budgetPeriod === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => setBudgetPeriod('monthly')}
            >
              📅 Monthly Budgets
            </button>
            <button
              className={`btn btn-sm ${budgetPeriod === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => setBudgetPeriod('yearly')}
            >
              📆 Yearly Budgets
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => {
            const meta = CATEGORY_META[b.category] || { name: b.category, icon: '📦', color: '#64748b' };
            const isEditing = editingCategory === b.category;
            const storedCurr = b.currency || 'USD';

            const actualSpendInViewCurrency = transactions
              .filter(t => {
                if (t.type !== 'EXPENSE' || t.category !== b.category) return false;
                const d = t.transactionDate || '2026-08-01';
                if (budgetPeriod === 'monthly') {
                  return d.startsWith(currentMonthKey);
                } else {
                  return d.startsWith(currentYearStr);
                }
              })
              .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);

            const storedCap = b.period === 'YEARLY' ? (b.yearlyLimit || b.monthlyLimit * 12) : b.monthlyLimit;
            let effectiveCapInStoredCurr = storedCap;
            if (budgetPeriod === 'yearly' && b.period !== 'YEARLY') {
              effectiveCapInStoredCurr = storedCap * 12;
            } else if (budgetPeriod === 'monthly' && b.period === 'YEARLY') {
              effectiveCapInStoredCurr = storedCap / 12;
            }

            const limitInViewCurrency = convertCurrency(effectiveCapInStoredCurr, storedCurr, currency);
            const usedPct = limitInViewCurrency > 0 ? (actualSpendInViewCurrency / limitInViewCurrency) * 100 : 0;
            const pct = Math.min(usedPct, 100);

            let statusBg = 'var(--success)';
            let statusText = 'On Track';
            let statusIcon = <CheckCircle size={14} color="var(--success)" />;

            if (usedPct > 100) {
              statusBg = 'var(--danger)';
              statusText = 'Over Budget!';
              statusIcon = <ShieldAlert size={14} color="var(--danger)" />;
            } else if (usedPct >= 80) {
              statusBg = 'var(--warning)';
              statusText = 'Near Cap (80%+)';
              statusIcon = <AlertTriangle size={14} color="var(--warning)" />;
            }

            return (
              <div
                key={b.id || b.category}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${usedPct > 100 ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block' }}>{meta.name}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: '1.8rem', height: '1.8rem' }}
                    onClick={() => handleEditClick(b)}
                  >
                    <Edit3 size={12} />
                  </button>
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-2" style={{ marginBottom: '0.75rem' }}>
                    <div className="flex gap-1.5">
                      <select className="form-control form-control-sm" value={editPeriod} onChange={(e) => setEditPeriod(e.target.value)}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                      <select className="form-control form-control-sm" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)}>
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                      <input type="number" className="form-control form-control-sm" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-secondary btn-xs" onClick={() => setEditingCategory(null)}>Cancel</button>
                      <button className="btn btn-primary btn-xs" onClick={() => handleSaveBudget(b.category)}>Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1" style={{ marginBottom: '0.5rem' }}>
                    <div className="flex items-center justify-between" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Spent: <strong>{formatCurrency(actualSpendInViewCurrency, currency, currency)}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>Cap: <strong>{formatCurrency(limitInViewCurrency, currency, currency)}</strong></span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: statusBg }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  <div className="flex items-center gap-1">
                    {statusIcon}
                    <span style={{ fontWeight: 600, color: statusBg }}>{statusText}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>{usedPct.toFixed(1)}% used</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 className="flex items-center gap-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              <PiggyBank size={18} color="var(--primary)" />
              <span>Active Savings Goals</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Set personal target savings milestones
            </p>
          </div>
          <button className="btn btn-primary btn-sm flex items-center gap-1.5" onClick={() => setShowAddGoalModal(true)}>
            <PlusCircle size={15} />
            <span>Add New Goal</span>
          </button>
        </div>

        {showAddGoalModal && (
          <form onSubmit={handleCreateSavingsGoal} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Create New Savings Target Goal</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: '0.75rem' }}>
              <input type="text" className="form-control form-control-sm" placeholder="Title" value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} required />
              <input type="number" className="form-control form-control-sm" placeholder="Target Amount" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} required />
              <input type="number" className="form-control form-control-sm" placeholder="Already Saved" value={newGoalSaved} onChange={(e) => setNewGoalSaved(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddGoalModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
            </div>
          </form>
        )}

        {/* Savings Goals Grid */}
        {mergedSavingsGoals.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>🐷 No active savings goals created yet.</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem' }}>Click "+ Add New Goal" above to set your first target milestone starting at $0.00!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mergedSavingsGoals.map(goal => {
              // Robust multi-criteria matching: Match Goal ID in notes, clean title, or key title words
              const cleanGoalTitle = (goal.title || '').toLowerCase().replace(/[^\w\s]/gi, '').trim();
              const goalWords = cleanGoalTitle.split(/\s+/).filter(w => w.length >= 3);

              const depositSumUSD = transactions
                .filter(t => {
                  if (t.type !== 'EXPENSE') return false;
                  const tTitle = (t.title || '').toLowerCase();
                  const tNotes = (t.notes || '').toLowerCase();

                  // 1. Direct Goal ID tag match in notes
                  if (tNotes.includes(`[goalid:${goal.id}]`)) return true;

                          // 2. Clean full title match in transaction title or notes
                          if (cleanGoalTitle && (tTitle.includes(cleanGoalTitle) || tNotes.includes(cleanGoalTitle))) return true;

                          // 3. Significant title keywords match (e.g. "vacation", "laptop", "emergency")
                          if (goalWords.length > 0) {
                            return goalWords.some(w => tTitle.includes(w) || tNotes.includes(w));
                          }

                          return false;
                        })
                        .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', 'USD'), 0);

                      const totalSavedUSD = (goal.savedAmount || 0) + depositSumUSD;

                      const savedInView = convertCurrency(totalSavedUSD, goal.currency || 'USD', currency);
                      const targetInView = convertCurrency(goal.targetAmount, goal.currency || 'USD', currency);
                      const pct = targetInView > 0 ? Math.min(((savedInView / targetInView) * 100), 100) : 0;
                      const isCompleted = savedInView >= targetInView;
                      const isAddingDeposit = editingGoalId === goal.id;
                      const isEditingTarget = editingTargetGoalId === goal.id;

                      return (
                        <div
                          key={goal.id}
                          style={{
                            padding: '1.25rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isCompleted ? 'var(--success)' : 'var(--border-color)'}`
                          }}
                        >
                          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{goal.title}</span>
                            <div className="flex items-center gap-1">
                              <span style={{ fontSize: '0.75rem', color: isCompleted ? 'var(--success)' : 'var(--primary)', fontWeight: 700 }}>
                                {pct.toFixed(0)}%
                              </span>
                              <button
                                className="btn btn-secondary btn-icon"
                                style={{ width: '1.5rem', height: '1.5rem', padding: 0 }}
                                onClick={() => handleStartEditTargetGoal(goal)}
                                title="Edit Goal Target & Currency"
                              >
                                <Edit3 size={11} />
                              </button>
                              <button
                                className="btn btn-danger btn-icon"
                                style={{ width: '1.5rem', height: '1.5rem', padding: 0 }}
                                onClick={() => handleDeleteGoal(goal.id)}
                                title="Delete Goal"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {isEditingTarget ? (
                            <div className="flex flex-col gap-2" style={{ marginBottom: '0.75rem' }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Goal Title"
                                value={editGoalTitle}
                                onChange={(e) => setEditGoalTitle(e.target.value)}
                              />
                              <div className="flex gap-1.5">
                                <select
                                  className="form-control form-control-sm"
                                  value={editGoalCurrency}
                                  onChange={(e) => setEditGoalCurrency(e.target.value)}
                                >
                                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  placeholder={`Target in ${editGoalCurrency}`}
                                  value={editGoalTargetVal}
                                  onChange={(e) => setEditGoalTargetVal(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button className="btn btn-secondary btn-xs" onClick={() => setEditingTargetGoalId(null)}>Cancel</button>
                                <button className="btn btn-primary btn-xs" onClick={() => handleSaveTargetGoalEdit(goal.id)}>Save Target</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                              {formatCurrency(savedInView, currency, currency)} / {formatCurrency(targetInView, currency, currency)}
                            </div>
                          )}

                          {/* Progress Bar */}
                          <div className="progress-bar-bg" style={{ marginBottom: '0.75rem' }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary)'
                              }}
                            />
                          </div>

                          {/* Deposit Action */}
                          {isAddingDeposit ? (
                            <div className="flex gap-1.5 items-center">
                              <input
                                type="number"
                                step="0.01"
                                className="form-control form-control-sm"
                                placeholder={`Add ${currency}`}
                                value={editSavedAddAmount}
                                onChange={(e) => setEditSavedAddAmount(e.target.value)}
                                autoFocus
                              />
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAddDeposit(goal)}
                              >
                                Deposit
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingGoalId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm flex items-center gap-1"
                              style={{ width: '100%', justifyContent: 'center' }}
                              onClick={() => {
                                setEditingGoalId(goal.id);
                                setEditSavedAddAmount('');
                              }}
                            >
                              <PlusCircle size={13} />
                              Deposit Funds
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
      </div>

    </div>
  );
}

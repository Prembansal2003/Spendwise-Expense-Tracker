import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle, Edit3, Plus, ShieldAlert, Calendar, RefreshCw, Trash2, PiggyBank, PlusCircle, Check } from 'lucide-react';
import { CATEGORY_META, formatCurrency, convertCurrency, getCurrencySymbol } from '../utils/formatters';

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

  useEffect(() => {
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
    // Compute stored limit cap in current active view currency for editing
    const storedLimit = b.period === 'YEARLY' ? (b.yearlyLimit || b.monthlyLimit * 12) : b.monthlyLimit;
    const displayVal = convertCurrency(storedLimit, b.currency || 'USD', currency);
    setNewLimit(displayVal ? displayVal.toFixed(2) : '');
  };

  const handleSaveBudget = (cat) => {
    if (!newLimit || Number(newLimit) < 0) return;

    const fedValue = Number(newLimit);
    const monthlyLimit = editPeriod === 'YEARLY' ? fedValue / 12 : fedValue;
    
    // Save with the active header currency fed by the user!
    onUpdateBudget(cat, monthlyLimit, editPeriod);
    setEditingCategory(null);
  };

  // Add New Savings Goal
  const handleCreateSavingsGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalTarget || Number(newGoalTarget) <= 0) return;

    const fedSavedVal = Number(newGoalSaved || 0);
    const targetInUSD = convertCurrency(Number(newGoalTarget), currency, 'USD');
    const savedInUSD = convertCurrency(fedSavedVal, currency, 'USD');

    const newGoal = {
      id: Date.now(),
      title: newGoalTitle.trim(),
      savedAmount: savedInUSD,
      targetAmount: targetInUSD,
      currency: 'USD'
    };

    setSavingsGoals([...savingsGoals, newGoal]);

    // Automatically create a deduction expense transaction if initial deposit > 0
    if (fedSavedVal > 0 && onCreateTransaction) {
      await onCreateTransaction({
        title: `Savings Goal Deposit: ${newGoalTitle.trim()}`,
        amount: fedSavedVal,
        type: 'EXPENSE',
        category: 'OTHER',
        paymentMethod: 'Bank Transfer',
        notes: `Initial deposit allocated towards ${newGoalTitle.trim()} savings goal`,
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

    // 1. Update Savings Goal balance
    setSavingsGoals(savingsGoals.map(g => {
      if (g.id === goal.id) {
        return { ...g, savedAmount: g.savedAmount + depositInUSD };
      }
      return g;
    }));

    // 2. Automatically create an Outflow Expense Transaction to deduct from main cash balance!
    if (onCreateTransaction) {
      await onCreateTransaction({
        title: `Savings Deposit: ${goal.title}`,
        amount: fedDepositVal,
        type: 'EXPENSE',
        category: 'OTHER',
        paymentMethod: 'Bank Transfer',
        notes: `Deposit deducted from available cash and allocated to ${goal.title}`,
        transactionDate: new Date().toISOString().split('T')[0]
      });
    }

    setEditingGoalId(null);
    setEditSavedAddAmount('');
  };

  // Delete Savings Goal
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Delete this savings goal?')) {
      setSavingsGoals(savingsGoals.filter(g => g.id !== goalId));
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ marginBottom: '1.5rem' }}>
      
      {/* Category Budgets Overview Header */}
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

          {/* Monthly vs Yearly Budget Selector */}
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

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => {
            const meta = CATEGORY_META[b.category] || { name: b.category, icon: '📦', color: '#64748b' };
            const isEditing = editingCategory === b.category;
            const storedCurr = b.currency || 'USD';

            // Compute actual spend according to selected period in active view currency
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

            // Compute stored cap in its native stored currency
            const storedCap = b.period === 'YEARLY' ? (b.yearlyLimit || b.monthlyLimit * 12) : b.monthlyLimit;
            let effectiveCapInStoredCurr = storedCap;
            if (budgetPeriod === 'yearly' && b.period !== 'YEARLY') {
              effectiveCapInStoredCurr = storedCap * 12;
            } else if (budgetPeriod === 'monthly' && b.period === 'YEARLY') {
              effectiveCapInStoredCurr = storedCap / 12;
            }

            // Dynamically convert cap from stored currency -> active view currency using live rates!
            const limitInViewCurrency = convertCurrency(effectiveCapInStoredCurr, storedCurr, currency);

            // Used Percentage
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
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {budgetPeriod === 'monthly' ? 'Monthly Limit' : 'Annual Limit'}
                        </span>
                        {storedCurr !== currency && (
                          <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
                            Fed in {storedCurr}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: '1.8rem', height: '1.8rem' }}
                    onClick={() => handleEditClick(b)}
                    title={`Edit Budget Cap (stored in ${storedCurr})`}
                  >
                    <Edit3 size={12} />
                  </button>
                </div>

                {/* Edit inline modal */}
                {isEditing ? (
                  <div className="flex flex-col gap-2" style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Setting cap in active currency (<strong>{currency}</strong>):
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        className="form-control form-control-sm"
                        style={{ width: 'auto', fontSize: '0.78rem' }}
                        value={editPeriod}
                        onChange={(e) => setEditPeriod(e.target.value)}
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{
                          position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                          color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600
                        }}>
                          {getCurrencySymbol(currency)}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control form-control-sm"
                          style={{ paddingLeft: '1.6rem', fontSize: '0.85rem' }}
                          value={newLimit}
                          onChange={(e) => setNewLimit(e.target.value)}
                          placeholder={`Cap in ${currency}`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-secondary btn-xs" onClick={() => setEditingCategory(null)}>
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-xs" onClick={() => handleSaveBudget(b.category)}>
                        Save Cap ({currency})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1" style={{ marginBottom: '0.5rem' }}>
                    <div className="flex items-center justify-between" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Spent: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(actualSpendInViewCurrency, currency, currency)}</strong>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Cap: <strong>{formatCurrency(limitInViewCurrency, currency, currency)}</strong>
                      </span>
                    </div>

                    {/* Stored Currency conversion sub-label */}
                    {storedCurr !== currency && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', fontStyle: 'italic' }}>
                        Original fed cap: {formatCurrency(effectiveCapInStoredCurr, storedCurr, storedCurr)}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="progress-bar-bg" style={{ marginBottom: '0.5rem' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: statusBg
                    }}
                  />
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between" style={{ fontSize: '0.75rem' }}>
                  <div className="flex items-center gap-1">
                    {statusIcon}
                    <span style={{ fontWeight: 600, color: statusBg }}>{statusText}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {usedPct.toFixed(1)}% used
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC INTERACTIVE SAVINGS GOALS SECTION */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank size={20} className="text-primary" />
              <span>Active Savings Goals</span>
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Set personal target savings milestones for vacations, emergencies, and big purchases
            </p>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddGoalModal(true)}
            style={{ gap: '0.35rem' }}
          >
            <PlusCircle size={14} />
            <span>Add New Goal</span>
          </button>
        </div>

        {/* Add Goal Form Inline */}
        {showAddGoalModal && (
          <form
            onSubmit={handleCreateSavingsGoal}
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--primary)',
              marginBottom: '1.25rem',
              animation: 'fadeIn 0.2s ease-in'
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              ✨ Create New Savings Target Goal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Goal Title & Emoji
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. 🚗 Car Downpayment"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Target Goal Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control form-control-sm"
                  placeholder="e.g. 5000"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Already Saved ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control form-control-sm"
                  placeholder="e.g. 1000 (Optional)"
                  value={newGoalSaved}
                  onChange={(e) => setNewGoalSaved(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddGoalModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Target Goal
              </button>
            </div>
          </form>
        )}

                {/* Savings Goals Grid */}
                {savingsGoals.length === 0 ? (
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
                    {savingsGoals.map(goal => {
                      const savedInView = convertCurrency(goal.savedAmount, goal.currency || 'USD', currency);
                      const targetInView = convertCurrency(goal.targetAmount, goal.currency || 'USD', currency);
                      const pct = targetInView > 0 ? Math.min(((savedInView / targetInView) * 100), 100) : 0;
                      const isCompleted = savedInView >= targetInView;
                      const isAddingDeposit = editingGoalId === goal.id;

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
                                className="btn btn-danger btn-icon"
                                style={{ width: '1.5rem', height: '1.5rem', padding: 0 }}
                                onClick={() => handleDeleteGoal(goal.id)}
                                title="Delete Goal"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                            {formatCurrency(savedInView, currency, currency)} / {formatCurrency(targetInView, currency, currency)}
                          </div>

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

import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Edit3, Plus, ShieldAlert, Calendar, RefreshCw } from 'lucide-react';
import { CATEGORY_META, formatCurrency, convertCurrency, getCurrencySymbol } from '../utils/formatters';

export default function BudgetTracker({
  budgets = [],
  currency,
  onUpdateBudget,
  transactions = []
}) {
  const [budgetPeriod, setBudgetPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [editPeriod, setEditPeriod] = useState('MONTHLY');

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

      {/* Savings Goals Widget */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Active Savings Goals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>🏖️ Summer Vacation</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>75%</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {formatCurrency(1500, currency)} / {formatCurrency(2000, currency)}
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '75%', backgroundColor: 'var(--success)' }} />
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>💻 New Work Laptop</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--info)', fontWeight: 600 }}>50%</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {formatCurrency(1200, currency)} / {formatCurrency(2400, currency)}
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '50%', backgroundColor: 'var(--info)' }} />
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>🛡️ Emergency Fund</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>90%</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {formatCurrency(4500, currency)} / {formatCurrency(5000, currency)}
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '90%', backgroundColor: 'var(--primary)' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

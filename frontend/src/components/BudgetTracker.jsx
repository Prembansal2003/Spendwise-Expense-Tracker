import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Edit3, Plus, ShieldAlert } from 'lucide-react';
import { CATEGORY_META, formatCurrency } from '../utils/formatters';

export default function BudgetTracker({
  budgets,
  currency,
  onUpdateBudget
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');

  const handleEditClick = (b) => {
    setEditingCategory(b.category);
    setNewLimit(b.monthlyLimit);
  };

  const handleSaveBudget = (cat) => {
    if (!newLimit || Number(newLimit) < 0) return;
    onUpdateBudget(cat, Number(newLimit));
    setEditingCategory(null);
  };

  return (
    <div className="flex flex-col gap-6" style={{ marginBottom: '1.5rem' }}>
      
      {/* Category Budgets Overview */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Monthly Category Budgets
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Set monthly spending caps and receive real-time limit alerts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => {
            const meta = CATEGORY_META[b.category] || { name: b.category, icon: '📦', color: '#64748b' };
            const isEditing = editingCategory === b.category;
            const pct = Math.min(b.percentageUsed, 100);

            let statusBg = 'var(--success)';
            let statusText = 'On Track';
            let statusIcon = <CheckCircle size={14} color="var(--success)" />;

            if (b.status === 'EXCEEDED') {
              statusBg = 'var(--danger)';
              statusText = 'Over Budget!';
              statusIcon = <ShieldAlert size={14} color="var(--danger)" />;
            } else if (b.status === 'WARNING') {
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
                  border: `1px solid ${b.status === 'EXCEEDED' ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{meta.name}</span>
                  </div>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: '1.8rem', height: '1.8rem' }}
                    onClick={() => handleEditClick(b)}
                    title="Change Budget Cap"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>

                {/* Edit input inline */}
                {isEditing ? (
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="number"
                      className="form-control"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveBudget(b.category)}>
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Spent: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(b.currentSpend, currency)}</strong>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Cap: <strong>{formatCurrency(b.monthlyLimit, currency)}</strong>
                    </span>
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
                    {b.percentageUsed.toFixed(1)}% used
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

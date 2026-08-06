import React, { useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function NotificationCenter({
  budgets,
  transactions,
  currency
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);

  // Generate automated real-time notifications based on current data
  const notifications = [];

  // 1. Check over-budget alerts
  budgets.forEach(b => {
    const actualSpend = transactions
      .filter(t => t.type === 'EXPENSE' && t.category === b.category)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const limit = Number(b.monthlyLimit || 0);
    if (limit > 0) {
      const pct = (actualSpend / limit) * 100;
      if (pct > 100) {
        notifications.push({
          id: `budget_exceeded_${b.category}`,
          type: 'DANGER',
          title: `Budget Exceeded: ${b.category}`,
          desc: `Spending (${formatCurrency(actualSpend, currency)}) has passed your limit (${formatCurrency(limit, currency)}).`,
          time: 'Just now'
        });
      } else if (pct >= 80) {
        notifications.push({
          id: `budget_warning_${b.category}`,
          type: 'WARNING',
          title: `Near Budget Cap: ${b.category}`,
          desc: `You have reached ${pct.toFixed(0)}% of your monthly cap.`,
          time: 'Today'
        });
      }
    }
  });

  // 2. Add savings rate milestone notification
  const incomeSum = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const expenseSum = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  if (incomeSum > 0 && ((incomeSum - expenseSum) / incomeSum) >= 0.2) {
    notifications.push({
      id: 'savings_milestone',
      type: 'SUCCESS',
      title: 'Savings Milestone Achieved!',
      desc: 'Your net savings rate is over 20% this month. Great discipline!',
      time: 'Aug 2026'
    });
  }

  // Add system welcome notification
  notifications.push({
    id: 'system_welcome',
    type: 'INFO',
    title: 'SpendWise Security Active',
    desc: 'BCrypt Password Encryption & AI Financial Analytics active.',
    time: 'System'
  });

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Bell Button */}
      <button
        className="btn btn-secondary btn-icon"
        style={{ position: 'relative' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Notification Center"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-card-solid)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '125%',
          width: '320px',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
          padding: '1rem',
          zIndex: 9999,
          animation: 'slideUp 0.2s ease-out'
        }}>
          
          <div className="flex items-center justify-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
            <div className="flex items-center gap-1.5">
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
              <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                {unreadCount} New
              </span>
            </div>
            <button className="btn btn-secondary btn-icon" style={{ width: '1.5rem', height: '1.5rem' }} onClick={() => setIsOpen(false)}>
              <X size={12} />
            </button>
          </div>

          {/* List */}
          <div className="flex flex-col gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {notifications.map(n => {
              const isRead = readIds.includes(n.id);
              let icon = <Info size={16} color="var(--info)" />;
              if (n.type === 'DANGER') icon = <ShieldAlert size={16} color="var(--danger)" />;
              if (n.type === 'WARNING') icon = <AlertTriangle size={16} color="var(--warning)" />;
              if (n.type === 'SUCCESS') icon = <CheckCircle2 size={16} color="var(--success)" />;

              return (
                <div
                  key={n.id}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isRead ? 'transparent' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    opacity: isRead ? 0.6 : 1,
                    fontSize: '0.8125rem'
                  }}
                  onClick={() => setReadIds(prev => [...prev, n.id])}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.2rem' }}>
                    <div className="flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                      {icon}
                      <span>{n.title}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}

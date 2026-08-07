import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { formatCurrency, convertCurrency } from '../utils/formatters';

export default function StatCards({ transactions, currency }) {
  // Convert each transaction's stored amount & currency to the active display currency
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
      
      {/* Net Balance Card */}
      <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Net Balance
          </span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Wallet size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
          {formatCurrency(balance, currency, currency)}
        </div>
        <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {balance >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{balance >= 0 ? 'Positive net cash flow' : 'Deficit spending warning'}</span>
        </div>
      </div>

      {/* Income Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Inflow
          </span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <TrendingUp size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem', color: 'var(--success)' }}>
          {formatCurrency(totalIncome, currency, currency)}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Total earned across records
        </div>
      </div>

      {/* Expense Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Outflow
          </span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <TrendingDown size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem', color: 'var(--danger)' }}>
          {formatCurrency(totalExpense, currency, currency)}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Total spent across records
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Savings Rate
          </span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PiggyBank size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
          {savingsRate.toFixed(1)}%
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {savingsRate >= 20 ? '🎉 Excellent savings habit!' : 'Target: 20%+ savings rate'}
        </div>
      </div>

    </div>
  );
}

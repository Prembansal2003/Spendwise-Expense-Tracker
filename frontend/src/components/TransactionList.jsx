import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Edit2, Trash2, Calendar, CreditCard, Tag } from 'lucide-react';
import { CATEGORY_META, formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionList({
  transactions,
  currency,
  onEditTransaction,
  onDeleteTransaction
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter transactions
  let filtered = transactions.filter(t => {
    if (selectedType !== 'ALL' && t.type !== selectedType) return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = t.notes && t.notes.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  });

  // Sort transactions
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.transactionDate) - new Date(a.transactionDate);
    if (sortBy === 'date-asc') return new Date(a.transactionDate) - new Date(b.transactionDate);
    if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
    if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
    return 0;
  });

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Header & Controls Bar */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Recent Transactions
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {transactions.length} records
          </p>
        </div>

        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expenses Only</option>
          </select>

          {/* Category Filter */}
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {Object.keys(CATEGORY_META).map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat].icon} {CATEGORY_META[cat].name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>No transactions found</p>
          <p style={{ fontSize: '0.8125rem' }}>Try clearing your search query or filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(item => {
            const meta = CATEGORY_META[item.category] || { name: item.category, icon: '📦', color: '#64748b', bg: 'rgba(100,116,139,0.15)' };
            const isIncome = item.type === 'INCOME';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between"
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                {/* Left side icon & info */}
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: meta.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    {meta.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</span>
                      <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                        {isIncome ? '+ Income' : '- Expense'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(item.transactionDate)}
                      </span>
                      {item.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <CreditCard size={12} />
                          {item.paymentMethod}
                        </span>
                      )}
                      {item.notes && (
                        <span style={{ fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{item.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side amount & actions */}
                <div className="flex items-center gap-4">
                  <div style={{
                    textAlign: 'right',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: isIncome ? 'var(--success)' : 'var(--text-primary)'
                  }}>
                    {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency, item.currency || currency)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ width: '2rem', height: '2rem' }}
                      onClick={() => onEditTransaction(item)}
                      title="Edit Entry"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      style={{ width: '2rem', height: '2rem' }}
                      onClick={() => onDeleteTransaction(item.id)}
                      title="Delete Entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

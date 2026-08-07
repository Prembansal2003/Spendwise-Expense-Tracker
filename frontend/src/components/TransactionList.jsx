import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Edit2, Trash2, Calendar, CreditCard, Tag, RotateCcw, X, CalendarDays } from 'lucide-react';
import { CATEGORY_META, formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionList({
  transactions,
  currency,
  onEditTransaction,
  onDeleteTransaction,
  onResetData
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(''); // Specific date filter
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter transactions
  let filtered = transactions.filter(t => {
    if (selectedType !== 'ALL' && t.type !== selectedType) return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    
    // Specific date filter
    if (selectedDate) {
      const txDate = t.transactionDate || '';
      if (txDate !== selectedDate) return false;
    }

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
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Specific Date Picker */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="date"
              className="form-control"
              style={{ paddingRight: selectedDate ? '2rem' : '0.5rem', fontSize: '0.8rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              title="Filter transactions by specific date"
            />
            {selectedDate && (
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                style={{ position: 'absolute', right: '0.25rem', width: '1.4rem', height: '1.4rem', padding: 0 }}
                onClick={() => setSelectedDate('')}
                title="Clear date filter"
              >
                <X size={12} />
              </button>
            )}
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

      {/* Active Specific Date Filter Pill */}
      {selectedDate && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.5rem 0.85rem',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between'
        }}>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={15} />
            Showing transactions for specific date: <strong>{formatDate(selectedDate)}</strong>
          </span>
          <button
            className="btn btn-secondary btn-xs"
            onClick={() => setSelectedDate('')}
            style={{ marginLeft: 'auto', gap: '0.25rem' }}
          >
            <X size={12} /> Show All Dates
          </button>
        </div>
      )}

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {selectedDate ? `No transactions recorded on ${formatDate(selectedDate)}` : 'No transactions found'}
          </p>
          <p style={{ fontSize: '0.8125rem' }}>
            {selectedDate ? 'Try selecting a different date or clearing the date filter.' : 'Try clearing your search query or filters.'}
          </p>
          {selectedDate && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setSelectedDate('')}
            >
              Clear Date Filter
            </button>
          )}
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
                  flexWrap: 'wrap',
                  gap: '0.75rem',
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
                    {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency, item.currency || 'USD')}
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

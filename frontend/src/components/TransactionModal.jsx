import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { CATEGORY_META, getCurrencySymbol } from '../utils/formatters';

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currency = 'USD'
}) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: 'FOOD',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    notes: ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || '',
        // Amount is stored in its original currency — show as-is if currencies match,
        // else convert from stored to current display currency
        amount: editingTransaction.amount || '',
        type: editingTransaction.type || 'EXPENSE',
        category: editingTransaction.category || 'FOOD',
        transactionDate: editingTransaction.transactionDate || new Date().toISOString().split('T')[0],
        paymentMethod: editingTransaction.paymentMethod || 'Credit Card',
        notes: editingTransaction.notes || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'EXPENSE',
        category: 'FOOD',
        transactionDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
        notes: ''
      });
    }
  }, [editingTransaction, isOpen, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) return;

    onSave({
      ...formData,
      amount: Number(formData.amount)
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Type Switcher */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`btn ${formData.type === 'EXPENSE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  backgroundColor: formData.type === 'EXPENSE' ? 'var(--danger)' : undefined,
                  borderColor: formData.type === 'EXPENSE' ? 'var(--danger)' : undefined,
                  color: formData.type === 'EXPENSE' ? '#fff' : undefined
                }}
                onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
              >
                💸 Expense
              </button>
              <button
                type="button"
                className={`btn ${formData.type === 'INCOME' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  backgroundColor: formData.type === 'INCOME' ? 'var(--success)' : undefined,
                  borderColor: formData.type === 'INCOME' ? 'var(--success)' : undefined,
                  color: formData.type === 'INCOME' ? '#fff' : undefined
                }}
                onClick={() => setFormData({ ...formData, type: 'INCOME', category: 'SALARY' })}
              >
                💰 Income
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title / Merchant</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Organic Groceries, Salary, Electric Bill"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Amount ({getCurrencySymbol(currency)})</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.95rem', pointerEvents: 'none'
                }}>
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  style={{ paddingLeft: '2rem' }}
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {Object.keys(CATEGORY_META).map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_META[cat].icon} {CATEGORY_META[cat].name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Additional comments or tags..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={18} />
              <span>{editingTransaction ? 'Update Entry' : 'Save Entry'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

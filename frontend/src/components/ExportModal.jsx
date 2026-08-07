import React, { useState } from 'react';
import { X, FileText, Download, RotateCcw, Database, Calendar, Printer, Filter } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

export default function ExportModal({
  isOpen,
  onClose,
  transactions = [],
  onResetData
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  // Filter transactions within selected date timeframe
  const filtered = transactions.filter(t => {
    const d = t.transactionDate || '2026-08-01';
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  // Set preset ranges
  const setPresetRange = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'THIS_MONTH') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setStartDate(`${year}-${month}-01`);
      setEndDate(todayStr);
    } else if (preset === 'LAST_30') {
      const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'THIS_YEAR') {
      const year = today.getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    }
  };

  // Export CSV function for selected timeframe
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('No transactions match the selected timeframe!');
      return;
    }

    const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date', 'Payment Method', 'Notes'];
    const rows = filtered.map(t => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.transactionDate,
      `"${t.paymentMethod || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    const rangeSuffix = startDate && endDate ? `${startDate}_to_${endDate}` : (startDate ? `from_${startDate}` : 'AllTime');
    link.setAttribute('download', `SpendWise_Export_${rangeSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON function for selected timeframe
  const handleExportJSON = () => {
    if (filtered.length === 0) {
      alert('No transactions match the selected timeframe!');
      return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);

    const rangeSuffix = startDate && endDate ? `${startDate}_to_${endDate}` : (startDate ? `from_${startDate}` : 'AllTime');
    link.setAttribute('download', `SpendWise_Backup_${rangeSuffix}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF statement summary
  const handlePrintPDF = () => {
    if (filtered.length === 0) {
      alert('No transactions match the selected timeframe!');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let incomeSum = 0;
    let expenseSum = 0;
    filtered.forEach(t => {
      if (t.type === 'INCOME') incomeSum += Number(t.amount);
      if (t.type === 'EXPENSE') expenseSum += Number(t.amount);
    });

    const rowsHtml = filtered.map(t => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${t.transactionDate}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd;"><strong>${t.title}</strong></td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${t.category}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; color:${t.type === 'INCOME' ? '#10b981' : '#ef4444'}; font-weight:bold;">
          ${t.type === 'INCOME' ? '+' : '-'}$${Number(t.amount).toFixed(2)}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>SpendWise Statement (${startDate || 'Start'} to ${endDate || 'Present'})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { color: #6366f1; margin-bottom: 5px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f3f4f6; text-align: left; padding: 8px; border-bottom: 2px solid #ddd; }
            .summary { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>SpendWise Financial Statement</h2>
          <div class="meta">
            Timeframe: <strong>${startDate || 'Beginning'}</strong> to <strong>${endDate || 'Present'}</strong><br/>
            Generated on: ${new Date().toLocaleDateString()}
          </div>

          <div class="summary">
            Total Inflow: <strong style="color:#10b981;">+$${incomeSum.toFixed(2)}</strong> &nbsp;|&nbsp;
            Total Outflow: <strong style="color:#ef4444;">-$${expenseSum.toFixed(2)}</strong> &nbsp;|&nbsp;
            Net Balance: <strong>$${(incomeSum - expenseSum).toFixed(2)}</strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Custom Timeframe Data Export & Backup
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Timeframe Date Range Selector */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} className="text-primary" />
            <span>Select Download Timeframe</span>
          </h4>

          {/* Quick Preset Range Buttons */}
          <div className="flex items-center gap-1.5" style={{ marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-xs" onClick={() => setPresetRange('ALL')}>All Time</button>
            <button className="btn btn-secondary btn-xs" onClick={() => setPresetRange('THIS_MONTH')}>This Month</button>
            <button className="btn btn-secondary btn-xs" onClick={() => setPresetRange('LAST_30')}>Last 30 Days</button>
            <button className="btn btn-secondary btn-xs" onClick={() => setPresetRange('THIS_YEAR')}>This Year (2026)</button>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                From Start Date
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                To End Date
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Records Counter Pill */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
            Selected Timeframe Records: <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> of {transactions.length} transactions
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="flex flex-col gap-3">
          
          {/* CSV Export Option */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex items-center justify-between" style={{ gap: '1rem' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Excel / CSV Spreadsheet</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Compatible with Excel & Google Sheets</p>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
                <Download size={14} /> Download CSV
              </button>
            </div>
          </div>

          {/* Print PDF Option */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex items-center justify-between" style={{ gap: '1rem' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Printer size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Print / Save PDF Statement</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Formatted PDF statement for printing</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handlePrintPDF}>
                <Printer size={14} /> Print PDF
              </button>
            </div>
          </div>

          {/* JSON Backup Option */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex items-center justify-between" style={{ gap: '1rem' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>JSON Database Backup</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Full raw data backup format</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
                <Download size={14} /> Download JSON
              </button>
            </div>
          </div>

          {/* Reset Demo Data Option */}
          {onResetData && (
            <div style={{
              padding: '0.875rem 1.25rem',
              backgroundColor: 'var(--danger-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239,68,68,0.2)',
              marginTop: '0.5rem'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>Reset Sample Demo Data</h4>
                </div>
                <button
                  className="btn btn-danger btn-xs"
                  onClick={() => {
                    if (window.confirm('Reset app data to default sample transactions?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

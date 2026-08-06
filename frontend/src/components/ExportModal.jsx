import React from 'react';
import { X, FileText, Download, RotateCcw, Database } from 'lucide-react';

export default function ExportModal({
  isOpen,
  onClose,
  transactions,
  onResetData
}) {
  if (!isOpen) return null;

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date', 'Payment Method', 'Notes'];
    const rows = transactions.map(t => [
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
    link.setAttribute('download', `SpendWise_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON function
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `SpendWise_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Data Export & Backup Manager
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* CSV Export Option */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Export to CSV Spreadsheet</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Download transaction history compatible with Excel and Google Sheets.
                </p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={handleExportCSV}>
              <Download size={14} /> Download .CSV File
            </button>
          </div>

          {/* JSON Backup Option */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Export JSON Database Backup</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Complete raw JSON data format for full app restoration.
                </p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleExportJSON}>
              <Download size={14} /> Download JSON Backup
            </button>
          </div>

          {/* Reset Demo Data Option */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--danger-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.2)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)' }}>Reset Sample Demo Data</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Reset local transactions and budgets to default sample values.
                </p>
              </div>
            </div>
            <button
              className="btn btn-danger btn-sm"
              style={{ width: '100%' }}
              onClick={() => {
                if (window.confirm('Reset app data to default sample transactions?')) {
                  onResetData();
                  onClose();
                }
              }}
            >
              <RotateCcw size={14} /> Reset Data
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

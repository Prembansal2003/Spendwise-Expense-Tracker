import React, { useState } from 'react';
import { Wallet, Sun, Moon, Plus, Download, LayoutDashboard, Receipt, Target, Server, User, LogOut, ChevronDown, Bot, Sparkles } from 'lucide-react';
import { CURRENCIES } from '../utils/formatters';
import NotificationCenter from './NotificationCenter';

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  currency,
  setCurrency,
  onOpenAddModal,
  onOpenExportModal,
  isBackend,
  user,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenAiModal,
  onLogout,
  budgets,
  transactions
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="glass-card" style={{ padding: '0.875rem 1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 500 }}>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo & Live System Status */}
        <div className="flex items-center gap-3">
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                SpendWise
              </h1>
              <span className="badge" style={{
                fontSize: '0.68rem',
                backgroundColor: isBackend ? 'var(--success-bg)' : 'var(--primary-light)',
                color: isBackend ? 'var(--success)' : 'var(--primary)',
                border: `1px solid ${isBackend ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isBackend ? 'var(--success)' : 'var(--primary)', display: 'inline-block' }} />
                {isBackend ? 'Spring Engine Live' : 'Full Stack Edition'}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Financial Intelligence & Analytics Dashboard
            </p>
          </div>
        </div>

        {/* Segmented Tab Navigation Controller */}
        <nav className="flex items-center gap-1" style={{
          background: 'var(--bg-secondary)',
          padding: '0.2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <button
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={15} />
            Overview
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('transactions')}
          >
            <Receipt size={15} />
            Transactions
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'budgets' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('budgets')}
          >
            <Target size={15} />
            Budgets
          </button>
        </nav>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2" style={{ position: 'relative' }}>
          
          {/* AI Advisor Button */}
          <button
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.35rem 0.7rem',
              gap: '0.35rem',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              color: 'var(--primary)',
              fontWeight: 700
            }}
            onClick={onOpenAiModal}
            title="Open AI Financial Advisor"
          >
            <Bot size={15} />
            <span>AI Advisor</span>
          </button>

          {/* Notification Center */}
          <NotificationCenter budgets={budgets} transactions={transactions} currency={currency} />

          {/* Currency Selector */}
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.35rem 0.55rem', fontSize: '0.8rem', fontWeight: 600 }}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Export CTA */}
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '2rem', height: '2rem' }}
            onClick={onOpenExportModal}
            title="Export Data / Backup"
          >
            <Download size={16} />
          </button>

          {/* Theme Toggle */}
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '2rem', height: '2rem' }}
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
          </button>

          {/* Add Entry CTA */}
          <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>New Transaction</span>
          </button>

          {/* User Profile Avatar Pill & Dropdown */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.6rem', gap: '0.4rem', borderRadius: 'var(--radius-md)' }}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={13} />
              </button>

              {/* Profile Dropdown Menu */}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '125%',
                  width: '220px',
                  backgroundColor: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.4rem',
                  zIndex: 9999,
                  animation: 'slideUp 0.18s ease-out'
                }}>
                  <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.2rem' }}
                    onClick={() => { setShowDropdown(false); onOpenProfileModal(); }}
                  >
                    <User size={14} /> Account Settings
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}
                    onClick={() => { setShowDropdown(false); onLogout(); }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onOpenAuthModal}>
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

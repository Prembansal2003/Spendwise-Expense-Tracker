import React, { useState } from 'react';
import { Wallet, Sun, Moon, Plus, Download, LayoutDashboard, Receipt, Target, User, LogOut, ChevronDown, Bot, ZoomIn, BarChart2 } from 'lucide-react';
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
    <header className="glass-card header-container" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.25rem', position: 'relative', zIndex: 500 }}>
      
      {/* Top Bar: Brand + Quick Utility Tools (Theme, AI, User) */}
      <div className="header-top flex items-center justify-between gap-2">
        
        {/* Brand Logo & Live System Status */}
        <div className="flex items-center gap-2.5">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}>
            <Wallet size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                SpendWise
              </h1>
              <span className="badge" style={{
                fontSize: '0.62rem',
                padding: '0.15rem 0.4rem',
                backgroundColor: isBackend ? 'var(--success-bg)' : 'var(--primary-light)',
                color: isBackend ? 'var(--success)' : 'var(--primary)',
                border: `1px solid ${isBackend ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`
              }}>
                {isBackend ? 'Engine Live' : 'Full Stack'}
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Financial Tracker
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-1.5">
          
          {/* AI Advisor Button */}
          <button
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.35rem 0.6rem',
              gap: '0.3rem',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              color: 'var(--primary)',
              fontWeight: 700
            }}
            onClick={onOpenAiModal}
            title="Open AI Financial Advisor"
          >
            <Bot size={15} />
            <span className="hidden-mobile">AI Advisor</span>
          </button>

          {/* Notification Center */}
          <NotificationCenter budgets={budgets} transactions={transactions} currency={currency} />

          {/* Theme Toggle */}
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '1.9rem', height: '1.9rem' }}
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
          </button>

          {/* User Profile */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.45rem', gap: '0.25rem', borderRadius: 'var(--radius-md)' }}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span className="hidden-mobile" style={{ fontWeight: 700, fontSize: '0.8rem' }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={12} />
              </button>

              {/* Profile Dropdown */}
              {showDropdown && (
                <div style={{
                  position: 'absolute', right: 0, top: '125%', width: '200px',
                  backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '0.4rem', zIndex: 9999
                }}>
                  <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.2rem' }} onClick={() => { setShowDropdown(false); onOpenProfileModal(); }}>
                    <ZoomIn size={14} /> View / Edit Photo
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.2rem' }} onClick={() => { setShowDropdown(false); onOpenProfileModal(); }}>
                    <User size={14} /> Profile Settings
                  </button>
                  <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => { setShowDropdown(false); onLogout(); }}>
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onOpenAuthModal}>
              <User size={14} />
            </button>
          )}

        </div>

      </div>

      {/* Row 2: Segmented Tabs & Action Bar */}
      <div className="header-bottom flex items-center justify-between gap-2" style={{ marginTop: '0.75rem', flexWrap: 'wrap' }}>
        
        {/* Nav Tabs */}
        <nav className="flex items-center gap-1 nav-tabs-container">
          <button
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('transactions')}
          >
            <Receipt size={14} />
            <span>Transactions</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={14} />
            <span>Analytics</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'budgets' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('budgets')}
          >
            <Target size={14} />
            <span>Budgets</span>
          </button>
        </nav>

        {/* Action Controls (Currency, Export, New Transaction) */}
        <div className="flex items-center gap-1.5 header-action-group">
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.3rem 0.45rem', fontSize: '0.78rem', fontWeight: 600 }}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>

          <button className="btn btn-secondary btn-icon" style={{ width: '1.9rem', height: '1.9rem' }} onClick={onOpenExportModal} title="Export Data">
            <Download size={14} />
          </button>

          <button className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.65rem' }} onClick={onOpenAddModal}>
            <Plus size={15} />
            <span>New Entry</span>
          </button>
        </div>

      </div>

    </header>
  );
}

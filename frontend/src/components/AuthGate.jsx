import React, { useState } from 'react';
import { Wallet, ShieldCheck, Sparkles, TrendingUp, PieChart, Lock, Mail, User, Eye, EyeOff, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function AuthGate({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Please enter valid email and password');
      return;
    }

    if (activeTab === 'register' && !formData.name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    setErrorMsg('');

    const userObj = {
      id: Date.now(),
      name: activeTab === 'register' ? formData.name : (formData.email.split('@')[0] || 'SpendWise Member'),
      email: formData.email,
      role: 'PRO_MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      createdAt: 'Aug 2026'
    };

    onLoginSuccess(userObj);
  };

  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 101,
      name: 'Alex Morgan',
      email: 'alex.morgan@spendwise.io',
      role: 'PRO_MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      createdAt: 'Aug 2026'
    };
    onLoginSuccess(demoUser);
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" style={{ width: '100%', maxWidth: '1100px' }}>
        
        {/* Left Side: Hero Info & Value Proposition */}
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              backgroundColor: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              <Wallet size={24} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              SpendWise
            </span>
            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)' }}>
              Full Stack Edition
            </span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Take Control of Your Personal Finances & Budgets
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            An intelligent financial analytics platform powered by Java Spring Boot 3, React 18, AI recommendations, and multi-user data isolation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '0.875rem 1rem' }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                <TrendingUp size={16} color="var(--primary)" />
                <span>Cash Flow Analytics</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interactive trend line charts and category breakdown doughnut visualizer.</p>
            </div>

            <div className="glass-card" style={{ padding: '0.875rem 1rem' }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                <Sparkles size={16} color="var(--success)" />
                <span>AI Financial Advisor</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated financial health score (0-100) & smart savings strategies.</p>
            </div>
          </div>

          {/* Quick Demo Login CTA */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--primary-light)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', display: 'block' }}>⚡ 1-Click Instant Demo Login</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test the full platform immediately as Alex Morgan</span>
            </div>
            <button className="btn btn-primary" onClick={handleQuickDemoLogin}>
              <span>Login as Alex</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Right Side: Authentication Form Card */}
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '440px', justifySelf: 'center', width: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {activeTab === 'login' ? 'Account Sign In' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {activeTab === 'login' ? 'Enter your credentials to access your dashboard' : 'Sign up for a private financial workspace'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2" style={{
            background: 'var(--bg-secondary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem'
          }}>
            <button
              className={`btn btn-sm ${activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            >
              <UserPlus size={14} /> Register
            </button>
          </div>

          {errorMsg && (
            <div style={{
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Alex Morgan"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="alex.morgan@spendwise.io"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
              {activeTab === 'login' ? 'Sign In to Workspace' : 'Create Account'}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

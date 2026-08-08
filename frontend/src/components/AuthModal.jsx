import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Please enter valid email and password');
      return;
    }

    if (activeTab === 'login') {
      const backendUser = await apiService.loginUser(formData.email, formData.password);
      if (backendUser && backendUser.id) {
        setErrorMsg('');
        onLoginSuccess({
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role || 'PRO_MEMBER',
          avatarUrl: backendUser.avatarUrl || '/default-avatar.png',
          token: backendUser.token
        });
        onClose();
        return;
      }

      const storedUserRaw = localStorage.getItem('spendwise_user');
      let knownUsers = [
        {
          id: 101,
          name: 'Prem Agrawal',
          email: 'agrawalprem00@gmail.com',
          password: 'password123',
          role: 'PRO_MEMBER',
          avatarUrl: '/default-avatar.png',
          createdAt: 'Aug 2026'
        }
      ];

      if (storedUserRaw) {
        try {
          const parsed = JSON.parse(storedUserRaw);
          if (parsed && parsed.email && !knownUsers.some(u => u.email.toLowerCase() === parsed.email.toLowerCase())) {
            knownUsers.push(parsed);
          }
        } catch (e) {}
      }

      const matchedUser = knownUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (!matchedUser) {
        setErrorMsg('No registered account found with this email address. Please Register first.');
        return;
      }

      if (matchedUser.password && matchedUser.password !== formData.password) {
        setErrorMsg('Incorrect password for this account. Please try again.');
        return;
      }

      setErrorMsg('');
      onLoginSuccess(matchedUser);
      onClose();
      return;
    }

    if (activeTab === 'register') {
      if (!formData.name.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }

      const backendUser = await apiService.registerUser(formData.name, formData.email, formData.password);
      if (backendUser && backendUser.id) {
        setErrorMsg('');
        onLoginSuccess({
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role || 'PRO_MEMBER',
          avatarUrl: backendUser.avatarUrl || '/default-avatar.png',
          token: backendUser.token
        });
        onClose();
        return;
      }

      const existingUser = localStorage.getItem('spendwise_user');
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser);
          if (parsed && parsed.email && parsed.email.toLowerCase() === formData.email.toLowerCase()) {
            setErrorMsg('An account with this email address already exists. Please sign in instead.');
            return;
          }
        } catch (e) {}
      }

      const userObj = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'PRO_MEMBER',
        avatarUrl: '/default-avatar.png',
        createdAt: 'Aug 2026'
      };

      setErrorMsg('');
      onLoginSuccess(userObj);
      onClose();
    }
  };

  // Quick 1-click Demo Login
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 101,
      name: 'Prem Agrawal',
      email: 'agrawalprem00@gmail.com',
      role: 'PRO_MEMBER',
      avatarUrl: '/default-avatar.png',
      createdAt: 'Aug 2026'
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {activeTab === 'login' ? 'Sign in to access your budget dashboard' : 'Join SpendWise to manage your finances'}
            </p>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
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

        {/* Quick Demo Login Banner */}
        <div style={{
          padding: '0.875rem',
          backgroundColor: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} color="var(--primary)" />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary)' }}>Instant Demo Access</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sign in instantly as Prem Agrawal</p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleQuickDemoLogin}>
            Quick Login
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

        {/* Form */}
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
                  placeholder="Prem Agrawal"
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
                placeholder="agrawalprem00@gmail.com"
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
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {activeTab === 'login' ? 'Sign In to Account' : 'Create New Account'}
          </button>

        </form>

      </div>
    </div>
  );
}

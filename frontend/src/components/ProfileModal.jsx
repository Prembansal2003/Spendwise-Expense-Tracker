import React from 'react';
import { X, ShieldCheck, Mail, Calendar, Award, LogOut, CheckCircle2, UserCheck } from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onLogout
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            User Profile & Account
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          marginBottom: '1.25rem',
          position: 'relative'
        }}>
          {/* Avatar Image */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.75rem' }}>
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              backgroundColor: 'var(--success)',
              color: '#fff',
              borderRadius: '50%',
              padding: '2px',
              border: '2px solid var(--bg-card-solid)'
            }}>
              <CheckCircle2 size={12} />
            </div>
          </div>

          <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user.name}</h4>
          
          <div className="flex items-center justify-center gap-2" style={{ marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <Award size={12} /> {user.role || 'Pro Member'}
            </span>
            <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck size={12} /> Verified
            </span>
          </div>

          {/* Account Details */}
          <div className="flex flex-col gap-2" style={{
            paddingTop: '0.875rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)'
          }}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Mail size={14} /> Email Address
              </span>
              <span style={{ fontWeight: 600 }}>{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={14} /> Member Since
              </span>
              <span style={{ fontWeight: 600 }}>{user.createdAt || 'Aug 2026'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <UserCheck size={14} /> Data Access
              </span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>Full Premium Access</span>
            </div>
          </div>
        </div>

        {/* Security & Settings Summary */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          fontSize: '0.8125rem'
        }}>
          <h5 style={{ fontWeight: '700', marginBottom: '0.35rem' }}>🔒 Account Security & Preferences</h5>
          <p style={{ color: 'var(--text-muted)' }}>
            Two-factor authentication (2FA) is active. Your transactions and budget analytics are encrypted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut size={14} /> Log Out
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}

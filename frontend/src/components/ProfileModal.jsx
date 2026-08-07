import React, { useState, useRef } from 'react';
import { X, ShieldCheck, Mail, Calendar, Award, LogOut, CheckCircle2, UserCheck, Camera, Upload, Link, Check, RefreshCw } from 'lucide-react';

const PRESET_AVATARS = [
  { label: 'Prem Agrawal', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
  { label: 'Executive', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { label: 'Developer', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80' },
  { label: 'Creative', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80' },
  { label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80' },
  { label: 'Analyst', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80' }
];

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateAvatar
}) {
  const [showEditor, setShowEditor] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !user) return null;

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && onUpdateAvatar) {
        onUpdateAvatar(reader.result);
        setShowEditor(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle custom URL save
  const handleCustomUrlSave = (e) => {
    e.preventDefault();
    if (customUrl.trim() && onUpdateAvatar) {
      onUpdateAvatar(customUrl.trim());
      setCustomUrl('');
      setShowEditor(false);
    }
  };

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
          
          {/* Avatar Image Container with Camera Badge */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.75rem' }}>
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: '0 6px 18px rgba(99, 102, 241, 0.35)'
              }}
            />

            {/* Camera Edit Overlay Button */}
            <button
              type="button"
              title="Change Profile Picture"
              onClick={() => setShowEditor(!showEditor)}
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2.5px solid var(--bg-card-solid)',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease'
              }}
            >
              <Camera size={14} />
            </button>
          </div>

          {/* Quick Edit Profile Picture Toggle */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowEditor(!showEditor)}
              style={{ fontSize: '0.75rem', gap: '0.35rem', margin: '0 auto' }}
            >
              <Camera size={13} />
              <span>{showEditor ? 'Hide Photo Options' : 'Change Profile Picture'}</span>
            </button>
          </div>

          {/* Expanded Profile Picture Editor Options */}
          {showEditor && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-card-solid)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--primary)',
              marginBottom: '1rem',
              textAlign: 'left',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              
              {/* Option 1: Upload from device */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  📁 Option 1: Upload Image File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', gap: '0.5rem', justifyContent: 'center' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  <span>Choose Photo from Device</span>
                </button>
              </div>

              {/* Option 2: Paste Image URL */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  🔗 Option 2: Paste Image Web URL
                </span>
                <form onSubmit={handleCustomUrlSave} className="flex gap-2">
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="https://example.com/photo.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Check size={14} />
                  </button>
                </form>
              </div>

              {/* Option 3: Presets */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  ✨ Option 3: Select Preset Avatar
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset.url}
                      alt={preset.label}
                      title={preset.label}
                      onClick={() => {
                        onUpdateAvatar(preset.url);
                        setShowEditor(false);
                      }}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: user.avatarUrl === preset.url ? '2px solid var(--primary)' : '2px solid transparent',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user.name}</h4>
          
          <div className="flex items-center justify-center gap-2" style={{ marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <Award size={12} /> {user.role || 'Pro Member'}
            </span>
            <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck size={12} /> Verified Account
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
                <UserCheck size={14} /> Workspace Access
              </span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>Full Access</span>
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
          <h5 style={{ fontWeight: '700', marginBottom: '0.35rem' }}>🔒 Account Security & Profile</h5>
          <p style={{ color: 'var(--text-muted)' }}>
            Your custom profile photo is saved securely in your profile preferences.
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

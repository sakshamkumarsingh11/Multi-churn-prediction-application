import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SettingsIcon, User, Mail, LogOut, Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import './Settings.css';

function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const ctx = gsap.context(() => {
      gsap.from('.auth-card', {
        opacity: 0,
        scale: 0.92,
        y: 30,
        duration: 0.7,
        ease: 'power3.out',
      });
      gsap.from('.auth-back-btn', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        delay: 0.3,
        ease: 'power2.out',
      });
    }, wrapperRef);
    return () => ctx.revert();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateUser({ name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="auth-wrapper" ref={wrapperRef}>
      <div className="auth-bg-blob"></div>

      <button className="auth-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
      </button>

      <div className="auth-card settings-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <SettingsIcon size={28} strokeWidth={1.6} />
          </div>
          <h1>Account Settings</h1>
          <p>Manage your profile information</p>
        </div>

        {/* Avatar */}
        <div className="settings-avatar">
          <div className="avatar-circle">
            {(user.name || user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="avatar-info">
            <strong>{user.name || 'User'}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="auth-form">
          <div className="auth-input-group">
            <label>Full Name</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>
          </div>

          <div className="settings-member-since">
            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>

          <button type="submit" className="auth-submit-btn">
            {saved ? (
              <>
                <CheckCircle2 size={18} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>

        <button className="settings-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

export default Settings;

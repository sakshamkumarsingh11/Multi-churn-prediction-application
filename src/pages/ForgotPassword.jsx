import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import './Login.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess('Password reset link sent! Check your email inbox (and spam folder).');
        setEmail('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper" ref={wrapperRef}>
      <div className="auth-bg-blob"></div>

      <button className="auth-back-btn" onClick={() => navigate('/login')}>
        <ArrowLeft size={20} />
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <KeyRound size={28} strokeWidth={1.6} />
          </div>
          <h1>Reset Password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`auth-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

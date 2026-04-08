import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
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

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(name, email, password);
      if (result.success) {
        navigate('/dashboard');
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

      <button className="auth-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus size={28} strokeWidth={1.6} />
          </div>
          <h1>Create Account</h1>
          <p>Sign up to start predicting churn</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Full Name</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="auth-input"
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
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Confirm Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`auth-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Settings, Zap, Target, BarChart3, Shield, Link2, Brain, Rocket, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import AnimatedBackground from '../components/backgrounds/AnimatedBackground';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const getStartedBtnRef = useRef(null);
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const trustRef = useRef(null);
  const processRef = useRef(null);
  const contactRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  const sections = ['Home', 'About Us', 'Contact Us'];

  const scrollToSection = (id) => {
    if (id === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id.toLowerCase().replace(' ', '-'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ---- Navbar scroll effects ---- */
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setScrolled(currentY > 50);
    if (currentY > lastScrollY.current && currentY > 120) {
      setNavHidden(true);
    } else {
      setNavHidden(false);
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ---- Magnetic + hover move for Get Started Button ---- */
  const handleMouseMove = (e) => {
    const btn = getStartedBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gsap.to(btn, { '--x': `${x}px`, '--y': `${y}px`, duration: 0.1 });
  };

  /* Magnetic effect — button subtly shifts towards cursor when nearby */
  const handleBtnAreaMove = (e) => {
    const btn = getStartedBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      gsap.to(btn, { x: dx * 0.2, y: dy * 0.2, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  };

  const handleBtnAreaLeave = () => {
    const btn = getStartedBtnRef.current;
    if (!btn) return;
    gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
  };

  /* ---- GSAP entrance + ScrollTrigger animations ---- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero entrance */
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.hero-title', { opacity: 0, y: 50, duration: 0.8 })
        .from('.hero-tagline', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
        .fromTo(getStartedBtnRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8 },
          '-=0.3'
        );

      /* Trust section */
      gsap.from('.trust-section .section-content h2', {
        scrollTrigger: { trigger: '.trust-section', start: 'top 80%', toggleActions: 'play none none none' },
        opacity: 0, y: 40, duration: 0.7,
      });
      gsap.from('.trust-section .section-subtitle', {
        scrollTrigger: { trigger: '.trust-section', start: 'top 78%', toggleActions: 'play none none none' },
        opacity: 0, y: 30, duration: 0.6, delay: 0.15,
      });
      gsap.from('.trust-card', {
        scrollTrigger: { trigger: '.trust-cards', start: 'top 82%', toggleActions: 'play none none none' },
        opacity: 0, y: 60, duration: 0.7, stagger: 0.15,
      });

      /* Process section */
      gsap.from('.process-section .section-content h2', {
        scrollTrigger: { trigger: '.process-section', start: 'top 80%', toggleActions: 'play none none none' },
        opacity: 0, y: 40, duration: 0.7,
      });
      gsap.from('.process-section .section-subtitle', {
        scrollTrigger: { trigger: '.process-section', start: 'top 78%', toggleActions: 'play none none none' },
        opacity: 0, y: 30, duration: 0.6, delay: 0.15,
      });
      gsap.from('.process-card', {
        scrollTrigger: { trigger: '.process-cards', start: 'top 82%', toggleActions: 'play none none none' },
        opacity: 0, x: -60, duration: 0.7, stagger: 0.18,
      });

      /* Contact section */
      gsap.from('.contact-left', {
        scrollTrigger: { trigger: '.contact-section', start: 'top 75%', toggleActions: 'play none none none' },
        opacity: 0, x: -60, duration: 0.8,
      });
      gsap.from('.contact-right', {
        scrollTrigger: { trigger: '.contact-section', start: 'top 75%', toggleActions: 'play none none none' },
        opacity: 0, x: 60, duration: 0.8, delay: 0.15,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-wrapper">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${navHidden ? 'nav-hidden' : ''}`} ref={navRef}>
        <div className="nav-logo">
          <Zap size={20} className="nav-logo-icon" />
          <span>ChurnSense</span>
        </div>
        <ul className="nav-links-center">
          {sections.map(section => (
            <li key={section}>
              <button className="nav-btn" onClick={() => scrollToSection(section)}>
                {section}
                <span className="nav-btn-underline"></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="nav-auth">
          {user ? (
            <button className="nav-btn nav-auth-btn nav-settings-btn" onClick={() => navigate('/settings')}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
          ) : (
            <>
              <button className="nav-btn nav-auth-btn nav-login-text-btn" onClick={() => navigate('/login')}>
                Login
                <span className="nav-btn-underline"></span>
              </button>
              <button className="nav-btn nav-auth-btn nav-signup-btn" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section" ref={heroRef}>
        <AnimatedBackground />
        <div className="hero-content container">
          <div className="hero-center">
            <h1 className="hero-title">Churn<span className="text-accent">Sense</span></h1>
            <p className="hero-tagline">Predict <span className="text-accent">Churn</span> before it happens — across every industry.</p>
            <div
              className="get-started-magnetic-area"
              onMouseMove={handleBtnAreaMove}
              onMouseLeave={handleBtnAreaLeave}
            >
              <button
                ref={getStartedBtnRef}
                className="get-started-btn"
                onMouseMove={handleMouseMove}
                onClick={handleGetStarted}
              >
                <span>Get Started</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Businesses Trust Us */}
      <section id="about-us" className="trust-section" ref={trustRef}>
        <div className="section-content container">
          <h2>Why Businesses Trust Us</h2>
          <p className="section-subtitle">Empowering customer success teams with the world's most accurate data-driven decision making platform.</p>
          <div className="trust-cards">
            <div className="trust-card">
              <div className="trust-icon-wrap">
                <Target size={28} />
              </div>
              <h3>Unmatched Accuracy</h3>
              <p>Advanced machine learning models tailored to your unique historical data patterns for 99% accuracy.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon-wrap">
                <BarChart3 size={28} />
              </div>
              <h3>Real-time Insights</h3>
              <p>Monitor customer health scores as they change in real-time. Catch the signals before they leave.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon-wrap">
                <Shield size={28} />
              </div>
              <h3>Proactive Retention</h3>
              <p>Automated alerts and playbooks to save at-risk accounts instantly with personalized outreach.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Simple Process */}
      <section id="process" className="process-section" ref={processRef}>
        <div className="section-content container">
          <h2>Our Simple Process</h2>
          <p className="section-subtitle">Transform your customer data into actionable retention workflows in three steps.</p>
          <div className="process-cards">
            <div className="process-card">
              <div className="process-icon-wrap process-icon-teal">
                <Link2 size={22} />
              </div>
              <h3>Connect</h3>
              <p>Integrate your data., CRM, suport desk, and billing teams seamlessly with one-click connectors.</p>
            </div>
            <div className="process-card">
              <div className="process-icon-wrap process-icon-blue">
                <Brain size={22} />
              </div>
              <h3>Train</h3>
              <p>Our proprietary AI models automatically from your historical patterns to identify unique risk factors.</p>
            </div>
            <div className="process-card">
              <div className="process-icon-wrap process-icon-red">
                <Rocket size={22} />
              </div>
              <h3>Execute</h3>
              <p>Deploy automated retention workflows and monitor monitor evere results. Save customers while you sleep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section id="contact-us" className="contact-section" ref={contactRef}>
        <div className="contact-content container">
          <div className="contact-left">
            <h2>Ready to stop churn?</h2>
            <p>Get in touch with our solution experts to see how ChurnPredict can transform your retention strategy.</p>
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon"><Mail size={18} /></div>
                <span>churnpredict@gmail.com</span>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon"><Phone size={18} /></div>
                <span>+91 9266148718</span>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon"><MapPin size={18} /></div>
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>
          <div className="contact-right">
            <form className="contact-form" onSubmit={e => e.preventDefault()}>
              <div className="form-row">
                <div className="form-group">
                  <label>FIRST NAME</label>
                  <input type="text" placeholder="John" />
                </div>
                <div className="form-group">
                  <label>LAST NAME</label>
                  <input type="text" placeholder="Doe" />
                </div>
              </div>
              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input type="email" placeholder="john@company.com" />
              </div>
              <div className="form-group">
                <label>MESSAGE</label>
                <textarea placeholder="Tell us about your churn challenges..." rows="3"></textarea>
              </div>
              <button type="submit" className="contact-submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

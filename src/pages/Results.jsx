import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Users, AlertTriangle, ShieldCheck, Activity,
  ArrowLeft, Download, TrendingUp, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import gsap from 'gsap';
import './Results.css';

/* ── Risk colour map ── */
const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const RISK_BG     = { High: 'rgba(239,68,68,0.1)', Medium: 'rgba(245,158,11,0.1)', Low: 'rgba(16,185,129,0.1)' };

function Results() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const results      = location.state?.results;
  const containerRef = useRef(null);

  const [activeTab,    setActiveTab]    = useState('overview');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterRisk,   setFilterRisk]   = useState('All');
  const [currentPage,  setCurrentPage]  = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    if (!results) return;
    const ctx = gsap.context(() => {
      gsap.from('.results-topbar',   { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
      gsap.from('.stat-card',        { opacity: 0, y:  30, duration: 0.5, stagger: 0.08, delay: 0.15, ease: 'power3.out' });
      gsap.from('.results-tabs',     { opacity: 0, y:  15, duration: 0.5, delay: 0.4, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [results]);

  if (!results) return <Navigate to="/dashboard" replace />;

  const {
    serviceLabel, totalCustomers, highRisk, mediumRisk, lowRisk,
    overallChurnRate, churnRateValue, customers = [],
    featureImportance = [], plainSummary,
  } = results;

  /* ── Filtered customer table ── */
  const filtered = customers.filter(c => {
    const matchSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk   = filterRisk === 'All' || c.risk === filterRisk;
    return matchSearch && matchRisk;
  });

  const totalPages    = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated     = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ['Customer ID', 'Churn Probability (%)', 'Risk Level', 'Suggestion'];
    const rows    = customers.map(c => [c.id, c.probability, c.risk, `"${c.suggestion}"`]);
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `churnsense_${results.serviceType}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Donut chart (SVG) ── */
  const total  = highRisk + mediumRisk + lowRisk;
  const hPct   = total ? highRisk   / total : 0;
  const mPct   = total ? mediumRisk / total : 0;
  const lPct   = total ? lowRisk    / total : 0;

  const r = 15.915;

  const hDash = hPct * 100;
  const mDash = mPct * 100;
  const lDash = lPct * 100;

  const hOffset = 25;
  const mOffset = 25 - hDash;
  const lOffset = 25 - hDash - mDash;

  /* ── Bar chart for feature importance ── */
  const maxImp = featureImportance.length ? Math.max(...featureImportance.map(f => f.importance)) : 1;

  return (
    <div className="results-container" ref={containerRef}>

      {/* ══════════════ HERO HEADER ══════════════ */}
      <div className="results-hero">
        <div className="results-hero-inner">

          {/* ── TOP BAR ── */}
          <div className="results-topbar">
            <button className="results-back-btn" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={18} />
              <span>New Prediction</span>
            </button>
            <div className="results-title-wrap">
              <h1>Prediction Results</h1>
              <span className="results-service-badge">{serviceLabel}</span>
            </div>
            <button className="results-export-btn" onClick={exportCSV}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#a5b4fc' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Analyzed</h3>
                <p className="stat-number">{totalCustomers.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#fca5a5' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <h3>High Risk</h3>
                <p className="stat-number">{highRisk.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#fcd34d' }}>
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <h3>Medium Risk</h3>
                <p className="stat-number">{mediumRisk.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#6ee7b7' }}>
                <ShieldCheck size={24} />
              </div>
              <div className="stat-info">
                <h3>Low Risk / Safe</h3>
                <p className="stat-number">{lowRisk.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#f9a8d4' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <h3>Churn Rate</h3>
                <p className="stat-number">{overallChurnRate}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════ MAIN BODY ══════════════ */}
      <div className="results-body">

        {/* ── TABS ── */}
        <div className="results-tabs">
          {['overview', 'customers', 'insights'].map(tab => (
            <button
              key={tab}
              className={`results-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {activeTab === 'overview' && (
          <div className="tab-content">

            {/* Plain English Summary */}
            <div className="plain-summary">
              <div className="plain-summary-header">
                <div className="summary-icon">
                  <Info size={18} />
                </div>
                <h3>AI Analysis Summary</h3>
              </div>
              <p>{plainSummary}</p>
            </div>

            <div className="overview-charts">

              {/* Donut chart */}
              <div className="chart-card">
                <h3 className="chart-title">
                  <span className="chart-title-dot"></span>
                  Risk Distribution
                </h3>
                <div className="donut-wrap">
                  <svg viewBox="0 0 42 42" className="donut-svg">
                    {/* background ring */}
                    <circle cx="21" cy="21" r={r} fill="transparent"
                      stroke="#f1f5f9" strokeWidth="3.5" />
                    {/* high risk */}
                    {hPct > 0 && (
                      <circle cx="21" cy="21" r={r} fill="transparent"
                        stroke={RISK_COLORS.High} strokeWidth="3.5"
                        strokeDasharray={`${hDash} ${100 - hDash}`}
                        strokeDashoffset={hOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 21 21)" />
                    )}
                    {/* medium risk */}
                    {mPct > 0 && (
                      <circle cx="21" cy="21" r={r} fill="transparent"
                        stroke={RISK_COLORS.Medium} strokeWidth="3.5"
                        strokeDasharray={`${mDash} ${100 - mDash}`}
                        strokeDashoffset={mOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 21 21)" />
                    )}
                    {/* low risk */}
                    {lPct > 0 && (
                      <circle cx="21" cy="21" r={r} fill="transparent"
                        stroke={RISK_COLORS.Low} strokeWidth="3.5"
                        strokeDasharray={`${lDash} ${100 - lDash}`}
                        strokeDashoffset={lOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 21 21)" />
                    )}
                  </svg>
                  <div className="donut-center-label">
                    <span className="donut-pct" style={{ color: RISK_COLORS.High }}>
                      {churnRateValue != null ? churnRateValue.toFixed(1) : overallChurnRate}%
                    </span>
                    <span className="donut-sub">Churn Risk</span>
                  </div>
                </div>
                <div className="donut-legend">
                  {[
                    { label: 'High Risk',   count: highRisk,   color: RISK_COLORS.High },
                    { label: 'Medium Risk', count: mediumRisk, color: RISK_COLORS.Medium },
                    { label: 'Low Risk',    count: lowRisk,    color: RISK_COLORS.Low },
                  ].map(item => (
                    <div key={item.label} className="donut-legend-item">
                      <span className="donut-legend-dot" style={{ background: item.color }}></span>
                      <span>{item.label}</span>
                      <span className="donut-legend-count">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature importance bar chart */}
              {featureImportance.length > 0 && (
                <div className="chart-card">
                  <h3 className="chart-title">
                    <span className="chart-title-dot"></span>
                    Top Churn Drivers
                  </h3>
                  <div className="feature-bar-list">
                    {featureImportance.map((f, i) => (
                      <div key={i} className="feature-bar-row">
                        <span className="feature-bar-label">{f.feature.replace(/_/g, ' ')}</span>
                        <div className="feature-bar-track">
                          <div
                            className="feature-bar-fill"
                            style={{ width: `${(f.importance / maxImp) * 100}%` }}
                          />
                        </div>
                        <span className="feature-bar-value">{(f.importance * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ CUSTOMERS TAB ══════════════ */}
        {activeTab === 'customers' && (
          <div className="tab-content">
            <div className="table-controls">
              <input
                className="table-search"
                type="text"
                placeholder="Search by Customer ID..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <div className="risk-filter-btns">
                {['All', 'High', 'Medium', 'Low'].map(r => (
                  <button
                    key={r}
                    className={`risk-filter-btn ${filterRisk === r ? 'active' : ''}`}
                    style={filterRisk === r && r !== 'All'
                      ? { background: RISK_BG[r], color: RISK_COLORS[r] }
                      : {}}
                    onClick={() => { setFilterRisk(r); setCurrentPage(1); }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="customer-table-wrap">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Churn Probability</th>
                    <th>Risk Level</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-muted)' }}>No customers found.</td></tr>
                  ) : paginated.map((c, i) => (
                    <tr key={i}>
                      <td className="customer-id">{c.id}</td>
                      <td>
                        <div className="prob-cell">
                          <span style={{ color: RISK_COLORS[c.risk], fontWeight: 700, minWidth: '44px' }}>{c.probability}%</span>
                          <div className="prob-bar-bg">
                            <div className="prob-bar-fill"
                              style={{ width: `${c.probability}%`, background: RISK_COLORS[c.risk] }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="risk-badge"
                          style={{ background: RISK_BG[c.risk], color: RISK_COLORS[c.risk] }}>
                          {c.risk} Risk
                        </span>
                      </td>
                      <td className="suggestion-cell">{c.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Prev
                </button>
                <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  Next
                  <ChevronRight size={16} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ INSIGHTS TAB ══════════════ */}
        {activeTab === 'insights' && (
          <div className="tab-content">
            <div className="insights-grid">

              {/* Risk breakdown insight cards */}
              {[
                {
                  risk  : 'High',
                  count : highRisk,
                  pct   : total ? (highRisk / total * 100).toFixed(1) : 0,
                  title : 'Immediate Action Required',
                  body  : `${highRisk.toLocaleString()} customers have a churn probability above 65%. These customers are very likely to leave within the next billing cycle. They need personalised outreach, special offers, or direct calls from your retention team. Every day of delay increases the risk of permanent loss.`,
                },
                {
                  risk  : 'Medium',
                  count : mediumRisk,
                  pct   : total ? (mediumRisk / total * 100).toFixed(1) : 0,
                  title : 'Monitor & Engage',
                  body  : `${mediumRisk.toLocaleString()} customers are in the warning zone with 35–65% churn probability. They are showing early signs of disengagement. Automated re-engagement campaigns, product usage tips, or a proactive check-in call can bring these customers back before they cross into high-risk territory.`,
                },
                {
                  risk  : 'Low',
                  count : lowRisk,
                  pct   : total ? (lowRisk / total * 100).toFixed(1) : 0,
                  title : 'Maintain & Upsell',
                  body  : `${lowRisk.toLocaleString()} customers are healthy with below 35% churn probability. These are your most loyal and satisfied customers. Focus on rewarding their loyalty, seeking referrals, and introducing them to premium offerings to increase lifetime value.`,
                },
              ].map(card => (
                <div key={card.risk} className="insight-card" data-risk={card.risk}>
                  <div className="insight-card-header">
                    <span className="insight-risk-badge"
                      style={{ background: RISK_BG[card.risk], color: RISK_COLORS[card.risk] }}>
                      {card.risk} Risk — {card.count.toLocaleString()} customers ({card.pct}%)
                    </span>
                    <h3>{card.title}</h3>
                  </div>
                  <p>{card.body}</p>
                </div>
              ))}

              {/* Plain summary again for easy reference */}
              <div className="insight-card" data-risk="summary">
                <div className="insight-card-header">
                  <span className="insight-risk-badge"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                    Full Analysis Summary
                  </span>
                  <h3>What This Means For Your Business</h3>
                </div>
                <p>{plainSummary}</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Results;

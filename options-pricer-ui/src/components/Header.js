import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img className="header-sigil" src={`${process.env.PUBLIC_URL}/favicon.svg`} alt="" width="40" height="40" />
          <span className="header-title">Volos</span>
          <span className="header-subtitle">Options pricer</span>
        </div>
        <p className="server-notice">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <circle cx="10" cy="10" r="7.25" />
            <path d="M10 5.8v4.4l2.6 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          First run may take about a minute.
        </p>
      </div>
    </header>
  );
}

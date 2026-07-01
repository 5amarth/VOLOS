import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-sigil">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Stylized sigma / volatility glyph */}
              <polygon
                points="8,8 40,8 24,24 40,40 8,40"
                stroke="#C49A1E"
                strokeWidth="1.5"
                fill="none"
                strokeLinejoin="round"
              />
              <line x1="8" y1="8" x2="8" y2="40" stroke="#C49A1E" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="2.5" fill="#C49A1E" />
            </svg>
          </div>
          <div className="header-wordmark">
            <span className="header-title">VOLOS</span>
            <span className="header-subtitle">Options Pricing Engine</span>
          </div>
        </div>
        <div className="header-tag">
          <span className="header-tag-text">Βόλος</span>
        </div>
      </div>
      <div className="header-rule">
        <span className="header-rule-line" />
        <span className="header-rule-diamond">◆</span>
        <span className="header-rule-line" />
      </div>
    </header>
  );
}

import React from 'react';
import './PageShell.css';

export default function PageShell({ title, description, children }) {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </header>
      <div className="page-content">{children}</div>
    </div>
  );
}

import React from 'react';
import './PageShell.css';

export default function PageShell({ title, epigraph, children }) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {epigraph && <p className="page-epigraph">{epigraph}</p>}
        <div className="page-divider">
          <span className="page-divider-line" />
        </div>
      </div>
      <div className="page-content">{children}</div>
    </div>
  );
}

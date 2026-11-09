import React from 'react';

export default function ResultPlaceholder({ loading, prompt }) {
  return (
    <section className="panel workspace-result result-placeholder" aria-label="Results">
      <h2 className="panel-label">Results</h2>
      <div className="placeholder-body">
        <svg viewBox="0 0 264 128" width="264" height="128" fill="none" aria-hidden="true">
          <path d="M12 12h240v104H12zM12 38h240M12 64h240M12 90h240M52 12v104M92 12v104M132 12v104M172 12v104M212 12v104" stroke="var(--line)" />
          <path d="M12 90h120l100-65M32 27l100 63h120" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 5" />
          <path d="M12 90h120l100-65" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M132 12v104" stroke="var(--accent)" strokeOpacity=".45" strokeDasharray="3 5" />
          <circle cx="132" cy="90" r="5" fill="var(--accent)" stroke="var(--panel)" strokeWidth="2" />
          <circle cx="232" cy="25" r="3" fill="var(--accent)" />
        </svg>
        <div role="status">
          <p className="placeholder-title">{loading ? 'Calculation in progress' : 'Ready to calculate'}</p>
          <p className="placeholder-copy">{loading ? 'The first run can take a little longer.' : prompt}</p>
        </div>
      </div>
    </section>
  );
}

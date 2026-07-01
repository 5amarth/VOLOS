import React from 'react';
import './TabNav.css';

export default function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="tabnav" role="tablist">
      <div className="tabnav-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tabnav-tab ${activeTab === tab.id ? 'tabnav-tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tabnav-roman">{tab.roman}</span>
            <span className="tabnav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

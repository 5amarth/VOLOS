import React from 'react';
import './TabNav.css';

export default function TabNav({ tabs, activeTab, onTabChange }) {
  const handleKeyDown = (event, index) => {
    let next;
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % tabs.length; break;
      case 'ArrowLeft': next = (index + tabs.length - 1) % tabs.length; break;
      case 'Home': next = 0; break;
      case 'End': next = tabs.length - 1; break;
      default: return;
    }

    event.preventDefault();
    onTabChange(tabs[next].id);
    event.currentTarget.parentElement.children[next].focus();
  };

  return (
    <nav className="tabnav" aria-label="Pricing models">
      <div className="tabnav-inner" role="tablist" aria-label="Pricing models">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={activeTab === tab.id ? `model-${tab.id}` : undefined}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className="tabnav-tab"
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

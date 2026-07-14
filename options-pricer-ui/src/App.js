import React, { Suspense, lazy, useState } from 'react';
import './App.css';
import Header from './components/Header';
import TabNav from './components/TabNav';

// Lazy-loaded so each tab's heavier dependencies (Recharts, Plotly) only
// download when that tab is actually opened, instead of bloating the initial
// page load for everyone.
const BinomialTree = lazy(() => import('./pages/BinomialTree'));
const BlackScholes = lazy(() => import('./pages/BlackScholes'));
const ImpliedVol = lazy(() => import('./pages/ImpliedVol'));
const VolSurface = lazy(() => import('./pages/VolSurface'));
const MonteCarlo = lazy(() => import('./pages/MonteCarlo'));

const TABS = [
  { id: 'binomial',   label: 'Binomial Tree',       roman: 'I'   },
  { id: 'bsm',        label: 'Black–Scholes',        roman: 'II'  },
  { id: 'impliedvol', label: 'Implied Volatility',   roman: 'III' },
  { id: 'volsurface', label: 'IV Interpolator',      roman: 'IV'  },
  { id: 'montecarlo', label: 'Monte Carlo',          roman: 'V'   },
];

function PageLoadingFallback() {
  return (
    <div className="page-loading">
      <span className="page-loading-text">Consulting the tables&hellip;</span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('binomial');

  const renderPage = () => {
    switch (activeTab) {
      case 'binomial':   return <BinomialTree />;
      case 'bsm':        return <BlackScholes />;
      case 'impliedvol': return <ImpliedVol />;
      case 'volsurface': return <VolSurface />;
      case 'montecarlo': return <MonteCarlo />;
      default:           return <BinomialTree />;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="server-notice">
        <span className="server-notice-text">
          This site is hosted on a free server — the first calculation may take up to a minute to wake it up.
        </span>
      </div>
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main">
        <Suspense fallback={<PageLoadingFallback />}>
          {renderPage()}
        </Suspense>
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span className="footer-text">
            VOLOS &mdash; Pricing instruments of the ancient art
          </span>
          <span className="footer-credit">built by samarth tanigere</span>
        </div>
      </footer>
    </div>
  );
}

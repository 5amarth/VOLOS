import React, { Suspense, lazy, useState } from 'react';
import './App.css';
import Header from './components/Header';
import TabNav from './components/TabNav';

const TABS = [
  { id: 'binomial', label: 'Binomial Tree', Page: lazy(() => import('./pages/BinomialTree')) },
  { id: 'bsm', label: 'Black–Scholes', Page: lazy(() => import('./pages/BlackScholes')) },
  { id: 'impliedvol', label: 'Implied Volatility', Page: lazy(() => import('./pages/ImpliedVol')) },
  { id: 'volsurface', label: 'IV Interpolator', Page: lazy(() => import('./pages/VolSurface')) },
  { id: 'montecarlo', label: 'Monte Carlo', Page: lazy(() => import('./pages/MonteCarlo')) },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const { Page } = TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="app">
      <Header />
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main">
        <div role="tabpanel" id={`model-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          <Suspense fallback={<p className="page-loading" role="status">Loading model…</p>}>
            <Page />
          </Suspense>
        </div>
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>Volos Options Pricer</span>
          <span>Built by Samarth Tanigere</span>
        </div>
      </footer>
    </div>
  );
}

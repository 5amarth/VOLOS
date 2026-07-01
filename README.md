# VOLOS: Quantitative Options Pricing & Analytics Platform

A high-performance, full-stack quantitative analytics platform providing multi-paradigm derivative pricing, risk parameter estimation (the Greeks), and structural implied volatility calibration.

---

## 1. Quantitative Methodologies

* **Analytical Core (Black-Scholes-Merton):** Closed-form solutions for European options incorporating continuous underlying dividend distributions.
* **Numerical Lattice Framework (Binomial Tree):** Multi-stage Cox-Ross-Rubinstein (CRR) discrete-time lattice incorporating localized backward induction routines to optimize early-exercise constraints for American-style equity derivatives.
* **Stochastic Simulation Engine (Monte Carlo):** Vectorized geometric Brownian motion (gBm) path generation using **Antithetic Variates** for variance reduction, complete with dynamic convergence monitoring and asymptotic 95% confidence bounds.
* **Risk Sensitivity Calibration (The Greeks):** Dual-sided finite-difference approximation schedules yielding stable estimations for first and second-order risk parameters ($\Delta$, $\Gamma$, $\mathcal{V}$, $\Theta$, $\rho$).
* **Implied Volatility & Surface Interpolation:** Safeguarded Newton-Raphson root-finding algorithm calibrated with structural boundary conditions, driving continuous 2D skews and 3D implied volatility surfaces via cubic spline mesh grids.

---

## 2. Platform Architecture & Modular Breakdown

### Tab 1: Black-Scholes-Merton (BSM) Engine
* **Core Analytics:** Computes exact closed-form pricing and continuous Greeks for vanilla European options.
* **Interactive Risk Mapping:** Generates dynamic 10x10 dual pricing/profit heatmaps. To prevent mathematical singularities at boundary limits, slider constraints are dynamically restricted to $\pm 15\%$ of the underlying asset spot price ($S_0$) and current implied volatility. Highly saturated cells feature automated text halos to preserve font legibility across intense gradients.

### Tab 2: Binomial Tree Model
* **Lattice Induction:** Maps the complete asset price evolution across discrete-time steps.
* **Early-Exercise Premium Optimization:** Employs backward induction to evaluate American-style option contracts, exposing the localized financial spread between holding the derivative contract versus immediate optimal execution.

### Tab 3: Monte Carlo Simulation
* **Stochastic Paths:** Generates high-velocity geometric Brownian motion (gBm) asset trajectories.
* **Performance Engineering:** Fully vectorized random walks optimize computational overhead. For desktop web-client performance and instantaneous UI rendering, the simulation interface is tuned for an optimal scale of 10,000 to 100,000 asset paths.

### Tab 4: IV Interpolator
* **Volatility Smile Processing:** Extracts market-implied volatilities from standard asynchronous data chains. Strike labels on the 2D volatility smile axis are rotated at $-35^\circ$ and bound to single-decimal precision to prevent floating-point text collisions.
* **3D Surface Modeling:** Passes calculated coordinates to a cubic spline mesh layer to construct a rotatable, fully interactive 3D Implied Volatility Surface using WebGL canvas acceleration.

---

## 3. Engineering & Architectural Thought Process

The design philosophy behind VOLOS centers on bridging high-fidelity quantitative compute scripts with responsive web interactions:

1. **Asynchronous Computational Decoupling:** Decoupling the compute layer (Python/FastAPI) from the presentation layout (React/Vite) guarantees that heavy numerical calculations (e.g., thousands of vectorized paths or spline meshes) never block user interface rendering loops.
2. **Strict Operational Boundaries:** Transitioning from static parameter inputs to relative parameter scaling ensures that visual charts remain clean, informative, and free from out-of-bounds rendering bugs when processing extreme market regimes.
3. **Optimized Client Ingestion:** Leveraging client-side binary parsing engines (SheetJS) reduces server-side network payload bloat, moving structural data validation right to the user's browser for lightning-fast file upload experiences.

---

## 4. Technical Architecture & Stack

### Backend Engine
* **Runtime Environment:** Python 3.x
* **Application Framework:** FastAPI (Asynchronous ASGI server layer via Uvicorn)
* **Mathematical Vectorization:** NumPy (C-optimized multi-dimensional arrays)
* **Optimization Core:** SciPy (Interpolation, Root-finding, and Spline routines)

### Frontend Dashboard
* **Framework:** React.js (Component-driven view tier built via Webpack/Vite)
* **Style Engine:** Tailwind CSS
* **Visualization Layer:** Plotly.js (WebGL-accelerated 3D coordinate matrices) & Recharts (SVG 2D charting)
* **Data Ingestion:** Client-side binary spreadsheet parser (SheetJS)

---

## 5. Local Installation & Setup

### Prerequisites
Ensure your local environment has **Python 3.10+** and **Node.js LTS** installed before proceeding.

---

### Part A: Backend Pipeline Initialization

From your root folder, navigate to the backend directory, install the required Python dependencies, then start the development server:

```bash
cd "Options Pricer Backend"
pip install -r requirements.txt
python3 -m uvicorn main:app --reload
```

The FastAPI server will now be running locally via Uvicorn with hot-reload enabled.

---

### Part B: Frontend Interface Compilation

Open a **separate terminal window**, navigate to the frontend directory from your root folder, install the Node dependencies, then launch the development client:

```bash
cd options-pricer-ui
npm install
npm start
```

Once both processes are running, the dashboard will be accessible in your browser at `http://localhost:3000` by default.

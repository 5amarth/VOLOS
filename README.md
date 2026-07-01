# Quantitative Options Pricing & Analytics Dashboard

An institutional-grade web application combining analytical, numerical, and stochastic models to price European and American equity derivatives, calibrate implied volatility structures, and map continuous risk parameters (Greeks).

## 🚀 Key Features

* **Paradigms Supported:** * **Black-Scholes-Merton:** Analytical European option pricing with underlying dividend yields.
  * **Binomial Tree Model:** Multi-step Cox-Ross-Rubinstein lattice framework natively handling early exercise premiums for American options.
  * **Monte Carlo Simulation Engine:** Stochastic asset path generation vectorized via NumPy, utilizing **Antithetic Variates** for advanced variance reduction and computing 95% confidence intervals.
* **Risk Metrics Engine:** Finite-difference approximations capturing first and second-order Greeks ($\Delta$, $\Gamma$, $\mathcal{V}$, $\Theta$, $\rho$).
* **Implied Volatility Solver:** A calibrated Newton-Raphson root-finding algorithm complete with structural Vega safeguards to generate continuous 3D volatility surfaces and 2D volatility smiles/skews via cubic spline interpolation.
* **Interactive Visual Analytics:** 10x10 pricing/profit heatmaps, sample asset paths, and coordinate-precise rotatable matrices.

## 🛠️ Tech Stack

* **Backend:** Python, FastAPI, NumPy, SciPy (Optimization & Interpolation Modules), Uvicorn.
* **Frontend:** React, Vite, Tailwind CSS, charting libraries (e.g., Chart.js / Plotly.js).

## 💻 Local Installation & Setup

### 1. Backend Setup
Navigate to your backend directory and run:

```bash
# Install required dependencies
pip install -r requirements.txt

# Start the local development server
uvicorn main:app --reload
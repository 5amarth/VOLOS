import unittest
import math
import numpy as np
from engine import (
    binomial_tree_model,
    black_scholes_merton,
    implied_volatility_finder,
    volatility_surface_interpolator,
    monte_carlo_engine
)

class TestQuantPricingEngine(unittest.TestCase):

    def setUp(self):
        """Set up standard baseline market parameters used across standard tests."""
        self.S_0 = 100.0      # Spot Price
        self.K = 100.0       # Strike Price
        self.T = 1.0         # Time to maturity (1 year)
        self.r = 0.05        # Risk-free rate (5%)
        self.sigma = 0.20    # Volatility (20%)
        self.q = 0.02        # Continuous dividend yield (2%)
        
        # Heatmap configurations
        self.min_spot, self.max_spot = 80.0, 120.0
        self.min_vol, self.max_vol = 0.10, 0.40

    def test_tab1_binomial_tree_baseline(self):
        """Test baseline Binomial Tree pricing convergence and structure."""
        res = binomial_tree_model(
            self.S_0, self.K, self.T, self.r, self.sigma, self.q, 100,
            self.min_spot, self.max_spot, self.min_vol, self.max_vol
        )
        
        # Structure validations
        self.assertIn("EU Call", res)
        self.assertIn("AM Call", res)
        self.assertIn("EU Call Delta", res)
        self.assertIn("EU Call Price Heatmap", res)
        
        # Early exercise value check: American Put must be >= European Put
        self.assertGreaterEqual(res["AM Put"], res["EU Put"])
        
        # Check that output matrices match specified 10x10 resolution
        self.assertEqual(len(res["EU Call Price Heatmap"]), 10)
        self.assertEqual(len(res["EU Call Price Heatmap"][0]), 10)

    def test_tab2_bsm_baseline_and_edge_cases(self):
        """Test BSM core calculations alongside ultra-short maturity edge cases."""
        # 1. Baseline Test
        res_base = black_scholes_merton(
            self.S_0, self.K, self.T, self.r, self.sigma, self.q,
            self.min_spot, self.max_spot, self.min_vol, self.max_vol
        )
        self.assertGreater(res_base["EU Call"], 0.0)
        self.assertLess(res_base["EU Call Delta"], 1.0)
        
        # Put-Call Parity validation (Discrepancy must be effectively 0)
        self.assertAlmostEqual(res_base["EU Parity Discrepency"], 0.0, places=5)

        # 2. Edge Case: Near-Zero Maturity (T <= 1e-5)
        res_near_expiry = black_scholes_merton(
            self.S_0, self.K, 1e-6, self.r, self.sigma, self.q,
            0, 0, 0, 0 # Passing zeros to verify heatmap bypass optimization
        )
        # At-the-money call at expiry with spot=100, strike=100 should equal 0 payoff
        self.assertEqual(res_near_expiry["EU Call"], 0.0)
        self.assertEqual(res_near_expiry["EU Call Gamma"], 0.0)
        # Verify heatmap bypass didn't crash and returns clean base values
        self.assertNotIn("EU Call Price Heatmap", res_near_expiry)

    def test_tab3_implied_volatility_solver(self):
        """Test tracking exact implied volatility recovery and boundary conditions."""
        # 1. Verification of IV Recovery Loop
        target_vol = 0.32
        bsm_data = black_scholes_merton(self.S_0, self.K, self.T, self.r, target_vol, self.q, 0, 0, 0, 0)
        market_price = bsm_data["EU Call"]
        
        recovered_iv = implied_volatility_finder(market_price, self.S_0, self.K, self.T, self.r, self.q, True)
        self.assertAlmostEqual(recovered_iv, target_vol, places=4)

        # 2. Edge Case: Price below intrinsic value floor (Negative Arbitrage Violation)
        impossible_low_price = 0.01 
        nan_iv = implied_volatility_finder(impossible_low_price, self.S_0, self.K, self.T, self.r, self.q, True)
        self.assertTrue(math.isnan(nan_iv))

    def test_tab4_volatility_surface_interpolator(self):
        """Test multi-point spatial interpolation for the Volatility Surface grid."""
        # Setup a dummy Nx4 market matrix [Price, Strike, Maturity, Type(0=Call, 1=Put)]
        # Filtering logic focuses on OTM options (Calls when K > S_0, Puts when K < S_0)
        market_matrix = np.array([
            [2.50, 110.0, 0.5, 0],  # OTM Call
            [5.20, 120.0, 1.0, 0],  # OTM Call
            [1.80, 90.0,  0.5, 1],  # OTM Put
            [3.40, 85.0,  1.0, 1]   # OTM Put
        ])
        
        grid_res = 5
        surface = volatility_surface_interpolator(self.S_0, self.r, self.q, grid_res, market_matrix)
        
        self.assertEqual(len(surface["X_Strikes"]), grid_res)
        self.assertEqual(len(surface["Y_Maturities"]), grid_res)
        # Ensure 2D spatial dimensions map correctly (5x5 matrix structure)
        self.assertEqual(len(surface["Z_IV_Surface"]), grid_res)
        self.assertEqual(len(surface["Z_IV_Surface"][0]), grid_res)

    def test_tab5_monte_carlo_engine(self):
        """Test Monte Carlo paths generation, confidence intervals, and convergence."""
        N_steps = 50
        N_sims = 1000 # Keep sample path sizing manageable for unit testing
        
        res = monte_carlo_engine(
            self.S_0, self.K, self.T, self.r, self.sigma, self.q, N_steps, N_sims,
            self.min_spot, self.max_spot, self.min_vol, self.max_vol
        )
        
        # Verify Statistical Confidence Limits exist and bound the estimate cleanly
        self.assertIn("Call CI Upper", res)
        self.assertIn("Call CI Lower", res)
        self.assertGreater(res["Call CI Upper"], res["Call CI Lower"])
        
        # Check baseline alignment with analytical benchmarks
        bsm = black_scholes_merton(self.S_0, self.K, self.T, self.r, self.sigma, self.q, 0, 0, 0, 0)
        
        # Verify sample simulation price falls within reasonable standard error bounds of analytic BSM price
        self.assertAlmostEqual(res["EU Call"], bsm["EU Call"], delta=0.5)
        
        # Verify front-end visual vector extraction cap
        self.assertEqual(len(res["Sample Paths"]), 10)
        self.assertEqual(len(res["Sample Paths"][0]), N_steps)

if __name__ == "__main__":
    unittest.main()
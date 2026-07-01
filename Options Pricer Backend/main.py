from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np

from engine import (
    binomial_tree_model, 
    black_scholes_merton, 
    implied_volatility_finder, 
    monte_carlo_engine, 
    volatility_surface_interpolator
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Added your local frontend port
        "http://localhost:5173",  # Keep Vite just in case
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model to cleanly handle the structured matrix payload via POST
class SurfaceInterpolatorPayload(BaseModel):
    S_0: float
    r: float
    q: float
    grid_resolution: int
    market_data_matrix: List[List[float]]  # Expects Nx4 nested list structure


@app.get("/")
def read_root():
    return {"message": "Welcome to the Binomial Options Pricing API"}


@app.get("/binomial_tree")
def get_binomial_prices(S_0: float, K: float, T: float, r: float, sigma: float, q: float, N: int, min_spot_price: float, max_spot_price: float, min_vol: float, max_vol: float):
    result = binomial_tree_model(S_0, K, T, r, sigma, q, N, min_spot_price, max_spot_price, min_vol, max_vol)
    return result


@app.get("/black_scholes_merton")
def get_bsm_prices(S_0: float, K: float, T: float, r: float, sigma: float, q: float, min_spot_price: float, max_spot_price: float, min_vol: float, max_vol: float):
    result = black_scholes_merton(S_0, K, T, r, sigma, q, min_spot_price, max_spot_price, min_vol, max_vol)
    return result


@app.get("/implied_volatility")
def get_implied_volatility(p: float, S_0: float, K: float, T: float, r: float, q: float, type: bool):
    result = implied_volatility_finder(p, S_0, K, T, r, q, type)
    return result


# Changed to POST to allow robust JSON payload shipping for the matrix array
@app.post("/IV_interpolator")
def get_IV_interpolator(payload: SurfaceInterpolatorPayload):
    # Convert incoming nested Python list to NumPy array so engine's .shape[0] 
    matrix_np = np.array(payload.market_data_matrix)
    
    result = volatility_surface_interpolator(
        payload.S_0, 
        payload.r, 
        payload.q, 
        payload.grid_resolution, 
        matrix_np
    )
    return result


@app.get("/monte_carlo")
def get_monte_carlo(S_0: float, K: float, T: float, r: float, sigma: float, q: float, N: int, N2: int, min_spot_price: float, max_spot_price: float, min_vol: float, max_vol: float):
    result = monte_carlo_engine(S_0, K, T, r, sigma, q, N, N2, min_spot_price, max_spot_price, min_vol, max_vol)
    return result
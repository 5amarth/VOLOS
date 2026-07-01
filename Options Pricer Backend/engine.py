import math 
import numpy as np
from scipy import interpolate
from scipy.stats import norm

# tab 1 Binomial trees + Greeks + both heatmaps
def binomial_tree_model(S_0, K, T, r, sigma, q, N, min_spot_price, max_spot_price, min_vol, max_vol): #min_spot_price, max_spot_price, min_vol, max_vol
  def binomial_tree_pricer(S_0, K, T, r, sigma, q, N):
    ''' 
      S_0 = stock price
      K = Strike price 
      T = time in years
      r = risk free interest rate in float
      sigma = volatility in float
      N = number of steps in integer
      q = continuous dividend yield/foreign interest rate in float
    '''
    delta_t = T/N
    u = math.exp(sigma * math.sqrt(delta_t))
    d = 1/u
    p = (math.exp((r - q)*delta_t)-d)/(u-d)
    discount = math.exp(-r*delta_t)


    stock_prices = np.zeros(N+1)
    eu_call = np.zeros(N+1)
    eu_put = np.zeros(N+1)
    am_call = np.zeros(N+1)
    am_put = np.zeros(N+1)
   

  #building the tree
    for i in range (N+1): 
        stock_prices[i] = S_0*(u**(N-i)* d**i)

        eu_call[i] = max(stock_prices[i] - K, 0)
        am_call[i] = eu_call[i]  

        eu_put[i] = max(K - stock_prices[i], 0)
        am_put[i] = eu_put[i]


    # Storage arrays to grab values needed for delta and gamma
    saved_j1_eu_call = np.zeros(2)
    saved_j1_eu_put  = np.zeros(2)
    saved_j1_am_call = np.zeros(2)
    saved_j1_am_put  = np.zeros(2)

    saved_j2_eu_call = np.zeros(3)
    saved_j2_eu_put  = np.zeros(3)
    saved_j2_am_call = np.zeros(3)
    saved_j2_am_put  = np.zeros(3)

    # Backward induction tree traversal loop
    for j in range(N-1, -1, -1):
        for i in range(j+1):
            
            current_S = S_0 * (u ** (j - i)) * (d ** i)

            #american
            am_call_f = discount * (p * am_call[i] + (1 - p) * am_call[i+1])
            am_call_check = max(current_S - K, 0)
            am_call[i] = max(am_call_check, am_call_f)
            am_put_f = discount * (p * am_put[i] + (1 - p) * am_put[i+1])
            am_put_check = max(K - current_S, 0)
            am_put[i] = max(am_put_check, am_put_f)


            #european
            eu_call[i] = discount * (p * eu_call[i] + (1 - p) * eu_call[i+1])
            eu_put[i]  = discount * (p * eu_put[i]  + (1 - p) * eu_put[i+1])

        # intercept and extract array values before they are overwritten
        if j == 1:
            saved_j1_eu_call = np.copy(eu_call[:2])
            saved_j1_eu_put  = np.copy(eu_put[:2])
            saved_j1_am_call = np.copy(am_call[:2])
            saved_j1_am_put  = np.copy(am_put[:2])
        elif j == 2:
            saved_j2_eu_call = np.copy(eu_call[:3])
            saved_j2_eu_put  = np.copy(eu_put[:3])
            saved_j2_am_call = np.copy(am_call[:3])
            saved_j2_am_put  = np.copy(am_put[:3])

    
    #greeks - gamma and delta

    # Stock price variations at Step 1,2  boundaries for greeks
    S_u  = S_0 * u
    S_d  = S_0 * d
    S_uu = S_0 * (u ** 2)
    S_ud = S_0 
    S_dd = S_0 * (d ** 2)

    #delta calculations
    eu_call_delta = (saved_j1_eu_call[0] - saved_j1_eu_call[1]) / (S_u - S_d)
    eu_put_delta  = (saved_j1_eu_put[0]  - saved_j1_eu_put[1])  / (S_u - S_d)
    am_call_delta = (saved_j1_am_call[0] - saved_j1_am_call[1]) / (S_u - S_d)
    am_put_delta  = (saved_j1_am_put[0]  - saved_j1_am_put[1])  / (S_u - S_d)

    #gamma calculations
    delta_u_eu_call = (saved_j2_eu_call[0] - saved_j2_eu_call[1]) / (S_uu - S_ud)
    delta_d_eu_call = (saved_j2_eu_call[1] - saved_j2_eu_call[2]) / (S_ud - S_dd)
    eu_call_gamma   = (delta_u_eu_call - delta_d_eu_call) / (0.5 * (S_uu - S_dd))

    delta_u_eu_put = (saved_j2_eu_put[0] - saved_j2_eu_put[1]) / (S_uu - S_ud)
    delta_d_eu_put = (saved_j2_eu_put[1] - saved_j2_eu_put[2]) / (S_ud - S_dd)
    eu_put_gamma   = (delta_u_eu_put - delta_d_eu_put) / (0.5 * (S_uu - S_dd))

    delta_u_am_call = (saved_j2_am_call[0] - saved_j2_am_call[1]) / (S_uu - S_ud)
    delta_d_am_call = (saved_j2_am_call[1] - saved_j2_am_call[2]) / (S_ud - S_dd)
    am_call_gamma   = (delta_u_am_call - delta_d_am_call) / (0.5 * (S_uu - S_dd))

    delta_u_am_put = (saved_j2_am_put[0] - saved_j2_am_put[1]) / (S_uu - S_ud)
    delta_d_am_put = (saved_j2_am_put[1] - saved_j2_am_put[2]) / (S_ud - S_dd)
    am_put_gamma   = (delta_u_am_put - delta_d_am_put) / (0.5 * (S_uu - S_dd)) 

    values = {
        "AM Call" : am_call[0],
        "AM Put"  : am_put[0],
        "EU Call" : eu_call[0],
        "EU Put"  : eu_put[0],

        "EU Call Delta" : eu_call_delta,
        "EU Put Delta" : eu_put_delta,
        "AM Call Delta" : am_call_delta,
        "AM Put Delta" : am_put_delta,

        "EU Call Gamma" : eu_call_gamma,
        "EU Put Gamma" : eu_put_gamma,
        "AM Call Gamma" : am_call_gamma,
        "AM Put Gamma" : am_put_gamma,

        "EU Parity Discrepency" : abs(eu_call[0]+K*math.exp(-r*T) - eu_put[0] - S_0*math.exp(-q*T)),
        "AM Parity Discrepency" : abs(am_call[0]+K*math.exp(-r*T) - am_put[0] - S_0*math.exp(-q*T))
    }
    return values

  values = binomial_tree_pricer(S_0,K,T, r, sigma, q, N)
  price_bumped_vega = binomial_tree_pricer(S_0, K, T, r, sigma + 0.0001, q, N)
  price_bumped_rho = binomial_tree_pricer(S_0,K,T,r+0.0001,sigma,q,N)
  T_bump = T - (1/365) if T > (1/365) else T + (1/365)
  price_bumped_theta = binomial_tree_pricer(S_0, K, T_bump, r, sigma, q, N)
  
  #vega and rho and theta
  eu_call_vega = (price_bumped_vega["EU Call"] - values["EU Call"])/0.0001
  eu_put_vega = (price_bumped_vega["EU Put"] - values["EU Put"])/0.0001
  am_call_vega = (price_bumped_vega["AM Call"] - values["AM Call"])/0.0001
  am_put_vega = (price_bumped_vega["AM Put"] - values["AM Put"])/0.0001

  eu_call_rho = (price_bumped_rho["EU Call"] - values["EU Call"])/0.0001
  eu_put_rho = (price_bumped_rho["EU Put"] - values["EU Put"])/0.0001
  am_call_rho = (price_bumped_rho["AM Call"] - values["AM Call"])/0.0001
  am_put_rho = (price_bumped_rho["AM Put"] - values["AM Put"])/0.0001


  if T > (1/365):
    eu_call_theta = (price_bumped_theta["EU Call"] - values["EU Call"]) / (1/365)
    eu_put_theta = (price_bumped_theta["EU Put"] - values["EU Put"])/(1/365)
    am_call_theta = (price_bumped_theta["AM Call"] - values["AM Call"])/(1/365)
    am_put_theta = (price_bumped_theta["AM Put"] - values["AM Put"])/(1/365)
  else:
    eu_call_theta = (values["EU Call"] - price_bumped_theta["EU Call"]) / (1/365)
    eu_put_theta = (values["EU Put"] - price_bumped_theta["EU Put"])/(1/365)
    am_call_theta = ( values["AM Call"]-price_bumped_theta["AM Call"])/(1/365)
    am_put_theta = (values["AM Put"] - price_bumped_theta["AM Put"])/(1/365)



  #HEATMAP
  x_axis = np.linspace(min_spot_price,max_spot_price,10)
  y_axis = np.linspace(min_vol,max_vol,10)

  price_heatmap_eu_call = np.zeros((10,10))
  profit_heatmap_eu_call = np.zeros((10,10))

  price_heatmap_eu_put = np.zeros((10,10))
  profit_heatmap_eu_put = np.zeros((10,10))

  price_heatmap_am_call = np.zeros((10,10))
  profit_heatmap_am_call = np.zeros((10,10))

  price_heatmap_am_put = np.zeros((10,10))
  profit_heatmap_am_put = np.zeros((10,10))

  for i in range(10):
     for j in range(10):
      price_heatmap_eu_call[i][j] = binomial_tree_pricer(x_axis[i],K,T,r, y_axis[j], q, N)["EU Call"]
      price_heatmap_eu_put[i][j] = binomial_tree_pricer(x_axis[i],K,T,r, y_axis[j], q, N)["EU Put"]
      price_heatmap_am_call[i][j] = binomial_tree_pricer(x_axis[i],K,T,r, y_axis[j], q, N)["AM Call"]
      price_heatmap_am_put[i][j] = binomial_tree_pricer(x_axis[i],K,T,r, y_axis[j], q, N)["AM Put"]

      profit_heatmap_eu_call[i][j] = price_heatmap_eu_call[i][j] - values["EU Call"]
      profit_heatmap_eu_put[i][j] = price_heatmap_eu_put[i][j] - values["EU Put"]
      profit_heatmap_am_call[i][j] =  price_heatmap_am_call[i][j]- values["AM Call"]
      profit_heatmap_am_put[i][j] =  price_heatmap_am_put[i][j] - values["AM Put"]



  values["EU Call Vega"] = eu_call_vega
  values["EU Put Vega"] = eu_put_vega
  values["AM Call Vega"] = am_call_vega
  values["AM Put Vega"] = am_put_vega

  values["EU Call Rho"] = eu_call_rho
  values["EU Put Rho"] = eu_put_rho
  values["AM Call Rho"] = am_call_rho
  values["AM Put Rho"] = am_put_rho

  values["EU Call Theta"] = eu_call_theta
  values["EU Put Theta"] = eu_put_theta
  values["AM Call Theta"] = am_call_theta
  values["AM Put Theta"] = am_put_theta

  values["EU Call Price Heatmap"] = price_heatmap_eu_call.tolist()
  values["EU Put Price Heatmap"] = price_heatmap_eu_put.tolist()
  values["AM Call Price Heatmap"] = price_heatmap_am_call.tolist()
  values["AM Put Price Heatmap"] = price_heatmap_am_put.tolist()

  values["EU Call Profit Heatmap"] = profit_heatmap_eu_call.tolist()
  values["EU Put Profit Heatmap"] = profit_heatmap_eu_put.tolist()
  values["AM Call Profit Heatmap"] = profit_heatmap_am_call.tolist()
  values["AM Put Profit Heatmap"] = profit_heatmap_am_put.tolist()

  values["X Axis"] = x_axis.tolist()
  values["Y Axis"] = y_axis.tolist()

  return values


# tab 2 BSM + Greeks + both heatmaps
def black_scholes_merton(S_0, K, T, r, sigma, q, min_spot_price, max_spot_price, min_vol, max_vol):
   def bsm_pricer(S_0, K, T, r, sigma, q):
      '''
      S_0 = stock price
      K = Strike price 
      T = time in years
      r = risk free interest rate in float
      sigma = volatility in float
      q = continous dividend yield/foreign interest rate in float
      '''

      # Treat near-zero or zero maturity as expiration to not messup calculation of greeks
      if T <= 1e-5: 
         return {
            "EU Call": max(S_0 * math.exp(-q * T) - K, 0),
            "EU Put": max(K - S_0 * math.exp(-q * T), 0),
            "EU Call Delta": 1.0 if S_0 > K else 0.0,
            "EU Put Delta": -1.0 if K > S_0 else 0.0,
            "EU Call Theta": 0.0, "EU Put Theta": 0.0,
            "EU Call Gamma": 0.0, "EU Put Gamma": 0.0,
            "EU Call Vega": 0.0, "EU Put Vega": 0.0,
            "EU Call Rho": 0.0, "EU Put Rho": 0.0
         }

      d1 = (math.log(S_0 / K) + ((r - q) + (sigma**2) / 2) * T) / (sigma * math.sqrt(T))
      d2 = d1 - (sigma * math.sqrt(T))

      eu_call = S_0 * math.exp(-q*T)*norm.cdf(d1)-K*math.exp(-r*T)*norm.cdf(d2)
      eu_put  = K * math.exp(-r*T)*norm.cdf(-d2)-S_0*math.exp(-q*T)*norm.cdf(-d1)


      ##greeks
      eu_call_delta = math.exp(-q*T)*norm.cdf(d1)
      eu_put_delta  = math.exp(-q*T)*(norm.cdf(d1)-1)

      eu_call_theta = -((S_0 * norm.pdf(d1) * sigma * math.exp(-q*T)) / (2*math.sqrt(T)) + (r*K*math.exp(-r*T)*norm.cdf(d2)) - q*S_0*norm.cdf(d1)*math.exp(-q*T))
      eu_put_theta = -(((S_0*norm.pdf(d1)*sigma*math.exp(-q*T))/(2*(T**(1/2)))) - r*K*math.exp(-r*T)*norm.cdf(-d2) + q*S_0*norm.cdf(-d1)*math.exp(-q*T))

      eu_call_gamma = norm.pdf(d1)*math.exp(-q*T)/(S_0*sigma*(T**(1/2)))
      eu_put_gamma = norm.pdf(d1)*math.exp(-q*T)/(S_0*sigma*(T**(1/2)))

      eu_call_vega = S_0*(T**(1/2))*norm.pdf(d1)*math.exp(-q*T)
      eu_put_vega = S_0*(T**(1/2))*norm.pdf(d1)*math.exp(-q*T)

      eu_call_rho = K*T*math.exp(-r*T)*norm.cdf(d2)
      eu_put_rho = -K*T*math.exp(-r*T)*norm.cdf(-d2)

      values = {
         "EU Call" : eu_call,
         "EU Put" : eu_put,
         "EU Call Delta" : eu_call_delta,
         "EU Put Delta" : eu_put_delta,
         "EU Call Theta" : eu_call_theta,
         "EU Put Theta" : eu_put_theta,
         "EU Call Gamma" : eu_call_gamma,
         "EU Put Gamma" : eu_put_gamma,
         "EU Call Vega" : eu_call_vega,
         "EU Put Vega" : eu_put_vega,
         "EU Call Rho" : eu_call_rho,
         "EU Put Rho" : eu_put_rho,

         "EU Parity Discrepency" : abs(eu_call+K*math.exp(-r*T) - eu_put - S_0*math.exp(-q*T))
      }
      return values
   

   values = bsm_pricer(S_0, K, T, r, sigma, q)

   ##HEATMAPS
   x_axis = np.linspace(min_spot_price,max_spot_price,10)
   y_axis = np.linspace(min_vol,max_vol,10)

   price_heatmap_eu_call = np.zeros((10,10))
   profit_heatmap_eu_call = np.zeros((10,10))

   price_heatmap_eu_put = np.zeros((10,10))
   profit_heatmap_eu_put = np.zeros((10,10))

   if max_spot_price > 0 and max_vol > 0: #to reduce computation costs when called in tab 3 IV solver:)
      for i in range(10):
         for j in range(10):
            price_heatmap_eu_call[i][j] = bsm_pricer(x_axis[i],K,T,r, y_axis[j], q)["EU Call"]
            price_heatmap_eu_put[i][j] = bsm_pricer(x_axis[i],K,T,r, y_axis[j], q)["EU Put"]

            profit_heatmap_eu_call[i][j] = price_heatmap_eu_call[i][j] - values["EU Call"]
            profit_heatmap_eu_put[i][j] = price_heatmap_eu_put[i][j] - values["EU Put"]

      
      values["EU Call Price Heatmap"] = price_heatmap_eu_call.tolist()
      values["EU Put Price Heatmap"] = price_heatmap_eu_put.tolist()

      values["EU Call Profit Heatmap"] = profit_heatmap_eu_call.tolist()
      values["EU Put Profit Heatmap"] = profit_heatmap_eu_put.tolist()

      values["X Axis"] = x_axis.tolist()
      values["Y Axis"] = y_axis.tolist()

   return values


# tab 3 - implied vol solver
def implied_volatility_finder(p, S_0, K, T, r, q, type):
   '''
   p = option price in float
   S_0 = stock price in float
   K = strike price in float
   T = time maturity in years float
   r = risk free interest rate float
   q = continuous dividend yield/foreign interest rate in float
   type = option type (Call or Put. Call is true, put is false) boolean
   '''
   tol = 1e-6
   max_itr = 100
   std_guess = 0.25
   index = 0
   sigma = std_guess

   if (type == True) and (p < (S_0*math.exp(-q*T)-K*math.exp(-r*T)) or p>S_0*math.exp(-q*T)):
      return float('nan')
   elif (type == False) and (p < (K*math.exp(-r*T)-S_0*math.exp(-q*T)) or p>K*math.exp(-r*T)):
      return float('nan')
   
   while index<max_itr:
      values = black_scholes_merton(S_0,K,T,r,sigma,q,0,0,0,0)
      p_model = 0
      if type == True: 
         p_model = values["EU Call"]
      else:
        p_model = values["EU Put"]
      
      diff = p_model-p
      if abs(diff) < tol:
         break
      else: 
         # to make sure sigma doesn't blow up 
         if abs(values["EU Call Vega"]) < 1e-4: 
            return float('nan')
         sigma = sigma - (diff/values["EU Call Vega"])
      index+=1
      # cushion for sigma to make sure it isn't negative
      if sigma<0:
         sigma = 0.01
      
   return sigma
         

#tab 4 volatility surface interpolator
def volatility_surface_interpolator(S_0, r,q, grid_resolution, market_data_matrix):
   '''
   S_0 = spot price in float
   r = risk free interest rate 
   q = continuous dividend yield/foreign interest rate in float
   grid resolution in int which determines the resolution of the surface
   market_data_matrix = Nx4 matrix, first column has option prices in float, second column has respective strike prices in float, third coloumn has respective maturity times in float and fourth column has type (0 for call, 1 for put)
   '''

   x_scattered = [] #strikes
   y_scattered = [] #time maturities
   z_scattered = [] #IV's
   
   ##sorting for OTM calls and puts only due to liquidity issues
   for i in range (market_data_matrix.shape[0]):
      if(market_data_matrix[i,3] == 0 and market_data_matrix[i,1]>S_0):
         iv = implied_volatility_finder(market_data_matrix[i,0], S_0, market_data_matrix[i,1], market_data_matrix[i,2], r, q, True)
         if not math.isnan(iv):
            x_scattered.append(market_data_matrix[i,1])
            y_scattered.append(market_data_matrix[i,2])
            z_scattered.append(iv)
      elif(market_data_matrix[i,3] == 1 and market_data_matrix[i,1]<S_0):
         iv = implied_volatility_finder(market_data_matrix[i,0], S_0, market_data_matrix[i,1], market_data_matrix[i,2], r, q, False)
         if not math.isnan(iv):
            x_scattered.append(market_data_matrix[i,1])
            y_scattered.append(market_data_matrix[i,2])
            z_scattered.append(iv)

   grid_x = np.linspace(min(x_scattered), max(x_scattered), grid_resolution)
   grid_y = np.linspace(min(y_scattered), max(y_scattered), grid_resolution)
   grid_X_matrix, grid_Y_matrix = np.meshgrid(grid_x, grid_y, indexing='ij')
   xi = (grid_X_matrix,grid_Y_matrix)
   points = np.column_stack((x_scattered,y_scattered))
   grid_z = interpolate.griddata(points, z_scattered, xi, method='cubic', fill_value = 0.0)

   return {
      "X_Strikes": grid_x.tolist(),
      "Y_Maturities": grid_y.tolist(),
      "Z_IV_Surface": grid_z.tolist()
   }



 # tab 5 monte carlo simulator + greeks + visual + both heatmaps + antithetic variate
def monte_carlo_engine(S_0, K, T, r, sigma, q, N, N2, min_spot_price, max_spot_price, min_vol, max_vol):

   N2 = int(N2) if N2 % 2 == 0 else int(N2) + 1

   rng = np.random.default_rng(seed=42)

   true_master_shocks = rng.standard_normal((N2//2, N))
   anti_master_shocks = -true_master_shocks
   master_shocks = np.concatenate((true_master_shocks,anti_master_shocks),axis=0)

   def monte_carlo_simulator(S_0, K, T, r, sigma, q, N, N2, master_shocks, return_paths=False):
      '''
      S_0 = stock price in float
      K = strike price in float
      T = time in years in float
      r = risk free interest rate in float 
      q = continuous dividend yield/foreign interest rate in float
      N = Number of steps
      N2 = number of simulations
      '''

      delta_t = T/N
      mu = r-q
      drift = (mu - (sigma ** 2) / 2) * delta_t
      diffusion = sigma * math.sqrt(delta_t) * master_shocks
      discount = math.exp(-r * T)

      #each column represents the different exponent value that each path takes, with memory of time due to cumulative sum?
      cumulative_exponent = np.cumsum(drift + diffusion, axis=1)

      # multiplying by Snot to get the stock paths
      S_paths = S_0 * np.exp(cumulative_exponent)

      #For vanilla european options pricing, extracting the final column and doing payoffs
      S_T = S_paths[:, -1]

      call_payoffs = np.maximum(S_T-K, 0)
      put_payoffs = np.maximum(K-S_T,0)

      call_price = np.mean(call_payoffs)
      put_price = np.mean(put_payoffs)

      call_sd = np.std(call_payoffs, ddof=1)
      put_sd  = np.std(put_payoffs, ddof=1)


      return {
        "EU Call": discount * call_price,
        "EU Put": discount * put_price,
        "Call Error": (discount * call_sd) / math.sqrt(N2),
        "Put Error": (discount* put_sd) / math.sqrt(N2),
        "Call CI Upper" : discount*call_price + ((discount * call_sd) / math.sqrt(N2)*1.96),
        "Call CI Lower" : discount*call_price - ((discount * call_sd) / math.sqrt(N2)*1.96),
        "Put CI Upper" : discount*put_price + ((discount * put_sd) / math.sqrt(N2)*1.96),
        "Put CI Lower" : discount*put_price - ((discount * put_sd) / math.sqrt(N2)*1.96),
        "Sample Paths": S_paths[:25, :].tolist()  if return_paths else [] # grabbing first 125 paths for frontend simulation
      }
   

   #greeks 
   values = monte_carlo_simulator(S_0, K, T, r, sigma, q, N, N2, master_shocks, return_paths=True)
   values_S_plus = monte_carlo_simulator(S_0 + 0.0001, K, T, r, sigma, q, N, N2, master_shocks)
   values_S_minus = monte_carlo_simulator(S_0 - 0.0001, K, T, r, sigma, q, N, N2, master_shocks)
   values_sigma_plus = monte_carlo_simulator(S_0, K, T, r, sigma+ 0.0001, q, N, N2, master_shocks)
   values_r_plus = monte_carlo_simulator(S_0, K, T, r+0.0001, sigma, q, N, N2, master_shocks)
   T_bump = T - (1/365) if T > (1/365) else T + (1/365)
   values_T_change = monte_carlo_simulator(S_0, K, T_bump, r, sigma, q, N, N2, master_shocks)

   delta_call = (values_S_plus["EU Call"] - values_S_minus["EU Call"])/(0.0002)
   delta_put = (values_S_plus["EU Put"] - values_S_minus["EU Put"])/(0.0002)

   gamma_call = (values_S_plus["EU Call"] + values_S_minus["EU Call"] - (2* values["EU Call"]))/(0.0001**2)
   gamma_put = (values_S_plus["EU Put"] + values_S_minus["EU Put"] - (2* values["EU Put"]))/(0.0001**2)

   vega_call = (values_sigma_plus["EU Call"] - values["EU Call"])/(0.0001)
   vega_put = (values_sigma_plus["EU Put"] - values["EU Put"])/(0.0001)

   rho_call = (values_r_plus["EU Call"] - values["EU Call"])/(0.0001)
   rho_put = (values_r_plus["EU Put"] - values["EU Put"])/(0.0001)

   if T > (1/365):
    theta_call = (values_T_change["EU Call"] - values["EU Call"])/(1/365)
    theta_put = (values_T_change["EU Put"] - values["EU Put"])/(1/365)
   else:
    theta_call = (values["EU Call"] - values_T_change["EU Call"]) / (1/365)
    theta_put = (values["EU Put"] - values_T_change["EU Put"])/(1/365)


   ##HEATMAP
   x_axis = np.linspace(min_spot_price,max_spot_price,10)
   y_axis = np.linspace(min_vol,max_vol,10)

   price_heatmap_eu_call = np.zeros((10,10))
   profit_heatmap_eu_call = np.zeros((10,10))

   price_heatmap_eu_put = np.zeros((10,10))
   profit_heatmap_eu_put = np.zeros((10,10))


   for i in range(10):
      for j in range(10):
         res = monte_carlo_simulator(x_axis[i], K, T, r, y_axis[j], q, N, N2, master_shocks, return_paths=False)
         price_heatmap_eu_call[i, j] = res["EU Call"]
         price_heatmap_eu_put[i, j]  = res["EU Put"]

         profit_heatmap_eu_call[i][j] = price_heatmap_eu_call[i][j] - values["EU Call"]
         profit_heatmap_eu_put[i][j] = price_heatmap_eu_put[i][j] - values["EU Put"]


   values["EU Call Delta"] = delta_call
   values["EU Put Delta"] = delta_put
   values["EU Call Gamma"] = gamma_call
   values["EU Put Gamma"] = gamma_put
   values["EU Call Vega"] = vega_call
   values["EU Put Vega"] = vega_put
   values["EU Call Theta"] = theta_call
   values["EU Put Theta"] = theta_put
   values["EU Call Rho"] = rho_call
   values["EU Put Rho"] = rho_put


   values["EU Call Price Heatmap"] = price_heatmap_eu_call.tolist()
   values["EU Put Price Heatmap"] = price_heatmap_eu_put.tolist()

   values["EU Call Profit Heatmap"] = profit_heatmap_eu_call.tolist()
   values["EU Put Profit Heatmap"] = profit_heatmap_eu_put.tolist()

   values["X Axis"] = x_axis.tolist()
   values["Y Axis"] = y_axis.tolist()

   return values
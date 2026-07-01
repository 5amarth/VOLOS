// Central place to change the backend URL.
// NOTE: main.py's CORS config currently only allows http://localhost:5173 (Vite's
// default port). This app runs on Create React App's default port, 3000.
// Either add "http://localhost:3000" to `allow_origins` in main.py, or serve this
// build from port 5173, or requests will be blocked by the browser's CORS policy.
export const API_BASE_URL = "https://volos-backend.onrender.com";
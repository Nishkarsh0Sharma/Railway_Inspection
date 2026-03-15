# Railway Train Inspection Tracker

A React application for managing railway train inspections across Mechanical, Electrical, and Safety departments.

## Features

- User authentication (Admin/Worker roles)
- Calendar-based inspection records
- Department-specific inspection forms
- Real-time status tracking
- Conditional clearance management

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `src/App.jsx` - Main application component
- `src/main.jsx` - React entry point
- `index.html` - HTML template
- `vite.config.js` - Vite configuration

## Technologies Used

- React 18
- Vite
- JavaScript ES6+

## Deployment (Vercel frontend + Render backend)

1. Push your code to GitHub.
2. Render backend:
   - New Web Service from repo
   - Build: `npm install`
   - Start: `npm run server`
   - Add disk volume (persistent `data.db`)
   - Set env var `FRONTEND_URL=https://<your-vercel-app>.vercel.app`
3. Vercel frontend:
   - Import repo
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
   - Set env var `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api`
4. API config:
   - `src/services/dataService.js` uses `VITE_API_BASE_URL`
   - `server.js` uses `FRONTEND_URL` as allowed CORS origin
5. Test:
   - frontend UI should load and call Render API
   - backend should expose `/api/data`, `/api/addTrain`, etc.

# Railway Train Tracker

A React + Vite frontend with an Express (v5) backend for tracking railway train inspections.

## Architecture

- **Frontend**: React 18 + Vite, served as static files from `dist/` in production
- **Backend**: Express 5 API server (`server.js`) with better-sqlite3 for persistence
- **Database**: SQLite (`data.db`) — created automatically on first run

## Running the App

```bash
npm run build   # Build the frontend
npm run start   # Start the Express server (serves API + static frontend on port 5000)
npm run dev     # Vite dev server (port 5173) with proxy to backend on port 5000
```

## Key Configuration

- Server listens on `0.0.0.0:5000` (required for Replit)
- Frontend uses relative `/api` paths (no hardcoded localhost)
- Vite dev server proxies `/api` requests to `http://localhost:5000`
- Static files are served from `dist/` by Express in production

## Default Users

- Admin: `admin1` / `admin123`
- Worker: `worker1` / `worker123`

## Database Schema

- `users` — auth accounts with hashed passwords
- `sessions` — bearer token sessions (24h TTL)
- `trains` — train records per date with coach lists
- `inspections` — inspection comments per coach/department
- `audit_log` — full action audit trail

## Dependencies

- `express` v5, `better-sqlite3`, `cors` — backend
- `react`, `react-dom`, `vite`, `@vitejs/plugin-react` — frontend
- `xlsx` — Excel export

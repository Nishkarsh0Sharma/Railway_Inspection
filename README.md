# Railway Train Inspection Tracker

A React application for managing railway train inspections across Mechanical, Electrical, and Safety departments.

## Features

- User authentication (Admin/Worker roles)
- Calendar-based inspection records
- Department-specific inspection forms
- Real-time status tracking
- Conditional clearance management
- Export reports as XLSX/DOC

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start backend:

   ```bash
   npm run server
   ```

   Backend runs on http://localhost:3001

3. Start frontend:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `src/App.jsx` - Main application component
- `src/main.jsx` - React entry point
- `index.html` - HTML template
- `vite.config.js` - Vite configuration
- `server.js` - Express API backend with SQLite

## Technologies Used

| Frontend | Backend    | Database                |
| -------- | ---------- | ----------------------- |
| React 18 | Express.js | SQLite (better-sqlite3) |
| Vite     | Node.js    | WAL mode                |

## Production Deployment

### Backend (Render)

1. Create Web Service from GitHub repo.
2. **Build Command**: `npm install`
3. **Start Command**: `node server.js`
4. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | `https://your-vercel-app.vercel.app` |
   | `DB_PATH` | `/data/data.db` |
   | `PORT` | `10000` |
5. **Persistent Disk** (Render Starter plan $7/mo):
   - Mount `/data` (1GB) for `data.db`.
6. **Test**: `curl https://your-app.onrender.com/api/data`

**Default Users**: admin1/admin123, worker1/worker123

### Frontend (Vercel)

1. Import GitHub repo.
2. **Framework Preset**: Vite
3. **Build**: `npm run build`
4. **Output**: `dist`
5. **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://your-render-app.onrender.com/api` |

### Verified Setup

- railways-inspection.vercel.app (frontend)
- railway-inspection.onrender.com (backend)
- API endpoints: `/api/data`, `/api/auth/login`, `/api/addTrain`, `/api/submitInspection`

## Common Issues

- **Failed to fetch**: Set `VITE_API_BASE_URL` in Vercel.
- **Data lost**: Render free tier no disk → Upgrade to Starter.
- **CORS**: Set `FRONTEND_URL` in Render.
- **Adblock**: Disable for .onrender.com.

## API Docs

```
POST /api/auth/login {username, password} → {token, role}
GET /api/data → {date: {trains: [...]}}
POST /api/addTrain {date, trainId, coaches}
POST /api/submitInspection {date, trainId, dept, coach, inspection}
GET /api/audit?date=... (admin)
```

Your Railway Inspection Tracker is production-ready!

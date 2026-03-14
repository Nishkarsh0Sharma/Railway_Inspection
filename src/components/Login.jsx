import React from 'react';

export function Login({ adminName, setAdminName, workerName, setWorkerName, onAdminLogin, onWorkerLogin }) {
  return (
    <div className="app-shell login-page">
      <div className="card login-card">
        <h2>Railway Inspection Login</h2>

        <div className="form-row">
          <label>Admin</label>
          <select value={adminName} onChange={(e) => setAdminName(e.target.value)}>
            <option value="">Select admin</option>
            <option value="Ravi K.">Ravi K.</option>
            <option value="Priya S.">Priya S.</option>
            <option value="Arjun M.">Arjun M.</option>
          </select>
          <button className="btn-secondary" onClick={onAdminLogin}>Admin Login</button>
        </div>

        <div className="form-row">
          <label>Worker</label>
          <input type="text" value={workerName} placeholder="Enter worker name" onChange={(e) => setWorkerName(e.target.value)} />
          <button className="btn-secondary" onClick={onWorkerLogin}>Worker Login</button>
        </div>
      </div>
    </div>
  );
}

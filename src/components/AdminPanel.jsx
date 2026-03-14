import React from 'react';

export function AdminPanel({ adminDate, setAdminDate, trainSelection, setTrainSelection, onAddTrain, trainsForDate, onDeleteTrain, trainCoachMap, onExport }) {
  const coaches = trainCoachMap[trainSelection] || [];

  return (
    <div className="card">
      <h3>Admin Panel</h3>
      <div className="form-row">
        <label>Date</label>
        <input type="date" value={adminDate} onChange={(e) => setAdminDate(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Train ID</label>
        <select value={trainSelection} onChange={(e) => setTrainSelection(e.target.value)}>
          {Array.from({ length: 20 }, (_, i) => `TRN-${1001 + i}`).map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Coach nos</label>
        <div style={{flex:1, fontSize:'13px', color:'#374151', lineHeight:'1.4'}}>{coaches.join(', ') || 'No coaches mapped'}</div>
        <button className="btn" onClick={onAddTrain}>Add</button>
      </div>
      
      <div className="train-list">
        <h4>Trains for {adminDate}</h4>
        {trainsForDate.length === 0 ? (
          <p>No trains scheduled</p>
        ) : (
          trainsForDate.map((train) => (
            <div key={train.id} className="train-line">
              <span>{train.id}</span>
              <button className="btn-danger" onClick={() => onDeleteTrain(train.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

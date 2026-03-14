import React from 'react';

const DEPARTMENTS = ['Mechanical', 'Electrical', 'Safety'];

export function WorkerPanel({ workDate, setWorkDate, workTrain, setWorkTrain, workCoach, setWorkCoach, workDept, setWorkDept, workComment, setWorkComment, trainOptions, onSubmit }) {
  const selectedTrain = trainOptions.find((t) => t.id === workTrain);
  const coachList = selectedTrain?.coaches || [];

  return (
    <div className="card">
      <h3>Worker Panel</h3>
      <div className="form-row">
        <label>Date</label>
        <input type="date" value={workDate} onChange={(e) => { setWorkDate(e.target.value); setWorkTrain(''); setWorkCoach(''); }} />
      </div>
      <div className="form-row">
        <label>Train</label>
        <select value={workTrain} onChange={(e) => { setWorkTrain(e.target.value); setWorkCoach(''); }}>
          <option value="">Select train</option>
          {trainOptions.map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Coach</label>
        <select value={workCoach} onChange={(e) => setWorkCoach(e.target.value)}>
          <option value="">Select coach</option>
          {coachList.map((coach) => <option key={coach} value={coach}>{coach}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Department</label>
        <select value={workDept} onChange={(e) => setWorkDept(e.target.value)}>
          {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Comment</label>
        <textarea value={workComment} onChange={(e) => setWorkComment(e.target.value)} placeholder="Comment only" />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn" onClick={onSubmit}>Submit</button>
      </div>
    </div>
  );
}

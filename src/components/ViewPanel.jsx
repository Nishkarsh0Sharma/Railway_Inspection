import React from 'react';

const DEPARTMENTS = ['Mechanical', 'Electrical', 'Safety'];
const rowColor = (comment) => (comment ? '#dcfce7' : '#fff');

export function ViewPanel({ viewDate, setViewDate, data, role, onDownload }) {
  const getTrains = (date) => data[date]?.trains || [];

  return (
    <div className="card">
      <h3>Inspection View</h3>
      <div className="form-row" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label>View Date</label>
          <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} />
        </div>
        {role === 'admin' && (
          <button className="btn-secondary" onClick={() => onDownload(viewDate)}>
            Download inspection XLSX
          </button>
        )}
      </div>

      {getTrains(viewDate).length === 0 ? (
        <p>No records for this date</p>
      ) : (
        getTrains(viewDate).map((train) => {
          const coaches = train.coaches || [];
          return (
            <div key={train.id} className="train-card">
              <h4>{train.id}</h4>
              {coaches.length === 0 ? (
                <p>No coach information available</p>
              ) : (
                <table className="dept-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      {coaches.map((coach) => <th key={coach}>{coach}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {DEPARTMENTS.map((dept) => {
                      const deptRecords = train.departments?.[dept] || {};
                      const lastComment = coaches.reduce((acc, coach) => {
                        const recs = deptRecords[coach] || [];
                        return recs.length ? recs[recs.length - 1].comment : acc;
                      }, '');

                      return (
                        <tr key={dept} style={{ backgroundColor: rowColor(lastComment) }}>
                          <td className="dept-name">{dept}</td>
                          {coaches.map((coach) => {
                            const entries = deptRecords[coach] || [];
                            if (entries.length === 0) return <td key={coach}>—</td>;
                            return (
                              <td key={coach} className="dept-comment">
                                {entries.map((entry, idx) => (
                                  <div key={idx}>{entry.comment} ({entry.worker} @ {entry.time})</div>
                                ))}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

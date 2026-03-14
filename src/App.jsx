import { useEffect, useState } from 'react';
import * as dataService from './services/dataService';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { WorkerPanel } from './components/WorkerPanel';
import { ViewPanel } from './components/ViewPanel';
import './styles.css';

const DEPARTMENTS = ['Mechanical', 'Electrical', 'Safety'];
const TRAIN_OPTIONS = Array.from({ length: 20 }, (_, i) => `TRN-${1001 + i}`);
const todayDate = new Date().toISOString().slice(0, 10);

const TRAIN_COACH_MAPPING = {
  'TRN-1001': ['128070', '048055', '018046', '128078', '128077', '048050', '068015', '048116'],
  'TRN-1002': ['068029', '048092', '128237', '048095', '128239', '108566', '148040', '148030'],
  'TRN-1003': ['248784', '248792', '248793', '248794', '248795', '248796', '248797', '248785'],
  'TRN-1004': ['248783', '248791', '248790', '248788', '248789', '248786', '248787', '248782'],
  'TRN-1005': ['078039', '148081', '148152', '148082', '148150', '018033', '018035', '028021'],
  'TRN-1006': ['188306', '188317', '188316', '188318', '188319', '188315', '188314', '188307'],
  'TRN-1007': ['128227', '188311', '188313', '188308', '188310', '188309', '188307', '188304'],
  'TRN-1008': ['258226', '258232', '258231', '258230', '258229', '258228', '258227', '258225'],
  'TRN-1009': ['178195', '188830', '188831', '188832', '178196', '178197', '178198', '188833'],
  'TRN-1010': ['048048', '158456', '018115', '018110', '048093', '158457', '018114', '018044'],
  'TRN-1011': ['128178', '108564', '128182', '048081', '128181', '148037', '048094', '128177'],
  'TRN-1012': ['018047', '128113', '128082', '018049', '128081', '078046', '128080', '018048'],
  'TRN-1013': ['148046', '128031', '148073', '068017', '148074', '078093', '128023', '148044'],
  'TRN-1014': ['178100', '178111', '178103', '178099', '178136', '178122', '178146', '178094'],
  'TRN-1015': ['158351', '018091', '108561', '158353', '158352', '048080', '028041', '158352'],
  'TRN-1016': ['258218', '258224', '258223', '258221', '258220', '258219', '258217', '258217'],
  'TRN-1017': ['048035', '068021', '148075', '068029', '048036', '068019', '068018', '068027'],
  'TRN-1018': ['258234', '258240', '258239', '258238', '258237', '258236', '258235', '258233'],
  'TRN-1019': ['018025', '128079', '068028', '048041', '018029', '148085', '148084', '148029'],
  'TRN-1020': ['138100', '138108', '138109', '138113', '138114', '138110', '138111', '138115']
};

const createEmptyTrain = (id, coaches = []) => ({
  id,
  coaches,
  departments: DEPARTMENTS.reduce((acc, dept) => ({
    ...acc,
    [dept]: coaches.reduce((inner, coach) => ({
      ...inner,
      [coach]: []
    }), {})
  }), {})
});

export default function App() {
  const [role, setRole] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [data, setData] = useState({ [todayDate]: { trains: [] } });

  const [adminDate, setAdminDate] = useState(todayDate);
  const [trainSelection, setTrainSelection] = useState(TRAIN_OPTIONS[0]);

  const [workDate, setWorkDate] = useState(todayDate);
  const [workTrain, setWorkTrain] = useState('');
  const [workCoach, setWorkCoach] = useState('');
  const [workDept, setWorkDept] = useState(DEPARTMENTS[0]);
  const [workComment, setWorkComment] = useState('');

  const [viewDate, setViewDate] = useState(todayDate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await dataService.loadData({ [todayDate]: { trains: [] } });
      setData(loaded);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) dataService.saveData(data);
  }, [data, loading]);

  const getTrains = (date) => data[date]?.trains || [];

  const loginAsAdmin = () => {
    if (!adminName) return alert('Select admin name');
    setRole('admin');
    setWorkerName('');
  };

  const loginAsWorker = () => {
    if (!workerName.trim()) return alert('Enter worker name');
    setRole('worker');
    setAdminName('');
  };

  const logout = () => {
    setRole(null);
    setAdminName('');
    setWorkerName('');
  };

  const addTrain = async () => {
    const trainId = trainSelection;
    if (!trainId) return;

    const coachCodes = TRAIN_COACH_MAPPING[trainId] || [];
    if (coachCodes.length === 0) {
      return alert('No defined coach mapping for selected train');
    }

    const trains = getTrains(adminDate);
    if (trains.some((t) => t.id === trainId)) {
      return alert('Train already added for this date');
    }

    const updated = {
      ...data,
      [adminDate]: { trains: [...trains, createEmptyTrain(trainId, coachCodes)] }
    };

    setData(updated);
    await dataService.addTrain(updated, adminDate, trainId, coachCodes);
  };

  const deleteTrain = async (id) => {
    if (!window.confirm(`Delete train ${id} on ${adminDate}?`)) return;
    const updated = {
      ...data,
      [adminDate]: { trains: getTrains(adminDate).filter((t) => t.id !== id) }
    };
    setData(updated);
    await dataService.deleteTrain(updated, adminDate, id);
  };

  const downloadInspectionForDate = (date) => {
    const trains = getTrains(date);
    if (!trains.length) {
      alert('No records for selected date');
      return;
    }

    const headerCols = ['Department', 'Train ID', 'Coach 1', 'Coach 2', 'Coach 3', 'Coach 4', 'Coach 5', 'Coach 6', 'Coach 7', 'Coach 8'];
    let rowsHtml = '';

    trains.forEach((train) => {
      const coaches = (train.coaches || []).slice(0, 8);

      DEPARTMENTS.forEach((dept) => {
        const deptRecords = train.departments?.[dept] || {};
        const cells = coaches.map((coach) => {
          if (!coach) return '<td>—</td>';
          const entries = deptRecords[coach] || [];
          if (!entries.length) return '<td>—</td>';
          const lines = entries.map((e) => `${e.worker} (${e.time}): ${e.comment}`).join('<br>');
          return `<td>${lines}</td>`;
        }).join('');

        const paddedCells = cells + '<td>—</td>'.repeat(Math.max(0, 8 - coaches.length));
        rowsHtml += `<tr><td>${dept}</td><td>${train.id}</td>${paddedCells}</tr>`;
      });
    });

    const html = `
      <html><head><meta charset="UTF-8"><style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #333; padding: 6px; vertical-align: top; }
        th { background: #e2e8f0; }
      </style></head><body>
      <h2>Inspection report for ${date}</h2>
      <table>
        <thead><tr>${headerCols.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      </body></html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-${date}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadInspectionAsXlsx = (date) => {
    const trains = getTrains(date);
    if (!trains.length) {
      alert('No records for selected date');
      return;
    }

    const rows = [];
    trains.forEach((train) => {
      const coaches = (train.coaches || []).slice(0, 8);
      DEPARTMENTS.forEach((dept) => {
        const deptRecords = train.departments?.[dept] || {};
        const row = { Department: dept, 'Train ID': train.id };
        for (let i = 0; i < 8; i += 1) {
          const coach = coaches[i] || '';
          const entries = coach ? deptRecords[coach] || [] : [];
          row[`Coach ${i + 1}`] = entries.length
            ? entries.map((e) => `${e.worker} (${e.time}): ${e.comment}`).join('\n')
            : '';
        }
        rows.push(row);
      });
    });

    import('xlsx').then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(rows, { header: ['Department', 'Train ID', 'Coach 1', 'Coach 2', 'Coach 3', 'Coach 4', 'Coach 5', 'Coach 6', 'Coach 7', 'Coach 8'] });
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const wopts = { bookType: 'xlsx', type: 'array' };
      const wbout = XLSX.write(workbook, wopts);
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };


  const exportAdminData = () => {
    const rows = [];
    Object.keys(data).forEach((date) => {
      data[date].trains.forEach((train) => {
        (train.coaches || []).forEach((coach) => {
          DEPARTMENTS.forEach((dept) => {
            const entries = train.departments?.[dept]?.[coach] || [];
            const commentHistory = entries.map((e) => `${e.comment} (${e.worker} @ ${e.time})`).join('; ');
            rows.push({ date, trainId: train.id, coach, department: dept, comment: commentHistory || '—' });
          });
        });
      });
    });

    const tableRows = rows.map((r) => `
      <tr>
        <td>${r.date}</td>
        <td>${r.trainId}</td>
        <td>${r.coach}</td>
        <td>${r.department}</td>
        <td>${r.comment}</td>
      </tr>
    `).join('');

    const html = `
      <html><head><meta charset="UTF-8"><style>
        table, th, td { border: 1px solid #000; border-collapse: collapse; }
        th, td { padding: 6px; }
      </style></head><body>
        <h1>Admin Train Data</h1>
        <table><thead><tr><th>Date</th><th>Train ID</th><th>Coach</th><th>Department</th><th>Workers comments</th></tr></thead><tbody>${tableRows}</tbody></table>
      </body></html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-data-${new Date().toISOString().slice(0,10)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitWorkerComment = async () => {
    if (!workTrain) return alert('Select train');
    if (!workCoach) return alert('Select coach');
    if (!workComment.trim()) return alert('Enter comment');

    const trains = getTrains(workDate);
    const train = trains.find((t) => t.id === workTrain);
    if (!train) return alert('Train not registered on this date');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry = {
      comment: workComment.trim(),
      worker: workerName,
      time
    };

    const deptRecords = train.departments?.[workDept] || {};
    const existingCoachEntries = deptRecords[workCoach] || [];

    const updatedTrain = {
      ...train,
      departments: {
        ...train.departments,
        [workDept]: {
          ...deptRecords,
          [workCoach]: [...existingCoachEntries, newEntry]
        }
      }
    };

    const updatedData = {
      ...data,
      [workDate]: { trains: trains.map((t) => (t.id === workTrain ? updatedTrain : t)) }
    };

    setData(updatedData);
    setWorkComment('');
    await dataService.submitInspection(updatedData, workDate, workTrain, workDept, workCoach, newEntry);
  };

  if (loading) return <div className="app-shell">Loading...</div>;

  if (!role) {
    return (
      <Login
        adminName={adminName}
        setAdminName={setAdminName}
        workerName={workerName}
        setWorkerName={setWorkerName}
        onAdminLogin={loginAsAdmin}
        onWorkerLogin={loginAsWorker}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div>{role === 'admin' ? `Admin: ${adminName}` : `Worker: ${workerName}`}</div>
        <button className="btn-secondary" onClick={logout}>Logout</button>
      </div>

      {role === 'admin' ? (
        <AdminPanel
          adminDate={adminDate}
          setAdminDate={setAdminDate}
          trainSelection={trainSelection}
          setTrainSelection={setTrainSelection}
          trainCoachMap={TRAIN_COACH_MAPPING}
          onAddTrain={addTrain}
          trainsForDate={getTrains(adminDate)}
          onDeleteTrain={deleteTrain}
        />
      ) : (
        <WorkerPanel
          workDate={workDate}
          setWorkDate={setWorkDate}
          workTrain={workTrain}
          setWorkTrain={setWorkTrain}
          workCoach={workCoach}
          setWorkCoach={setWorkCoach}
          workDept={workDept}
          setWorkDept={setWorkDept}
          workComment={workComment}
          setWorkComment={setWorkComment}
          trainOptions={getTrains(workDate)}
          onSubmit={submitWorkerComment}
        />
      )}

      <ViewPanel
        viewDate={viewDate}
        setViewDate={setViewDate}
        data={data}
        role={role}
        onDownload={() => downloadInspectionAsXlsx(viewDate)}
      />
    </div>
  );
}

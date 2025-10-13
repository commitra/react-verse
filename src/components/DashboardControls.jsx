import { useEffect, useState } from 'react';

export default function DashboardControls({ onRefresh }) {
  const [intervalTime, setIntervalTime] = useState(null);

  useEffect(() => {
    if (intervalTime) {
      const id = setInterval(() => {
        onRefresh();
      }, intervalTime);
      return () => clearInterval(id);
    }
  }, [intervalTime, onRefresh]);

  return (
    <div>
      <button
        onClick={onRefresh}
      >
        Refresh
      </button>

      <select
        onChange={(e) =>
          setIntervalTime(e.target.value === 'off' ? null : Number(e.target.value))
        }
      >
        <option value="off">Auto Refresh: Off</option>
        <option value={5000}>Every 5s</option>
        <option value={30000}>Every 30s</option>
        <option value={60000}>Every 1 min</option>
      </select>
    </div>
  );
}

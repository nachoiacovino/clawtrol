'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/shared/StatCard';
import { LogsView } from '@/components/shared/ActivityFeed';

export default function LogsModule() {
  const [logs, setLogs] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/gateway/logs?lines=100');
      const data = await res.json();
      setLogs(data.logs || '');
    } catch {}
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return (
    <Card title="GATEWAY LOGS" actions={
      <button onClick={fetchLogs} className="text-[10px] tracking-wider transition-colors" style={{ color: 'var(--text-dim)' }}>
        ↻ REFRESH
      </button>
    }>
      <LogsView logs={logs} />
    </Card>
  );
}

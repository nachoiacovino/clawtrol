'use client';

import { useRef, useEffect } from 'react';

export function LogsView({ logs }: { logs: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logs]);
  return (
    <div
      ref={ref}
      className="rounded p-3 overflow-y-auto overflow-x-hidden font-mono text-[11px] leading-relaxed"
      style={{
        background: 'var(--bg-secondary)',
        height: 'calc(100dvh - 280px)',
        minHeight: '300px',
        maxHeight: 'calc(100vh - 280px)',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <pre className="whitespace-pre-wrap break-all" style={{ color: '#b0bcc8' }}>{logs || 'Loading...'}</pre>
    </div>
  );
}

export function ActivityFeed({ logs }: { logs: string }) {
  const feedRef = useRef<HTMLDivElement>(null);
  const lines = logs
    .split('\n')
    .filter(l => l.trim())
    .slice(-20);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [logs]);

  const colorLine = (line: string) => {
    if (line.includes('ERROR') || line.includes('error') || line.includes('ERR')) return 'var(--accent-red)';
    if (line.includes('WARN') || line.includes('warn')) return 'var(--accent-yellow)';
    if (line.includes('INFO') || line.includes('heartbeat') || line.includes('connected')) return 'var(--accent-cyan)';
    return 'var(--text-secondary)';
  };

  return (
    <div ref={feedRef} className="h-48 overflow-auto terminal-log p-2 rounded max-w-full" style={{ background: 'var(--bg-secondary)' }}>
      {lines.length === 0 ? (
        <div style={{ color: 'var(--text-dim)' }}>Waiting for logs...</div>
      ) : (
        lines.map((line, i) => (
          <div key={i} className="py-0.5 truncate max-w-full" title={line} style={{ color: colorLine(line) }}>
            {line}
          </div>
        ))
      )}
    </div>
  );
}

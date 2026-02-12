'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, MetricBlock, StatusIndicator, ProgressBar } from '@/components/shared/StatCard';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import { formatBytes, formatUptime, timeAgo } from '@/lib/types';
import type { SystemInfo, GatewayStatus, TailscaleStatus, PM2Process } from '@/lib/types';

export default function OverviewModule() {
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [tailscale, setTailscale] = useState<TailscaleStatus | null>(null);
  const [processes, setProcesses] = useState<PM2Process[]>([]);
  const [claudeUsage, setClaudeUsage] = useState<any>(null);
  const [aranet, setAranet] = useState<any>(null);
  const [logs, setLogs] = useState('');
  const [restarting, setRestarting] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memHistory, setMemHistory] = useState<number[]>([]);

  const fetchAll = useCallback(async () => {
    const fetches = [
      fetch('/api/system').then(r => r.json()).then(data => {
        setSystem(data);
        setCpuHistory(prev => [...prev.slice(-59), data.cpu.load]);
        setMemHistory(prev => [...prev.slice(-59), data.memory.usedPercent]);
      }).catch(() => {}),
      fetch('/api/gateway/status').then(r => r.json()).then(setGateway).catch(() => {}),
      fetch('/api/tailscale').then(r => r.json()).then(setTailscale).catch(() => {}),
      fetch('/api/processes').then(r => r.json()).then(d => setProcesses(d.pm2 || [])).catch(() => {}),
      fetch('/api/claude-usage').then(r => r.json()).then(setClaudeUsage).catch(() => {}),
      fetch('/api/aranet').then(r => r.json()).then(setAranet).catch(() => {}),
      fetch('/api/gateway/logs?lines=100').then(r => r.json()).then(d => setLogs(d.logs || '')).catch(() => {}),
    ];
    await Promise.all(fetches);
  }, []);

  const restartGateway = async () => {
    if (!confirm('Restart gateway?')) return;
    setRestarting(true);
    try {
      await fetch('/api/gateway/restart', { method: 'POST' });
      setActionResult('Gateway restarting...');
      setTimeout(() => { fetchAll(); setRestarting(false); setActionResult(null); }, 5000);
    } catch { setRestarting(false); }
  };

  const doAction = async (action: string, target?: string) => {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target }),
      });
      const data = await res.json();
      setActionResult(data.message || data.error || 'Done');
      setTimeout(() => setActionResult(null), 3000);
      fetchAll();
    } catch {}
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      setMessage('');
      setActionResult('Message sent');
      setTimeout(() => setActionResult(null), 2000);
    } catch {}
    setSending(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const mainDisk = system?.disk.find(d => d.mount === '/' || d.mount.includes('Data'));
  const cpuColor = system && system.cpu.load > 80 ? 'var(--accent-red)' : system && system.cpu.load > 50 ? 'var(--accent-yellow)' : 'var(--accent-cyan)';
  const memColor = system && system.memory.usedPercent > 85 ? 'var(--accent-red)' : system && system.memory.usedPercent > 65 ? 'var(--accent-yellow)' : 'var(--accent-purple)';

  return (
    <>
      {actionResult && (
        <div className="text-[10px] px-3 py-1.5 rounded animate-pulse-glow mb-2" style={{ background: 'rgba(0,255,106,0.15)', color: 'var(--accent-green)' }}>
          {actionResult}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 animate-fade-in">
        <MetricBlock label="CPU LOAD" value={system ? `${system.cpu.load.toFixed(1)}%` : '—'} sub={system?.cpu.model.split(' ').slice(0, 2).join(' ')} accent={cpuColor} sparkData={cpuHistory} />
        <MetricBlock label="MEMORY" value={system ? `${system.memory.usedPercent.toFixed(1)}%` : '—'} sub={system ? formatBytes(system.memory.used) : undefined} accent={memColor} sparkData={memHistory} />
        <MetricBlock label="DISK" value={mainDisk ? `${mainDisk.usedPercent.toFixed(0)}%` : '—'} sub={mainDisk ? `${formatBytes(mainDisk.available)} free` : undefined} accent="var(--accent-yellow)" />
        <MetricBlock label="UPTIME" value={system ? formatUptime(system.uptime) : '—'} accent="var(--accent-green)" />
      </div>

      {/* Gateway + PM2 Row */}
      <div className="grid md:grid-cols-2 gap-2 animate-fade-in-1">
        <Card title="GATEWAY" tag={gateway?.running ? 'ONLINE' : 'OFFLINE'} actions={
          <button onClick={restartGateway} disabled={restarting} className="px-2 py-0.5 rounded text-[10px] tracking-wider border transition-colors disabled:opacity-50" style={{ borderColor: 'rgba(255,138,0,0.3)', color: 'var(--accent-orange)', background: 'rgba(255,138,0,0.05)' }}>
            {restarting ? 'RESTARTING...' : '↻ RESTART'}
          </button>
        }>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIndicator online={gateway?.running || false} />
                <span className="text-xs font-medium" style={{ color: gateway?.running ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {gateway?.running ? 'Running' : 'Stopped'}
                </span>
                {gateway?.version && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>v{gateway.version}</span>}
              </div>
              {gateway?.process && (
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                  PID {gateway.process.pid} · {formatUptime(gateway.process.uptime / 1000)}
                </span>
              )}
            </div>
            {gateway?.process && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>CPU</div>
                  <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{gateway.process.cpu.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>MEM</div>
                  <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{formatBytes(gateway.process.memory)}</div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="PM2 SERVICES" actions={
          <button onClick={() => doAction('pm2-restart', 'all')} className="text-[10px] tracking-wider transition-colors" style={{ color: 'var(--text-dim)' }}>
            RESTART ALL
          </button>
        }>
          <div className="space-y-1 max-h-40 overflow-auto">
            {processes.map(p => (
              <div key={p.name} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-dim)' }}>
                <div className="flex items-center gap-2">
                  <StatusIndicator online={p.status === 'online'} />
                  <span className="text-xs font-mono">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                  <span>{formatBytes(p.memory || 0)}</span>
                  <button onClick={() => doAction('pm2-restart', p.name)} className="hover:opacity-80 transition" style={{ color: 'var(--accent-orange)' }}>↻</button>
                </div>
              </div>
            ))}
            {processes.length === 0 && <div className="text-xs" style={{ color: 'var(--text-dim)' }}>No processes found</div>}
          </div>
        </Card>
      </div>

      {/* Claude Code Usage */}
      <div className="animate-fade-in-2">
        <Card title="CLAUDE MAX USAGE" tag="LIVE">
          {claudeUsage ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>5-HOUR WINDOW</span>
                  {claudeUsage.fiveHour?.resetIn && <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>resets in {claudeUsage.fiveHour.resetIn}</span>}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: claudeUsage.fiveHour?.percent >= 90 ? 'var(--accent-red)' : claudeUsage.fiveHour?.percent >= 75 ? 'var(--accent-yellow)' : 'var(--accent-cyan)', fontFamily: 'var(--font-data)' }}>
                    {claudeUsage.fiveHour?.percent?.toFixed(0) || 0}%
                  </span>
                </div>
                <ProgressBar value={claudeUsage.fiveHour?.percent || 0} color={claudeUsage.fiveHour?.percent >= 90 ? 'var(--accent-red)' : claudeUsage.fiveHour?.percent >= 75 ? 'var(--accent-yellow)' : 'var(--accent-cyan)'} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>WEEKLY</span>
                  {claudeUsage.weekly?.resetIn && <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>resets in {claudeUsage.weekly.resetIn}</span>}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: claudeUsage.weekly?.percent >= 90 ? 'var(--accent-red)' : claudeUsage.weekly?.percent >= 75 ? 'var(--accent-yellow)' : claudeUsage.weekly?.percent >= 50 ? 'var(--accent-purple)' : 'var(--accent-green)', fontFamily: 'var(--font-data)' }}>
                    {claudeUsage.weekly?.percent?.toFixed(0) || 0}%
                  </span>
                </div>
                <ProgressBar value={claudeUsage.weekly?.percent || 0} color={claudeUsage.weekly?.percent >= 90 ? 'var(--accent-red)' : claudeUsage.weekly?.percent >= 75 ? 'var(--accent-yellow)' : claudeUsage.weekly?.percent >= 50 ? 'var(--accent-purple)' : 'var(--accent-green)'} />
              </div>
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading usage data...</div>
          )}
        </Card>
      </div>

      {/* Aranet Air Quality */}
      {aranet && !aranet.error && (
        <div className="animate-fade-in-2">
          <Card title="AIR QUALITY" tag={aranet.stale ? 'STALE' : aranet.status}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>CO₂</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: aranet.co2 >= 2000 ? 'var(--accent-red)' : aranet.co2 >= 1400 ? 'var(--accent-orange)' : aranet.co2 >= 1000 ? 'var(--accent-yellow)' : 'var(--accent-green)', fontFamily: 'var(--font-data)' }}>
                    {aranet.co2}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>ppm</span>
                </div>
                <div className="text-[9px]" style={{ color: aranet.level === 'excellent' ? 'var(--accent-green)' : aranet.level === 'good' ? 'var(--accent-cyan)' : aranet.level === 'fair' ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
                  {aranet.level?.toUpperCase()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>TEMP</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-data)' }}>{aranet.temperature}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>°C</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>HUMIDITY</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-data)' }}>{aranet.humidity}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>BATTERY</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: aranet.battery < 20 ? 'var(--accent-red)' : aranet.battery < 50 ? 'var(--accent-yellow)' : 'var(--accent-green)', fontFamily: 'var(--font-data)' }}>{aranet.battery}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>%</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[9px]" style={{ color: 'var(--text-dim)' }}>
              Updated {aranet.ageMinutes}m ago · Pressure {aranet.pressure} hPa
            </div>
          </Card>
        </div>
      )}

      {/* Resources + Activity */}
      <div className="grid md:grid-cols-3 gap-2 animate-fade-in-2 overflow-hidden">
        <Card title="RESOURCES" className="min-w-0">
          <div className="space-y-3">
            {[
              { label: 'CPU', value: system?.cpu.load || 0, color: cpuColor },
              { label: 'MEM', value: system?.memory.usedPercent || 0, color: memColor },
              { label: 'DISK', value: mainDisk?.usedPercent || 0, color: 'var(--accent-yellow)' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>{r.label}</span>
                  <span className="text-[11px] font-mono" style={{ color: r.color }}>{r.value.toFixed(1)}%</span>
                </div>
                <ProgressBar value={r.value} color={r.color} />
              </div>
            ))}
          </div>
        </Card>

        <div className="md:col-span-2 min-w-0 overflow-hidden">
          <Card title="ACTIVITY FEED" tag="LIVE">
            <ActivityFeed logs={logs} />
          </Card>
        </div>
      </div>

      {/* Tailscale Devices */}
      <div className="animate-fade-in-3">
        <Card title="TAILSCALE MESH">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {tailscale?.peers.map(p => (
              <div key={p.hostname} className="flex items-center gap-2 p-2 rounded" style={{ background: p.online ? 'rgba(0,255,106,0.05)' : 'var(--bg-secondary)' }}>
                <StatusIndicator online={p.online} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono truncate">{p.hostname}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{p.os} · {p.online ? 'online' : timeAgo(p.lastSeen)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions + Message */}
      <div className="grid md:grid-cols-2 gap-2 animate-fade-in-4">
        <Card title="QUICK ACTIONS">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'GIT PULL', action: 'git-pull', icon: '↓', desc: 'Pull latest code' },
              { label: 'CLEAR LOGS', action: 'clear-logs', icon: '✕', desc: 'Flush PM2 logs' },
              { label: 'UPDATE', action: 'openclaw-update', icon: '↑', desc: 'Update OpenClaw' },
              { label: 'REFRESH', action: 'refresh', icon: '↻', desc: 'Refresh all data' },
            ].map(a => (
              <button
                key={a.action}
                onClick={() => a.action === 'refresh' ? fetchAll() : doAction(a.action)}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded border transition-all hover:scale-[1.02] active:scale-95"
                style={{ borderColor: 'var(--border-dim)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
              >
                <span className="text-lg">{a.icon}</span>
                <span className="text-[11px] tracking-wider font-medium">{a.label}</span>
                <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{a.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card title="MESSAGE">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Send to Telegram..."
              className="flex-1 rounded px-3 py-1.5 text-xs"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !message.trim()}
              className="px-3 py-1.5 rounded text-[10px] tracking-wider font-medium border transition-all disabled:opacity-30"
              style={{ borderColor: 'var(--border-accent)', color: 'var(--accent-cyan)', background: 'rgba(0,255,200,0.05)' }}
            >
              {sending ? '···' : 'SEND'}
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

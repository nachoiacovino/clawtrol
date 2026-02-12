'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, StatusIndicator } from '@/components/shared/StatCard';
import { timeAgo } from '@/lib/types';
import type { TailscaleStatus } from '@/lib/types';

export default function NetworkModule() {
  const [tailscale, setTailscale] = useState<TailscaleStatus | null>(null);

  const fetchTailscale = useCallback(async () => {
    try {
      const res = await fetch('/api/tailscale');
      const data = await res.json();
      setTailscale(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTailscale();
    const interval = setInterval(fetchTailscale, 30000);
    return () => clearInterval(interval);
  }, [fetchTailscale]);

  return (
    <div className="space-y-3">
      <Card title="TAILSCALE" className="animate-fade-in">
        {tailscale?.self && (
          <div className="mb-3 p-3 rounded border" style={{ background: 'rgba(0,255,200,0.03)', borderColor: 'var(--border-accent)' }}>
            <div className="flex items-center gap-2">
              <StatusIndicator online={tailscale.self.online} />
              <span className="font-mono text-sm" style={{ color: 'var(--accent-cyan)' }}>{tailscale.self.hostname}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: 'rgba(0,255,200,0.1)', color: 'var(--accent-cyan)' }}>
                THIS NODE
              </span>
            </div>
            <div className="text-[11px] font-mono mt-1" style={{ color: 'var(--text-dim)' }}>
              {tailscale.self.ip} · {tailscale.self.dnsName}
            </div>
          </div>
        )}
        <div className="space-y-1">
          {tailscale?.peers.map(p => (
            <div key={p.hostname} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-dim)' }}>
              <div className="flex items-center gap-2">
                <StatusIndicator online={p.online} />
                <div>
                  <div className="text-xs font-mono">{p.hostname}</div>
                  <div className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{p.ip}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{p.os}</div>
                <div className="text-[10px]" style={{ color: p.online ? 'var(--accent-green)' : 'var(--text-dim)' }}>
                  {p.online ? 'online' : timeAgo(p.lastSeen)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

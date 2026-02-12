'use client';

import React from 'react';
import { Sparkline } from './Sparkline';

export function Card({ title, children, className = '', actions, tag }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode; tag?: string }) {
  return (
    <div className={`card-base ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center px-3 py-2 border-b" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="flex items-center gap-2">
            {title && (
              <h2 className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                {title}
              </h2>
            )}
            {tag && (
              <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: 'rgba(0,255,200,0.1)', color: 'var(--accent-cyan)' }}>
                {tag}
              </span>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}

export function MetricBlock({ label, value, sub, accent = 'var(--accent-cyan)', sparkData }: { label: string; value: string; sub?: string; accent?: string; sparkData?: number[] }) {
  return (
    <div className="card-base p-3">
      <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-xl font-semibold tabular-nums" style={{ color: accent, fontFamily: 'var(--font-data)' }}>
            {value}
          </div>
          {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{sub}</div>}
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} color={accent} height={28} width={80} />
        )}
      </div>
    </div>
  );
}

export function StatusIndicator({ online, label }: { online: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={online ? 'status-online animate-pulse-glow' : 'status-offline'} />
      {label && <span className="text-xs" style={{ color: online ? 'var(--accent-green)' : 'var(--accent-red)' }}>{label}</span>}
    </div>
  );
}

export function ProgressBar({ value, color = 'var(--accent-cyan)', height = 4 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full rounded-sm overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.05)' }}>
      <div
        className="h-full rounded-sm transition-all duration-700 ease-out"
        style={{ width: `${Math.min(value, 100)}%`, background: color, boxShadow: `0 0 8px ${color}40` }}
      />
    </div>
  );
}

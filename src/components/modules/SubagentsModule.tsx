'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/shared/StatCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function SubagentsModule() {
  const [subagents, setSubagents] = useState<any>(null);
  const [selectedAgentLogs, setSelectedAgentLogs] = useState<any>(null);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());

  const fetchSubagents = useCallback(async () => {
    try {
      await fetch('/api/subclawds/history', { method: 'POST' }).catch(() => {});
      const res = await fetch('/api/subclawds');
      const data = await res.json();
      setSubagents(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchSubagents();
  }, [fetchSubagents]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
            SUB-AGENT REGISTRY
          </h2>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>
            Persistent AI agents with specialized roles
          </p>
        </div>
        <button
          onClick={fetchSubagents}
          className="px-3 py-1.5 rounded text-[10px] uppercase tracking-wider"
          style={{ background: 'rgba(0,255,200,0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)' }}
        >
          Refresh
        </button>
      </div>

      {/* Coordinator Card */}
      {subagents?.coordinator && (
        <Card>
          <div className="flex items-center gap-3 p-4">
            <span className="text-3xl">{subagents.coordinator.emoji}</span>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--accent-cyan)' }}>{subagents.coordinator.name}</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{subagents.coordinator.role} · {subagents.coordinator.model}</p>
            </div>
            <div className="ml-auto px-2 py-1 rounded text-[10px]" style={{ background: 'rgba(0,255,200,0.15)', color: 'var(--accent-cyan)' }}>
              COORDINATOR
            </div>
          </div>
        </Card>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subagents?.agents?.map((agent: any) => (
          <Card key={agent.id}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: agent.color }}>{agent.name}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{agent.role}</p>
                </div>
                <div
                  className="px-2 py-1 rounded text-[9px] uppercase"
                  style={{
                    background: agent.status === 'working' ? 'rgba(250,204,21,0.15)' : 'rgba(100,100,100,0.15)',
                    color: agent.status === 'working' ? 'var(--accent-yellow)' : 'var(--text-dim)'
                  }}
                >
                  {agent.status}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(167,139,250,0.15)', color: 'var(--accent-purple)' }}>
                  {agent.model.split('/').pop()}
                </span>
                {agent.persistent && (
                  <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,255,200,0.1)', color: 'var(--accent-cyan)' }}>
                    persistent
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {agent.focus?.map((f: string) => (
                  <span key={f} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {f}
                  </span>
                ))}
              </div>

              <div className="p-2 rounded mb-3" style={{ background: 'var(--bg-secondary)' }}>
                <div className="text-[9px] uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Current Task</div>
                <div className="text-[11px]" style={{ color: agent.status === 'working' ? 'var(--accent-yellow)' : 'var(--text-dim)' }}>
                  {agent.currentTask || 'Idle'}
                </div>
              </div>

              {agent.lastActive && (
                <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                  Last active: {new Date(agent.lastActive).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-dim)' }}>
                <button
                  onClick={async () => {
                    const task = prompt(`Dispatch task to ${agent.name}:`);
                    if (task) {
                      await fetch('/api/subclawds', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'dispatch', agentId: agent.id, task })
                      });
                      fetchSubagents();
                    }
                  }}
                  className="flex-1 px-2 py-1.5 rounded text-[10px]"
                  style={{ background: `${agent.color}22`, color: agent.color, border: `1px solid ${agent.color}` }}
                >
                  Dispatch Task
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/subclawds/history?label=${agent.id}&limit=30`);
                    const data = await res.json();
                    setSelectedAgentLogs({ agent, ...data });
                  }}
                  className="px-2 py-1.5 rounded text-[10px]"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }}
                >
                  Logs
                </button>
                {agent.status === 'working' && (
                  <button
                    onClick={async () => {
                      await fetch('/api/subclawds', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'clear', agentId: agent.id })
                      });
                      fetchSubagents();
                    }}
                    className="px-2 py-1.5 rounded text-[10px]"
                    style={{ background: 'rgba(255,59,92,0.1)', color: 'var(--accent-red)' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Costs Summary */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Cost Tracking
            </h3>
            <button
              onClick={async () => {
                const res = await fetch('/api/subclawds/costs');
                const data = await res.json();
                alert(`Total: $${data.totalCost}\nTasks: ${data.totalTasks}\nAvg: $${data.avgCostPerTask}/task`);
              }}
              className="text-[9px] px-2 py-1 rounded"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-dim)' }}
            >
              View Details
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {subagents?.agents?.slice(0, 4).map((agent: any) => (
              <div key={agent.id} className="p-2 rounded" style={{ background: 'var(--bg-secondary)' }}>
                <div className="text-lg">{agent.emoji}</div>
                <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{agent.name}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Agent Communications */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Agent Communications
            </h3>
            <button
              onClick={async () => {
                const res = await fetch('/api/subclawds/comms');
                const data = await res.json();
                if (data.requests?.length > 0) {
                  alert(`Pending requests:\n${data.requests.map((r: any) => `${r.from} → ${r.to}: ${r.task}`).join('\n')}`);
                } else {
                  alert('No pending communication requests');
                }
              }}
              className="text-[9px] px-2 py-1 rounded"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-dim)' }}
            >
              Check Queue
            </button>
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Agents can request help from each other via the comms system
          </div>
        </div>
      </Card>

      {/* Architecture Info */}
      <Card>
        <div className="p-4">
          <h3 className="text-[12px] font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Architecture
          </h3>
          <div className="text-[11px] space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <div>• <strong>Coordinator</strong> dispatches tasks and reviews work</div>
            <div>• <strong>Sub-agents</strong> have persistent memory per agent</div>
            <div>• <strong>Models</strong> matched to task type (Codex for coding, Opus for research)</div>
            <div>• <strong>Communication</strong> agents report to coordinator only</div>
          </div>
        </div>
      </Card>

      {/* Agent Runs Modal */}
      <Dialog open={!!selectedAgentLogs} onOpenChange={(open) => !open && setSelectedAgentLogs(null)}>
        <DialogContent className="flex flex-col p-0" style={{ maxWidth: '56rem' }} showCloseButton={true}>
          {selectedAgentLogs && (
            <>
              <DialogHeader className="p-4 border-b shrink-0" style={{ borderColor: 'var(--border-dim)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedAgentLogs.agent?.emoji}</span>
                  <div>
                    <DialogTitle style={{ color: selectedAgentLogs.agent?.color }}>
                      {selectedAgentLogs.agent?.name} Run History
                    </DialogTitle>
                    <DialogDescription>
                      {selectedAgentLogs.totalRuns || 0} task run(s)
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div
                className="flex-1 overflow-auto p-4 space-y-3"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  maxHeight: 'calc(100dvh - 12rem)',
                }}
              >
                {selectedAgentLogs.runs?.length > 0 ? (
                  selectedAgentLogs.runs.map((run: any) => {
                    const isExpanded = expandedRuns.has(run.runId);
                    const taskPreview = run.task?.length > 100 ? run.task.slice(0, 100) + '...' : run.task;

                    const toggleExpanded = () => {
                      setExpandedRuns(prev => {
                        const next = new Set(prev);
                        if (next.has(run.runId)) next.delete(run.runId);
                        else next.add(run.runId);
                        return next;
                      });
                    };

                    return (
                      <div
                        key={run.runId}
                        className="rounded-lg cursor-pointer transition-all hover:opacity-90"
                        style={{
                          background: 'var(--bg-secondary)',
                          borderLeft: `3px solid ${run.status === 'ok' ? 'var(--accent-green)' : 'var(--accent-red)'}`
                        }}
                        onClick={toggleExpanded}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-[10px] px-2 py-0.5 rounded font-medium uppercase"
                                style={{
                                  background: run.status === 'ok' ? 'rgba(0,255,106,0.15)' : 'rgba(255,59,92,0.15)',
                                  color: run.status === 'ok' ? 'var(--accent-green)' : 'var(--accent-red)'
                                }}
                              >
                                {run.status}
                              </span>
                              <span className="text-[11px] font-medium" style={{ color: selectedAgentLogs.agent?.color }}>
                                {run.label}
                              </span>
                              {run.durationFormatted && (
                                <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                                  ⏱ {run.durationFormatted}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                                {run.createdAt && new Date(run.createdAt).toLocaleString('en-US', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                          </div>

                          <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            {isExpanded ? run.task : taskPreview}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--border-dim)' }}>
                            <div className="pt-3 space-y-2">
                              <div className="flex gap-2 text-[10px]">
                                <span style={{ color: 'var(--text-dim)' }}>Session:</span>
                                <span className="font-mono break-all" style={{ color: 'var(--text-secondary)' }}>{run.sessionKey}</span>
                              </div>
                              <div className="flex gap-2 text-[10px]">
                                <span style={{ color: 'var(--text-dim)' }}>Requester:</span>
                                <span className="font-mono break-all" style={{ color: 'var(--text-secondary)' }}>{run.requesterSessionKey}</span>
                              </div>
                              {run.startedAt && run.endedAt && (
                                <div className="flex gap-2 text-[10px]">
                                  <span style={{ color: 'var(--text-dim)' }}>Duration:</span>
                                  <span style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(run.startedAt).toLocaleTimeString()} → {new Date(run.endedAt).toLocaleTimeString()} ({run.durationFormatted})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>
                    No task runs found for this agent yet.
                    <br />
                    <span className="text-[11px]">Dispatch a task to see history here.</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import type { TerminalEntry } from '@/lib/types';

export function WebTerminal() {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [runningCmd, setRunningCmd] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const INTERACTIVE_CMDS = ['claude', 'vim', 'nvim', 'nano', 'top', 'htop', 'less', 'more', 'man', 'ssh', 'python3 -i', 'python -i', 'node --', 'irb', 'psql'];

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history, running]);

  const cancelRun = () => {
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearInterval(timerRef.current);
    setHistory(prev => [...prev, {
      command: runningCmd, stdout: '', stderr: `Cancelled after ${elapsed}s`, exitCode: 130, timestamp: Date.now(),
    }]);
    setRunning(false);
    setRunningCmd('');
    setElapsed(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const execute = async () => {
    const cmd = input.trim();
    if (!cmd) return;

    const baseCmd = cmd.split(/\s+/)[0];
    if (INTERACTIVE_CMDS.some(ic => cmd === ic || baseCmd === ic)) {
      setHistory(prev => [...prev, {
        command: cmd, stdout: '',
        stderr: `⚠ "${baseCmd}" is interactive and needs a real terminal (PTY).\nThis web terminal only supports non-interactive commands.\n\nTry running it from the Screen tab instead, or use SSH.`,
        exitCode: 1, timestamp: Date.now(),
      }]);
      setInput('');
      return;
    }

    setRunning(true);
    setRunningCmd(cmd);
    setInput('');
    setElapsed(0);
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
        signal: controller.signal,
      });
      const data = await res.json();
      setHistory(prev => [...prev, {
        command: cmd, stdout: data.stdout || '', stderr: data.stderr || data.error || '',
        exitCode: data.exitCode ?? 1, timestamp: Date.now(),
      }]);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setHistory(prev => [...prev, {
          command: cmd, stdout: '', stderr: `Connection error: ${err}`, exitCode: 1, timestamp: Date.now(),
        }]);
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setRunningCmd('');
    setElapsed(0);
    abortRef.current = null;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      execute();
    } else if (e.key === 'c' && e.ctrlKey && running) {
      e.preventDefault();
      cancelRun();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= cmdHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(cmdHistory[newIndex]);
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]" onClick={() => inputRef.current?.focus()}>
      <div ref={outputRef} className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed" style={{ background: '#0c0c12' }}>
        {history.length === 0 && !running && (
          <div style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--accent-cyan)', opacity: 0.5 }}>~</span> — type a command to get started
          </div>
        )}
        {history.map((entry, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: entry.exitCode === 0 ? 'var(--accent-cyan)' : 'var(--accent-red)' }}>❯</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{entry.command}</span>
              {entry.exitCode !== 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,59,92,0.15)', color: 'var(--accent-red)' }}>
                  exit {entry.exitCode}
                </span>
              )}
            </div>
            {entry.stdout && <pre className="mt-1.5 whitespace-pre-wrap pl-5" style={{ color: '#c8d0da' }}>{entry.stdout}</pre>}
            {entry.stderr && <pre className="mt-1.5 whitespace-pre-wrap pl-5" style={{ color: 'var(--accent-red)' }}>{entry.stderr}</pre>}
          </div>
        ))}
        {running && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--accent-cyan)' }}>❯</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{runningCmd}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 pl-5">
              <span className="animate-pulse-glow" style={{ color: 'var(--accent-cyan)' }}>⠿</span>
              <span style={{ color: 'var(--text-secondary)' }}>Running{elapsed > 0 ? ` (${elapsed}s)` : '...'}</span>
              <button
                onClick={cancelRun}
                className="px-2 py-0.5 rounded text-[10px] border transition-colors"
                style={{ borderColor: 'rgba(255,59,92,0.3)', color: 'var(--accent-red)', background: 'rgba(255,59,92,0.08)' }}
              >
                ✕ CANCEL
              </button>
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>or Ctrl+C</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 border-t" style={{ borderColor: 'var(--border-accent)', background: '#08080e' }}>
        <span style={{ color: 'var(--accent-cyan)' }}>❯</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={running ? 'Command running...' : 'Enter command...'}
          disabled={running}
          className="flex-1 bg-transparent border-none outline-none text-[13px]"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-data)', caretColor: 'var(--accent-cyan)' }}
          autoFocus
        />
        {!running && (
          <div className="flex items-center gap-3 text-[10px] shrink-0" style={{ color: 'var(--text-dim)' }}>
            <span>↑↓ history</span>
            <span>^L clear</span>
          </div>
        )}
      </div>
    </div>
  );
}

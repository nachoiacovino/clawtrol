'use client';

export default function TerminalModule() {
  return (
    <div className="animate-fade-in">
      <div className="card-base overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
              TERMINAL
            </h2>
            <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: 'rgba(0,255,200,0.1)', color: 'var(--accent-cyan)' }}>
              PTY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const iframe = document.getElementById('terminal-frame') as HTMLIFrameElement;
                if (iframe) iframe.src = iframe.src;
              }}
              className="px-2 py-0.5 rounded text-[10px] border transition-colors"
              style={{ borderColor: 'var(--border-dim)', color: 'var(--text-dim)', background: 'transparent' }}
            >
              ↻ NEW SHELL
            </button>
          </div>
        </div>
        <iframe
          id="terminal-frame"
          src={typeof window !== 'undefined' ? `http://${window.location.hostname}:7682/` : 'http://localhost:7682/'}
          className="w-full border-none"
          style={{ height: 'calc(100% - 40px)', background: '#0c0c12' }}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/shared/StatCard';
import { formatBytes, timeAgo } from '@/lib/types';

export default function FilesModule() {
  const [filesPath, setFilesPath] = useState(process.env.HOME || '/root');
  const [filesData, setFilesData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const fetchFiles = useCallback(async (path?: string) => {
    const targetPath = path || filesPath;
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(targetPath)}`);
      const data = await res.json();
      setFilesData(data);
      setFilesPath(targetPath);
      setSelectedFile(null);
    } catch {}
  }, [filesPath]);

  const readFile = async (filePath: string) => {
    try {
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setSelectedFile({ path: filePath, ...data });
    } catch {}
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="space-y-3 animate-fade-in">
      {!selectedFile ? (
        <Card title="FILE BROWSER" actions={
          <div className="flex gap-3">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `/api/files/zip?path=${encodeURIComponent(filesPath)}`;
                link.download = `${filesPath.split('/').pop() || 'export'}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-[10px] tracking-wider transition-colors hover:opacity-70"
              style={{ color: 'var(--accent-cyan)' }}
            >
              ↓ ZIP
            </button>
            <button onClick={() => fetchFiles()} className="text-[10px] tracking-wider transition-colors" style={{ color: 'var(--text-dim)' }}>
              ↻ REFRESH
            </button>
          </div>
        }>
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  const parentPath = filesPath.split('/').slice(0, -1).join('/') || '/';
                  fetchFiles(parentPath);
                }}
                disabled={filesPath === '/'}
                className="px-2 py-1 rounded text-[9px] border transition-colors disabled:opacity-30"
                style={{ borderColor: 'var(--border-dim)', color: 'var(--text-dim)' }}
              >
                ← BACK
              </button>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                {filesPath}
              </div>
            </div>
          </div>

          <div className="space-y-1 max-h-[60vh] overflow-auto" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            {filesData?.entries?.map((entry: any) => (
              <div
                key={entry.name}
                onClick={() => {
                  const fullPath = `${filesPath}/${entry.name}`;
                  if (entry.type === 'directory') {
                    fetchFiles(fullPath);
                  } else {
                    readFile(fullPath);
                  }
                }}
                className="flex items-center gap-3 p-2 rounded hover:bg-opacity-50 cursor-pointer transition-colors"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="text-[12px]">
                  {entry.type === 'directory' ? '📁' : '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] truncate" style={{ color: 'var(--text-primary)' }}>
                    {entry.name}
                  </div>
                  <div className="text-[8px]" style={{ color: 'var(--text-dim)' }}>
                    {entry.type === 'file' && `${formatBytes(entry.size)} • `}
                    {entry.modified && timeAgo(entry.modified)}
                  </div>
                </div>
                {entry.type === 'directory' && (
                  <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>→</div>
                )}
              </div>
            ))}
          </div>

          {filesData?.entries?.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>
              <div className="text-2xl mb-2">📂</div>
              <div>Empty directory</div>
            </div>
          )}
        </Card>
      ) : (
        <Card title="FILE VIEWER">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-2 py-1 rounded text-[9px] border transition-colors"
                style={{ borderColor: 'var(--border-dim)', color: 'var(--text-dim)' }}
              >
                ← BACK
              </button>
              <div className="text-[10px] truncate" style={{ color: 'var(--accent-cyan)' }}>
                {selectedFile.path}
              </div>
            </div>
            <div className="text-[8px] ml-[52px]" style={{ color: 'var(--text-dim)' }}>
              {formatBytes(selectedFile.size)} • {selectedFile.modified && new Date(selectedFile.modified).toLocaleString()}
            </div>
          </div>

          {selectedFile.type === 'text' && selectedFile.content && (
            <div className="rounded p-3 max-h-[60vh] overflow-auto font-mono text-[10px] leading-relaxed" style={{ background: 'var(--bg-secondary)', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
              <pre className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {selectedFile.content}
              </pre>
            </div>
          )}

          {selectedFile.type === 'image' && selectedFile.content && (
            <div className="text-center">
              <img src={selectedFile.content} alt="File content" className="max-w-full h-auto rounded" />
            </div>
          )}

          {selectedFile.type === 'pdf' && selectedFile.content && (
            <div className="w-full" style={{ height: '70vh' }}>
              <iframe
                src={selectedFile.content}
                className="w-full h-full rounded border"
                style={{ borderColor: 'var(--border-dim)' }}
                title="PDF Viewer"
              />
            </div>
          )}

          {selectedFile.tooLarge && (
            <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>
              <div className="text-2xl mb-2">⚠️</div>
              <div>File too large to display</div>
              <div className="text-[10px] mt-1">Size: {formatBytes(selectedFile.size)}</div>
            </div>
          )}

          {selectedFile.type === 'binary' && (
            <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>
              <div className="text-2xl mb-2">📄</div>
              <div>Binary file - cannot display content</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SystemInfo {
  cpu: { model: string; cores: number; speed: number; load: number };
  memory: { total: number; used: number; free: number; usedPercent: number; active?: number; wired?: number; inactive?: number; purgeable?: number; rawFree?: number };
  disk: Array<{ fs: string; size: number; used: number; available: number; usedPercent: number; mount: string }>;
  os: { platform: string; distro: string; release: string; hostname: string; arch: string };
  uptime: number;
  temperature: number | null;
}

export interface GatewayStatus {
  running: boolean;
  process: { pid: string; memory: number; cpu: number; uptime: number } | null;
  version: string | null;
}

export interface TailscaleStatus {
  self: { ip: string; hostname: string; dnsName: string; os: string; online: boolean };
  peers: Array<{ ip: string; hostname: string; dnsName: string; os: string; online: boolean; lastSeen: string }>;
  magicDNS: string;
}

export interface PM2Process {
  name: string; status: string; cpu: number; memory: number; uptime: number; restarts: number; pid: number;
}

export interface Weather {
  location: string;
  current: { temp: string; feelsLike: string; humidity: string; description: string; windSpeed: string; uvIndex: string };
  today: { maxTemp: string; minTemp: string; sunrise: string; sunset: string };
}

export interface ScreenInfo {
  logicalWidth: number; logicalHeight: number; retina: boolean;
}

export interface ProcessInfo {
  pid: string; rss: number; memPercent: number; cpuPercent: number; command: string; name: string;
}

export interface TerminalEntry {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  timestamp: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

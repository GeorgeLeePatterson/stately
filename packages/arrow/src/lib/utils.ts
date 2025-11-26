export function messageFromError(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return null;
}

export function sanitizeIdentifier(name: string) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    return `'${name}'`;
  }
  return name.includes('"')
    ? `"${name.replace(/"/g, '""')}"`
    : name.includes('://')
      ? `'${name}'`
      : name;
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '—';
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

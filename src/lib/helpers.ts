export const formatBytes = (bytes: number): string => {
  if (!+bytes) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['B', 'KB', 'MB', 'GB'][i]}`;
};

export const calculateExpiryDate = (option: string, customVal: string): Date | null => {
  if (option === 'permanent') return null;
  const now = new Date();

  if (option === '1h') { now.setHours(now.getHours() + 1); return now; }
  if (option === '1d') { now.setDate(now.getDate() + 1); return now; }
  if (option === '1w') { now.setDate(now.getDate() + 7); return now; }
  if (option === '1m') { now.setMonth(now.getMonth() + 1); return now; }
  if (option === '1y') { now.setFullYear(now.getFullYear() + 1); return now; }

  if (option === 'custom' && customVal) {
    const val = customVal.trim();
    const timeMatch = val.match(/^(\d{1,2})[.:](\d{2})$/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1]);
      const m = parseInt(timeMatch[2]);

      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const target = new Date();
        target.setHours(h, m, 0, 0);
        if (target <= new Date()) {
          target.setDate(target.getDate() + 1);
        }
        return target;
      }
    }
    const durationMatch = val.match(/^(\d+)([dDwWmMyYhH]|min|m)$/);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();

      if (unit.startsWith('h')) now.setHours(now.getHours() + num);
      else if (unit === 'd') now.setDate(now.getDate() + num);
      else if (unit === 'w') now.setDate(now.getDate() + (num * 7));
      else if (unit === 'min') now.setMinutes(now.getMinutes() + num);
      else if (unit === 'm') now.setMonth(now.getMonth() + num);
      else if (unit === 'y') now.setFullYear(now.getFullYear() + num);
      return now;
    }
  }
  return null;
};

export const getExpiryOptionLabel = (option: string): string => {
  switch (option) {
    case 'permanent': return 'Permanent';
    case '1h': return '1 Jam';
    case '1d': return '1 Hari';
    case '1w': return '1 Minggu';
    case 'custom': return 'Custom';
    default:
      // Parse custom formats like "2h", "3d", "30min"
      const match = option.match(/^(\d+)(h|d|w|m|min|y)$/);
      if (match) {
        const num = match[1];
        const unit = match[2];
        const unitLabels: Record<string, string> = {
          'h': 'Jam',
          'd': 'Hari',
          'w': 'Minggu',
          'm': 'Bulan',
          'min': 'Menit',
          'y': 'Tahun'
        };
        return `${num} ${unitLabels[unit] || unit}`;
      }
      return option;
  }
};

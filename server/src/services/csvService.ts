export const convertToCSV = (rows: Record<string, any>[], headers: { key: string; label: string }[]): string => {
  if (!rows || rows.length === 0) {
    return headers.map((h) => `"${h.label}"`).join(',') + '\n';
  }

  const headerLine = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) => {
    return headers
      .map((h) => {
        const val = row[h.key];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  return [headerLine, ...rowLines].join('\n');
};

// Utilitário simples de exportação CSV (UTF-8 com BOM para abrir bem no Excel pt-BR).
export type CsvColumn<T> = { header: string; value: (row: T) => string | number | null | undefined };

const escape = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // CSV: encapsular se contém vírgula, aspas, ; ou quebra-linha
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export function exportCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const header = columns.map((c) => escape(c.header)).join(";");
  const body = rows.map((r) => columns.map((c) => escape(c.value(r))).join(";")).join("\n");
  const csv = `\uFEFF${header}\n${body}`; // BOM
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${filename}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

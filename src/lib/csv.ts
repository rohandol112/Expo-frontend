/** One CSV column: its header and how to read the cell from a row. */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Builds a CSV (with a BOM so Excel reads Hindi/Marathi names) and downloads it. */
export function downloadCsv<T>(fileName: string, rows: T[], columns: CsvColumn<T>[]): void {
  const lines = [columns.map((c) => escapeCell(c.header)).join(","), ...rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Max rows one export pulls (the reward reports allow up to 1000 per request). */
export const EXPORT_LIMIT = 1000;

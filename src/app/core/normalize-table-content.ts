export interface NormalizedRow {
  [key: number]: string;
  id: string;
}

const DEFAULT_TABLE_ROWS_COUNT = 10000;

export function normalizeRows(
  columns: string[],
  rows: string[][]
): NormalizedRow[] {
  let normalizedRows: NormalizedRow[] = [];
  for (let i = 0; i < DEFAULT_TABLE_ROWS_COUNT; i++) {
    normalizedRows.push(
      Object.assign({ id: `r${i}` }, rows[i] || [...columns].fill(''))
    );
  }

  return normalizedRows;
}

export interface NormalizedColumn {
  name: string;
  id: string;
}

export function normalizeColumns(columns: string[]): NormalizedColumn[] {
  return columns.map((c, i) => ({ id: `c${i}`, name: c }));
}

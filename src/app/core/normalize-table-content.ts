import { ColDef } from 'ag-grid-community';

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

export interface NormalizedRow2 {
  [key: string]: string | number;
}

export function normalizeRows2(
  columns: string[],
  rows: string[][]
): NormalizedRow2[] {
  let normalizedRows: NormalizedRow2[] = [];
  for (let i = 0; i < DEFAULT_TABLE_ROWS_COUNT; i++) {
    const normalizedRow: NormalizedRow2 = (
      rows[i] || [...columns].fill('')
    ).reduce(
      (obj, item, key) => {
        return {
          ...obj,
          [key]: `${i}-${item}`,
        };
      },
      { id: `r${i}` }
    );

    normalizedRows.push(normalizedRow);
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

export function normalizeColumns2(columns: string[]): ColDef[] {
  // return [
  //   {
  //     headerName: '',
  //     valueGetter: 'node.rowIndex + 1',
  //     width: 50,
  //   },
  //   ...columns.map((c, i) => ({
  //     field: i.toString(),
  //     headerName: c,
  //     sortable: true,
  //     editable: true,
  //     flex: 1,
  //   })),
  // ];
  const normalizedColumns: ColDef[] = columns.map((c, i) => ({
    field: i.toString(),
    headerName: c,
  }));

  return normalizedColumns;
}

export function getDefaultColDef(): ColDef {
  return {
    sortable: true,
    editable: true,
    flex: 1,
    minWidth: 100,
  };
}

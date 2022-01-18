import { ColDef } from 'ag-grid-community';

export interface NormalizedRow {
  [key: string]: string | number;
}

const DEFAULT_TABLE_ROWS_COUNT = 10000;

export function normalizeRows(
  columns: string[],
  rows: string[][]
): NormalizedRow[] {
  let normalizedRows: NormalizedRow[] = [];
  for (let i = 0; i < DEFAULT_TABLE_ROWS_COUNT; i++) {
    const normalizedRow: NormalizedRow = Object.assign(
      {} as NormalizedRow,
      rows[i] || [...columns].fill('')
    );
    normalizedRows.push(normalizedRow);
  }

  return normalizedRows;
}

// export function normalizeRows2(
//   columns: string[],
//   rows: string[][]
// ): NormalizedRow2[] {
//   let normalizedRows: NormalizedRow2[] = [];
//   for (let i = 0; i < DEFAULT_TABLE_ROWS_COUNT; i++) {
//     const normalizedRow: NormalizedRow2 = (
//       rows[i] || [...columns].fill('')
//     ).reduce(
//       (obj, item, key) => {
//         return {
//           ...obj,
//           [key]: `${i}-${item}`,
//         };
//       },
//       { id: `r${i}` }
//     );

//     normalizedRows.push(normalizedRow);
//   }

//   return normalizedRows;
// }

export function normalizeColumns(columns: string[]): ColDef[] {
  return columns.map((c, i) => ({
    field: i.toString(),
    headerName: c,
  }));
}

export function getDefaultColDef(): ColDef {
  return {
    sortable: true,
    editable: true,
    flex: 1,
    minWidth: 100,
  };
}

import { ColDef, RowNode } from 'ag-grid-community';
import { v4 as uuidv4 } from 'uuid';

export interface NormalizedRow {
  [key: string]: string;
}

export interface INormalizedVotingTableContent {
  voteName: string;
  totalSquare: number;
  inspectorName: string;
  normalizedColumns: ColDef[];
  normalizedRows: NormalizedRow[];
}

const INITIAL_ROWS_LENGTH = 500;
export const ROWS_TO_BE_ADDED_COUNT = 100;

export function normalizeRows(
  columns: string[],
  rows: string[][]
): NormalizedRow[] {
  let normalizedRows: NormalizedRow[] = [];
  const rowsCount =
    rows.length < ROWS_TO_BE_ADDED_COUNT
      ? INITIAL_ROWS_LENGTH
      : rows.length + ROWS_TO_BE_ADDED_COUNT;
  for (let i = 0; i < rowsCount; i++) {
    const normalizedRow: NormalizedRow = Object.assign(
      { id: uuidv4() } as NormalizedRow,
      rows[i] || [...columns].fill('')
    );
    normalizedRows.push(normalizedRow);
  }
  return normalizedRows;
}

// fastest way
const collator = new Intl.Collator(['ru', 'en-GB', 'en-US'], {
  sensitivity: 'base',
});

export function normalizeColumns(columns: string[]): ColDef[] {
  return columns.map((c, i) =>
    // Square column is a numeric type
    i === 1
      ? {
          field: i.toString(),
          headerName: c,
          type: 'numericColumn',
          comparator: (
            a: string,
            b: string,
            nodeA: RowNode,
            nodeB: RowNode,
            isInverted: boolean
          ): number => {
            if (a === b) {
              return 0;
            } else if (a === '') {
              return isInverted ? -1 : 1;
            } else if (b === '') {
              return isInverted ? 1 : -1;
            } else {
              return Number(a) - Number(b);
            }
          },
        }
      : {
          field: i.toString(),
          headerName: c,
        }
  );
}

export function getDefaultColDef(): ColDef {
  return {
    sortable: true,
    editable: true,
    flex: 1,
    minWidth: 100,
    comparator: (
      a: string,
      b: string,
      nodeA: RowNode,
      nodeB: RowNode,
      isInverted: boolean
    ): number => {
      if (a === b) {
        return 0;
      } else if (a === '') {
        return isInverted ? -1 : 1;
      } else if (b === '') {
        return isInverted ? 1 : -1;
      } else {
        return collator.compare(a, b);
      }
    },
  };
}

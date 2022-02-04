import {ColDef, RowNode, ValueSetterFunc, ValueSetterParams} from 'ag-grid-community';

const INITIAL_ROWS_LENGTH = 500;
export const ROWS_TO_BE_ADDED_COUNT = 100;

export function getAppendedRows(columns: string[], rows: string[][]): string[][] {
  let preparedRows: string[][] = [];
  const rowsCount = rows.length < ROWS_TO_BE_ADDED_COUNT ? INITIAL_ROWS_LENGTH : rows.length + ROWS_TO_BE_ADDED_COUNT;
  for (let i = 0; i < rowsCount; i++) {
    const row: string[] = rows[i] || [...columns].fill('');
    preparedRows.push(row);
  }
  return preparedRows;
}

export function createEmptyRows(rowsCount: number, columnCount: number): string[][] {
  let rows: string[][] = [];
  for (let i = 0; i < rowsCount; i++) {
    const row: string[] = Array(columnCount).fill('');
    rows.push(row);
  }

  return rows;
}

// fastest way
const collator = new Intl.Collator(['ru', 'en-GB', 'en-US'], {
  sensitivity: 'base',
});

const valueSetter: ValueSetterFunc = (params: ValueSetterParams): boolean => {
  const newValue = isNaN(params.newValue) ? '' : params.newValue;
  params.data[params.colDef.field!] = newValue;
  return newValue !== params.oldValue;
};

const comparator = (a: string, b: string, nodeA: RowNode, nodeB: RowNode, isInverted: boolean): number => {
  if (a === b) {
    return 0;
  } else if (a === '') {
    return isInverted ? -1 : 1;
  } else if (b === '') {
    return isInverted ? 1 : -1;
  } else {
    return Number(a) - Number(b);
  }
};

export function getColumnDefs(columns: string[]): ColDef[] {
  return columns.map((c, i) =>
    // Square column is a numeric type
    i === 1
      ? {
          field: i.toString(),
          headerName: c,
          type: 'numericColumn',
          comparator,
          valueSetter,
        }
      : {
          field: i.toString(),
          headerName: c,
        },
  );
}

export function getDefaultColDef(): ColDef {
  return {
    sortable: true,
    editable: true,
    flex: 1,
    minWidth: 100,
    comparator: (a: string, b: string, nodeA: RowNode, nodeB: RowNode, isInverted: boolean): number => {
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

export interface IParsedVotingTableContent {
  voteName: string;
  totalSquare: number;
  inspectorName: string;
  columnNames: string[];
  rows: string[][];
}

export function parseVotingData(content: any): IParsedVotingTableContent {
  return {
    voteName: content[0][0],
    inspectorName: content[0][1],
    totalSquare: content[0][2],
    columnNames: content[1],
    rows: content.slice(2),
  };
}

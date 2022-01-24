export interface IParsedVotingTableContent {
  voteName: string;
  totalSquare: number;
  inspectorName: string;
  columns: string[];
  rows: string[][];
}

export function parseVotingContent(content: any): IParsedVotingTableContent {
  return {
    voteName: content[0][0],
    inspectorName: content[0][1],
    totalSquare: content[0][2],
    columns: content[1],
    rows: content.slice(2),
  };
}

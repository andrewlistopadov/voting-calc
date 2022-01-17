export interface IVotingContent {
  voteName: string;
  totalSquare: number;
  inspectorName: string;
  columns: string[];
  rows: string[][];
}

export function parseVotingContent(content: any): IVotingContent {
  return {
    voteName: content[0][0],
    totalSquare: content[0][1],
    inspectorName: content[0][2],
    columns: content[1],
    rows: content.slice(2),
  };
}

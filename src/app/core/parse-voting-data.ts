import {blankLinesRegex} from './regex';

export interface IParsedVotingData {
  voteName: string;
  totalSquare: string;
  inspectorName: string;
  columnNames: string[];
  rows: string[][];
}

export function parseVotingData(dataAsText: string): IParsedVotingData {
  const fixedData = dataAsText.replace(blankLinesRegex, '');
  const votingData: string[][] = fixedData
    .split(/$(?:[\t ]*(?:\r?\n|\r))/gm)
    .map((row) => row.split(','))
    .filter((row) => row.some((i) => i));

  return {
    voteName: votingData[0][0],
    inspectorName: votingData[0][1],
    totalSquare: votingData[0][2],
    columnNames: votingData[1],
    rows: votingData.slice(2),
  };
}

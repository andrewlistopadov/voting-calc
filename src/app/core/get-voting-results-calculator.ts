import {CellValueChangedEvent} from 'ag-grid-community';
import Big from 'big.js';

export interface VotingResults {
  votesCount?: number;
  totalVotedSquare?: Big;
  answersWeights?: Map<string, Big>[];
}

export function getVotingResultsCalculator(
  votesCount: number,
  totalVotedSquare: Big,
  answersWeights: Map<string, Big>[],
  colCount: number,
): Map<string, (e: CellValueChangedEvent) => VotingResults> {
  const votesCountCalc: (e: CellValueChangedEvent) => VotingResults = (e: CellValueChangedEvent) => {
    // e.column.colId - '3' - column
    // e.node.id - '33' - row
    // const column = e.colDef.field;
    // const row = e.node.id;
    const {newValue, oldValue} = e;
    if (newValue && oldValue) return {};
    if (newValue && !oldValue) {
      votesCount++;
    } else {
      votesCount--;
    }

    return {votesCount};
  };
  const votedSquareCalc: (e: CellValueChangedEvent) => VotingResults = (e: CellValueChangedEvent) => {
    const {newValue, oldValue} = e;
    const newValueAsNum = new Big(newValue || 0);
    const oldValueAsNum = new Big(oldValue || 0);

    const diff = newValueAsNum.sub(oldValueAsNum);
    totalVotedSquare = diff.plus(totalVotedSquare);

    const answersArr = e.data.slice(2);
    answersArr.forEach((v: string, i: number) => {
      if (v) {
        const currentAnswersMap = answersWeights[i];
        const weightForAnswer = currentAnswersMap.get(v) || new Big(0);
        const newWeightForAnswer = diff.plus(weightForAnswer!);
        // console.log('weightForAnswer', weightForAnswer.toString());
        // console.log('newWeightForAnswer', newWeightForAnswer.toString());
        currentAnswersMap.set(v, newWeightForAnswer);
        answersWeights[i] = new Map(currentAnswersMap);
      }
    });

    // console.log('totalVotedSquare: ', totalVotedSquare.toString());
    answersWeights = [...answersWeights];
    return {totalVotedSquare, answersWeights};
  };
  const answersCalc: (e: CellValueChangedEvent) => VotingResults = (e: CellValueChangedEvent) => {
    const voteWeight = e.data[1] || 0;
    const {newValue, oldValue} = e;

    if (voteWeight) {
      const index = +e.colDef.field! - 2;
      const currentAnswersMap = answersWeights[index];
      const voteWeightAsNum = new Big(voteWeight);
      // '1' -> '2'
      if (newValue && oldValue) {
        // minuses from old
        const weightForOldAnswer = currentAnswersMap.get(oldValue)!;
        const updatedWeightForOldAnswer = weightForOldAnswer.minus(voteWeightAsNum!);
        currentAnswersMap.set(oldValue, updatedWeightForOldAnswer);
        // add to new
        const weightForNewAnswer = currentAnswersMap.get(newValue) || Big(0);
        const updatedWeightForNewAnswer = weightForNewAnswer.plus(voteWeightAsNum!);
        currentAnswersMap.set(newValue, updatedWeightForNewAnswer);
        //
        // '' -> '2'
      } else if (newValue) {
        // adds to new
        const weightForNewAnswer = currentAnswersMap.get(newValue) || Big(0);
        const updatedWeightForNewAnswer = weightForNewAnswer.plus(voteWeightAsNum!);
        currentAnswersMap.set(newValue, updatedWeightForNewAnswer);
        //
        // '1' -> ''
      } else {
        // minuses from old
        const weightForOldAnswer = currentAnswersMap.get(oldValue)!;
        const updatedWeightForOldAnswer = weightForOldAnswer.minus(voteWeightAsNum!);
        currentAnswersMap.set(oldValue, updatedWeightForOldAnswer);
      }

      answersWeights[index] = new Map(currentAnswersMap);
      answersWeights = [...answersWeights];

      return {answersWeights};
    }

    return {};
  };

  const calcsForCols: [string, (e: CellValueChangedEvent) => VotingResults][] = [
    ['0', votesCountCalc],
    ['1', votedSquareCalc],
  ];
  while (--colCount && colCount > 1) {
    calcsForCols.push([colCount.toString(), answersCalc]);
  }

  const calcsForColsMap: Map<string, (e: CellValueChangedEvent) => VotingResults> = new Map(calcsForCols);
  return calcsForColsMap;
}

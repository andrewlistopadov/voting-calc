export function alphabetically(isInverted: boolean) {
  return function (valueA: string, valueB: string): number {
    // equal items sort equally
    if (valueA === valueB) {
      return 0;
    }
    // an empty string sort after anything else
    else if (valueA === '') {
      return 1;
    } else if (valueB === '') {
      return -1;
    }
    // otherwise, if we're ascending, lowest sorts first
    else if (isInverted) {
      return valueA < valueB ? -1 : 1;
    }
    // if descending, highest sorts first
    else {
      return valueA < valueB ? 1 : -1;
    }
  };
}

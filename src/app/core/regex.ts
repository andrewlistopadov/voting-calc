// const regexPattern = `(${new Array(regexLength).join(',')}+)|^\s*$(?:\r\n?|\n)`; // ` removes ,,,,,,,, and empty lines
const blankLinesPattern = /^\s+$/gm; // the only regex that works fine
export const blankLinesRegex = new RegExp(blankLinesPattern);
const numberPattern = /^[0-9]*\.?[0-9]+$/;
export const numberRegex = new RegExp(numberPattern);
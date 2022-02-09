// const regexPattern = `(${new Array(regexLength).join(',')}+)|^\s*$(?:\r\n?|\n)`; // ` removes ,,,,,,,, and empty lines
const blankLinesPattern = /^\s+$/gm; // the only regex that works fine
export const blankLinesRegex = new RegExp(blankLinesPattern);

const numericPatternWithDotSeparator = /^[0-9]*\.?[0-9]+$/;
export const numericRegexWithDotSeparator = new RegExp(numericPatternWithDotSeparator);

const numericPatternWithCommaSeparator = /^[0-9]*\,[0-9]+$/;
export const numericRegexWithCommaSeparator = new RegExp(numericPatternWithCommaSeparator);

const inspectorNamePattern = /,|\s/gm; // all commas and whitespace characters
export const inspectorNameRegex = new RegExp(inspectorNamePattern);

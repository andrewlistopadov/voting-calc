export interface IVotingTableContentFile {
  general: { name: string; totalSquare: number };
  tableData: {
    header: string[];
    body: string[];
    footer: string[];
  };
}

export function parseVotingTableContentFile(content: any) {
  return {
    general: { name: content[0][0], totalSquare: content[0][1] },
    tableData: {
      header: content[1],
      body: content[2],
      footer: content[3],
    },
  };
}

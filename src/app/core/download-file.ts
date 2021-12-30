const download = (blob: Blob, fileName: string): void => {
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export function downloadFile(
  file: BlobPart,
  type: string,
  filename: string
): void {
  const blob = new Blob([file], { type });
  download(blob, filename);
}

export function downloadCSV(csv: string, filename: string): void {
  downloadFile(csv, 'text/csv;charset=utf-8;', filename);
}

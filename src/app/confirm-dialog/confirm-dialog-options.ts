export interface IConfirmDialog {
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
}

const confirmDialogDefaultOptions: IConfirmDialog = {title: '', message: '', cancelText: 'CANCEL', confirmText: 'OK'};

export function getConfirmDialogOptions(options: {
  title?: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
}): IConfirmDialog {
  return {...confirmDialogDefaultOptions, ...options};
}

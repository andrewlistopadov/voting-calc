import {Observable, Subscriber} from 'rxjs';

export const readFileAsText = (blob: Blob, reader: FileReader = new FileReader()) => {
  return new Observable((subscriber: Subscriber<string>) => {
    if (!(blob instanceof Blob)) {
      subscriber.error(new Error('`blob` must be an instance of File or Blob.'));
      return;
    }

    reader.onerror = (err) => subscriber.error(err);
    reader.onabort = (err) => subscriber.error(err);
    reader.onload = () => subscriber.next(reader!.result as string);
    reader.onloadend = () => subscriber.complete();

    return reader.readAsText(blob);
  });
};

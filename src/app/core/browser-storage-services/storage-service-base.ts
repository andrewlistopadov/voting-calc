export class StorageServiceBase implements Storage {
  constructor(private storage: Storage) {}

  public get length(): number {
    return this.getKeys().length;
  }

  public key(index: number): string | null {
    const allKeys = this.getKeys();
    if (index < 0 || index >= allKeys.length) {
      return null;
    }
    return allKeys[index];
  }

  public getKeys(): (string | null)[] {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      keys.push(this.storage.key(i));
    }
    return keys;
  }

  public setItem(key: string, value: any): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (exception) {
      console.error(exception);
    }
  }

  public getItem(key: string): any {
    try {
      return JSON.parse(this.storage.getItem(key)!);
    } catch (exception) {
      console.error(exception);
    }
  }

  public clear(): void {
    try {
      this.storage.clear();
    } catch (exception) {
      console.error(exception);
    }
  }

  public removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (exception) {
      console.error(exception);
    }
  }
}

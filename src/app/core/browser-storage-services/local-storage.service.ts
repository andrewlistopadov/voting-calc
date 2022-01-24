import {InjectionToken} from '@angular/core';
import {StorageServiceBase} from './storage-service-base';

export const LocalStorageFactory = () => new StorageServiceBase(localStorage);

export const LocalStorageService = new InjectionToken<StorageServiceBase>('LocalStorageService', {
  providedIn: 'root',
  factory: LocalStorageFactory
});

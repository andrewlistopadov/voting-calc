import {InjectionToken} from '@angular/core';
import {StorageServiceBase} from './storage-service-base';

export const SessionStorageService = new InjectionToken<StorageServiceBase>('SessionStorageService', {
  providedIn: 'root',
  factory: () => new StorageServiceBase(sessionStorage)
});

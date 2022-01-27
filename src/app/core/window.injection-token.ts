import {DOCUMENT} from '@angular/common';
import {inject, InjectionToken} from '@angular/core';

export const WINDOW: InjectionToken<(WindowProxy & typeof globalThis) | null> = new InjectionToken<
  (WindowProxy & typeof globalThis) | null
>('An abstraction over global window object', {
  providedIn: 'root',
  factory: (): (WindowProxy & typeof globalThis) | null => {
    return inject(DOCUMENT).defaultView!;
  },
});

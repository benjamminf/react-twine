import { Selector } from './types';

export function isSelector<T>(obj: unknown): obj is Selector<T> {
  return (
    typeof obj === 'object' &&
    obj != null &&
    typeof (obj as Selector<T>).key === 'symbol' &&
    typeof (obj as Selector<T>).get === 'function' &&
    typeof (obj as Selector<T>).observe === 'function' &&
    typeof (obj as Selector<T>).effect === 'function'
  );
}

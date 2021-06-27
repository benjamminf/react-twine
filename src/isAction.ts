import { Action } from './types';

export default function isAction<T>(obj: unknown): obj is Action<T> {
  return (
    typeof obj === 'object' &&
    obj != null &&
    typeof (obj as Action<T>).dispatch === 'function'
  );
}

import {Observable} from './types';

export default function isObservable<T>(obj: unknown): obj is Observable<T> {
  return (
    typeof obj === 'object' &&
    obj != null &&
    (obj as Observable<T>).get instanceof Function &&
    (obj as Observable<T>).observe instanceof Function
  );
}

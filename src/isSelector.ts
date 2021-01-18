import {Selector} from './createSelector';

export default function isSelector<T>(obj: unknown): obj is Selector<T> {
  return (
    typeof obj === 'object' &&
    obj != null &&
    (obj as Selector<T>).get instanceof Function &&
    (obj as Selector<T>).observe instanceof Function
  );
}

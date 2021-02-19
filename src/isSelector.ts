import {Selector} from './types';
import isObservable from './isObservable';

export default function isSelector<T>(obj: unknown): obj is Selector<T> {
  return isObservable(obj) && typeof (obj as Selector<T>).states === 'function';
}

import {State} from './types';
import isObservable from './isObservable';

export default function isState<T>(obj: unknown): obj is State<T> {
  return isObservable(obj) && typeof (obj as State<T>).set === 'function';
}

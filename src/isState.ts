import {State} from './types';
import isSelector from './isSelector';

export default function isState<T>(obj: unknown): obj is State<T> {
  return isSelector(obj) && typeof (obj as State<T>).set === 'function';
}

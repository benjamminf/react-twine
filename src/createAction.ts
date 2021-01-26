import {SetValue, State} from './createState';
import {GetFunction, Selector} from './createSelector';
import {frameCapture, isFrameCapturing} from './frame';

export type SetFunction = <T>(state: State<T>, value: SetValue<T>) => void;
export type Setter<T> = (value: T, set: SetFunction, get: GetFunction) => void;

export type Action<T> = (payload: T) => void;

function getFunction<T>(selector: Selector<T>): T {
  return selector.get();
}

function setFunction<T>(state: State<T>, value: SetValue<T>): void {
  if (!isFrameCapturing()) {
    throw new Error('State cannot be set asynchronously within an action');
  }

  state.set(value);
}

export default function createAction<T = void>(setter: Setter<T>): Action<T> {
  return function action(payload: T): void {
    frameCapture(() => setter(payload, setFunction, getFunction));
  };
}

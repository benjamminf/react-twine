import {SetValue, State} from './createState';
import {GetFunction, Selector} from './createSelector';
import {taskCapture, isTaskCapturing} from './task';

export type SetFunction = <T>(state: State<T>, value: SetValue<T>) => void;
export type Setter<T> = (context: {
  value: T;
  set: SetFunction;
  get: GetFunction;
  dispatch: DispatchFunction;
}) => void;

export type DispatchMethod<T> = (value: T) => void;
export type DispatchFunction = <T>(action: Action<T>, value: T) => void;

export type Action<T> = {
  dispatch: DispatchMethod<T>;
};

function getFunction<T>(selector: Selector<T>): T {
  return selector.get();
}

function setFunction<T>(state: State<T>, value: SetValue<T>): void {
  if (!isTaskCapturing()) {
    throw new Error('State cannot be set asynchronously within an action');
  }

  state.set(value);
}

function dispatchFunction<T>(action: Action<T>, value: T): void {
  action.dispatch(value);
}

export default function createAction<T = void>(setter: Setter<T>): Action<T> {
  function dispatch(value: T): void {
    taskCapture(() =>
      setter({
        value,
        get: getFunction,
        set: setFunction,
        dispatch: dispatchFunction,
      })
    );
  }

  return {dispatch};
}

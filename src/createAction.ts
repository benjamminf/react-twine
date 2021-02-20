import {SetValue, Selector, State, Setter, Action} from './types';
import {captureTasks, isTaskCapturing} from './tasks';

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
    captureTasks(() =>
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

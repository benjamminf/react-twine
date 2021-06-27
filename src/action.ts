import {
  Action,
  ActionCreator,
  Setter,
  SetterContext,
  Transactor,
} from './types';

export function bootstrapAction({
  transactor,
}: {
  transactor: Transactor;
}): ActionCreator {
  const context: SetterContext = {
    get: selector => selector.get(),
    set: (state, value) => state.set(value),
    dispatch: (action, value) => action.dispatch(value),
  };

  return function createAction<T>(setter: Setter<T>): Action<T> {
    function dispatch(value: T): void {
      transactor.transact(() => setter(context, value));
    }

    return { dispatch };
  };
}

export function isAction<T>(obj: unknown): obj is Action<T> {
  return (
    typeof obj === 'object' &&
    obj != null &&
    typeof (obj as Action<T>).dispatch === 'function'
  );
}

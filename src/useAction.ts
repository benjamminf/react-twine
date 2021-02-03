import {useCallback} from 'react';
import {Action, DispatchMethod} from './createAction';

function useAction<T>(action: Action<T>): DispatchMethod<T>;
function useAction<T>(action: Action<T>, value: T): () => void;
function useAction<T>(
  action: Action<T>,
  value?: T
): DispatchMethod<T> | (() => void) {
  return useCallback(
    value === undefined ? action.dispatch : () => action.dispatch(value),
    [action, value]
  );
}

export default useAction;

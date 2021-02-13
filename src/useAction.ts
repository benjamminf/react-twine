import {Action, DispatchMethod} from './types';
import {useCallback} from 'react';

function useAction<T>(action: Action<T>): DispatchMethod<T>;
function useAction<T, A extends any[] = []>(
  action: Action<T>,
  value: T | ((...args: A) => T)
): () => void;
function useAction<T, A extends any[] = []>(
  action: Action<T>,
  value?: T | ((...args: A) => T)
): DispatchMethod<T> | (() => void) {
  return useCallback(
    value === undefined
      ? action.dispatch
      : (...args: A) =>
          action.dispatch(value instanceof Function ? value(...args) : value),
    [action, value]
  );
}

export default useAction;

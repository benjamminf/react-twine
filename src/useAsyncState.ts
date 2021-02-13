import {SetMethod, State} from './types';
import {useCallback} from 'react';
import useAsync from './useAsync';
import useSharedState from './useSharedState';

export default function useAsyncState<T>(
  state: State<Promise<T>>
): [T | undefined, SetMethod<T>, Error | undefined] {
  const [promise, setPromise] = useSharedState(state);
  const {value, error} = useAsync(() => promise, [promise]);
  const setValue: SetMethod<T> = useCallback(
    value =>
      setPromise(
        value instanceof Function
          ? promise => promise.then(value)
          : Promise.resolve(value)
      ),
    [setPromise]
  );

  return [value, setValue, error];
}

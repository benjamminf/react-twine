import {useCallback} from 'react';
import {SetMethod, State} from './createState';
import useAsync from './useAsync';
import useSharedState from './useSharedState';

export default function useAsyncSharedState<T>(
  state: State<Promise<T>>
): [T | undefined, SetMethod<T | Promise<T>>, Error | undefined] {
  const [promise, setPromise] = useSharedState(state);
  const {value, error} = useAsync(() => promise, [promise]);
  const setValue: SetMethod<T | Promise<T>> = useCallback(
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

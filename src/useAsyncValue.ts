import {Observable} from './types';
import useAsync from './useAsync';
import useValue from './useValue';

export default function useAsyncValue<T>(
  observable: Observable<Promise<T>>
): [T | undefined, Error | undefined] {
  const promise = useValue(observable);
  const {value, error} = useAsync(() => promise, [promise]);

  return [value, error];
}

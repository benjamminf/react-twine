import {Selector} from './types';
import useAsync from './useAsync';
import useValue from './useValue';

export default function useAsyncValue<T>(
  selector: Selector<Promise<T>>
): [T | undefined, Error | undefined] {
  const promise = useValue(selector);
  const {value, error} = useAsync(() => promise, [promise]);

  return [value, error];
}

import {Selector} from './createSelector';
import useAsync from './useAsync';
import useSharedSelector from './useSharedSelector';

export default function useAsyncSharedSelector<T>(
  selector: Selector<Promise<T>>
): [T | undefined, Error | undefined] {
  const promise = useSharedSelector(selector);
  const {value, error} = useAsync(() => promise, [promise]);

  return [value, error];
}

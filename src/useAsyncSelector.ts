import {Selector} from './createSelector';
import useAsync from './useAsync';
import useSelector from './useSelector';

export default function useAsyncSharedSelector<T>(
  selector: Selector<Promise<T>>
): [T | undefined, Error | undefined] {
  const promise = useSelector(selector);
  const {value, error} = useAsync(() => promise, [promise]);

  return [value, error];
}

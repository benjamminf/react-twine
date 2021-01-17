import {State, SetMethod} from './createState';
import useSharedSelector from './useSharedSelector';

export default function useSharedState<T>(
  sharedState: State<T>
): [T, SetMethod<T>] {
  const value = useSharedSelector(sharedState);

  return [value, sharedState.set];
}

import {State, Set} from './createState';
import useSharedSelector from './useSharedSelector';

export default function useSharedState<T>(sharedState: State<T>): [T, Set<T>] {
  const value = useSharedSelector(sharedState);

  return [value, sharedState.set];
}

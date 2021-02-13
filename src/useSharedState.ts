import {State, SetMethod} from './types';
import useSelector from './useSelector';

export default function useSharedState<T>(state: State<T>): [T, SetMethod<T>] {
  const value = useSelector(state);

  return [value, state.set];
}

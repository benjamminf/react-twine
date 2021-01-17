import {State, SetMethod} from './createState';
import useSelector from './useSelector';

export default function useSharedState<T>(state: State<T>): [T, SetMethod<T>] {
  const value = useSelector(state);

  return [value, state.set];
}

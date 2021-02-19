import {State, SetMethod} from './types';
import useValue from './useValue';

export default function useSharedState<T>(state: State<T>): [T, SetMethod<T>] {
  const value = useValue(state);

  return [value, state.set];
}

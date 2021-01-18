import {SetValue, State} from './createState';
import createSelector, {GetFunction, Getter} from './createSelector';

export type SetFunction = <T>(state: State<T>, value: SetValue<T>) => void;
export type Setter<T> = (value: T, set: SetFunction, get: GetFunction) => void;

function getFunction<T>(state: State<T>): T {
  return state.get();
}

function setFunction<T>(state: State<T>, value: SetValue<T>): void {
  state.set(value);
}

export default function deriveState<T>(
  getter: Getter<T>,
  setter: Setter<T>
): State<T> {
  const proxySelector = createSelector(getter);

  function set(value: SetValue<T>): void {
    setter(
      value instanceof Function ? value(proxySelector.get()) : value,
      setFunction,
      getFunction
    );
  }

  return {
    get: proxySelector.get,
    set,
    observe: proxySelector.observe,
  };
}

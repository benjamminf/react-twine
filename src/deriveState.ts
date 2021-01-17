import {SetValue, State} from './createState';
import createSelector, {GetFunction, Getter} from './createSelector';

export type SetFunction = <T>(state: State<T>, value: SetValue<T>) => void;
export type Setter<T> = (
  value: T,
  args: {get: GetFunction; set: SetFunction}
) => void;

function getFunction<V>(state: State<V>): V {
  return state.get();
}

function setFunction<V>(state: State<V>, value: SetValue<V>): void {
  state.set(value);
}

export default function deriveState<T>(
  getter: Getter<T>,
  setter: Setter<T>
): State<T> {
  const proxySelector = createSelector(getter);

  function set(value: SetValue<T>): void {
    setter(value instanceof Function ? value(proxySelector.get()) : value, {
      get: getFunction,
      set: setFunction,
    });
  }

  return {
    get: proxySelector.get,
    set,
    observe: proxySelector.observe,
  };
}

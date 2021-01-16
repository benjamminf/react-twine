import {SetValue, State} from './createState';
import createSelector, {GetProxy, Getter} from './createSelector';

export type SetProxy = <T>(state: State<T>, value: SetValue<T>) => void;
export type Setter<T> = (
  value: T,
  args: {get: GetProxy; set: SetProxy}
) => void;

export default function deriveState<T>(
  getter: Getter<T>,
  setter: Setter<T>
): State<T> {
  const proxySelector = createSelector(getter);

  function set(value: SetValue<T>): void {
    setter(value instanceof Function ? value(proxySelector.get()) : value, {
      get: state => state.get(),
      set: (state, value) => state.set(value),
    });
  }

  return {
    get: proxySelector.get,
    set,
    observe: proxySelector.observe,
  };
}

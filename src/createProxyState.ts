import {Getter, Selector, Setter, SetValue, State} from './types';
import createSelector from './createSelector';
import createAction from './createAction';
import resolveValue from './resolveValue';

export default function createProxyState<T>(
  getter: Getter<T>,
  setter: Setter<T>
): State<T> & Selector<T> {
  const proxySelector = createSelector(getter);
  const proxyAction = createAction(setter);
  const {get, observe} = proxySelector;

  function set(value: SetValue<T>): void {
    proxyAction.dispatch(resolveValue(value, get));
  }

  return {
    get,
    set,
    observe,
  };
}

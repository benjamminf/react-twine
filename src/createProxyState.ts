import {SetValue, State} from './createState';
import createSelector, {Getter} from './createSelector';
import createAction, {Setter} from './createAction';

export default function createProxyState<T>(
  getter: Getter<T>,
  setter: Setter<T>
): State<T> {
  const proxySelector = createSelector(getter);
  const proxyAction = createAction(setter);

  function set(value: SetValue<T>): void {
    proxyAction.dispatch(
      value instanceof Function ? value(proxySelector.get()) : value
    );
  }

  return {
    get: proxySelector.get,
    set,
    observe: proxySelector.observe,
  };
}

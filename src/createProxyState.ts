import {SetValue, State} from './createState';
import createSelector, {Getter} from './createSelector';
import createAction, {Setter} from './createAction';
import resolveValue from './resolveValue';

export default function createProxyState<T>(
  getter: Getter<T>,
  setter: Setter<T>
): State<T> {
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

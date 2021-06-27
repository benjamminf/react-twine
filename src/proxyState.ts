import { resolveValue } from './resolveValue';
import {
  ActionCreator,
  Getter,
  ProxyStateCreator,
  SelectorCreator,
  Setter,
  SetValue,
  State,
} from './types';

export function bootstrapProxyState({
  createAction,
  createSelector,
}: {
  createAction: ActionCreator;
  createSelector: SelectorCreator;
}): ProxyStateCreator {
  return function createProxyState<T>(
    getter: Getter<T>,
    setter: Setter<T>,
  ): State<T> {
    const selector = createSelector(getter);
    const action = createAction(setter);

    function set(value: SetValue<T>): void {
      action.dispatch(resolveValue(value, selector.get));
    }

    return {
      ...selector,
      set,
    };
  };
}

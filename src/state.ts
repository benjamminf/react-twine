import {
  DependencyStore,
  DependencyStatus,
  InitialValue,
  SetValue,
  State,
  StateCreator,
  Box,
  SelectorCreator,
} from './types';
import { resolveValue } from './resolveValue';
import { box, unbox } from './box';

export function bootstrapState({
  dependencyStore,
  createSelector,
}: {
  dependencyStore: DependencyStore<symbol>;
  createSelector: SelectorCreator;
}): StateCreator {
  return function createState<T>(initialValue: InitialValue<T>): State<T> {
    let unresolved: Array<SetValue<T>> = [];
    let current: Box<T> | undefined;

    function resolve(i = unresolved.length - 1): T {
      if (i >= 0) {
        return resolveValue(unresolved[i], () => resolve(i - 1));
      }

      return current ? unbox(current) : resolveValue(initialValue);
    }

    const selector = createSelector(() => {
      current = box(resolve());
      unresolved = [];

      return unbox(current);
    });

    function set(value: SetValue<T>): void {
      unresolved.push(value);
      dependencyStore.mark(selector.key, DependencyStatus.Stale);
    }

    return {
      ...selector,
      set,
    };
  };
}

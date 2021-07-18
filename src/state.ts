import { InitialValue, SetValue, State } from './types';
import { resolveValue } from './value';
import { Box, box, unbox } from './box';
import { isSelector, SelectorCreator, SelectorOptions } from './selector';
import { DependencyStore, DependencyStatus } from './dependencyStore';
import { Transactor } from './transactor';

export type StateCreator = <T>(
  initialValue: InitialValue<T>,
  options?: SelectorOptions<T>,
) => State<T>;

export function bootstrapState({
  dependencyStore,
  transactor,
  createSelector,
}: {
  dependencyStore: DependencyStore<symbol>;
  transactor: Transactor;
  createSelector: SelectorCreator;
}): StateCreator {
  return function createState<T>(
    initialValue: InitialValue<T>,
    options?: SelectorOptions<T>,
  ): State<T> {
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
    }, options);

    function markStale() {
      dependencyStore.markStatus(selector.key, DependencyStatus.Stale);
    }

    function set(value: SetValue<T>): void {
      unresolved.push(value);
      transactor.transact(markStale);
    }

    return {
      ...selector,
      set,
    };
  };
}

export function isState<T>(obj: unknown): obj is State<T> {
  return isSelector(obj) && typeof (obj as State<T>).set === 'function';
}

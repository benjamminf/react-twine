import { SelectorCreator } from './selector';
import { GetterContext, Selector } from './types';

export type Compute<T, A extends unknown[]> = (
  context: GetterContext,
  ...args: A
) => T;
export type Computed<T, A extends unknown[]> = (...args: A) => Selector<T>;
export type ComputedCreator = <T, A extends unknown[]>(
  compute: Compute<T, A>,
) => Computed<T, A>;

export function bootstrapComputed({
  createSelector,
}: {
  createSelector: SelectorCreator;
}): ComputedCreator {
  return function createComputed<T, A extends unknown[]>(
    compute: Compute<T, A>,
  ): Computed<T, A> {
    const selectors = new MultiKeyMap<A, Selector<T>>();

    return (...args) => {
      const existingSelector = selectors.get(args);

      if (existingSelector) {
        return existingSelector;
      }

      const selector = createSelector<T>(context => compute(context, ...args));

      selector.effect(() => {
        if (selectors.has(args)) {
          return;
        }

        selectors.set(args, selector);

        return () => selectors.delete(args);
      });

      return selector;
    };
  };
}

type Node<K, V> = {
  value?: V;
  children?: Map<K, Node<K, V>>;
};

class MultiKeyMap<K extends unknown[], V> {
  private root: Node<unknown, V> = {};

  has(key: K): boolean {
    let current = this.root;

    for (const k of key) {
      const next = current.children?.get(k);

      if (!next) {
        return false;
      }

      current = next;
    }

    return true;
  }

  get(key: K): V | undefined {
    let current = this.root;

    for (const k of key) {
      const next = current.children?.get(k);

      if (!next) {
        return undefined;
      }

      current = next;
    }

    return current.value;
  }

  set(key: K, value: V): this {
    let current = this.root;

    for (const k of key) {
      let next = current.children?.get(k);

      if (!next) {
        next = {};
        current.children ||= new Map();
        current.children.set(k, next);
      }

      current = next;
    }

    current.value = value;

    return this;
  }

  delete(key: K): boolean {
    const path = [this.root];

    for (let i = 0; i < key.length; i++) {
      const k = key[i];
      const current = path[i];
      const next = current.children?.get(k);

      if (!next) {
        return false;
      }

      path.push(next);
      i++;
    }

    const current = path[path.length - 1];
    current.value = undefined;

    for (let i = path.length - 1; i >= 0; i--) {
      const k = key[i];
      const current = path[i];
      const previous = path[i - 1];

      if (previous?.children && !current.children?.size) {
        previous.children.delete(k);

        if (!previous.children.size) {
          previous.children = undefined;
        }
      }
    }

    return true;
  }
}

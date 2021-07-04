import { SelectorCreator, SelectorOptions } from './selector';
import { GetterContext, Selector } from './types';
import { Values } from './value';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HashFunction<V> = (value: V) => any;

export type ComputedOptions<A extends unknown[]> = SelectorOptions &
  Partial<{
    hash: HashFunction<Values<A>>;
  }>;

export type Compute<T, A extends unknown[]> = (
  context: GetterContext,
  ...args: A
) => T;

export type Computed<T, A extends unknown[]> = (...args: A) => Selector<T>;

export type ComputedCreator = <T, A extends unknown[]>(
  compute: Compute<T, A>,
  options?: ComputedOptions<A>,
) => Computed<T, A>;

export function bootstrapComputed({
  createSelector,
}: {
  createSelector: SelectorCreator;
}): ComputedCreator {
  return function createComputed<T, A extends unknown[]>(
    compute: Compute<T, A>,
    { hash, ...selectorOptions }: ComputedOptions<A> = {},
  ): Computed<T, A> {
    const selectors = new MultiKeyMap<A, Selector<T>>(hash);

    return (...args) => {
      const existingSelector = selectors.get(args);

      if (existingSelector) {
        return existingSelector;
      }

      const selector = createSelector<T>(
        context => compute(context, ...args),
        selectorOptions,
      );

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

  constructor(private hash: HashFunction<Values<K>> = v => v) {}

  has(key: K): boolean {
    let current = this.root;

    for (const k of key) {
      const hashed = this.hash(k as Values<K>);
      const next = current.children?.get(hashed);

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
      const hashed = this.hash(k as Values<K>);
      const next = current.children?.get(hashed);

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
      const hashed = this.hash(k as Values<K>);
      let next = current.children?.get(hashed);

      if (!next) {
        next = {};
        current.children ||= new Map();
        current.children.set(hashed, next);
      }

      current = next;
    }

    current.value = value;

    return this;
  }

  delete(key: K): boolean {
    const path = [this.root];
    const hashes = key.map(k => this.hash(k as Values<K>));

    for (let i = 0; i < hashes.length; i++) {
      const hashed = hashes[i];
      const current = path[i];
      const next = current.children?.get(hashed);

      if (!next) {
        return false;
      }

      path.push(next);
      i++;
    }

    const current = path[path.length - 1];
    current.value = undefined;

    for (let i = path.length - 1; i >= 0; i--) {
      const hashed = hashes[i];
      const current = path[i];
      const previous = path[i - 1];

      if (previous?.children && !current.children?.size) {
        previous.children.delete(hashed);

        if (!previous.children.size) {
          previous.children = undefined;
        }
      }
    }

    return true;
  }
}

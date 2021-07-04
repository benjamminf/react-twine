import { Selector } from './types';
import { isSelector } from './selector';
import { isValueInRange, ValueRange } from './value';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HashFunction<V> = (value: V) => any;

export type FactoryOptions<K> = Partial<{
  range: ValueRange<K> | Selector<ValueRange<K>>;
  hash: HashFunction<K>;
}>;

export type Factory<K, V> = (key: K) => V;

export type FactoryCreator = <K, V>(
  resolver: (key: K) => V,
  options?: FactoryOptions<K>,
) => Factory<K, V>;

export function createFactory<K, V>(
  resolver: (key: K) => V,
  { range = () => true, hash = v => v }: FactoryOptions<K> = {},
): Factory<K, V> {
  const keys = new Map<unknown, K>();
  const values = new Map<unknown, V>();
  const getRange = isSelector<ValueRange<K>>(range) ? range.get : () => range;

  if (isSelector<ValueRange<K>>(range)) {
    range.observe(rangeValue => {
      for (const hashed of values.keys()) {
        const key = keys.get(hashed)!;

        if (!isValueInRange(key, rangeValue)) {
          values.delete(hashed);
        }
      }
    });
  }

  return function factory(key: K): V {
    if (!isValueInRange(key, getRange())) {
      throw new RangeError(`Factory key "${String(key)}" is out of bounds`);
    }

    const hashed = hash(key);

    if (!keys.has(hashed)) {
      keys.set(hashed, key);
    }

    if (!values.has(hashed)) {
      values.set(hashed, resolver(key));
    }

    return values.get(hashed)!;
  };
}

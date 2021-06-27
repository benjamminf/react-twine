import { Factory, Selector, ValueRange } from './types';
import { isSelector } from './selector';
import { isValueInRange } from './value';

export function createFactory<K, V>(
  resolver: (key: K) => V,
  range: ValueRange<K> | Selector<ValueRange<K>> = () => true,
): Factory<K, V> {
  const values = new Map<K, V>();
  const getRange = isSelector<ValueRange<K>>(range) ? range.get : () => range;

  if (isSelector<ValueRange<K>>(range)) {
    range.observe(rangeValue => {
      for (const key of values.keys()) {
        if (!isValueInRange(key, rangeValue)) {
          values.delete(key);
        }
      }
    });
  }

  return function factory(key: K): V {
    if (!isValueInRange(key, getRange())) {
      throw new RangeError(`Factory key "${String(key)}" is out of bounds`);
    }

    if (!values.has(key)) {
      values.set(key, resolver(key));
    }

    return values.get(key) as V;
  };
}

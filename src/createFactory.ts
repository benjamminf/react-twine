import {Selector} from './createSelector';
import isSelector from './isSelector';
import isValueInRange, {ValueRange} from './isValueInRange';
import memo, {MemoFunction} from './memo';

export type Factory<K, V> = MemoFunction<V, K>;

export default function createFactory<K, V>(
  fn: (key: K) => V,
  keyRange?: ValueRange<K> | Selector<ValueRange<K>>
): Factory<K, V> {
  const factory = memo<V, K>(fn);

  if (keyRange) {
    if (isSelector<ValueRange<K>>(keyRange)) {
      keyRange.observe(range => {
        for (const key of factory.cache.keys()) {
          if (!isValueInRange(key, range)) {
            factory.cache.delete(key);
          }
        }
      });
    }

    const guardedFactory = (key: K): V => {
      const range = isSelector<ValueRange<K>>(keyRange)
        ? keyRange.get()
        : keyRange;

      if (!isValueInRange(key, range)) {
        throw new RangeError(`State factory key "${key}" is out of bounds`);
      }

      return factory(key);
    };

    return Object.assign(guardedFactory, {cache: factory.cache});
  }

  return factory;
}

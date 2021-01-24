import {Selector} from './createSelector';
import createState, {DefaultValue, State} from './createState';
import isSelector from './isSelector';
import isState from './isState';
import isValueInRange, {ValueRange} from './isValueInRange';
import memo, {MemoFunction} from './memo';

export type StateFactory<K, V> = MemoFunction<State<V>, K>;

export default function createStateFactory<K, V>(
  fn: (key: K) => DefaultValue<V> | State<V>,
  keyRange?: ValueRange<K> | Selector<ValueRange<K>>
): StateFactory<K, V> {
  const factory = memo<State<V>, K>(key => {
    const defaultValOrState = fn(key);

    return isState<V>(defaultValOrState)
      ? defaultValOrState
      : createState(defaultValOrState);
  });

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

    const guardedFactory = (key: K): State<V> => {
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

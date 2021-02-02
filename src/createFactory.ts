import createAction from './createAction';
import createMutableState from './createMutableState';
import createSelector, {Selector} from './createSelector';
import {State} from './createState';
import deriveState from './deriveState';
import isSelector from './isSelector';
import isValueInRange, {ValueRange} from './isValueInRange';
import mapCompare from './mapCompare';
import setCompare from './setCompare';

export type Factory<K, V> = ((key: K) => V) &
  State<Map<K, V>> & {keys: Selector<Set<K>>};

export default function createFactory<K, V>(
  fn: (key: K) => V,
  keyRange?: ValueRange<K> | Selector<ValueRange<K>>
): Factory<K, V> {
  const keysState = createMutableState(new Set<K>());
  const keysSelector = createSelector(({get}) => new Set(get(keysState)));

  const valuesState = createMutableState(new Map<K, V>());

  const factoryState = deriveState(
    ({get}) => new Map(get(valuesState)),
    ({value: newValues, get, set}) => {
      const newKeys = new Set(newValues.keys());
      const oldValues = get(valuesState);
      const oldKeys = get(keysState);
      const hasNewKeys = !setCompare(newKeys, oldKeys);
      const hasNewValues = hasNewKeys || !mapCompare(newValues, oldValues);

      if (hasNewValues) {
        set(valuesState, new Map(newValues));
      }

      if (hasNewKeys) {
        set(keysState, newKeys);
      }
    }
  );

  const addAction = createAction<[K, V]>(({value: [key, value], set}) => {
    set(valuesState, values => values.set(key, value));
    set(keysState, keys => keys.add(key));
  });

  if (isSelector<ValueRange<K>>(keyRange)) {
    keyRange.observe(range => {
      const keys = keysState.get();
      const values = valuesState.get();

      keys.forEach(key => {
        if (!isValueInRange(key, range)) {
          keys.delete(key);
          values.delete(key);
        }
      });

      keysState.set(keys);
      valuesState.set(values);
    });
  }

  function factory(key: K): V {
    const range = isSelector<ValueRange<K>>(keyRange)
      ? keyRange.get()
      : keyRange;

    if (range && !isValueInRange(key, range)) {
      throw new RangeError(`Factory key "${key}" is out of bounds`);
    }

    const values = valuesState.get();
    const value = values.get(key) ?? fn(key);

    if (!values.has(key)) {
      addAction.dispatch([key, value]);
    }

    return value;
  }

  return Object.assign(factory, factoryState, {
    keys: keysSelector,
  });
}

function filter<V>(set: Set<V>, fn: (value: V) => boolean): Set<V>;
function filter<K, V>(
  map: Map<K, V>,
  fn: (value: V, key: K) => boolean
): Map<K, V>;
function filter<K, V>(
  object: Set<V> | Map<K, V>,
  fn: (value: V, key?: K) => boolean
): Set<V> | Map<K, V> {
  if (object instanceof Set) {
    return new Set(Array.from(object).filter(value => fn(value)));
  }

  if (object instanceof Map) {
    return new Map(Array.from(object).filter(([key, value]) => fn(value, key)));
  }

  throw new TypeError('Object must be a set or map instance');
}

export default filter;

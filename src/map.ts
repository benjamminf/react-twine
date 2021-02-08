function map<V, M>(set: Set<V>, fn: (value: V) => M): Set<M>;
function map<K, V, M>(map: Map<K, V>, fn: (value: V, key: K) => M): Map<K, M>;
function map<K, V, M>(
  object: Set<V> | Map<K, V>,
  fn: (value: V, key?: K) => M
): Set<M> | Map<K, M> {
  if (object instanceof Set) {
    return new Set(Array.from(object, value => fn(value)));
  }

  if (object instanceof Map) {
    return new Map(Array.from(object, ([key, value]) => [key, fn(value, key)]));
  }

  throw new TypeError('Object must be a set or map instance');
}

export default map;

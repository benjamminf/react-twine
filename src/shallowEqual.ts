function shallowEqual<V>(setA: Set<V>, setB: Set<V>): boolean;
function shallowEqual<K, V>(mapA: Map<K, V>, mapB: Map<K, V>): boolean;
function shallowEqual<K, V>(
  objectA: Map<K, V> | Set<V>,
  objectB: Map<K, V> | Set<V>
): boolean {
  if (objectA instanceof Map && objectB instanceof Map) {
    return (
      objectA.size === objectB.size &&
      Array.from(objectA).reduce(
        (isEqual: boolean, [key, value]) =>
          isEqual && objectB.has(key) && objectB.get(key) === value,
        true
      )
    );
  }

  if (objectA instanceof Set && objectB instanceof Set) {
    return (
      objectA.size === objectB.size &&
      Array.from(objectA).reduce(
        (isEqual: boolean, key) => isEqual && objectB.has(key),
        true
      )
    );
  }

  throw new TypeError('Object must be a set or map instance');
}

export default shallowEqual;

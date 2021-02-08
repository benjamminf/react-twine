export default function shallowEqualSet<V>(
  setA: Set<V>,
  setB: Set<V>
): boolean {
  return (
    setA.size === setB.size &&
    Array.from(setA).reduce(
      (isEqual: boolean, key) => isEqual && setB.has(key),
      true
    )
  );
}

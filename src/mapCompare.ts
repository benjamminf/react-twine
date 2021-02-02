export default function mapCompare<K, V>(
  mapA: Map<K, V>,
  mapB: Map<K, V>
): boolean {
  return (
    mapA.size === mapB.size &&
    Array.from(mapA).reduce(
      (isEqual: boolean, [key, value]) =>
        isEqual && mapB.has(key) && mapB.get(key) === value,
      true
    )
  );
}

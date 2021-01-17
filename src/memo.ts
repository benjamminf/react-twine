export type MemoFunction<V, K = void> = ((key: K) => V) & {cache: Map<K, V>};

export default function memo<V, K = void>(
  fn: (key: K) => V
): MemoFunction<V, K> {
  const cache = new Map<K, V>();

  return Object.assign(
    (key: K) =>
      (cache.has(key) ? cache : cache.set(key, fn(key))).get(key) as V,
    {cache}
  );
}

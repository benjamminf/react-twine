export type Box<V> = [V];

export function box<V>(value: V): Box<V> {
  return [value];
}

export function unbox<V>([value]: Box<V>): V {
  return value;
}

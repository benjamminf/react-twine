export type Bucket<T> = {value: T};

export default function bucket<T>(value: T): Bucket<T> {
  return {value};
}

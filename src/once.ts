import bucket, {Bucket} from './bucket';

export default function once<A extends any[], R>(
  fn: (...args: A) => R
): (...args: A) => R {
  let result: Bucket<R> | null = null;
  return (...args) => (result = result ?? bucket(fn(...args))).value;
}

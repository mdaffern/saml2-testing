import { ints, map, take } from './generators';
import { Predicate } from '../common-types';

export function range(low: number, high: number) {
  const count = high - low + 1;
  return [...take(map(ints(), x => x + low), count)];
}

export function findOne<T>(from: Iterable<T>, p: Predicate<T>): T | undefined {
  const iterator = from[Symbol.iterator]();
  let next;

  while (next = iterator.next().value) {
    if (p(next)) {
      return next;
    }
  }
}

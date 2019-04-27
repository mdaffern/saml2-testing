import { Predicate } from '../common-types';

export function* take<T>(from: Iterable<T>, numberToTake: number): IterableIterator<T> {
  const iterator = from[Symbol.iterator]();

  while (numberToTake--) {
    const next = iterator.next().value;

    if (next == undefined) {
      return null;
    }
    yield next;
  }
}

export function* map<T, T2>(from: Iterable<T>, transform: (item: T) => T2): IterableIterator<T2> {
  const iterator = from[Symbol.iterator]();
  let next;

  while (next = iterator.next().value) {
    yield transform(next);
  }
}

export function* filter<T>(from: Iterable<T>, p: Predicate<T>): IterableIterator<T> {
  const iterator = from[Symbol.iterator]();
  let next;

  while (next = iterator.next().value) {
    if (p(next)) {
      yield next;
    }
  }
}

export function* ints(offset: number = 0): IterableIterator<number> {
  let i = offset;

  while (true) {
    const newOffset = yield i;
    i++;

    if (typeof newOffset === 'number') {
      i = newOffset;
    }
  }
}

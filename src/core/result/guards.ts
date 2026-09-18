import type { Result, Ok, Err } from './result';

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

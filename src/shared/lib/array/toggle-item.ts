/**
 * Pure immutable array item toggler.
 * If the target item exists in the array, it returns a new array with the item removed.
 * If not present, returns a new array with the item appended.
 */
export function toggleItem<T>(items: readonly T[], item: T): T[] {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

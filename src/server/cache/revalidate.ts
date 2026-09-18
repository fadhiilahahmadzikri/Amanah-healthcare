import 'server-only';
import {
  revalidateTag as nextRevalidateTag,
  revalidatePath as nextRevalidatePath
} from 'next/cache';

export function invalidateTag(tag: string): void {
  try {
    nextRevalidateTag(tag, 'max');
  } catch {
    // Graceful fallback outside Next.js request context (e.g. CLI, tests)
  }
}

export function invalidatePath(path: string, type?: 'page' | 'layout'): void {
  try {
    nextRevalidatePath(path, type);
  } catch {
    // Graceful fallback
  }
}

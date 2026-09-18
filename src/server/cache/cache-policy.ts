import 'server-only';

export const CachePolicies = {
  NO_STORE: {
    cache: 'no-store' as const,
    revalidate: 0
  },
  SHORT: {
    revalidate: 60 // 60 seconds
  },
  SWR: {
    revalidate: 300 // 5 minutes
  },
  STATIC: {
    revalidate: false as const
  }
} as const;

export type CachePolicyName = keyof typeof CachePolicies;

import 'server-only';

export const cacheTags = {
  auth: {
    me: (userId: string) => `auth:me:${userId}` as const,
    session: (sessionId: string) => `auth:session:${sessionId}` as const
  },
  users: {
    detail: (id: string) => `user:detail:${id}` as const,
    list: () => 'user:list' as const
  }
} as const;

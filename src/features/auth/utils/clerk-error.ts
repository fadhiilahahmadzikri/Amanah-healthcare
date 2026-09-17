type ClerkLikeError = {
  errors?: Array<{
    message?: string;
    longMessage?: string;
  }>;
  message?: string;
};

export function getClerkErrorMessage(error: unknown, fallback: string) {
  const clerkError = error as ClerkLikeError;
  return (
    clerkError.errors?.[0]?.longMessage ??
    clerkError.errors?.[0]?.message ??
    clerkError.message ??
    fallback
  );
}

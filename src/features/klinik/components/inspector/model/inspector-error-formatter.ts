export function formatInspectorErrorMessage(err: any): {
  userFriendlyMessage: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  const invalidParams =
    err?.problemDetails?.invalidParams ||
    err?.invalidParams ||
    (Array.isArray(err?.errors) ? err.errors : null);

  if (Array.isArray(invalidParams) && invalidParams.length > 0) {
    for (const p of invalidParams) {
      const fieldKey = p.name || p.property || p.field;
      const reason = p.reason || p.message || 'Data tidak valid';
      if (fieldKey) {
        fieldErrors[fieldKey] = reason;
      }
    }
    const userFriendlyMessage =
      invalidParams
        .map((p) => p.reason || p.message)
        .filter(Boolean)
        .slice(0, 2)
        .join(', ') || 'Data formulir tidak valid';

    return { userFriendlyMessage, fieldErrors };
  }

  const rawMsg = err?.message;
  const userFriendlyMessage =
    typeof rawMsg === 'string' && !rawMsg.startsWith('{') && !rawMsg.startsWith('[')
      ? rawMsg
      : 'Gagal menyimpan perubahan formulir';

  return { userFriendlyMessage, fieldErrors };
}

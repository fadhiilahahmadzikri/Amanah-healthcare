export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Generic security-conscious error for credential failures (prevents account enumeration)
  genericInvalidCredentials: 'Email atau kata sandi yang Anda masukkan salah.',
  notFound: 'Email atau kata sandi yang Anda masukkan salah.',
  incorrectPassword: 'Email atau kata sandi yang Anda masukkan salah.',
  emailAlreadyExists: 'Alamat email ini sudah terdaftar. Silakan masuk.',
  emailNotExists: 'Jika email terdaftar, instruksi pemulihan telah dikirim.',
  invalidHash: 'Tautan atau token reset kata sandi tidak valid atau telah kedaluwarsa.',
  'email must be an email': 'Format alamat email tidak valid.',
  'password should not be empty': 'Kata sandi wajib diisi.',
  'password must be longer than or equal to 6 characters':
    'Kata sandi minimal terdiri dari 6 karakter.',
  UNAUTHENTICATED: 'Sesi Anda telah berakhir. Silakan masuk kembali.',
  FORBIDDEN: 'Anda tidak memiliki hak akses untuk membuka halaman ini.',
  RATE_LIMIT_EXCEEDED:
    'Terlalu banyak percobaan masuk. Mohon tunggu beberapa saat sebelum mencoba kembali.',
  INTERNAL_SERVER_ERROR: 'Terjadi kendala pada server. Tim teknis sedang menangani ini.'
};

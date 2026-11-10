export interface GreetingItem {
  id: string;
  text: string;
  language: string;
}

/**
 * 6 Bahasa Salam Resmi untuk Halaman Autentikasi
 * Minimalis, universal, dan ramah pengguna.
 */
export const GREETINGS_CONFIG: readonly GreetingItem[] = [
  { id: 'ar', text: 'Assalamualaikum', language: 'Arab / Indonesia' },
  { id: 'en', text: 'Welcome', language: 'Inggris' },
  { id: 'ja', text: 'こんにちは', language: 'Jepang' },
  { id: 'zh', text: '你好', language: 'Mandarin (Kanji/Hanzi)' },
  { id: 'es', text: '¡Hola!', language: 'Spanyol' },
  { id: 'fr', text: 'Bonjour', language: 'Perancis' }
] as const;

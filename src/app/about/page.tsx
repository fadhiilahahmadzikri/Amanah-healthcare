import { permanentRedirect } from 'next/navigation';

export default function AboutPage(): never {
  permanentRedirect('/tentang-kami');
}

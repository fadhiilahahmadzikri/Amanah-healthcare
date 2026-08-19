import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default async function Page() {
  let stars = 3000;

  try {
    const response = await fetch('https://api.github.com/repos/fadhiilahahmadzikri/stockitdown', {
      next: { revalidate: 86400 }
    });

    if (response.ok) {
      const data = await response.json();
      stars = data.stargazers_count || stars;
    }
  } catch {}
  return <SignUpViewPage stars={stars} />;
}

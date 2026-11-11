import { redirect } from 'next/navigation';

interface PromoRedirectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PromoRedirectPage({ params }: PromoRedirectPageProps) {
  const { id } = await params;
  redirect(`/promosi/${id}`);
}

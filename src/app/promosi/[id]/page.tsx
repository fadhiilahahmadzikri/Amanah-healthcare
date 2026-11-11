import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicSiteRouteShell } from '@/features/public-site';
import { HealthcareShell } from '@/features/public-site/components/shared';
import { PromoDetailView } from '@/features/promotions';
import {
  getPublicPromotionByIdOnServer,
  getLivePublicPromotionsOnServer
} from '@/features/promotions/api/server';

interface PromoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params
}: PromoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const promo = await getPublicPromotionByIdOnServer(id);

  if (!promo) {
    return {
      title: 'Program & Promo | Amanah Healthcare',
      description: 'Penawaran spesial dan informasi layanan kesehatan terkini dari Amanah Healthcare.'
    };
  }

  return {
    title: `${promo.title} | Amanah Healthcare`,
    description: promo.summary,
    openGraph: {
      title: `${promo.title} | Amanah Healthcare`,
      description: promo.summary,
      images: promo.image.src ? [promo.image.src] : []
    }
  };
}

export default async function Page({ params }: PromoDetailPageProps) {
  const { id } = await params;
  const promo = await getPublicPromotionByIdOnServer(id);

  if (!promo) {
    notFound();
  }

  const allPromos = await getLivePublicPromotionsOnServer();
  const otherPromos = allPromos.filter((item) => item.id !== id).slice(0, 3);

  return (
    <PublicSiteRouteShell>
      <HealthcareShell activePath='/promosi' locale='id'>
        <PromoDetailView promo={promo} otherPromos={otherPromos} />
      </HealthcareShell>
    </PublicSiteRouteShell>
  );
}

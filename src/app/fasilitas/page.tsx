import type { Metadata } from 'next';
import {
  AmanahServicesPage,
  PublicSiteRouteShell,
  facilitiesMetadata
} from '@/features/public-site';
import {
  getClinicCatalogOnServer,
  getClinicFacilitiesOnServer
} from '@/features/klinik/api/server';
import type { ServiceCategoryCatalog } from '@/features/klinik/api/catalog.service';
import type { FacilityCarouselItem } from '@/features/public-site/pages/services/types';

export const metadata: Metadata = facilitiesMetadata;
export const dynamic = 'force-dynamic';

export default async function Page() {
  let categories: ServiceCategoryCatalog[] = [];
  let facilities: FacilityCarouselItem[] = [];

  try {
    const [fetchedCategories, fetchedFacilities] = await Promise.all([
      getClinicCatalogOnServer(),
      getClinicFacilitiesOnServer()
    ]);
    categories = fetchedCategories;
    facilities = fetchedFacilities.map((f) => ({
      id: f.id,
      title: f.title,
      summary: f.summary || '',
      url: f.ctaUrl || '/kontak',
      image: f.imageUrl || '/healthcare/assets/images/fasilitas-apotek.webp',
      serviceId: f.serviceId,
      serviceName: f.serviceName
    }));
  } catch (error) {
    console.error('Failed to fetch clinic data on server:', error);
  }

  return (
    <PublicSiteRouteShell>
      <AmanahServicesPage
        activePath='/fasilitas'
        locale='id'
        initialCategories={categories}
        initialFacilities={facilities}
      />
    </PublicSiteRouteShell>
  );
}

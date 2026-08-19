import PageContainer from '@/components/layout/page-container';
import ShippingOnboardingPage from '@/features/shipping/components/shipping-onboarding-page';
import type { ShippingFilters } from '@/features/shipping/api/types';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Shipping Onboarding'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const initialFilters = getInitialShippingFilters(await searchParams);

  return (
    <PageContainer
      pageTitle='Shipping Onboarding'
      pageDescription='Manage orders and shipping onboarding process'
      scrollable
    >
      <div className='flex-1 w-full flex flex-col gap-4 -mt-4'>
        <ShippingOnboardingPage initialFilters={initialFilters} />
      </div>
    </PageContainer>
  );
}

function getInitialShippingFilters(searchParams: SearchParams): ShippingFilters {
  const page = parsePositiveInteger(getSearchParam(searchParams, 'page')) ?? 1;
  const limit = parsePositiveInteger(getSearchParam(searchParams, 'limit')) ?? 10;
  const search = getSearchParam(searchParams, 'search') ?? '';
  const status = getSearchParam(searchParams, 'status') ?? 'Shipping';

  return {
    page,
    limit,
    ...(search && { search }),
    ...(isShippingStatus(status) && { status })
  };
}

function getSearchParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isShippingStatus(value: string): value is NonNullable<ShippingFilters['status']> {
  return value === 'Packed' || value === 'Shipping' || value === 'Completed';
}

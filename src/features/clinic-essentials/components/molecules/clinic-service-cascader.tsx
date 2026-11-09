'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface ClinicServiceCascaderSelection {
  unitId: string;
  unitName: string;
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
}

export interface ClinicServiceCascaderProps {
  initialUnitId?: string;
  initialCategoryId?: string;
  initialServiceId?: string;
  value?: Partial<ClinicServiceCascaderSelection>;
  onChange?: (selection: ClinicServiceCascaderSelection) => void;
  disabled?: boolean;
  className?: string;
  layout?: 'stacked' | 'grid';
  error?: string;
}

export function ClinicServiceCascader({
  initialUnitId = '',
  initialCategoryId = '',
  initialServiceId = '',
  value,
  onChange,
  disabled = false,
  className,
  layout = 'grid',
  error
}: ClinicServiceCascaderProps) {
  const [unitId, setUnitId] = React.useState(value?.unitId ?? initialUnitId);
  const [categoryId, setCategoryId] = React.useState(value?.categoryId ?? initialCategoryId);
  const [serviceId, setServiceId] = React.useState(value?.serviceId ?? initialServiceId);

  // Sync state if external controlled value changes
  React.useEffect(() => {
    if (value?.unitId !== undefined && value.unitId !== unitId) {
      setUnitId(value.unitId);
    }
    if (value?.categoryId !== undefined && value.categoryId !== categoryId) {
      setCategoryId(value.categoryId);
    }
    if (value?.serviceId !== undefined && value.serviceId !== serviceId) {
      setServiceId(value.serviceId);
    }
  }, [value, unitId, categoryId, serviceId]);

  // 1. Fetch Poliklinik (Units)
  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['clinic-essentials-active-units'],
    queryFn: () => clinicEssentialsApi.getUnits({ status: 'active' }),
    staleTime: 5 * 60_000
  });

  // 2. Fetch Kelompok Layanan (Categories) berdasarkan unitId
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['clinic-essentials-categories-by-unit', unitId],
    queryFn: () => clinicEssentialsApi.getCategories(unitId, { status: 'active' }),
    enabled: Boolean(unitId),
    staleTime: 5 * 60_000
  });

  // 3. Fetch Layanan Medis (Services) berdasarkan categoryId & unitId
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['clinic-essentials-services-by-category', categoryId, unitId],
    queryFn: () =>
      clinicEssentialsApi.getServices(categoryId, unitId, { status: 'active' }),
    enabled: Boolean(categoryId),
    staleTime: 5 * 60_000
  });

  // Self-heal: If initialServiceId is passed but unitId or categoryId is missing,
  // query all services once to discover which category & unit owns this service.
  const { data: allServices = [] } = useQuery({
    queryKey: ['clinic-essentials-all-services-lookup'],
    queryFn: () => clinicEssentialsApi.getServices(undefined, undefined, { status: 'active' }),
    enabled: Boolean(initialServiceId && (!unitId || !categoryId)),
    staleTime: 10 * 60_000
  });

  React.useEffect(() => {
    if (initialServiceId && (!unitId || !categoryId) && allServices.length > 0) {
      const match = allServices.find((s) => s.id === initialServiceId);
      if (match) {
        if (!unitId && match.unitId) {
          setUnitId(match.unitId);
        }
        if (!categoryId && match.serviceCategoryId) {
          setCategoryId(match.serviceCategoryId);
        }
      }
    }
  }, [allServices, initialServiceId, unitId, categoryId]);

  // Handler: Poliklinik change (resets category & service)
  const handleUnitChange = (newUnitId: string) => {
    setUnitId(newUnitId);
    setCategoryId('');
    setServiceId('');
  };

  // Handler: Category change (resets service)
  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setServiceId('');
  };

  // Handler: Service change (notifies parent with complete resolved selection)
  const handleServiceChange = (newServiceId: string) => {
    setServiceId(newServiceId);
    const unit = units.find((u) => u.id === unitId);
    const category = categories.find((c) => c.id === categoryId);
    const service = services.find((s) => s.id === newServiceId);

    if (onChange && unit && category && service) {
      onChange({
        unitId: unit.id,
        unitName: unit.name,
        categoryId: category.id,
        categoryName: category.name,
        serviceId: service.id,
        serviceName: service.name
      });
    }
  };

  const containerClasses =
    layout === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans'
      : 'space-y-3 font-sans';

  return (
    <div className={cn('w-full', className)}>
      <div className={containerClasses}>
        {/* Level 1: Poliklinik Tujuan */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
            Poliklinik Tujuan <span className='text-destructive'>*</span>
            {isLoadingUnits && (
              <Icons.spinner className='size-3 animate-spin text-muted-foreground' />
            )}
          </Label>
          <Select
            value={unitId}
            onValueChange={handleUnitChange}
            disabled={disabled || isLoadingUnits}
          >
            <SelectTrigger className='w-full bg-card'>
              <SelectValue
                placeholder={isLoadingUnits ? 'Memuat Poliklinik...' : 'Pilih Poliklinik'}
              />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level 2: Kelompok Layanan */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
            Kelompok Layanan <span className='text-destructive'>*</span>
            {isLoadingCategories && (
              <Icons.spinner className='size-3 animate-spin text-muted-foreground' />
            )}
          </Label>
          <Select
            value={categoryId}
            onValueChange={handleCategoryChange}
            disabled={disabled || !unitId || isLoadingCategories}
          >
            <SelectTrigger className='w-full bg-card'>
              <SelectValue
                placeholder={
                  !unitId
                    ? 'Pilih Poli dahulu'
                    : isLoadingCategories
                    ? 'Memuat Kelompok...'
                    : 'Pilih Kelompok Layanan'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level 3: Layanan Medis */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
            Layanan Medis <span className='text-destructive'>*</span>
            {isLoadingServices && (
              <Icons.spinner className='size-3 animate-spin text-muted-foreground' />
            )}
          </Label>
          <Select
            value={serviceId}
            onValueChange={handleServiceChange}
            disabled={disabled || !categoryId || isLoadingServices}
          >
            <SelectTrigger className='w-full bg-card'>
              <SelectValue
                placeholder={
                  !categoryId
                    ? 'Pilih Kelompok dahulu'
                    : isLoadingServices
                    ? 'Memuat Layanan...'
                    : 'Pilih Layanan Medis'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {services.map((svc) => (
                <SelectItem key={svc.id} value={svc.id}>
                  {svc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <span className='text-xs font-medium text-destructive mt-1.5 block'>
          {error}
        </span>
      )}
    </div>
  );
}

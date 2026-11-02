'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { kiaIntakeService } from '../api/kia-intake-service';
import { klinikKeys } from '../api/query-keys';
import type { FormFieldDataSource } from '../constants/medical-appointment-types';

export interface FormDataSourceDescriptor {
  key: string;
  label: string;
  description: string;
}

export const REGISTERED_DATA_SOURCES: FormDataSourceDescriptor[] = [
  {
    key: 'blood_types',
    label: 'Golongan Darah',
    description: 'Master darah A, B, AB, O, Belum Tahu'
  },
  {
    key: 'occupations',
    label: 'Pekerjaan Pasien',
    description: 'Katalog pekerjaan resmi dari database'
  },
  {
    key: 'education_levels',
    label: 'Tingkat Pendidikan',
    description: 'SD, SMP, SMA, D3, S1, S2, dsb'
  },
  { key: 'religions', label: 'Agama', description: 'Master agama resmi' },
  { key: 'tetanus_statuses', label: 'Status Imunisasi TT', description: 'TT 1 s/d TT 5' },
  { key: 'vaccines', label: 'Katalog Vaksin Anak', description: 'Master vaksin imunisasi anak' },
  {
    key: 'contraceptive_types',
    label: 'Jenis KB / Kontrasepsi',
    description: 'Pil, Suntik, IUD, Implan, Kondom, dsb'
  },
  {
    key: 'delivery_methods',
    label: 'Metode Persalinan',
    description: 'Spontan/Normal, Caesar, Vakum'
  },
  {
    key: 'delivery_places',
    label: 'Tempat Persalinan',
    description: 'Puskesmas, Rumah Sakit, Klinik, Praktik Mandiri'
  },
  { key: 'child_sexes', label: 'Jenis Kelamin', description: 'Laki-laki, Perempuan' },
  {
    key: 'birth_attendants',
    label: 'Penolong Persalinan',
    description: 'Dokter SpOG, Bidan, Dokter Umum'
  },
  {
    key: 'indonesian_regions',
    label: 'Wilayah Domisili Indonesia',
    description: 'Data wilayah bertingkat (Provinsi, Kota/Kab, Kecamatan, Kelurahan)'
  }
];

export function useFormDataSourceRegistry(enabled = true) {
  const { data: refOptions, isLoading: isLoadingRef } = useQuery({
    queryKey: klinikKeys.maternalReferenceOptions(),
    queryFn: () => kiaIntakeService.getMaternalReferenceOptions(),
    enabled,
    staleTime: 300_000
  });

  const { data: occupations, isLoading: isLoadingOcc } = useQuery({
    queryKey: klinikKeys.occupations(),
    queryFn: () => kiaIntakeService.getOccupations(),
    enabled,
    staleTime: 300_000
  });

  const { data: vaccines, isLoading: isLoadingVac } = useQuery({
    queryKey: klinikKeys.vaccineCatalog(),
    queryFn: () => kiaIntakeService.getVaccineCatalog(),
    enabled,
    staleTime: 300_000
  });

  const catalogMap = React.useMemo<Record<string, string[]>>(() => {
    return {
      blood_types: refOptions?.bloodTypes?.map((item) => item.label) || [],
      religions: refOptions?.religions?.map((item) => item.label) || [],
      education_levels: refOptions?.educationLevels?.map((item) => item.label) || [],
      tetanus_statuses: refOptions?.tetanusStatuses?.map((item) => item.label) || [],
      delivery_methods: refOptions?.deliveryMethods?.map((item) => item.label) || [],
      delivery_places: refOptions?.deliveryPlaces?.map((item) => item.label) || [],
      child_sexes: refOptions?.childSexes?.map((item) => item.label) || [],
      birth_attendants: refOptions?.birthAttendants?.map((item) => item.label) || [],
      contraceptive_types: refOptions?.contraceptiveTypes?.map((item) => item.label) || [],
      occupations: refOptions?.occupations
        ? refOptions.occupations.map((item) => item.label)
        : occupations?.map((item) => item.name) || [],
      vaccines: vaccines?.map((v) => v.name) || []
    };
  }, [refOptions, occupations, vaccines]);

  const resolveChoices = React.useCallback(
    (dataSource?: FormFieldDataSource, staticChoices?: string[]): string[] => {
      if (!dataSource || dataSource.type !== 'catalog' || !dataSource.key) {
        return staticChoices || [];
      }
      const liveChoices = catalogMap[dataSource.key];
      if (liveChoices && liveChoices.length > 0) {
        return liveChoices;
      }
      return staticChoices || [];
    },
    [catalogMap]
  );

  return {
    catalogMap,
    resolveChoices,
    isLoading: isLoadingRef || isLoadingOcc || isLoadingVac
  };
}

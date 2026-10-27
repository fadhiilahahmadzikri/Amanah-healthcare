'use client';

import { useMemo, useCallback } from 'react';
import { Icons } from '@/components/icons';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import {
  CLINICAL_HISTORY_TAB,
  type ClinicalHistoryTabType,
  type MaternalHistoryItem,
  type ImmunizationHistoryItem
} from '../api/history-queries';

export interface UseClinicalHistoryDynamicOptionsProps {
  activeTab: ClinicalHistoryTabType;
  setActiveTab: (tab: ClinicalHistoryTabType) => void;
  totalMaternal: number;
  totalImmunization: number;
  familyMembers: Array<{
    id: string;
    fullName: string;
    relationshipLabel?: string;
    relationship: string;
  }>;
  patientId: string;
  setPatientId: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  maternalRows?: MaternalHistoryItem[];
  immunizationRows?: ImmunizationHistoryItem[];
  onReset?: () => void;
}

export function useClinicalHistoryDynamicOptions({
  activeTab,
  setActiveTab,
  totalMaternal,
  totalImmunization,
  familyMembers,
  patientId,
  setPatientId,
  search,
  setSearch,
  maternalRows = [],
  immunizationRows = [],
  onReset
}: UseClinicalHistoryDynamicOptionsProps) {
  // 1. Facet Groups for Agnostic ResponsiveFacetToolbox & FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    const groups: FacetGroupDefinition[] = [
      {
        id: 'category',
        title: 'Kategori Riwayat',
        icon: Icons.history,
        mode: 'single',
        options: [
          {
            label: 'Kehamilan & Persalinan',
            value: CLINICAL_HISTORY_TAB.MATERNITY,
            count: totalMaternal,
            icon: Icons.user
          },
          {
            label: 'Imunisasi Anak',
            value: CLINICAL_HISTORY_TAB.IMMUNIZATION,
            count: totalImmunization,
            icon: Icons.user
          }
        ],
        selectedValues: [activeTab],
        onSelect: (val: string) => {
          if (val && val !== activeTab) {
            setActiveTab(val as ClinicalHistoryTabType);
          }
        },
        popoverWidth: 'w-56',
        resetLabel: 'Semua Kategori'
      }
    ];

    if (familyMembers.length > 0) {
      groups.push({
        id: 'familyMember',
        title: 'Anggota Keluarga',
        icon: Icons.users,
        mode: 'single',
        options: familyMembers.map((m) => ({
          label: `${m.fullName} (${getRelationshipLabel(m.relationship)})`,
          value: m.id,
          icon: Icons.user
        })),
        selectedValues: patientId ? [patientId] : [],
        onSelect: (val: string) => {
          setPatientId(val === patientId ? '' : val);
        },
        onReset: () => setPatientId(''),
        popoverWidth: 'w-64',
        resetLabel: 'Semua Anggota'
      });
    }

    return groups;
  }, [
    activeTab,
    setActiveTab,
    totalMaternal,
    totalImmunization,
    familyMembers,
    patientId,
    setPatientId
  ]);

  // 2. Count of active filter parameters (Search & Family Member selection)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (patientId) count++;
    return count;
  }, [search, patientId]);

  const isFiltered = activeFilterCount > 0;

  // 3. Search Engine Index Items (Maternal + Immunization + Family Members)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];
    const seenMother = new Set<string>();
    const seenChild = new Set<string>();
    const seenFamily = new Set<string>();

    maternalRows.forEach((r) => {
      if (r.motherName && !seenMother.has(r.motherName)) {
        seenMother.add(r.motherName);
        items.push({
          id: `maternal-${r.id}`,
          title: r.motherName,
          subtitle: `NIK: ${r.motherNik || '-'} • Kehamilan & Persalinan`,
          category: 'Ibu Hamil',
          icon: Icons.user,
          queryValue: r.motherName
        });
      }
    });

    immunizationRows.forEach((r) => {
      if (r.childName && !seenChild.has(r.childName)) {
        seenChild.add(r.childName);
        items.push({
          id: `immunization-${r.id}`,
          title: r.childName,
          subtitle: `NIK: ${r.childNik || '-'} • Imunisasi Anak`,
          category: 'Anak',
          icon: Icons.user,
          queryValue: r.childName
        });
      }
    });

    familyMembers.forEach((m) => {
      if (m.fullName && !seenFamily.has(m.id)) {
        seenFamily.add(m.id);
        items.push({
          id: `family-${m.id}`,
          title: m.fullName,
          subtitle: `Hubungan: ${getRelationshipLabel(m.relationship)}`,
          category: 'Anggota Keluarga',
          icon: Icons.users,
          queryValue: m.fullName
        });
      }
    });

    return items;
  }, [maternalRows, immunizationRows, familyMembers]);

  const searchEngine = useStateSearchEngine({
    query: search,
    onQueryChange: setSearch,
    id: 'klinik-clinical-history',
    title: 'Pencarian Riwayat Medis',
    description: 'Cari riwayat formulir kehamilan, imunisasi anak, NIK, atau nama keluarga',
    placeholder:
      activeTab === CLINICAL_HISTORY_TAB.MATERNITY
        ? 'Ketik nama ibu atau NIK...'
        : 'Ketik nama anak atau NIK...',
    indexItems
  });

  const resetAllFilters = useCallback(() => {
    searchEngine.clearQuery();
    setSearch('');
    setPatientId('');
    onReset?.();
  }, [searchEngine, setSearch, setPatientId, onReset]);

  return {
    facetGroups,
    activeFilterCount,
    isFiltered,
    searchEngine,
    resetAllFilters
  };
}

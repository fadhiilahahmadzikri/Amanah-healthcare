import type { SearchEngineResultItem } from '@/components/search-engine';
import {
  Building2,
  DoorOpen,
  Folder,
  HelpCircle,
  Layers,
  Stethoscope,
  Users
} from 'lucide-react';
import type {
  ClinicFacilityItem,
  ClinicService,
  FacilityResource,
  FacilityRoom,
  FacilityUnit,
  FacilityUnitType,
  PatientRelationshipTypeItem,
  ServiceCategory,
  SupportFaqItem
} from '../types/clinic-essentials.types';

export interface BuildSearchIndexParams {
  unitTypes: FacilityUnitType[];
  units: FacilityUnit[];
  rooms: FacilityRoom[];
  categories: ServiceCategory[];
  services: ClinicService[];
  relationships: PatientRelationshipTypeItem[];
  facilities?: ClinicFacilityItem[];
  faqs?: SupportFaqItem[];
  setActiveTab: (tab: FacilityResource) => void;
  setSearchQuery: (query: string) => void;
}

export function buildClinicEssentialsSearchIndex({
  unitTypes,
  units,
  rooms,
  categories,
  services,
  relationships,
  facilities = [],
  faqs = [],
  setActiveTab,
  setSearchQuery
}: BuildSearchIndexParams): SearchEngineResultItem[] {
  const items: SearchEngineResultItem[] = [];

  (Array.isArray(unitTypes) ? unitTypes : []).forEach((ut) => {
    items.push({
      id: `unit-type-${ut.id}`,
      title: ut.name,
      subtitle: 'Klasifikasi Tipe Unit',
      category: 'Tipe Unit',
      icon: Layers,
      queryValue: ut.name,
      onSelect: () => {
        setActiveTab('unit-types');
        setSearchQuery(ut.name);
      }
    });
  });

  (Array.isArray(units) ? units : []).forEach((u) => {
    items.push({
      id: `unit-${u.id}`,
      title: u.name,
      subtitle: u.location ? `Unit Poliklinik • ${u.location}` : 'Unit Poliklinik',
      category: 'Unit Poliklinik',
      icon: Building2,
      queryValue: u.name,
      onSelect: () => {
        setActiveTab('units');
        setSearchQuery(u.name);
      }
    });
  });

  (Array.isArray(rooms) ? rooms : []).forEach((r) => {
    const parentUnit = units.find((u) => u.id === r.unitId);
    const parentName = r.unitName || parentUnit?.name;
    items.push({
      id: `room-${r.id}`,
      title: r.name,
      subtitle: parentName ? `Ruang Periksa • ${parentName}` : 'Ruang Periksa',
      category: 'Ruang Periksa',
      icon: DoorOpen,
      queryValue: r.name,
      onSelect: () => {
        setActiveTab('rooms');
        setSearchQuery(r.name);
      }
    });
  });

  (Array.isArray(categories) ? categories : []).forEach((c) => {
    const parentUnit = units.find((u) => u.id === c.unitId);
    const parentName = c.unitName || parentUnit?.name;
    items.push({
      id: `cat-${c.id}`,
      title: c.name,
      subtitle: parentName ? `Kelompok Layanan • ${parentName}` : 'Kelompok Layanan',
      category: 'Kategori Layanan',
      icon: Folder,
      queryValue: c.name,
      onSelect: () => {
        setActiveTab('categories');
        setSearchQuery(c.name);
      }
    });
  });

  (Array.isArray(services) ? services : []).forEach((s) => {
    const parentCat = categories.find((c) => c.id === s.serviceCategoryId);
    const parentName = s.categoryName || parentCat?.name;
    items.push({
      id: `svc-${s.id}`,
      title: s.name,
      subtitle: parentName ? `Layanan Medis • ${parentName}` : 'Layanan Medis',
      category: 'Layanan Medis',
      icon: Stethoscope,
      queryValue: `${s.name} ${s.shortName || ''}`,
      onSelect: () => {
        setActiveTab('services');
        setSearchQuery(s.name);
      }
    });
  });

  (Array.isArray(facilities) ? facilities : []).forEach((f) => {
    items.push({
      id: `facility-${f.id}`,
      title: f.title,
      subtitle: f.serviceName ? `Fasilitas Unggulan • ${f.serviceName}` : 'Fasilitas Unggulan',
      category: 'Fasilitas Unggulan',
      icon: Building2,
      queryValue: `${f.title} ${f.slug}`,
      onSelect: () => {
        setActiveTab('facilities');
        setSearchQuery(f.title);
      }
    });
  });

  (Array.isArray(faqs) ? faqs : []).forEach((faq) => {
    items.push({
      id: `faq-${faq.id}`,
      title: faq.title,
      subtitle: `FAQ • ${faq.category.toUpperCase()}`,
      category: 'FAQ Landing Page',
      icon: HelpCircle,
      queryValue: `${faq.title} ${faq.category}`,
      onSelect: () => {
        setActiveTab('faqs');
        setSearchQuery(faq.title);
      }
    });
  });

  (Array.isArray(relationships) ? relationships : []).forEach((rel) => {
    items.push({
      id: `rel-${rel.id}`,
      title: rel.name,
      subtitle: `Relasi Pasien • ${rel.code}`,
      category: 'Relasi Pasien',
      icon: Users,
      queryValue: `${rel.name} ${rel.code}`,
      onSelect: () => {
        setActiveTab('relationships');
        setSearchQuery(rel.name);
      }
    });
  });

  return items;
}

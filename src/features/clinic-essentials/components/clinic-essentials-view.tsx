'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, HelpCircle, Lock, Megaphone } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SideTray, SideTrayLayout, type SideTrayItem } from '@/components/ui/side-tray';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';
import { useSidebar } from '@/components/ui/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { SearchEngineDialog, useStateSearchEngine } from '@/components/search-engine';
import { cn } from '@/lib/utils';
import { getEssentialFirstIcon, renderEssentialIcon } from '../utils/essential-icon-resolver';
import type {
  ClinicFacilityItem,
  CreateClinicFacilityPayload,
  CreateSupportFaqPayload,
  DemographicMasterItem,
  FacilityResource,
  SupportFaqItem,
  UpdateClinicFacilityPayload,
  UpdateSupportFaqPayload,
} from '../types/clinic-essentials.types';
import type {
  ClinicEssentialEditItem,
  ClinicEssentialEntityType,
} from '../model/useClinicEssentialFormModal';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';

// Hooks
import { useClinicEssentialsData } from '../hooks/useClinicEssentialsData';
import { useClinicEssentialsBulkActions } from '../hooks/useClinicEssentialsBulkActions';
import { useClinicEssentialsMutations } from '../hooks/useClinicEssentialsMutations';

// Layout Sub-components
import { ClinicEssentialsHeader } from './layout/clinic-essentials-header';
import { ClinicEssentialsFloatingBulkBar } from './layout/clinic-essentials-floating-bulk-bar';
import { ClinicEssentialsDeleteDialogs } from './layout/clinic-essentials-delete-dialogs';
import { ClinicEssentialsModals } from './layout/clinic-essentials-modals';

// Dialogs
import { FacilityFormDialog } from './dialogs/facility-form-dialog';
import { FaqFormDialog } from './dialogs/faq-form-dialog';

// Atomic Tab Components
import { UnitTypesTab } from './tabs/unit-types-tab';
import { UnitsTab } from './tabs/units-tab';
import { RoomsTab } from './tabs/rooms-tab';
import { CategoriesTab } from './tabs/categories-tab';
import { ServicesTab } from './tabs/services-tab';
import { RelationshipsTab } from './tabs/relationships-tab';
import { DemographicMasterTab } from './tabs/demographic-master-tab';
import { FacilitiesTab } from './tabs/facilities-tab';
import { FaqsTab } from './tabs/faqs-tab';
import { PromotionsManagementTab } from '@/features/promotions';

export function ClinicEssentialsView() {
  const { can } = useAuthContext();
  const canManage = can(PERMISSIONS.CLINICS.MANAGE);

  // Active Tab state
  const [activeTab, setActiveTab] = React.useState<FacilityResource>('units');
  const [isTrayActive, setIsTrayActive] = React.useState(false);

  // Responsive compact state
  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === 'expanded';
  const { isOpen: isUnder1024 } = useMediaQuery('(max-width: 1024px)');
  const { isOpen: isUnder1280 } = useMediaQuery('(max-width: 1280px)');
  const isCompact = isUnder1024 || (isUnder1280 && isSidebarExpanded);

  // Unified Stepped Modal state (Add & Edit across facility entities)
  const [activeModal, setActiveModal] = React.useState<{
    type: ClinicEssentialEntityType;
    editItem?: ClinicEssentialEditItem | null;
  } | null>(null);

  const queryClient = useQueryClient();

  // Facility Form Dialog state
  const [facilityModal, setFacilityModal] = React.useState<{
    open: boolean;
    editItem?: ClinicFacilityItem | null;
  }>({
    open: false,
    editItem: null,
  });

  // FAQ Form Dialog state
  const [faqModal, setFaqModal] = React.useState<{
    open: boolean;
    editItem?: SupportFaqItem | null;
  }>({
    open: false,
    editItem: null,
  });

  // Selected IDs for detail modals
  const [viewingUnitId, setViewingUnitId] = React.useState<string | null>(null);
  const [viewingCategoryId, setViewingCategoryId] = React.useState<string | null>(null);

  // Demographic Master Dialog state (Blood Types, Education, Religion, Occupation)
  const [demographicModal, setDemographicModal] = React.useState<{
    open: boolean;
    type: 'blood-types' | 'education-levels' | 'religions' | 'occupations';
    label: string;
    editItem?: DemographicMasterItem | null;
  }>({
    open: false,
    type: 'blood-types',
    label: 'Golongan Darah',
    editItem: null,
  });

  // Orchestrated Data Hook
  const {
    unitTypes,
    units,
    rooms,
    categories,
    services,
    facilities,
    faqs,
    promotions,
    forms,
    relationships,
    bloodTypes,
    educationLevels,
    religions,
    occupations,
    isLoadingUnitTypes,
    isLoadingUnits,
    isLoadingRooms,
    isLoadingCategories,
    isLoadingServices,
    isLoadingFacilities,
    isLoadingFaqs,
    isLoadingPromotions,
    isLoadingRelationships,
    isLoadingBloodTypes,
    isLoadingEducationLevels,
    isLoadingReligions,
    isLoadingOccupations,
    filteredUnitTypes,
    filteredUnits,
    filteredRooms,
    filteredCategories,
    filteredServices,
    filteredFacilities,
    filteredFaqs,
    filteredPromotions,
    filteredRelationships,
    filteredBloodTypes,
    filteredEducationLevels,
    filteredReligions,
    filteredOccupations,
    isUnitsLocked,
    isRoomsLocked,
    isCategoriesLocked,
    isServicesLocked,
    searchQuery,
    setSearchQuery,
    statusFilter,
    isFiltered,
    activeFilterCount,
    handleResetAll,
    effectiveFacetGroups,
    indexItems,
    isAnyRefetching,
    handleRefreshAll,
  } = useClinicEssentialsData(activeTab, setActiveTab, isCompact);

  // Current tab items computation for bulk select
  const currentTabItems = React.useMemo(() => {
    switch (activeTab) {
      case 'unit-types':
        return filteredUnitTypes;
      case 'units':
        return filteredUnits;
      case 'rooms':
        return filteredRooms;
      case 'categories':
        return filteredCategories;
      case 'services':
        return filteredServices;
      case 'facilities':
        return filteredFacilities;
      case 'faqs':
        return filteredFaqs;
      case 'promotions':
        return filteredPromotions;
      case 'relationships':
        return filteredRelationships;
      case 'blood-types':
        return filteredBloodTypes;
      case 'education-levels':
        return filteredEducationLevels;
      case 'religions':
        return filteredReligions;
      case 'occupations':
        return filteredOccupations;
      default:
        return [];
    }
  }, [
    activeTab,
    filteredUnitTypes,
    filteredUnits,
    filteredRooms,
    filteredCategories,
    filteredServices,
    filteredFacilities,
    filteredFaqs,
    filteredPromotions,
    filteredRelationships,
    filteredBloodTypes,
    filteredEducationLevels,
    filteredReligions,
    filteredOccupations,
  ]);

  // Orchestrated Bulk Actions Hook
  const {
    selectedIds,
    setSelectedIds,
    isBulkDeleteConfirmOpen,
    setIsBulkDeleteConfirmOpen,
    bulkMutation,
    isAllSelected,
    handleSelectAll,
    handleToggleSelect,
  } = useClinicEssentialsBulkActions(activeTab, currentTabItems);

  // Orchestrated Mutations Hook
  const {
    deletingItem,
    setDeletingItem,
    deleteMutation,
    toggleActiveMutation,
    setDefaultRelationshipMutation,
    isMutating,
  } = useClinicEssentialsMutations();

  const isPerformingAction = isMutating || bulkMutation.isPending;

  // Search Engine Dialog
  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: setSearchQuery,
    id: 'clinic-essentials-search',
    placeholder: 'Pencarian Fasilitas...',
    indexItems,
  });

  // Tray Items
  const trayItems = React.useMemo<SideTrayItem<FacilityResource>[]>(
    () => [
      {
        key: 'unit-types',
        label: 'Klasifikasi Fasilitas',
        icon: renderEssentialIcon(getEssentialFirstIcon('unit-types', { unitTypes })),
        count: filteredUnitTypes.length,
        description: 'Tipe kategori bangunan & operasional',
      },
      {
        key: 'units',
        label: 'Poliklinik & Departemen',
        icon: isUnitsLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('units', { units }))
        ),
        count: filteredUnits.length,
        description: isUnitsLocked
          ? 'Terkunci: Tambah klasifikasi terlebih dahulu'
          : 'Instalasi & unit pelayanan medis',
        disabled: isUnitsLocked,
      },
      {
        key: 'rooms',
        label: 'Ruang Periksa',
        icon: isRoomsLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('rooms', { rooms, units }))
        ),
        count: filteredRooms.length,
        description: isRoomsLocked
          ? 'Terkunci: Tambah poliklinik terlebih dahulu'
          : 'Kamar konsultasi & pemeriksaan fisik',
        disabled: isRoomsLocked,
      },
      {
        key: 'categories',
        label: 'Kelompok Layanan',
        icon: isCategoriesLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('categories', { categories }))
        ),
        count: filteredCategories.length,
        description: isCategoriesLocked
          ? 'Terkunci: Tambah poliklinik terlebih dahulu'
          : 'Rumpun klasifikasi tarif & paket',
        disabled: isCategoriesLocked,
      },
      {
        key: 'services',
        label: 'Service Medis',
        icon: isServicesLocked ? (
          <Lock className='size-4 text-muted-foreground' />
        ) : (
          renderEssentialIcon(getEssentialFirstIcon('services', { services }))
        ),
        count: filteredServices.length,
        description: isServicesLocked
          ? 'Terkunci: Tambah kelompok layanan terlebih dahulu'
          : 'Daftar prosedur & layanan medis',
        disabled: isServicesLocked,
      },
      {
        key: 'facilities',
        label: 'Fasilitas Unggulan',
        icon: <Building2 className='size-4 text-blue-600' />,
        count: filteredFacilities.length,
        description: 'Carousel fasilitas & kenyamanan landing page',
      },
      {
        key: 'faqs',
        label: 'FAQ Landing Page',
        icon: <HelpCircle className='size-4 text-purple-600' />,
        count: filteredFaqs.length,
        description: 'Pertanyaan umum & informasi landing page',
      },
      {
        key: 'promotions',
        label: 'Promo & Pengumuman',
        icon: <Megaphone className='size-4 text-emerald-600' />,
        count: filteredPromotions.length,
        description: 'Banner pengumuman, popup modal & penawaran',
      },
      {
        key: 'relationships',
        label: 'Relasi Pasien',
        icon: renderEssentialIcon(getEssentialFirstIcon('relationships', { relationships })),
        count: filteredRelationships.length,
        description: 'Profil berobat & relasi keluarga',
      },
      {
        key: 'blood-types',
        label: 'Golongan Darah',
        icon: renderEssentialIcon(getEssentialFirstIcon('blood-types', {})),
        description: 'Master simbol golongan darah',
      },
      {
        key: 'education-levels',
        label: 'Pendidikan',
        icon: renderEssentialIcon(getEssentialFirstIcon('education-levels', {})),
        description: 'Jenjang pendidikan formal',
      },
      {
        key: 'religions',
        label: 'Agama',
        icon: renderEssentialIcon(getEssentialFirstIcon('religions', {})),
        description: 'Master data agama resmi',
      },
      {
        key: 'occupations',
        label: 'Pekerjaan',
        icon: renderEssentialIcon(getEssentialFirstIcon('occupations', {})),
        description: 'Daftar profesi & pekerjaan',
      },
    ],
    [
      unitTypes,
      units,
      rooms,
      categories,
      services,
      forms,
      relationships,
      isUnitsLocked,
      isRoomsLocked,
      isCategoriesLocked,
      isServicesLocked,
      filteredUnitTypes.length,
      filteredUnits.length,
      filteredRooms.length,
      filteredCategories.length,
      filteredServices.length,
      filteredFacilities.length,
      filteredFaqs.length,
      filteredPromotions.length,
      filteredRelationships.length,
    ]
  );

  const cardGridClassName = cn(
    'grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 transition-all duration-300',
    isTrayActive
      ? 'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3'
      : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4'
  );

  return (
    <div className='flex flex-1 min-h-0 flex-col gap-3 font-sans h-full overflow-hidden select-none'>
      {/* Centralized Search Engine Dialog */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Header Toolbar */}
      <ClinicEssentialsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchDialog={searchEngine.open}
        facets={effectiveFacetGroups}
        isFiltered={isFiltered}
        onResetAll={handleResetAll}
        activeFilterCount={activeFilterCount}
        isCompact={isCompact}
        canManage={canManage}
        hasTabItems={currentTabItems.length > 0}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onRefreshAll={handleRefreshAll}
        isAnyRefetching={isAnyRefetching}
        isPerformingAction={isPerformingAction}
        activeTab={activeTab}
        unitsCount={units.length}
        categoriesCount={categories.length}
        onOpenModal={(type) => setActiveModal({ type, editItem: null })}
        onOpenDemographicModal={(type, label) =>
          setDemographicModal({ open: true, type, label, editItem: null })
        }
        onOpenFacilityModal={() => setFacilityModal({ open: true, editItem: null })}
        onOpenFaqModal={() => setFaqModal({ open: true, editItem: null })}
      />

      {/* Tabs Layout with Master SideTray Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as FacilityResource);
          setSelectedIds([]);
        }}
        className='flex flex-1 min-h-0 flex-col w-full m-0'
      >
        <SideTrayLayout
          tray={
            <SideTray
              items={trayItems}
              activeKey={activeTab}
              onSelect={(val) => {
                setActiveTab(val);
                setSelectedIds([]);
              }}
              title='Bagian Fasilitas'
              isExpanded={isTrayActive}
              onExpandedChange={setIsTrayActive}
            />
          }
          className='flex-1 min-h-0 h-full'
        >
          {/* 0. Tab Unit Types */}
          <TabsContent value='unit-types' className='mt-0'>
            <UnitTypesTab
              unitTypes={filteredUnitTypes}
              totalCount={unitTypes.length}
              isLoading={isLoadingUnitTypes}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'unit-types', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'unit-types'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onEdit={(item) => setActiveModal({ type: 'unit-type', editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'unit-types', id: item.id, name: item.name })
              }
              onOpenCreate={() => setActiveModal({ type: 'unit-type', editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 1. Tab Units */}
          <TabsContent value='units' className='mt-0'>
            <UnitsTab
              units={filteredUnits}
              totalCount={units.length}
              isLoading={isLoadingUnits}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'units', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'units'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onCardClick={(item) => setViewingUnitId(item.id)}
              onEdit={(item) => setActiveModal({ type: 'unit', editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'units', id: item.id, name: item.name })
              }
              onOpenCreate={() => setActiveModal({ type: 'unit', editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 2. Tab Rooms */}
          <TabsContent value='rooms' className='mt-0'>
            <RoomsTab
              rooms={filteredRooms}
              totalCount={rooms.length}
              units={units}
              isLoading={isLoadingRooms}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'rooms', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'rooms'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onEdit={(item) => setActiveModal({ type: 'room', editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'rooms', id: item.id, name: item.name })
              }
              onOpenCreate={() => setActiveModal({ type: 'room', editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 3. Tab Categories */}
          <TabsContent value='categories' className='mt-0'>
            <CategoriesTab
              categories={filteredCategories}
              totalCount={categories.length}
              units={units}
              isLoading={isLoadingCategories}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'categories', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'categories'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onCardClick={(item) => setViewingCategoryId(item.id)}
              onEdit={(item) => setActiveModal({ type: 'category', editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'categories', id: item.id, name: item.name })
              }
              onOpenCreate={() => setActiveModal({ type: 'category', editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 4. Tab Services */}
          <TabsContent value='services' className='mt-0'>
            <ServicesTab
              services={filteredServices}
              totalCount={services.length}
              categories={categories}
              forms={forms}
              isLoading={isLoadingServices}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'services', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'services'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onEdit={(item) => setActiveModal({ type: 'service', editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'services', id: item.id, name: item.name })
              }
              onOpenCreate={() => setActiveModal({ type: 'service', editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 4.1. Tab Facilities (Carousel Unggulan) */}
          <TabsContent value='facilities' className='mt-0'>
            <FacilitiesTab
              facilities={filteredFacilities}
              totalCount={facilities.length}
              isLoading={isLoadingFacilities}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'facilities', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'facilities'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onEdit={(item) => setFacilityModal({ open: true, editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'facilities', id: item.id, name: item.title })
              }
              onOpenCreate={() => setFacilityModal({ open: true, editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 4.2. Tab FAQs (Akordeon FAQ Landing Page) */}
          <TabsContent value='faqs' className='mt-0'>
            <FaqsTab
              faqs={filteredFaqs}
              totalCount={faqs.length}
              isLoading={isLoadingFaqs}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'faqs', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'faqs'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onEdit={(item) => setFaqModal({ open: true, editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'faqs', id: item.id, name: item.title })
              }
              onOpenCreate={() => setFaqModal({ open: true, editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 4.5. Tab Promotions */}
          <TabsContent value='promotions' className='mt-0'>
            <PromotionsManagementTab
              services={services}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'promotions', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'promotions'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onDelete={(promo) =>
                setDeletingItem({ type: 'promotions', id: promo.id, name: promo.title })
              }
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 5. Tab Relationships */}
          <TabsContent value='relationships' className='mt-0'>
            <RelationshipsTab
              relationships={filteredRelationships}
              totalCount={relationships.length}
              isLoading={isLoadingRelationships}
              canManage={canManage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'relationships', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.resource === 'relationships'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onSetDefault={(item) => setDefaultRelationshipMutation.mutate(item.id)}
              isSettingDefaultId={
                setDefaultRelationshipMutation.isPending
                  ? setDefaultRelationshipMutation.variables
                  : null
              }
              onEdit={(item) => setActiveModal({ type: 'relationship', editItem: item })}
              onDelete={(item) =>
                setDeletingItem({ type: 'relationships', id: item.id, name: item.name })
              }
              onOpenCreate={() => setActiveModal({ type: 'relationship', editItem: null })}
              onResetFilter={handleResetAll}
              cardGridClassName={cardGridClassName}
            />
          </TabsContent>

          {/* 7. Tab Blood Types */}
          <TabsContent value='blood-types' className='mt-0'>
            <DemographicMasterTab
              resourceType='blood-types'
              resourceLabel='Golongan Darah'
              iconName='droplet'
              canManage={canManage}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              cardGridClassName={cardGridClassName}
              items={filteredBloodTypes}
              isLoading={isLoadingBloodTypes}
              selectedIds={selectedIds}
              isBulkingActive={selectedIds.length > 0}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'blood-types', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.variables?.resource === 'blood-types'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onOpenCreate={() =>
                setDemographicModal({
                  open: true,
                  type: 'blood-types',
                  label: 'Golongan Darah',
                  editItem: null,
                })
              }
              onOpenEdit={(item) =>
                setDemographicModal({
                  open: true,
                  type: 'blood-types',
                  label: 'Golongan Darah',
                  editItem: item,
                })
              }
              onDelete={(item) =>
                setDeletingItem({ type: 'blood-types', id: item.id, name: item.name })
              }
            />
          </TabsContent>

          {/* 8. Tab Education Levels */}
          <TabsContent value='education-levels' className='mt-0'>
            <DemographicMasterTab
              resourceType='education-levels'
              resourceLabel='Pendidikan'
              iconName='graduation-cap'
              canManage={canManage}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              cardGridClassName={cardGridClassName}
              items={filteredEducationLevels}
              isLoading={isLoadingEducationLevels}
              selectedIds={selectedIds}
              isBulkingActive={selectedIds.length > 0}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'education-levels', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.variables?.resource === 'education-levels'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onOpenCreate={() =>
                setDemographicModal({
                  open: true,
                  type: 'education-levels',
                  label: 'Pendidikan',
                  editItem: null,
                })
              }
              onOpenEdit={(item) =>
                setDemographicModal({
                  open: true,
                  type: 'education-levels',
                  label: 'Pendidikan',
                  editItem: item,
                })
              }
              onDelete={(item) =>
                setDeletingItem({ type: 'education-levels', id: item.id, name: item.name })
              }
            />
          </TabsContent>

          {/* 9. Tab Religions */}
          <TabsContent value='religions' className='mt-0'>
            <DemographicMasterTab
              resourceType='religions'
              resourceLabel='Agama'
              iconName='bookmark'
              canManage={canManage}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              cardGridClassName={cardGridClassName}
              items={filteredReligions}
              isLoading={isLoadingReligions}
              selectedIds={selectedIds}
              isBulkingActive={selectedIds.length > 0}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'religions', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.variables?.resource === 'religions'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onOpenCreate={() =>
                setDemographicModal({
                  open: true,
                  type: 'religions',
                  label: 'Agama',
                  editItem: null,
                })
              }
              onOpenEdit={(item) =>
                setDemographicModal({
                  open: true,
                  type: 'religions',
                  label: 'Agama',
                  editItem: item,
                })
              }
              onDelete={(item) =>
                setDeletingItem({ type: 'religions', id: item.id, name: item.name })
              }
            />
          </TabsContent>

          {/* 10. Tab Occupations */}
          <TabsContent value='occupations' className='mt-0'>
            <DemographicMasterTab
              resourceType='occupations'
              resourceLabel='Pekerjaan'
              iconName='briefcase'
              canManage={canManage}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              cardGridClassName={cardGridClassName}
              items={filteredOccupations}
              isLoading={isLoadingOccupations}
              selectedIds={selectedIds}
              isBulkingActive={selectedIds.length > 0}
              onToggleSelect={handleToggleSelect}
              onToggleActive={(id, newActive) =>
                toggleActiveMutation.mutate({ resource: 'occupations', id, isActive: newActive })
              }
              isTogglingActiveId={
                toggleActiveMutation.variables?.resource === 'occupations'
                  ? toggleActiveMutation.variables.id
                  : null
              }
              onOpenCreate={() =>
                setDemographicModal({
                  open: true,
                  type: 'occupations',
                  label: 'Pekerjaan',
                  editItem: null,
                })
              }
              onOpenEdit={(item) =>
                setDemographicModal({
                  open: true,
                  type: 'occupations',
                  label: 'Pekerjaan',
                  editItem: item,
                })
              }
              onDelete={(item) =>
                setDeletingItem({ type: 'occupations', id: item.id, name: item.name })
              }
            />
          </TabsContent>
        </SideTrayLayout>
      </Tabs>

      {/* Floating Bulk Action Toolbar */}
      <ClinicEssentialsFloatingBulkBar
        selectedCount={selectedIds.length}
        canManage={canManage}
        onActivate={() =>
          bulkMutation.mutate({ resource: activeTab, action: 'activate', ids: selectedIds })
        }
        onDeactivate={() =>
          bulkMutation.mutate({ resource: activeTab, action: 'deactivate', ids: selectedIds })
        }
        onDelete={() => setIsBulkDeleteConfirmOpen(true)}
        onCancel={() => setSelectedIds([])}
        isPending={bulkMutation.isPending}
      />

      {/* Modals & Dialog Orchestrator */}
      <ClinicEssentialsModals
        canManage={canManage}
        unitTypes={unitTypes}
        units={units}
        rooms={rooms}
        categories={categories}
        services={services}
        forms={forms}
        activeModal={activeModal}
        onCloseActiveModal={() => setActiveModal(null)}
        viewingUnitId={viewingUnitId}
        onCloseViewingUnit={() => setViewingUnitId(null)}
        viewingCategoryId={viewingCategoryId}
        onCloseViewingCategory={() => setViewingCategoryId(null)}
        onOpenModal={(type, editItem) => setActiveModal({ type, editItem })}
        onOpenDelete={(type, id, name) => setDeletingItem({ type, id, name })}
        onToggleActive={(resource, id, isActive) =>
          toggleActiveMutation.mutate({ resource, id, isActive })
        }
        isTogglingActive={toggleActiveMutation.isPending}
        demographicModal={demographicModal}
        onCloseDemographicModal={() =>
          setDemographicModal((prev) => ({ ...prev, open: false, editItem: null }))
        }
      />

      {/* Facility Form Dialog */}
      <FacilityFormDialog
        open={facilityModal.open}
        onOpenChange={(open) => !open && setFacilityModal({ open: false, editItem: null })}
        editItem={facilityModal.editItem}
        services={services}
        onSubmit={async (payload, id) => {
          if (id) {
            await clinicEssentialsApi.updateFacility(id, payload as UpdateClinicFacilityPayload);
          } else {
            await clinicEssentialsApi.createFacility(payload as CreateClinicFacilityPayload);
          }
          queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
        }}
      />

      {/* FAQ Form Dialog */}
      <FaqFormDialog
        open={faqModal.open}
        onOpenChange={(open) => !open && setFaqModal({ open: false, editItem: null })}
        editItem={faqModal.editItem}
        services={services}
        categories={categories}
        onSubmit={async (payload, id) => {
          if (id) {
            await clinicEssentialsApi.updateFaq(id, payload as UpdateSupportFaqPayload);
          } else {
            await clinicEssentialsApi.createFaq(payload as CreateSupportFaqPayload);
          }
          queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
        }}
      />

      {/* Deletion Confirmation Dialogs */}
      <ClinicEssentialsDeleteDialogs
        deletingItem={deletingItem}
        onCloseSingleDelete={() => setDeletingItem(null)}
        onConfirmSingleDelete={() => deletingItem && deleteMutation.mutate(deletingItem)}
        isSingleDeletePending={deleteMutation.isPending}
        isBulkDeleteOpen={isBulkDeleteConfirmOpen}
        onCloseBulkDelete={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirmBulkDelete={() =>
          bulkMutation.mutate({
            resource: activeTab,
            action: 'delete',
            ids: selectedIds,
          })
        }
        isBulkDeletePending={bulkMutation.isPending}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}

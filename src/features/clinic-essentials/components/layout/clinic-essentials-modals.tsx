'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ClinicEssentialFormModal } from '../clinic-essential-form-modal';
import { UnitCategoriesDialog } from '../dialogs/unit-categories-dialog';
import { CategoryServicesDialog } from '../dialogs/category-services-dialog';
import { DemographicMasterDialog } from '../dialogs/demographic-master-dialog';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type {
  ClinicService,
  ClinicalIntakeForm,
  DemographicMasterItem,
  FacilityResource,
  FacilityRoom,
  FacilityUnit,
  FacilityUnitType,
  ServiceCategory,
} from '../../types/clinic-essentials.types';
import type {
  ClinicEssentialEditItem,
  ClinicEssentialEntityType,
} from '../../model/useClinicEssentialFormModal';

export interface ClinicEssentialsModalsProps {
  canManage: boolean;
  unitTypes: FacilityUnitType[];
  units: FacilityUnit[];
  rooms: FacilityRoom[];
  categories: ServiceCategory[];
  services: ClinicService[];
  forms: ClinicalIntakeForm[];
  activeModal: {
    type: ClinicEssentialEntityType;
    editItem?: ClinicEssentialEditItem | null;
  } | null;
  onCloseActiveModal: () => void;
  viewingUnitId: string | null;
  onCloseViewingUnit: () => void;
  viewingCategoryId: string | null;
  onCloseViewingCategory: () => void;
  onOpenModal: (type: ClinicEssentialEntityType, editItem?: ClinicEssentialEditItem | null) => void;
  onOpenDelete: (type: FacilityResource, id: string, name: string) => void;
  onToggleActive: (resource: FacilityResource, id: string, isActive: boolean) => void;
  isTogglingActive: boolean;
  demographicModal: {
    open: boolean;
    type: 'blood-types' | 'education-levels' | 'religions' | 'occupations';
    label: string;
    editItem?: DemographicMasterItem | null;
  };
  onCloseDemographicModal: () => void;
}

export function ClinicEssentialsModals({
  canManage,
  unitTypes,
  units,
  categories,
  services,
  forms,
  activeModal,
  onCloseActiveModal,
  viewingUnitId,
  onCloseViewingUnit,
  viewingCategoryId,
  onCloseViewingCategory,
  onOpenModal,
  onOpenDelete,
  onToggleActive,
  isTogglingActive,
  demographicModal,
  onCloseDemographicModal,
}: ClinicEssentialsModalsProps) {
  const queryClient = useQueryClient();

  const viewingUnit = React.useMemo(() => {
    if (!viewingUnitId) return null;
    return units.find((u) => u.id === viewingUnitId) ?? null;
  }, [units, viewingUnitId]);

  const viewingCategory = React.useMemo(() => {
    if (!viewingCategoryId) return null;
    return categories.find((c) => c.id === viewingCategoryId) ?? null;
  }, [categories, viewingCategoryId]);

  return (
    <>
      {/* Unified Stepped Modal (Handles Add & Edit for facility entities) */}
      {activeModal && (
        <ClinicEssentialFormModal
          open={Boolean(activeModal)}
          onOpenChange={(open) => !open && onCloseActiveModal()}
          type={activeModal.type}
          editItem={activeModal.editItem}
          unitTypes={unitTypes}
          units={units}
          categories={categories}
          forms={forms}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
          }}
        />
      )}

      {/* Unit Categories Detail Modal */}
      {viewingUnit && (
        <UnitCategoriesDialog
          unit={viewingUnit}
          open={Boolean(viewingUnit)}
          onOpenChange={(open) => {
            if (!open) onCloseViewingUnit();
          }}
          categories={categories}
          units={units}
          canManage={canManage}
          onEditCategory={(item) => onOpenModal('category', item)}
          onDeleteCategory={(item) => onOpenDelete('categories', item.id, item.name)}
          onToggleCategoryActive={(category, newActive) =>
            onToggleActive('categories', category.id, newActive)
          }
          isTogglingActive={isTogglingActive}
          onViewCategoryServices={(category) => {
            onCloseViewingUnit();
            onOpenModal('service', null);
          }}
        />
      )}

      {/* Category Services Detail Modal */}
      {viewingCategory && (
        <CategoryServicesDialog
          category={viewingCategory}
          open={Boolean(viewingCategory)}
          onOpenChange={(open) => {
            if (!open) onCloseViewingCategory();
          }}
          services={services}
          categories={categories}
          forms={forms}
          units={units}
          canManage={canManage}
          onAddServiceToCategory={(_cat) => {
            onCloseViewingCategory();
            onOpenModal('service', null);
          }}
          onEditService={(service) => {
            onCloseViewingCategory();
            onOpenModal('service', service);
          }}
          onDeleteService={(service) => {
            onOpenDelete('services', service.id, service.name);
          }}
          onToggleServiceActive={(service, newActive) => {
            onToggleActive('services', service.id, newActive);
          }}
          isTogglingActive={isTogglingActive}
        />
      )}

      {/* Demographic Master Dialog */}
      <DemographicMasterDialog
        open={demographicModal.open}
        onOpenChange={(open) => !open && onCloseDemographicModal()}
        resourceType={demographicModal.type}
        resourceLabel={demographicModal.label}
        editItem={demographicModal.editItem}
      />
    </>
  );
}

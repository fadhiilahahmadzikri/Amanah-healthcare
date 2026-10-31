'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import {
  useClinicEssentialFormModal,
  type ClinicEssentialEntityType
} from '../model/useClinicEssentialFormModal';
import {
  UnitIdentityStep,
  UnitClassificationStep,
  UnitLocationStep,
  RoomParentUnitStep,
  RoomIdentityStep,
  RoomLocationStep,
  CategoryIdentityStep,
  CategoryAffiliationStep,
  CategoryDescriptionStep,
  ServiceCategoryStep,
  ServiceIdentityStep,
  ServiceClinicalStep,
  FormIdentityStep,
  FormDescriptionStep
} from './form-steps';
import type {
  ClinicalIntakeForm,
  FacilityUnit,
  ServiceCategory
} from '../types/clinic-essentials.types';

export interface ClinicEssentialFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ClinicEssentialEntityType;
  units: FacilityUnit[];
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  onSuccess: () => void;
}

function getEntityMeta(type: ClinicEssentialEntityType) {
  switch (type) {
    case 'unit':
      return {
        title: 'Tambah Unit & Poliklinik',
        submitLabel: 'Simpan Unit'
      };
    case 'room':
      return {
        title: 'Tambah Ruang Periksa',
        submitLabel: 'Simpan Ruangan'
      };
    case 'category':
      return {
        title: 'Tambah Kategori Layanan',
        submitLabel: 'Simpan Kategori'
      };
    case 'service':
      return {
        title: 'Tambah Layanan Medis',
        submitLabel: 'Simpan Layanan'
      };
    case 'form':
      return {
        title: 'Tambah Formulir Intake',
        submitLabel: 'Simpan Formulir'
      };
  }
}

export function ClinicEssentialFormModal({
  open,
  onOpenChange,
  type,
  units,
  categories,
  forms,
  onSuccess
}: ClinicEssentialFormModalProps) {
  const { state, actions } = useClinicEssentialFormModal({
    type,
    units,
    categories,
    forms,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  const stepContentRef = React.useRef<HTMLDivElement>(null);
  const meta = getEntityMeta(type);

  // Smooth GSAP slide & fade on stage transition
  React.useEffect(() => {
    if (!stepContentRef.current) return;
    const direction = state.direction;

    gsap.fromTo(
      stepContentRef.current,
      { opacity: 0, y: direction === 'forward' ? 10 : -10 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
    );
  }, [state.currentStage, state.direction]);

  if (!open) return null;

  const handleClose = () => {
    actions.resetForm();
    onOpenChange(false);
  };

  const renderActiveStep = () => {
    switch (type) {
      case 'unit':
        if (state.currentStage === 1) {
          return (
            <UnitIdentityStep
              name={state.unitName}
              code={state.unitCode}
              iconName={state.unitIconName}
              onNameChange={actions.setUnitName}
              onCodeChange={actions.setUnitCode}
              onIconNameChange={actions.setUnitIconName}
              disabled={state.isSubmitting}
            />
          );
        }
        if (state.currentStage === 2) {
          return (
            <UnitClassificationStep
              unitType={state.unitType}
              queuePrefix={state.unitQueuePrefix}
              onUnitTypeChange={actions.setUnitType}
              onQueuePrefixChange={actions.setUnitQueuePrefix}
              disabled={state.isSubmitting}
            />
          );
        }
        return (
          <UnitLocationStep
            floor={state.unitFloor}
            location={state.unitLocation}
            onFloorChange={actions.setUnitFloor}
            onLocationChange={actions.setUnitLocation}
            disabled={state.isSubmitting}
          />
        );

      case 'room':
        if (state.currentStage === 1) {
          return (
            <RoomParentUnitStep
              unitId={state.roomUnitId}
              units={units}
              onUnitIdChange={actions.setRoomUnitId}
              disabled={state.isSubmitting}
            />
          );
        }
        if (state.currentStage === 2) {
          return (
            <RoomIdentityStep
              name={state.roomName}
              code={state.roomCode}
              onNameChange={actions.setRoomName}
              onCodeChange={actions.setRoomCode}
              disabled={state.isSubmitting}
            />
          );
        }
        return (
          <RoomLocationStep
            floor={state.roomFloor}
            location={state.roomLocation}
            onFloorChange={actions.setRoomFloor}
            onLocationChange={actions.setRoomLocation}
            disabled={state.isSubmitting}
          />
        );

      case 'category':
        if (state.currentStage === 1) {
          return (
            <CategoryIdentityStep
              name={state.categoryName}
              code={state.categoryCode}
              iconName={state.categoryIconName}
              onNameChange={actions.setCategoryName}
              onCodeChange={actions.setCategoryCode}
              onIconNameChange={actions.setCategoryIconName}
              disabled={state.isSubmitting}
            />
          );
        }
        if (state.currentStage === 2) {
          return (
            <CategoryAffiliationStep
              unitId={state.categoryUnitId}
              codePrefix={state.categoryCodePrefix}
              units={units}
              onUnitIdChange={actions.setCategoryUnitId}
              onCodePrefixChange={actions.setCategoryCodePrefix}
              disabled={state.isSubmitting}
            />
          );
        }
        return (
          <CategoryDescriptionStep
            description={state.categoryDescription}
            onDescriptionChange={actions.setCategoryDescription}
            disabled={state.isSubmitting}
          />
        );

      case 'service':
        if (state.currentStage === 1) {
          return (
            <ServiceCategoryStep
              categoryId={state.serviceCategoryId}
              intakeFormId={state.serviceIntakeFormId}
              categories={categories}
              forms={forms}
              onCategoryIdChange={actions.setServiceCategoryId}
              onIntakeFormIdChange={actions.setServiceIntakeFormId}
              disabled={state.isSubmitting}
            />
          );
        }
        if (state.currentStage === 2) {
          return (
            <ServiceIdentityStep
              name={state.serviceName}
              code={state.serviceCode}
              codePrefix={state.serviceCodePrefix}
              iconName={state.serviceIconName}
              onNameChange={actions.setServiceName}
              onCodeChange={actions.setServiceCode}
              onCodePrefixChange={actions.setServiceCodePrefix}
              onIconNameChange={actions.setServiceIconName}
              disabled={state.isSubmitting}
            />
          );
        }
        return (
          <ServiceClinicalStep
            complaintsRaw={state.serviceComplaintsRaw}
            description={state.serviceDescription}
            onComplaintsRawChange={actions.setServiceComplaintsRaw}
            onDescriptionChange={actions.setServiceDescription}
            disabled={state.isSubmitting}
          />
        );

      case 'form':
        if (state.currentStage === 1) {
          return (
            <FormIdentityStep
              name={state.formName}
              code={state.formCode}
              iconName={state.formIconName}
              onNameChange={actions.setFormName}
              onCodeChange={actions.setFormCode}
              onIconNameChange={actions.setFormIconName}
              disabled={state.isSubmitting}
            />
          );
        }
        return (
          <FormDescriptionStep
            description={state.formDescription}
            onDescriptionChange={actions.setFormDescription}
            disabled={state.isSubmitting}
          />
        );
    }
  };

  return (
    <ModalWrapper
      isOpen={open}
      onClose={handleClose}
      maxWidth='max-w-[500px] sm:max-w-[540px]'
      backdropClassName='overflow-hidden'
      className={cn(
        'flex flex-col h-auto max-h-[92dvh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl transition-[max-width] duration-300 ease-out max-w-[500px] sm:max-w-[540px]'
      )}
    >
      <h2 className='sr-only'>{meta.title}</h2>

      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        {/* Animated Active Stage Body */}
        <div ref={stepContentRef} className='pr-0.5 h-auto overflow-visible'>
          {renderActiveStep()}
        </div>

        {/* Footer Navigation */}
        <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40 mt-1'>
          <div>
            {state.currentStage === 1 ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={handleClose}
                disabled={state.isSubmitting}
              >
                Batal
              </Button>
            ) : (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                onClick={actions.handlePrevStage}
                disabled={state.isSubmitting}
              >
                Kembali
              </Button>
            )}
          </div>

          <div>
            {state.currentStage < state.maxStages ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={!state.isCurrentStageValid || state.isSubmitting}
                onClick={actions.handleNextStage}
                withTrailingCircleIcon
                className='min-w-[130px]'
                trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
              >
                Lanjut
              </Button>
            ) : (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={!state.isCurrentStageValid || state.isSubmitting}
                isLoading={state.isSubmitting}
                onClick={actions.handleSubmit}
                withTrailingCircleIcon
                className='min-w-[150px]'
                trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
              >
                {state.isSubmitting ? 'Menyimpan...' : meta.submitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

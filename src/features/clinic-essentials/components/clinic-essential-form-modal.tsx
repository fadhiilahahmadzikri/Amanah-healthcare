'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ChevronsLeft } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import {
  useClinicEssentialFormModal,
  type ClinicEssentialEditItem,
  type ClinicEssentialEntityType
} from '../model/useClinicEssentialFormModal';
import {
  UnitTypeIdentityStep,
  UnitTypeDetailsStep,
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
  FacilityUnitType,
  ServiceCategory
} from '../types/clinic-essentials.types';

export interface ClinicEssentialFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ClinicEssentialEntityType;
  unitTypes?: FacilityUnitType[];
  units: FacilityUnit[];
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  editItem?: ClinicEssentialEditItem | null;
  onSuccess: () => void;
}

function getEntityMeta(type: ClinicEssentialEntityType, isEditing: boolean) {
  switch (type) {
    case 'unit-type':
      return {
        title: isEditing ? 'Edit Klasifikasi Fasilitas' : 'Tambah Klasifikasi Fasilitas',
        submitLabel: isEditing ? 'Simpan Perubahan' : 'Simpan Klasifikasi'
      };
    case 'unit':
      return {
        title: isEditing ? 'Edit Poliklinik & Departemen' : 'Tambah Poliklinik & Departemen',
        submitLabel: isEditing ? 'Simpan Perubahan' : 'Simpan Poliklinik'
      };
    case 'room':
      return {
        title: isEditing ? 'Edit Ruang Periksa' : 'Tambah Ruang Periksa',
        submitLabel: isEditing ? 'Simpan Perubahan' : 'Simpan Ruangan'
      };
    case 'category':
      return {
        title: isEditing ? 'Edit Kelompok Layanan' : 'Tambah Kelompok Layanan',
        submitLabel: isEditing ? 'Simpan Perubahan' : 'Simpan Kelompok'
      };
    case 'service':
      return {
        title: isEditing ? 'Edit Service Medis' : 'Tambah Service Medis',
        submitLabel: isEditing ? 'Simpan Perubahan' : 'Simpan Service'
      };
    case 'form':
      return {
        title: isEditing ? 'Edit Formulir Pengkajian' : 'Tambah Formulir Pengkajian',
        submitLabel: isEditing ? 'Simpan Perubahan' : 'Simpan Formulir'
      };
  }
}

export function ClinicEssentialFormModal({
  open,
  onOpenChange,
  type,
  unitTypes = [],
  units,
  categories,
  forms,
  editItem,
  onSuccess
}: ClinicEssentialFormModalProps) {
  const { state, actions } = useClinicEssentialFormModal({
    type,
    unitTypes,
    units,
    categories,
    forms,
    editItem,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  const stepContentRef = React.useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = React.useState<'stepper' | 'expanded'>('stepper');
  const [isModeTrayHovered, setIsModeTrayHovered] = React.useState(false);
  const meta = getEntityMeta(type, state.isEditing);

  // Smooth GSAP slide & fade on stage transition
  React.useEffect(() => {
    if (!stepContentRef.current) return;
    const direction = state.direction;

    gsap.fromTo(
      stepContentRef.current,
      { opacity: 0.45, y: direction === 'forward' ? 8 : -8 },
      { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
    );
  }, [state.currentStage, state.direction]);

  if (!open) return null;

  const handleClose = () => {
    setViewMode('stepper');
    actions.resetForm();
    onOpenChange(false);
  };

  const renderActiveStep = () => {
    switch (type) {
      case 'unit-type':
        if (state.currentStage === 1) {
          return (
            <UnitTypeIdentityStep
              name={state.unitTypeName}
              iconName={state.unitTypeIconName}
              onNameChange={actions.setUnitTypeName}
              onIconNameChange={actions.setUnitTypeIconName}
              disabled={state.isSubmitting}
            />
          );
        }
        return (
          <UnitTypeDetailsStep
            description={state.unitTypeDescription}
            onDescriptionChange={actions.setUnitTypeDescription}
            isActive={state.unitTypeIsActive}
            onIsActiveChange={actions.setUnitTypeIsActive}
            isEditing={state.isEditing}
            disabled={state.isSubmitting}
          />
        );

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
              unitTypeId={state.unitTypeId}
              unitTypes={unitTypes}
              onUnitTypeIdChange={actions.setUnitTypeId}
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
            isActive={state.unitIsActive}
            onIsActiveChange={actions.setUnitIsActive}
            isEditing={state.isEditing}
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
            isActive={state.roomIsActive}
            onIsActiveChange={actions.setRoomIsActive}
            isEditing={state.isEditing}
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
              unitIds={state.categoryUnitIds}
              codePrefix={state.categoryCodePrefix}
              units={units}
              onUnitIdChange={actions.setCategoryUnitId}
              onUnitIdsChange={actions.setCategoryUnitIds}
              onCodePrefixChange={actions.setCategoryCodePrefix}
              disabled={state.isSubmitting}
            />
          );
        }
        return (
          <CategoryDescriptionStep
            description={state.categoryDescription}
            onDescriptionChange={actions.setCategoryDescription}
            isActive={state.categoryIsActive}
            onIsActiveChange={actions.setCategoryIsActive}
            isEditing={state.isEditing}
            disabled={state.isSubmitting}
          />
        );

      case 'service':
        if (state.currentStage === 1) {
          return (
            <ServiceCategoryStep
              categoryId={state.serviceCategoryId}
              categoryIds={state.serviceCategoryIds}
              intakeFormId={state.serviceIntakeFormId}
              categories={categories}
              forms={forms}
              onCategoryIdChange={actions.setServiceCategoryId}
              onCategoryIdsChange={actions.setServiceCategoryIds}
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
            isActive={state.serviceIsActive}
            onIsActiveChange={actions.setServiceIsActive}
            isEditing={state.isEditing}
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
            isActive={state.formIsActive}
            onIsActiveChange={actions.setFormIsActive}
            isEditing={state.isEditing}
            disabled={state.isSubmitting}
          />
        );
    }
  };

  const renderExpandedView = () => {
    switch (type) {
      case 'unit-type':
        return (
          <div className='space-y-6'>
            <UnitTypeIdentityStep
              name={state.unitTypeName}
              iconName={state.unitTypeIconName}
              onNameChange={actions.setUnitTypeName}
              onIconNameChange={actions.setUnitTypeIconName}
              disabled={state.isSubmitting}
            />
            <div className='border-t border-border/40 pt-4'>
              <UnitTypeDetailsStep
                description={state.unitTypeDescription}
                onDescriptionChange={actions.setUnitTypeDescription}
                isActive={state.unitTypeIsActive}
                onIsActiveChange={actions.setUnitTypeIsActive}
                isEditing={state.isEditing}
                disabled={state.isSubmitting}
              />
            </div>
          </div>
        );

      case 'unit':
        return (
          <div className='space-y-6'>
            <UnitIdentityStep
              name={state.unitName}
              code={state.unitCode}
              iconName={state.unitIconName}
              onNameChange={actions.setUnitName}
              onCodeChange={actions.setUnitCode}
              onIconNameChange={actions.setUnitIconName}
              disabled={state.isSubmitting}
            />
            <div className='border-t border-border/40 pt-4'>
              <UnitClassificationStep
                unitTypeId={state.unitTypeId}
                unitTypes={unitTypes}
                onUnitTypeIdChange={actions.setUnitTypeId}
                disabled={state.isSubmitting}
              />
            </div>
            <div className='border-t border-border/40 pt-4'>
              <UnitLocationStep
                floor={state.unitFloor}
                location={state.unitLocation}
                onFloorChange={actions.setUnitFloor}
                onLocationChange={actions.setUnitLocation}
                isActive={state.unitIsActive}
                onIsActiveChange={actions.setUnitIsActive}
                isEditing={state.isEditing}
                disabled={state.isSubmitting}
              />
            </div>
          </div>
        );

      case 'room':
        return (
          <div className='space-y-6'>
            <RoomParentUnitStep
              unitId={state.roomUnitId}
              units={units}
              onUnitIdChange={actions.setRoomUnitId}
              disabled={state.isSubmitting}
            />
            <div className='border-t border-border/40 pt-4'>
              <RoomIdentityStep
                name={state.roomName}
                code={state.roomCode}
                onNameChange={actions.setRoomName}
                onCodeChange={actions.setRoomCode}
                disabled={state.isSubmitting}
              />
            </div>
            <div className='border-t border-border/40 pt-4'>
              <RoomLocationStep
                floor={state.roomFloor}
                location={state.roomLocation}
                onFloorChange={actions.setRoomFloor}
                onLocationChange={actions.setRoomLocation}
                isActive={state.roomIsActive}
                onIsActiveChange={actions.setRoomIsActive}
                isEditing={state.isEditing}
                disabled={state.isSubmitting}
              />
            </div>
          </div>
        );

      case 'category':
        return (
          <div className='space-y-6'>
            <CategoryIdentityStep
              name={state.categoryName}
              code={state.categoryCode}
              iconName={state.categoryIconName}
              onNameChange={actions.setCategoryName}
              onCodeChange={actions.setCategoryCode}
              onIconNameChange={actions.setCategoryIconName}
              disabled={state.isSubmitting}
            />
            <div className='border-t border-border/40 pt-4'>
              <CategoryAffiliationStep
                unitId={state.categoryUnitId}
                unitIds={state.categoryUnitIds}
                codePrefix={state.categoryCodePrefix}
                units={units}
                onUnitIdChange={actions.setCategoryUnitId}
                onUnitIdsChange={actions.setCategoryUnitIds}
                onCodePrefixChange={actions.setCategoryCodePrefix}
                disabled={state.isSubmitting}
              />
            </div>
            <div className='border-t border-border/40 pt-4'>
              <CategoryDescriptionStep
                description={state.categoryDescription}
                onDescriptionChange={actions.setCategoryDescription}
                isActive={state.categoryIsActive}
                onIsActiveChange={actions.setCategoryIsActive}
                isEditing={state.isEditing}
                disabled={state.isSubmitting}
              />
            </div>
          </div>
        );

      case 'service':
        return (
          <div className='space-y-6'>
            <ServiceCategoryStep
              categoryId={state.serviceCategoryId}
              categoryIds={state.serviceCategoryIds}
              intakeFormId={state.serviceIntakeFormId}
              categories={categories}
              forms={forms}
              onCategoryIdChange={actions.setServiceCategoryId}
              onCategoryIdsChange={actions.setServiceCategoryIds}
              onIntakeFormIdChange={actions.setServiceIntakeFormId}
              disabled={state.isSubmitting}
            />
            <div className='border-t border-border/40 pt-4'>
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
            </div>
            <div className='border-t border-border/40 pt-4'>
              <ServiceClinicalStep
                complaintsRaw={state.serviceComplaintsRaw}
                description={state.serviceDescription}
                onComplaintsRawChange={actions.setServiceComplaintsRaw}
                onDescriptionChange={actions.setServiceDescription}
                isActive={state.serviceIsActive}
                onIsActiveChange={actions.setServiceIsActive}
                isEditing={state.isEditing}
                disabled={state.isSubmitting}
              />
            </div>
          </div>
        );

      case 'form':
        return (
          <div className='space-y-6'>
            <FormIdentityStep
              name={state.formName}
              code={state.formCode}
              iconName={state.formIconName}
              onNameChange={actions.setFormName}
              onCodeChange={actions.setFormCode}
              onIconNameChange={actions.setFormIconName}
              disabled={state.isSubmitting}
            />
            <div className='border-t border-border/40 pt-4'>
              <FormDescriptionStep
                description={state.formDescription}
                onDescriptionChange={actions.setFormDescription}
                isActive={state.formIsActive}
                onIsActiveChange={actions.setFormIsActive}
                isEditing={state.isEditing}
                disabled={state.isSubmitting}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <ModalWrapper
      isOpen={open}
      onClose={handleClose}
      maxWidth={
        viewMode === 'expanded'
          ? 'max-w-[700px] sm:max-w-[720px]'
          : 'max-w-[500px] sm:max-w-[540px]'
      }
      backdropClassName='overflow-hidden'
      className={cn(
        'relative flex flex-col h-auto max-h-[92dvh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl transition-[max-width] duration-300 ease-out',
        viewMode === 'expanded'
          ? 'max-w-[700px] sm:max-w-[720px]'
          : 'max-w-[500px] sm:max-w-[540px]'
      )}
    >
      {/* Subtle Hoverable Side-Tray Switcher Tab for Form View Mode */}
      <div
        className='absolute top-5 -right-1 z-30 flex items-center select-none'
        onMouseEnter={() => setIsModeTrayHovered(true)}
        onMouseLeave={() => setIsModeTrayHovered(false)}
      >
        <div
          className={cn(
            'flex items-center gap-1.5 py-1 px-1.5 rounded-l-xl bg-card border-y border-l border-border/80 shadow-md backdrop-blur-md transition-all duration-200',
            isModeTrayHovered
              ? 'translate-x-0 opacity-100 pr-2 shadow-lg ring-1 ring-primary/20'
              : 'translate-x-[calc(100%-28px)] opacity-70 hover:opacity-100'
          )}
        >
          {/* Peeking chevron icon indicator */}
          <div className='flex items-center justify-center size-6 text-muted-foreground cursor-pointer'>
            {isModeTrayHovered ? (
              <Icons.layoutList className='size-3.5 text-primary' />
            ) : (
              <div className='flex items-center gap-0.5' title='Buka mode tampilan formulir'>
                <ChevronsLeft className='size-3.5 text-muted-foreground animate-pulse' />
              </div>
            )}
          </div>

          {/* Mode switch buttons */}
          <div
            className={cn(
              'flex items-center gap-1 transition-opacity duration-200',
              isModeTrayHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <button
              type='button'
              onClick={() => setViewMode('stepper')}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
                viewMode === 'stepper'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              title='Mode Panduan Berlangkah'
            >
              <Icons.chevronRight className='size-3' />
              <span>Langkah</span>
            </button>
            <button
              type='button'
              onClick={() => setViewMode('expanded')}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
                viewMode === 'expanded'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              title='Mode Formulir Lengkap'
            >
              <Icons.layoutList className='size-3' />
              <span>Lengkap</span>
            </button>
          </div>
        </div>
      </div>

      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        {/* Compact Clean Header Bar */}
        <div className='flex items-center justify-between pb-3 border-b border-border/40 shrink-0'>
          <div className='min-w-0 pr-8'>
            <h2 className='text-sm sm:text-base font-bold text-foreground leading-tight truncate'>
              {state.isEditing ? editItem?.name || meta.title : meta.title}
            </h2>
            {!state.isEditing && (
              <p className='text-xs text-muted-foreground pt-0.5'>
                {viewMode === 'stepper'
                  ? `Langkah ${state.currentStage} dari ${state.maxStages}`
                  : 'Tampilan Formulir Lengkap'}
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        {viewMode === 'stepper' ? (
          <div ref={stepContentRef} className='pr-0.5 h-auto overflow-visible'>
            {renderActiveStep()}
          </div>
        ) : (
          <div className='max-h-[60vh] overflow-y-auto pr-1'>{renderExpandedView()}</div>
        )}

        {/* Minimal Clean Footer Navigation */}
        <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40 mt-1'>
          <div>
            {viewMode === 'expanded' || state.currentStage === 1 ? (
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

          <div className='flex items-center gap-2'>
            {viewMode === 'stepper' ? (
              <>
                {state.isEditing && state.currentStage < state.maxStages && (
                  <Button
                    type='button'
                    variant='outline'
                    size='md'
                    shape='pill'
                    disabled={!state.isAllStagesValid || state.isSubmitting}
                    isLoading={state.isSubmitting}
                    onClick={actions.handleSubmit}
                    className='text-xs'
                  >
                    Simpan Sekarang
                  </Button>
                )}
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
                    disabled={!state.isAllStagesValid || state.isSubmitting}
                    isLoading={state.isSubmitting}
                    onClick={actions.handleSubmit}
                    withTrailingCircleIcon
                    className='min-w-[150px]'
                    trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
                  >
                    {state.isSubmitting ? 'Menyimpan...' : meta.submitLabel}
                  </Button>
                )}
              </>
            ) : (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={!state.isAllStagesValid || state.isSubmitting}
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

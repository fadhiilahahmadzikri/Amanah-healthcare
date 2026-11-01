'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ChevronsLeft } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import { useRoleFormModal } from '../model/useRoleFormModal';
import { RoleIdentityStep } from './create-role-steps/role-identity-step';
import { RoleDescriptionStep } from './create-role-steps/role-description-step';
import { RoleHierarchyStep } from './create-role-steps/role-hierarchy-step';
import { RoleClinicalStep } from './create-role-steps/role-clinical-step';
import { RolePermissionsStep } from './create-role-steps/role-permissions-step';
import type { Permission, Role } from '../types/role.types';
import type { RoleCreateStage } from '../model/useCreateRoleModal';

export interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  role?: Role | null;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
}

function getStageMaxWidth(stage: RoleCreateStage): string {
  switch (stage) {
    case 1:
    case 2:
      return 'max-w-[480px]';
    case 3:
      return 'max-w-[540px]';
    case 4:
      return 'max-w-[520px]';
    case 5:
      return 'max-w-[720px]';
    default:
      return 'max-w-[500px]';
  }
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  role,
  existingRoles,
  groupedPermissions,
  onSuccess
}: RoleFormDialogProps) {
  const { state, actions } = useRoleFormModal({
    mode,
    role,
    existingRoles,
    groupedPermissions,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  const [viewMode, setViewMode] = React.useState<'stepper' | 'expanded'>('stepper');
  const [isModeTrayHovered, setIsModeTrayHovered] = React.useState(false);
  const stepContentRef = React.useRef<HTMLDivElement>(null);

  // Smooth GSAP slide & fade on stage transition in stepper mode
  React.useEffect(() => {
    if (viewMode !== 'stepper' || !stepContentRef.current) return;
    const direction = state.direction;

    gsap.fromTo(
      stepContentRef.current,
      { opacity: 0, y: direction === 'forward' ? 10 : -10 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
    );
  }, [state.currentStage, state.direction, viewMode]);

  if (!open) return null;

  const handleClose = () => {
    actions.resetForm();
    onOpenChange(false);
  };

  const submitLabel = state.isSubmitting
    ? 'Menyimpan...'
    : state.isEditMode
      ? 'Simpan Perubahan'
      : 'Simpan Peran';

  const modalMaxWidth =
    viewMode === 'expanded'
      ? 'max-w-[700px] sm:max-w-[720px]'
      : getStageMaxWidth(state.currentStage);

  return (
    <ModalWrapper
      isOpen={open}
      onClose={handleClose}
      maxWidth={modalMaxWidth}
      backdropClassName='overflow-hidden'
      className={cn(
        'relative flex flex-col h-auto max-h-[92dvh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl transition-[max-width] duration-300 ease-out',
        modalMaxWidth
      )}
    >
      {/* Hidden accessible heading for screen readers & Playwright */}
      <h2 className='sr-only'>{state.isEditMode ? 'Atur Peran' : 'Buat Peran Baru'}</h2>

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
              {state.isEditMode ? `Atur Peran: ${role?.name || state.name}` : 'Buat Peran Baru'}
            </h2>
            <p className='text-xs text-muted-foreground pt-0.5'>
              {viewMode === 'stepper'
                ? `Langkah ${state.currentStage} dari 5`
                : 'Tampilan Formulir Lengkap'}
            </p>
          </div>
        </div>

        {/* Content Body: Stepper Mode or Expanded Overview Mode */}
        {viewMode === 'stepper' ? (
          <div ref={stepContentRef} className='pr-0.5 h-auto overflow-visible'>
            {state.currentStage === 1 && (
              <RoleIdentityStep
                name={state.name}
                onNameChange={actions.setName}
                isCodeLocked={state.isEditMode}
                disabled={state.isSubmitting}
              />
            )}

            {state.currentStage === 2 && (
              <RoleDescriptionStep
                description={state.description}
                onDescriptionChange={actions.setDescription}
                disabled={state.isSubmitting}
              />
            )}

            {state.currentStage === 3 && (
              <RoleHierarchyStep
                tier={state.tier}
                audience={state.audience}
                parentRoleId={state.parentRoleId}
                macroRoles={state.macroRoles}
                onTierChange={actions.setTier}
                onAudienceChange={actions.setAudience}
                onParentRoleChange={actions.setParentRoleId}
                disabled={
                  state.isSubmitting || role?.code === 'admin' || role?.code === 'super_admin'
                }
              />
            )}

            {state.currentStage === 4 && (
              <RoleClinicalStep
                isClinical={state.isClinical}
                onClinicalChange={actions.setIsClinical}
                disabled={
                  state.isSubmitting || role?.code === 'admin' || role?.code === 'super_admin'
                }
              />
            )}

            {state.currentStage === 5 && (
              <RolePermissionsStep
                categories={state.categories}
                activeCategory={state.activeCategory}
                groupedPermissions={groupedPermissions}
                selectedPermissionIds={state.selectedPermissionIds}
                effectivePermissionCodes={state.effectivePermissionCodes}
                permissionSearch={state.permissionSearch}
                onSelectCategory={actions.setActiveCategory}
                onSearchChange={actions.setPermissionSearch}
                onTogglePermission={actions.handleTogglePermission}
                onSelectAllCategory={actions.handleSelectAllCategory}
                disabled={state.isSubmitting}
              />
            )}
          </div>
        ) : (
          <div className='max-h-[60vh] overflow-y-auto pr-2 space-y-6 scrollbar-thin'>
            {/* 1. Identitas & Nama */}
            <div className='pb-4 border-b border-border/40'>
              <RoleIdentityStep
                name={state.name}
                onNameChange={actions.setName}
                isCodeLocked={state.isEditMode}
                disabled={state.isSubmitting}
              />
            </div>

            {/* 2. Deskripsi */}
            <div className='pb-4 border-b border-border/40'>
              <RoleDescriptionStep
                description={state.description}
                onDescriptionChange={actions.setDescription}
                disabled={state.isSubmitting}
              />
            </div>

            {/* 3. Posisi Hierarki & Audiens */}
            <div className='pb-4 border-b border-border/40'>
              <RoleHierarchyStep
                tier={state.tier}
                audience={state.audience}
                parentRoleId={state.parentRoleId}
                macroRoles={state.macroRoles}
                onTierChange={actions.setTier}
                onAudienceChange={actions.setAudience}
                onParentRoleChange={actions.setParentRoleId}
                disabled={
                  state.isSubmitting || role?.code === 'admin' || role?.code === 'super_admin'
                }
              />
            </div>

            {/* 4. Sifat Klinis */}
            <div className='pb-4 border-b border-border/40'>
              <RoleClinicalStep
                isClinical={state.isClinical}
                onClinicalChange={actions.setIsClinical}
                disabled={
                  state.isSubmitting || role?.code === 'admin' || role?.code === 'super_admin'
                }
              />
            </div>

            {/* 5. Matriks Hak Akses */}
            <div>
              <RolePermissionsStep
                categories={state.categories}
                activeCategory={state.activeCategory}
                groupedPermissions={groupedPermissions}
                selectedPermissionIds={state.selectedPermissionIds}
                effectivePermissionCodes={state.effectivePermissionCodes}
                permissionSearch={state.permissionSearch}
                onSelectCategory={actions.setActiveCategory}
                onSearchChange={actions.setPermissionSearch}
                onTogglePermission={actions.handleTogglePermission}
                onSelectAllCategory={actions.handleSelectAllCategory}
                disabled={state.isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40'>
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
            {viewMode === 'expanded' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={!state.isStage1Valid || state.isSubmitting}
                isLoading={state.isSubmitting}
                onClick={() => actions.handleSubmit()}
                withTrailingCircleIcon
                className='min-w-[160px]'
                trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
              >
                {submitLabel}
              </Button>
            ) : (
              <>
                {state.isEditMode && state.currentStage < 5 && (
                  <Button
                    type='button'
                    variant='outline'
                    size='md'
                    shape='pill'
                    disabled={!state.isCurrentStageValid || state.isSubmitting}
                    isLoading={state.isSubmitting}
                    onClick={() => actions.handleSubmit()}
                    className='text-xs'
                  >
                    Simpan Sekarang
                  </Button>
                )}
                {state.currentStage < 5 ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='md'
                    shape='pill'
                    disabled={!state.isCurrentStageValid || state.isSubmitting}
                    onClick={actions.handleNextStage}
                    withTrailingCircleIcon
                    className='min-w-[140px]'
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
                    disabled={state.isSubmitting}
                    isLoading={state.isSubmitting}
                    onClick={() => actions.handleSubmit()}
                    withTrailingCircleIcon
                    className='min-w-[160px]'
                    trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
                  >
                    {submitLabel}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

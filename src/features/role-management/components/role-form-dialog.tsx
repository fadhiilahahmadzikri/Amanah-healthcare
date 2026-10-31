'use client';

import * as React from 'react';
import gsap from 'gsap';
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

  const stepContentRef = React.useRef<HTMLDivElement>(null);

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

  const submitLabel = state.isSubmitting
    ? 'Menyimpan...'
    : state.isEditMode
      ? 'Simpan Perubahan'
      : 'Simpan Peran';

  return (
    <ModalWrapper
      isOpen={open}
      onClose={handleClose}
      maxWidth={getStageMaxWidth(state.currentStage)}
      backdropClassName='overflow-hidden'
      className={cn(
        'flex flex-col h-auto max-h-[92dvh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl transition-[max-width] duration-300 ease-out',
        getStageMaxWidth(state.currentStage)
      )}
    >
      {/* Hidden accessible heading for screen readers & Playwright */}
      <h2 className='sr-only'>{state.isEditMode ? 'Atur Peran' : 'Buat Peran Baru'}</h2>

      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-5 justify-start'>
        {/* Animated Active Stage Body */}
        <div ref={stepContentRef} className='pr-0.5 h-auto overflow-visible'>
          {state.currentStage === 1 && (
            <RoleIdentityStep
              code={state.code}
              name={state.name}
              onCodeChange={actions.setCode}
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
              disabled={state.isSubmitting || state.isSystemRole}
            />
          )}

          {state.currentStage === 4 && (
            <RoleClinicalStep
              isClinical={state.isClinical}
              onClinicalChange={actions.setIsClinical}
              disabled={state.isSubmitting || state.isSystemRole}
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

        {/* Footer Navigation */}
        <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40'>
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
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

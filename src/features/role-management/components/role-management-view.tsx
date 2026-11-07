'use client';

import * as React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchEngineDialog } from '@/components/search-engine';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';
import { useRoleManagementView } from '../model/useRoleManagementView';
import { RoleToolbar } from './role-toolbar';
import { RoleCard } from './role-card';
import { CreateRoleDialog } from './create-role-dialog';
import { EditRolePermissionsDialog } from './edit-role-permissions-dialog';
import { EditRolePagesDialog } from './edit-role-pages-dialog';
import { ManageApplicationPagesDialog } from './manage-application-pages-dialog';
import { EditPageModal } from './edit-page-modal';
import { DeleteRoleDialog } from './delete-role-dialog';

export function RoleManagementView() {
  const {
    roles,
    filteredRoles,
    groupedPermissions,
    isLoading,
    isRefetching,
    searchQuery,
    searchEngine,
    audienceFilter,
    clinicalFilter,
    isCreateOpen,
    editingRole,
    managingPagesRole,
    deletingRole,
    isDeleting,
    togglingRoleId,
    actions
  } = useRoleManagementView();

  const { can } = useAuthContext();
  const canManageRoles = can(PERMISSIONS.ROLES.MANAGE);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = React.useState(false);
  const [isManagePagesOpen, setIsManagePagesOpen] = React.useState(false);

  return (
    <div className='flex flex-1 min-h-0 flex-col gap-3.5 font-sans h-full overflow-hidden select-none'>
      {/* Centralized Search Engine Dialog */}
      <SearchEngineDialog
        config={searchEngine.config}
        isOpen={searchEngine.isOpen}
        onClose={searchEngine.close}
      />

      {/* Top Action Bar (Pinned Header Section) */}
      <div className='shrink-0'>
        <RoleToolbar
          searchQuery={searchQuery}
          onSearchChange={actions.setSearchQuery}
          onOpenSearchDialog={searchEngine.open}
          audienceFilter={audienceFilter}
          onAudienceFilterChange={actions.setAudienceFilter}
          clinicalFilter={clinicalFilter}
          onClinicalFilterChange={actions.setClinicalFilter}
          onRefresh={actions.handleRefresh}
          isRefetching={isRefetching}
          onAddClick={canManageRoles ? () => actions.setIsCreateOpen(true) : undefined}
          onAddCategoryClick={canManageRoles ? () => setIsNewCategoryOpen(true) : undefined}
          onManagePagesClick={canManageRoles ? () => setIsManagePagesOpen(true) : undefined}
        />
      </div>

      {/* Grid of Simple Role Cards (Scrollable Content Section) */}
      <div className='flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 pb-20 scrollbar-thin'>
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Skeleton className='h-40 rounded-xl' />
            <Skeleton className='h-40 rounded-xl' />
            <Skeleton className='h-40 rounded-xl' />
          </div>
        ) : filteredRoles.length === 0 ? (
          <EmptyState
            title='Belum ada peran terdaftar'
            description='Klik tombol "Tambah Peran" di atas untuk membuat peran dan meracik hak akses perizinannya.'
            action={
              canManageRoles ? (
                <Button
                  type='button'
                  variant='outline'
                  shape='pill'
                  size='sm'
                  onClick={() => actions.setIsCreateOpen(true)}
                  className='font-semibold cursor-pointer'
                >
                  Tambah Peran
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                canManage={canManageRoles}
                onEdit={actions.setEditingRole}
                onManagePages={actions.setManagingPagesRole}
                onDelete={actions.setDeletingRole}
                onToggleActive={actions.handleToggleRoleActive}
                isToggling={togglingRoleId === role.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      <CreateRoleDialog
        open={isCreateOpen}
        onOpenChange={actions.setIsCreateOpen}
        existingRoles={roles}
        groupedPermissions={groupedPermissions}
        onSuccess={actions.handleRefresh}
      />

      {/* Edit Role & Permissions Modal */}
      <EditRolePermissionsDialog
        role={editingRole}
        open={Boolean(editingRole)}
        onOpenChange={(open) => {
          if (!open) actions.setEditingRole(null);
        }}
        existingRoles={roles}
        groupedPermissions={groupedPermissions}
        onSuccess={actions.handleRefresh}
      />

      {/* Edit Role Page Access & CMS Modal */}
      <EditRolePagesDialog
        role={managingPagesRole}
        open={Boolean(managingPagesRole)}
        onOpenChange={(open) => {
          if (!open) actions.setManagingPagesRole(null);
        }}
        canManage={canManageRoles}
      />

      {/* Global Application Pages CMS Manager Dialog */}
      <ManageApplicationPagesDialog
        open={isManagePagesOpen}
        onOpenChange={setIsManagePagesOpen}
        canManage={canManageRoles}
      />

      {/* Create New Category Modal */}
      <EditPageModal
        open={isNewCategoryOpen}
        onClose={() => setIsNewCategoryOpen(false)}
        isNewCategory={true}
        audience={audienceFilter === 'all' ? 'internal' : audienceFilter}
        parentCategories={[]}
        page={null}
      />

      {/* Delete Confirmation Alert */}
      <DeleteRoleDialog
        role={deletingRole}
        open={Boolean(deletingRole)}
        onOpenChange={(open) => {
          if (!open) actions.setDeletingRole(null);
        }}
        isDeleting={isDeleting}
        onConfirm={actions.handleDeleteRole}
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { IconShield } from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';
import { useRoleManagementView } from '../model/useRoleManagementView';
import { RoleToolbar } from './role-toolbar';
import { RoleCard } from './role-card';
import { CreateRoleDialog } from './create-role-dialog';
import { EditRolePermissionsDialog } from './edit-role-permissions-dialog';
import { EditRolePagesDialog } from './edit-role-pages-dialog';
import { DeleteRoleDialog } from './delete-role-dialog';

export function RoleManagementView() {
  const {
    roles,
    filteredRoles,
    groupedPermissions,
    isLoading,
    isRefetching,
    searchQuery,
    tierFilter,
    audienceFilter,
    clinicalFilter,
    isCreateOpen,
    editingRole,
    managingPagesRole,
    deletingRole,
    isDeleting,
    actions
  } = useRoleManagementView();

  const { can } = useAuthContext();
  const canManageRoles = can(PERMISSIONS.ROLES.MANAGE);

  return (
    <div className='space-y-4 font-sans'>
      {/* Top Action Bar */}
      <RoleToolbar
        searchQuery={searchQuery}
        onSearchChange={actions.setSearchQuery}
        tierFilter={tierFilter}
        onTierFilterChange={actions.setTierFilter}
        audienceFilter={audienceFilter}
        onAudienceFilterChange={actions.setAudienceFilter}
        clinicalFilter={clinicalFilter}
        onClinicalFilterChange={actions.setClinicalFilter}
        onRefresh={actions.handleRefresh}
        isRefetching={isRefetching}
        onAddClick={canManageRoles ? () => actions.setIsCreateOpen(true) : undefined}
      />

      {/* Grid of Simple Role Cards */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card className='p-8 text-center border-dashed'>
          <div className='flex flex-col items-center justify-center space-y-2'>
            <IconShield className='size-10 text-muted-foreground/40' />
            <p className='text-sm font-medium text-foreground'>Belum ada peran tambahan</p>
            <p className='text-xs text-muted-foreground max-w-sm'>
              Klik tombol &quot;Tambah Peran&quot; di atas untuk membuat peran dan meracik hak akses
              perizinannya.
            </p>
          </div>
        </Card>
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
            />
          ))}
        </div>
      )}

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

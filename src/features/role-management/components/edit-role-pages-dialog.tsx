'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { roleManagementApi } from '../api/role-management.api';
import { roleManagementKeys } from '../api/query-keys';
import type { ApplicationPage, Role } from '../types/role.types';

export interface EditRolePagesDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage?: boolean;
}

export function EditRolePagesDialog({
  role,
  open,
  onOpenChange,
  canManage = true
}: EditRolePagesDialogProps) {
  if (!role || !open) return null;

  return (
    <EditRolePagesForm
      key={role.id}
      role={role}
      open={open}
      onClose={() => onOpenChange(false)}
      canManage={canManage}
    />
  );
}

interface EditRolePagesFormProps {
  role: Role;
  open: boolean;
  onClose: () => void;
  canManage: boolean;
}

function EditRolePagesForm({ role, open, onClose, canManage }: EditRolePagesFormProps) {
  const queryClient = useQueryClient();

  // 1. Fetch Page Hierarchy for role's audience
  const { data: pageTree = [], isLoading: isLoadingPages } = useQuery({
    queryKey: roleManagementKeys.pageTree(role.audience),
    queryFn: () => roleManagementApi.getPageTree(role.audience)
  });

  // 2. Fetch Assigned Page IDs for this role
  const { data: rolePagesData, isLoading: isLoadingAssigned } = useQuery({
    queryKey: roleManagementKeys.rolePages(role.id),
    queryFn: () => roleManagementApi.getRolePages(role.id)
  });

  const [selectedPageIds, setSelectedPageIds] = React.useState<Set<string>>(new Set());

  // Initialize selected state once query loads
  React.useEffect(() => {
    if (rolePagesData) {
      setSelectedPageIds(new Set(rolePagesData));
    }
  }, [rolePagesData]);

  // 3. Mutation: Assign Pages to Role
  const assignPagesMutation = useMutation({
    mutationFn: (pageIds: string[]) => roleManagementApi.assignPages(role.id, pageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.rolePages(role.id) });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
      toast.success(`Hak akses halaman untuk peran '${role.name}' berhasil diperbarui`);
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan hak akses halaman';
      toast.error(msg);
    }
  });

  // 4. Mutation: Toggle Global Page Availability (CMS Kill Switch)
  const togglePageMutation = useMutation({
    mutationFn: ({ pageId, isEnabled }: { pageId: string; isEnabled: boolean }) =>
      roleManagementApi.togglePage(pageId, isEnabled),
    onSuccess: (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree(role.audience) });
      toast.success(
        `Ketersediaan halaman '${updatedPage.name}' diubah menjadi: ${updatedPage.isEnabled ? 'Aktif' : 'Nonaktif'}`
      );
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status halaman';
      toast.error(msg);
    }
  });

  const handleToggleSelectPage = (pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  };

  const handleToggleGroup = (parent: ApplicationPage, selectAll: boolean) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      const childIds = (parent.children || []).map((c) => c.id);
      for (const id of childIds) {
        if (selectAll) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  };

  const handleSave = () => {
    assignPagesMutation.mutate(Array.from(selectedPageIds));
  };

  const isLoading = isLoadingPages || isLoadingAssigned;

  return (
    <ModalWrapper
      isOpen={open}
      onClose={onClose}
      maxWidth='max-w-[1040px]'
      backdropClassName='overflow-hidden'
      className='flex flex-col h-[86dvh] max-h-[86dvh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[1040px] my-auto shadow-2xl'
    >
      <div className='flex flex-col font-sans select-none h-full min-h-0 justify-between'>
        {/* Minimal Clutter-Free Header */}
        <div className='pb-3 mb-2 border-b border-border/40 shrink-0'>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Akses Halaman: {role.name}
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Tentukan halaman aplikasi yang diizinkan untuk diakses oleh peran ini.
          </p>
        </div>

        {/* Scrollable Content with 3-Column Grid */}
        <div className='flex-1 min-h-0 overflow-y-auto pr-1.5 py-1 space-y-4'>
          {isLoading ? (
            <div className='py-16 flex flex-col items-center justify-center text-muted-foreground gap-2'>
              <Icons.spinner className='size-6 animate-spin text-primary' />
              <p className='text-xs'>Memuat daftar halaman aplikasi...</p>
            </div>
          ) : pageTree.length === 0 ? (
            <div className='py-16 text-center text-muted-foreground'>
              <p className='text-xs'>Tidak ada halaman terdaftar untuk audiens ini.</p>
            </div>
          ) : (
            pageTree.map((parent) => {
              const children = parent.children || [];
              const allSelected =
                children.length > 0 && children.every((c) => selectedPageIds.has(c.id));
              const someSelected = children.some((c) => selectedPageIds.has(c.id)) && !allSelected;

              return (
                <div
                  key={parent.id}
                  className='rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs'
                >
                  {/* Group Header */}
                  <div className='flex items-center justify-between pb-2 border-b border-border/60'>
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <Checkbox
                        id={`parent-select-${parent.id}`}
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={(checked) => handleToggleGroup(parent, Boolean(checked))}
                        disabled={!canManage}
                      />
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <label
                            htmlFor={`parent-select-${parent.id}`}
                            className='font-semibold text-xs sm:text-sm text-foreground cursor-pointer select-none'
                          >
                            {parent.name}
                          </label>
                          <span className='font-mono text-[10px] text-muted-foreground px-1.5 py-0.2 rounded border bg-muted/40'>
                            {parent.slug}
                          </span>
                          {!parent.isEnabled && (
                            <span className='text-[10px] font-semibold text-destructive px-1.5 py-0.2 rounded bg-destructive/10'>
                              Nonaktif di CMS
                            </span>
                          )}
                        </div>
                        {parent.description && (
                          <p className='text-[11px] text-muted-foreground pt-0.5 truncate max-w-lg'>
                            {parent.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Master Switch for Parent Group */}
                    {canManage && (
                      <div className='flex items-center gap-2 pl-3 shrink-0'>
                        <span className='text-[11px] text-muted-foreground'>Saklar CMS</span>
                        <Switch
                          checked={parent.isEnabled}
                          onCheckedChange={(val) =>
                            togglePageMutation.mutate({ pageId: parent.id, isEnabled: val })
                          }
                          aria-label={`Saklar CMS ${parent.name}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* 3-Column Child Pages Grid */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-0.5'>
                    {children.map((child) => {
                      const isAssigned = selectedPageIds.has(child.id);
                      const isChildEffectivelyEnabled = parent.isEnabled && child.isEnabled;

                      return (
                        <div
                          key={child.id}
                          className={cn(
                            'flex items-start justify-between p-2.5 rounded-xl border transition-colors select-none gap-2',
                            isAssigned
                              ? 'bg-primary/5 border-primary/40'
                              : 'bg-muted/10 border-border/70 hover:bg-muted/20',
                            !isChildEffectivelyEnabled && 'opacity-60'
                          )}
                        >
                          <div className='flex items-start gap-2 flex-1 min-w-0'>
                            <Checkbox
                              id={`page-${child.id}`}
                              checked={isAssigned}
                              onCheckedChange={() => handleToggleSelectPage(child.id)}
                              disabled={!canManage}
                              className='mt-0.5 shrink-0'
                            />
                            <div className='space-y-1 min-w-0 flex-1'>
                              <label
                                htmlFor={`page-${child.id}`}
                                className='text-xs font-semibold text-foreground cursor-pointer block truncate leading-tight'
                              >
                                {child.name}
                              </label>
                              <div className='font-mono text-[10px] text-muted-foreground truncate'>
                                {child.routePath}
                              </div>
                              <div>
                                {!child.isEnabled ? (
                                  <span className='inline-block text-[9px] font-semibold text-destructive px-1 rounded bg-destructive/10'>
                                    Nonaktif
                                  </span>
                                ) : !parent.isEnabled ? (
                                  <span className='inline-block text-[9px] font-medium text-muted-foreground px-1 rounded bg-muted'>
                                    Induk Nonaktif
                                  </span>
                                ) : (
                                  <span className='inline-block text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 px-1 rounded bg-emerald-50 dark:bg-emerald-950/30'>
                                    Aktif
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Individual Child CMS Toggle */}
                          {canManage && (
                            <div className='shrink-0 pt-0.5'>
                              <Switch
                                className='scale-75'
                                checked={child.isEnabled}
                                onCheckedChange={(val) =>
                                  togglePageMutation.mutate({ pageId: child.id, isEnabled: val })
                                }
                                aria-label={`Toggle CMS ${child.name}`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation matching Appointment Reservation style */}
        <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40 mt-2'>
          <span className='text-xs text-muted-foreground'>
            <strong className='font-semibold text-foreground'>{selectedPageIds.size}</strong>{' '}
            halaman dipilih
          </span>

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='md'
              shape='pill'
              onClick={onClose}
              disabled={assignPagesMutation.isPending}
            >
              Tutup
            </Button>

            {canManage && (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                onClick={handleSave}
                disabled={assignPagesMutation.isPending || isLoading}
                isLoading={assignPagesMutation.isPending}
                withTrailingCircleIcon
                trailingIcon={<Icons.check className='size-3 stroke-[2.5]' />}
                className='min-w-[160px]'
              >
                {assignPagesMutation.isPending ? 'Menyimpan...' : 'Simpan Hak Akses'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

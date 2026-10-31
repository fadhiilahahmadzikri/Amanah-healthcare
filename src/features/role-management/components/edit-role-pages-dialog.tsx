'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { IconBrowser, IconCheck, IconPower, IconRoute } from '@tabler/icons-react';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EditRolePagesForm role={role} onClose={() => onOpenChange(false)} canManage={canManage} />
    </Dialog>
  );
}

interface EditRolePagesFormProps {
  role: Role;
  onClose: () => void;
  canManage: boolean;
}

function EditRolePagesForm({ role, onClose, canManage }: EditRolePagesFormProps) {
  const queryClient = useQueryClient();

  // 1. Fetch Page Hierarchy for role's audience
  const { data: pageTree = [], isLoading: isLoadingPages } = useQuery({
    queryKey: roleManagementKeys.pageTree(role.audience),
    queryFn: () => roleManagementApi.getPageTree(role.audience)
  });

  // 2. Fetch Assigned Page IDs for this role
  const { data: initialPageIds = [], isLoading: isLoadingAssigned } = useQuery({
    queryKey: roleManagementKeys.rolePages(role.id),
    queryFn: () => roleManagementApi.getRolePages(role.id)
  });

  const [selectedPageIds, setSelectedPageIds] = React.useState<Set<string>>(new Set());

  // Initialize selected state once query loads
  React.useEffect(() => {
    if (initialPageIds) {
      setSelectedPageIds(new Set(initialPageIds));
    }
  }, [initialPageIds]);

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
    <DialogContent className='max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden'>
      <DialogHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
        <div className='flex items-center gap-2'>
          <DialogTitle className='flex items-center gap-2'>
            <IconBrowser className='size-5 text-primary' />
            Atur Akses Halaman: {role.name}
          </DialogTitle>
          <Badge variant='outline' className='font-mono text-xs'>
            {role.code}
          </Badge>
          <Badge variant='secondary' className='text-xs uppercase'>
            {role.audience}
          </Badge>
        </div>
        <DialogDescription>
          Pilih halaman mana saja yang diizinkan untuk diakses oleh peran ini. Halaman yang
          dinonaktifkan di tingkat CMS akan otomatis tertutup dan tidak muncul di navigasi.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className='flex-1 px-6 py-4 overflow-y-auto'>
        {isLoading ? (
          <div className='py-12 flex flex-col items-center justify-center text-muted-foreground gap-2'>
            <div className='animate-spin size-6 border-2 border-primary border-t-transparent rounded-full' />
            <p className='text-sm'>Memuat daftar halaman aplikasi...</p>
          </div>
        ) : pageTree.length === 0 ? (
          <div className='py-12 text-center text-muted-foreground'>
            <p className='text-sm'>Tidak ada halaman terdaftar untuk audiens ini.</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {pageTree.map((parent) => {
              const children = parent.children || [];
              const allSelected =
                children.length > 0 && children.every((c) => selectedPageIds.has(c.id));
              const someSelected = children.some((c) => selectedPageIds.has(c.id)) && !allSelected;

              return (
                <div key={parent.id} className='rounded-lg border bg-card p-4 space-y-3 shadow-2xs'>
                  {/* Group Header */}
                  <div className='flex items-center justify-between pb-2 border-b'>
                    <div className='flex items-center gap-2.5'>
                      <Checkbox
                        id={`parent-select-${parent.id}`}
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={(checked) => handleToggleGroup(parent, Boolean(checked))}
                        disabled={!canManage}
                      />
                      <div>
                        <div className='flex items-center gap-2'>
                          <label
                            htmlFor={`parent-select-${parent.id}`}
                            className='font-semibold text-sm cursor-pointer select-none'
                          >
                            {parent.name}
                          </label>
                          <Badge variant='outline' className='text-[10px] font-mono'>
                            {parent.slug}
                          </Badge>
                          {!parent.isEnabled && (
                            <Badge variant='destructive' className='text-[10px] gap-1'>
                              <IconPower className='size-2.5' />
                              Grup Dinonaktifkan
                            </Badge>
                          )}
                        </div>
                        {parent.description && (
                          <p className='text-xs text-muted-foreground pt-0.5'>
                            {parent.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Global Master Switch for parent group */}
                    {canManage && (
                      <div className='flex items-center gap-2 pl-4'>
                        <span className='text-[11px] text-muted-foreground'>CMS Saklar:</span>
                        <Switch
                          checked={parent.isEnabled}
                          onCheckedChange={(val) =>
                            togglePageMutation.mutate({ pageId: parent.id, isEnabled: val })
                          }
                          aria-label={`Toggle ketersediaan ${parent.name}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Child Pages Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1'>
                    {children.map((child) => {
                      const isAssigned = selectedPageIds.has(child.id);
                      const isChildEffectivelyEnabled = parent.isEnabled && child.isEnabled;

                      return (
                        <div
                          key={child.id}
                          className={`flex items-start justify-between p-2.5 rounded-md border transition-colors ${
                            isAssigned
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-muted/10 border-border/60 hover:bg-muted/20'
                          } ${!isChildEffectivelyEnabled ? 'opacity-65' : ''}`}
                        >
                          <div className='flex items-start gap-2.5 flex-1 min-w-0 pr-2'>
                            <Checkbox
                              id={`page-${child.id}`}
                              checked={isAssigned}
                              onCheckedChange={() => handleToggleSelectPage(child.id)}
                              disabled={!canManage}
                              className='mt-0.5'
                            />
                            <div className='space-y-0.5 min-w-0'>
                              <label
                                htmlFor={`page-${child.id}`}
                                className='text-xs font-medium text-foreground cursor-pointer select-none leading-none block truncate'
                              >
                                {child.name}
                              </label>
                              <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono truncate'>
                                <IconRoute className='size-3 shrink-0' />
                                <span className='truncate'>{child.routePath}</span>
                              </div>
                              <div className='flex items-center gap-1 pt-1 flex-wrap'>
                                {!child.isEnabled ? (
                                  <Badge
                                    variant='outline'
                                    className='text-[9px] px-1 py-0 border-destructive text-destructive'
                                  >
                                    Nonaktif di CMS
                                  </Badge>
                                ) : !parent.isEnabled ? (
                                  <Badge
                                    variant='outline'
                                    className='text-[9px] px-1 py-0 text-muted-foreground'
                                  >
                                    Induk Nonaktif
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant='outline'
                                    className='text-[9px] px-1 py-0 text-emerald-600 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20'
                                  >
                                    Aktif di CMS
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Individual child CMS toggle */}
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
            })}
          </div>
        )}
      </ScrollArea>

      <DialogFooter className='px-6 py-3 border-t bg-muted/10 shrink-0 flex items-center justify-between'>
        <div className='text-xs text-muted-foreground'>
          <span className='font-medium text-foreground'>{selectedPageIds.size}</span> halaman
          dipilih
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={assignPagesMutation.isPending}
          >
            Tutup
          </Button>
          {canManage && (
            <Button
              size='sm'
              onClick={handleSave}
              disabled={assignPagesMutation.isPending || isLoading}
              className='gap-1.5'
            >
              <IconCheck className='size-4' />
              {assignPagesMutation.isPending ? 'Menyimpan...' : 'Simpan Hak Akses'}
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
}

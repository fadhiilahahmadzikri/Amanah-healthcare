'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useEditRoleModal } from '../model/useEditRoleModal';
import type { Permission, Role, RoleAudience, RoleTier } from '../types/role.types';

export interface EditRolePermissionsDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
}

interface EditRoleFormProps {
  role: Role;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
  onClose: () => void;
}

function EditRoleForm({
  role,
  existingRoles,
  groupedPermissions,
  onSuccess,
  onClose
}: EditRoleFormProps) {
  const { state, actions } = useEditRoleModal({
    role,
    existingRoles,
    groupedPermissions,
    onSuccess,
    onClose
  });

  return (
    <DialogContent className='max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden'>
      <form onSubmit={actions.handleSubmit} className='flex flex-col h-full overflow-hidden'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
          <div className='flex items-center gap-2'>
            <DialogTitle>Atur Peran: {role.name}</DialogTitle>
            <Badge variant='outline' className='font-mono text-xs'>
              {role.code}
            </Badge>
            {role.isSystem && (
              <Badge variant='secondary' className='text-xs'>
                Sistem
              </Badge>
            )}
          </div>
          <DialogDescription>
            Konfigurasi detail peran, struktur hierarki, dan hak akses izin granular (matriks
            perizinan).
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='flex-1 px-6 py-4 overflow-y-auto'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5'>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-role-name'>
                  Nama Tampilan <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='edit-role-name'
                  value={state.name}
                  onChange={(e) => actions.setName(e.target.value)}
                  disabled={state.isSubmitting}
                />
              </div>

              <div className='space-y-1.5'>
                <Label>Tingkatan (Tier)</Label>
                <Select
                  value={state.tier}
                  onValueChange={(val) => actions.setTier(val as RoleTier)}
                  disabled={role.isSystem || state.isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='macro'>Macro (Induk)</SelectItem>
                    <SelectItem value='micro'>Micro (Sub-Peran)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label>Audiens</Label>
                <Select
                  value={state.audience}
                  onValueChange={(val) => actions.setAudience(val as RoleAudience)}
                  disabled={role.isSystem || state.isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='internal'>Internal (Staf)</SelectItem>
                    <SelectItem value='external'>External (Pasien)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit-role-desc'>Deskripsi</Label>
              <Textarea
                id='edit-role-desc'
                value={state.description}
                onChange={(e) => actions.setDescription(e.target.value)}
                disabled={state.isSubmitting}
                rows={2}
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'>
              <div className='space-y-1.5'>
                <Label>Peran Induk (Pewarisan)</Label>
                <Select
                  value={state.parentRoleId}
                  onValueChange={actions.setParentRoleId}
                  disabled={role.isSystem || state.isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih induk...' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Tanpa Induk (Mandiri)</SelectItem>
                    {state.candidateParentRoles.map((pr) => (
                      <SelectItem key={pr.id} value={pr.id}>
                        {pr.name} ({pr.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center justify-between p-3 rounded-lg border bg-muted/20'>
                <div className='space-y-0.5'>
                  <Label className='text-xs font-medium'>Tenaga Medis / Klinis</Label>
                  <p className='text-[11px] text-muted-foreground'>
                    Konsultasi pasien & rekam medis
                  </p>
                </div>
                <Switch
                  checked={state.isClinical}
                  onCheckedChange={actions.setIsClinical}
                  disabled={role.isSystem || state.isSubmitting}
                />
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className='space-y-2.5 pt-3 border-t'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label className='text-sm font-semibold text-foreground'>
                    Matriks Perizinan Granular
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    {state.selectedPermissionIds.length} izin langsung diberikan ke peran ini.
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 border rounded-lg overflow-hidden'>
                {/* Category Sidebar */}
                <div className='bg-muted/40 border-r p-2 space-y-1 max-h-64 overflow-y-auto'>
                  {state.categories.map((cat) => {
                    const catPerms = groupedPermissions[cat] || [];
                    const selectedInCat = catPerms.filter((p) =>
                      state.selectedPermissionIds.includes(p.id)
                    ).length;
                    return (
                      <button
                        key={cat}
                        type='button'
                        onClick={() => actions.setActiveCategory(cat)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                          state.activeCategory === cat
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className='capitalize truncate'>{cat}</span>
                        {selectedInCat > 0 && (
                          <Badge
                            variant={state.activeCategory === cat ? 'outline' : 'secondary'}
                            className='ml-1 text-[10px] h-4 px-1 shrink-0'
                          >
                            {selectedInCat}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Permissions List */}
                <div className='col-span-2 p-3 space-y-2 max-h-64 overflow-y-auto'>
                  {state.activeCategory && (
                    <>
                      <div className='flex items-center justify-between pb-1 mb-1 border-b'>
                        <span className='text-xs font-semibold capitalize text-foreground'>
                          {state.activeCategory} (
                          {groupedPermissions[state.activeCategory]?.length || 0} izin)
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-6 text-[11px] px-2'
                          onClick={() => actions.handleSelectAllCategory(state.activeCategory)}
                        >
                          Pilih Semua
                        </Button>
                      </div>

                      <div className='space-y-2'>
                        {(groupedPermissions[state.activeCategory] || []).map((perm) => {
                          const isChecked = state.selectedPermissionIds.includes(perm.id);
                          const isInherited =
                            !isChecked && (role.effectivePermissionCodes || []).includes(perm.code);

                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-2.5 p-1.5 rounded cursor-pointer select-none transition-colors ${
                                isChecked ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                              }`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => actions.handleTogglePermission(perm.id)}
                                className='mt-0.5'
                              />
                              <div className='space-y-0.5 leading-none flex-1'>
                                <div className='flex items-center gap-1.5'>
                                  <p className='text-xs font-medium text-foreground'>{perm.code}</p>
                                  {isInherited && (
                                    <Badge
                                      variant='outline'
                                      className='text-[9px] h-3.5 px-1 text-muted-foreground'
                                    >
                                      Diwarisi
                                    </Badge>
                                  )}
                                </div>
                                {perm.description && (
                                  <p className='text-[11px] text-muted-foreground'>
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className='px-6 py-4 border-t bg-muted/10 shrink-0 gap-2 sm:gap-0'>
          <Button type='button' variant='outline' onClick={onClose} disabled={state.isSubmitting}>
            Batal
          </Button>
          <Button type='submit' disabled={state.isSubmitting}>
            {state.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function EditRolePermissionsDialog({
  role,
  open,
  onOpenChange,
  existingRoles,
  groupedPermissions,
  onSuccess
}: EditRolePermissionsDialogProps) {
  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EditRoleForm
        key={role.id}
        role={role}
        existingRoles={existingRoles}
        groupedPermissions={groupedPermissions}
        onSuccess={onSuccess}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

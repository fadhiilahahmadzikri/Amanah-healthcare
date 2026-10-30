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
import { useCreateRoleModal } from '../model/useCreateRoleModal';
import type { Permission, Role, RoleAudience, RoleTier } from '../types/role.types';

export interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  existingRoles,
  groupedPermissions,
  onSuccess
}: CreateRoleDialogProps) {
  const { state, actions } = useCreateRoleModal({
    existingRoles,
    groupedPermissions,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden'>
        <form onSubmit={actions.handleSubmit} className='flex flex-col h-full overflow-hidden'>
          <DialogHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
            <DialogTitle>Buat Peran Baru</DialogTitle>
            <DialogDescription>
              Definisikan peran baru, struktur hierarki, sifat medis/operasional, serta matriks
              perizinan awal.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className='flex-1 px-6 py-4 overflow-y-auto'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='role-code'>
                    Kode Peran <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='role-code'
                    placeholder='contoh: receptionist_lead'
                    value={state.code}
                    onChange={(e) =>
                      actions.setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                    }
                    disabled={state.isSubmitting}
                  />
                  <p className='text-[11px] text-muted-foreground'>
                    Format snake_case huruf kecil tanpa spasi.
                  </p>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='role-name'>
                    Nama Tampilan <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='role-name'
                    placeholder='contoh: Kepala Resepsionis'
                    value={state.name}
                    onChange={(e) => actions.setName(e.target.value)}
                    disabled={state.isSubmitting}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='role-desc'>Deskripsi Tanggung Jawab</Label>
                <Textarea
                  id='role-desc'
                  placeholder='Jelaskan tanggung jawab utama dan cakupan peran ini...'
                  value={state.description}
                  onChange={(e) => actions.setDescription(e.target.value)}
                  disabled={state.isSubmitting}
                  rows={2}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1'>
                <div className='space-y-1.5'>
                  <Label>Tingkatan (Tier)</Label>
                  <Select
                    value={state.tier}
                    onValueChange={(val) => actions.setTier(val as RoleTier)}
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
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='internal'>Internal (Staf/Klinik)</SelectItem>
                      <SelectItem value='external'>External (Pasien)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label>Peran Induk</Label>
                  <Select value={state.parentRoleId} onValueChange={actions.setParentRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih peran induk...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>Tanpa Induk (Mandiri)</SelectItem>
                      {state.macroRoles.map((mr) => (
                        <SelectItem key={mr.id} value={mr.id}>
                          {mr.name} ({mr.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='flex items-center justify-between p-3.5 rounded-lg border bg-muted/30'>
                <div className='space-y-0.5'>
                  <Label className='text-sm font-medium'>Tenaga Medis / Klinis</Label>
                  <p className='text-xs text-muted-foreground'>
                    Aktifkan jika peran ini melakukan tindakan konsultasi atau rekam medis (dokter,
                    bidan, perawat).
                  </p>
                </div>
                <Switch
                  checked={state.isClinical}
                  onCheckedChange={actions.setIsClinical}
                  disabled={state.isSubmitting}
                />
              </div>

              {/* Permissions Selector Section */}
              <div className='space-y-2.5 pt-2 border-t'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Hak Akses & Perizinan Awal ({state.selectedPermissionIds.length} dipilih)
                  </Label>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 border rounded-lg overflow-hidden'>
                  {/* Category Sidebar */}
                  <div className='bg-muted/40 border-r p-2 space-y-1 max-h-56 overflow-y-auto'>
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
                  <div className='col-span-2 p-3 space-y-2 max-h-56 overflow-y-auto'>
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
                            return (
                              <label
                                key={perm.id}
                                className='flex items-start gap-2.5 p-1.5 rounded hover:bg-muted/50 cursor-pointer select-none'
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => actions.handleTogglePermission(perm.id)}
                                  className='mt-0.5'
                                />
                                <div className='space-y-0.5 leading-none'>
                                  <p className='text-xs font-medium text-foreground'>{perm.code}</p>
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
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={state.isSubmitting}
            >
              Batal
            </Button>
            <Button type='submit' disabled={state.isSubmitting}>
              {state.isSubmitting ? 'Membuat Peran...' : 'Simpan Peran'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

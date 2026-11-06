'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { CLINICAL_MODULE_INFO } from '@/core/auth/permissions.constants';
import type { Permission, Role } from '../../types/role.types';

export interface RolePermissionsStepProps {
  categories: string[];
  groupedPermissions: Record<string, Permission[]>;
  selectedPermissionIds: string[];
  effectivePermissionCodes?: string[];
  permissionSearch?: string;
  existingRoles?: Role[];
  onTogglePermission: (id: string) => void;
  onSetModulePermissions?: (toAdd: string[], toRemove: string[]) => void;
  onCopyFromRole?: (sourceRoleId: string) => void;
  onSearchChange?: (query: string) => void;
  disabled?: boolean;
}

type ModuleAccessLevel = 'none' | 'view' | 'manage' | 'custom';

export function RolePermissionsStep({
  categories,
  groupedPermissions,
  selectedPermissionIds,
  effectivePermissionCodes = [],
  permissionSearch = '',
  existingRoles = [],
  onTogglePermission,
  onSetModulePermissions,
  onCopyFromRole,
  onSearchChange,
  disabled
}: RolePermissionsStepProps) {
  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (cat: string) => {
    setExpandedModules((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Determine access level for a module
  const getModuleAccessLevel = React.useCallback(
    (cat: string): ModuleAccessLevel => {
      const perms = groupedPermissions[cat] || [];
      if (perms.length === 0) return 'none';

      const selectedCount = perms.filter((p) => selectedPermissionIds.includes(p.id)).length;
      if (selectedCount === 0) return 'none';
      if (selectedCount === perms.length) return 'manage';

      const moduleDef = CLINICAL_MODULE_INFO[cat];
      if (moduleDef) {
        const viewPermIds = perms
          .filter((p) => moduleDef.viewCodes.includes(p.code))
          .map((p) => p.id);
        const nonViewPermIds = perms
          .filter((p) => !moduleDef.viewCodes.includes(p.code))
          .map((p) => p.id);

        const allViewsSelected =
          viewPermIds.length > 0 && viewPermIds.every((id) => selectedPermissionIds.includes(id));
        const noNonViewsSelected = nonViewPermIds.every((id) => !selectedPermissionIds.includes(id));

        if (allViewsSelected && noNonViewsSelected) {
          return 'view';
        }
      }

      return 'custom';
    },
    [groupedPermissions, selectedPermissionIds]
  );

  // Apply access level to a specific module
  const handleApplyAccessLevel = React.useCallback(
    (cat: string, level: 'none' | 'view' | 'manage') => {
      const perms = groupedPermissions[cat] || [];
      if (perms.length === 0) return;

      const moduleDef = CLINICAL_MODULE_INFO[cat];
      const allPermIds = perms.map((p) => p.id);

      if (level === 'none') {
        if (onSetModulePermissions) {
          onSetModulePermissions([], allPermIds);
        } else {
          for (const id of allPermIds) {
            if (selectedPermissionIds.includes(id)) {
              onTogglePermission(id);
            }
          }
        }
      } else if (level === 'manage') {
        if (onSetModulePermissions) {
          onSetModulePermissions(allPermIds, []);
        } else {
          for (const id of allPermIds) {
            if (!selectedPermissionIds.includes(id)) {
              onTogglePermission(id);
            }
          }
        }
      } else if (level === 'view') {
        const viewCodes = moduleDef?.viewCodes || [];
        const viewPermIds = perms
          .filter((p) => viewCodes.includes(p.code) || p.code.endsWith(':read'))
          .map((p) => p.id);
        const nonViewPermIds = perms
          .filter((p) => !viewPermIds.includes(p.id))
          .map((p) => p.id);

        if (onSetModulePermissions) {
          onSetModulePermissions(viewPermIds, nonViewPermIds);
        } else {
          for (const id of viewPermIds) {
            if (!selectedPermissionIds.includes(id)) onTogglePermission(id);
          }
          for (const id of nonViewPermIds) {
            if (selectedPermissionIds.includes(id)) onTogglePermission(id);
          }
        }
      }
    },
    [groupedPermissions, onSetModulePermissions, onTogglePermission, selectedPermissionIds]
  );

  return (
    <div className='space-y-4 font-sans'>
      {/* Header */}
      <div className='flex items-start justify-between gap-2'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Apa saja hak akses yang boleh dibuka?
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Tentukan tingkat hak akses per modul layanan klinik atau salin dari peran lain.
          </p>
        </div>
        <span className='inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold shrink-0'>
          {selectedPermissionIds.length} izin aktif
        </span>
      </div>

      {/* Dynamic Copy From Role Dropdown (Driven by Database existingRoles) */}
      {existingRoles.length > 0 && onCopyFromRole && (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20'>
          <div className='space-y-0.5'>
            <p className='text-xs font-semibold text-foreground'>Salin Izin dari Peran yang Ada</p>
            <p className='text-[11px] text-muted-foreground'>
              Salin seluruh konfigurasi izin dari peran terdaftar di database klinik.
            </p>
          </div>
          <Select onValueChange={onCopyFromRole} disabled={disabled}>
            <SelectTrigger className='h-8 text-xs w-full sm:w-52 bg-card'>
              <SelectValue placeholder='Pilih peran acuan...' />
            </SelectTrigger>
            <SelectContent>
              {existingRoles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Optional Search */}
      {onSearchChange && (
        <div className='relative'>
          <Icons.search className='absolute left-2.5 top-2.5 size-3.5 text-muted-foreground' />
          <Input
            placeholder='Cari kode atau nama izin...'
            value={permissionSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className='h-8 pl-8 text-xs'
          />
        </div>
      )}

      {/* Modules List with 3-Level Access Selectors & Accordions */}
      <div className='border rounded-xl overflow-hidden bg-card divide-y divide-border/60 max-h-80 overflow-y-auto pr-0.5'>
        {categories.map((cat) => {
          const perms = groupedPermissions[cat] || [];
          const moduleInfo = CLINICAL_MODULE_INFO[cat];
          const title = moduleInfo?.title || cat.charAt(0).toUpperCase() + cat.slice(1);
          const description = moduleInfo?.description || `Pengaturan izin untuk kategori ${cat}`;
          const currentLevel = getModuleAccessLevel(cat);
          const isExpanded = Boolean(expandedModules[cat]);

          const filteredPerms = permissionSearch?.trim()
            ? perms.filter(
                (p) =>
                  p.code.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                  p.description?.toLowerCase().includes(permissionSearch.toLowerCase())
              )
            : perms;

          return (
            <div key={cat} className='p-3 space-y-2.5 transition-colors hover:bg-muted/10'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                {/* Module Title & Description */}
                <div className='space-y-0.5 max-w-sm'>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-xs sm:text-sm font-semibold text-foreground'>{title}</h4>
                    {currentLevel === 'custom' && (
                      <Badge variant='outline' className='text-[10px] h-4 px-1.5 text-amber-600 border-amber-300'>
                        Kustom
                      </Badge>
                    )}
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-normal'>{description}</p>
                </div>

                {/* 3-Level Access Selector */}
                <div className='flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/60 shrink-0 self-start sm:self-auto'>
                  <button
                    type='button'
                    disabled={disabled}
                    onClick={() => handleApplyAccessLevel(cat, 'none')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                      currentLevel === 'none'
                        ? 'bg-card text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Tidak Ada
                  </button>

                  <button
                    type='button'
                    disabled={disabled}
                    onClick={() => handleApplyAccessLevel(cat, 'view')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                      currentLevel === 'view'
                        ? 'bg-primary/10 text-primary shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Hanya Lihat
                  </button>

                  <button
                    type='button'
                    disabled={disabled}
                    onClick={() => handleApplyAccessLevel(cat, 'manage')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                      currentLevel === 'manage'
                        ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Kelola Penuh
                  </button>
                </div>
              </div>

              {/* Collapsible toggle for fine-grained permissions */}
              <div className='pt-0.5'>
                <button
                  type='button'
                  onClick={() => toggleExpand(cat)}
                  className='text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer'
                >
                  <Icons.chevronRight className={cn('size-3 transition-transform', isExpanded && 'rotate-90')} />
                  <span>{isExpanded ? 'Sembunyikan detail izin' : `Lihat detail izin (${perms.length})`}</span>
                </button>

                {isExpanded && (
                  <div className='mt-2 pl-4 border-l-2 border-border/70 space-y-1.5'>
                    {filteredPerms.map((perm) => {
                      const isChecked = selectedPermissionIds.includes(perm.id);
                      const isInherited = !isChecked && effectivePermissionCodes.includes(perm.code);

                      return (
                        <label
                          key={perm.id}
                          className={cn(
                            'flex items-start gap-2 p-1.5 rounded-lg border transition-colors cursor-pointer select-none text-xs',
                            isChecked ? 'border-primary/30 bg-primary/5' : 'border-transparent hover:bg-muted/40'
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => onTogglePermission(perm.id)}
                            disabled={disabled}
                            className='mt-0.5'
                          />
                          <div className='space-y-0.5 leading-none flex-1'>
                            <div className='flex items-center gap-1.5'>
                              <span className='font-mono text-[11px] font-medium text-foreground'>{perm.code}</span>
                              {isInherited && (
                                <Badge variant='outline' className='text-[9px] h-3.5 px-1 text-muted-foreground'>
                                  Diwarisi
                                </Badge>
                              )}
                            </div>
                            {perm.description && (
                              <p className='text-[10px] text-muted-foreground leading-normal'>{perm.description}</p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

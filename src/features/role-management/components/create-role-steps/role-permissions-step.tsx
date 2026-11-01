'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Permission } from '../../types/role.types';

export interface RolePermissionsStepProps {
  categories: string[];
  activeCategory: string;
  groupedPermissions: Record<string, Permission[]>;
  selectedPermissionIds: string[];
  effectivePermissionCodes?: string[];
  permissionSearch: string;
  onSelectCategory: (cat: string) => void;
  onSearchChange: (query: string) => void;
  onTogglePermission: (id: string) => void;
  onSelectAllCategory: (cat: string) => void;
  disabled?: boolean;
}

export function RolePermissionsStep({
  categories,
  activeCategory,
  groupedPermissions,
  selectedPermissionIds,
  effectivePermissionCodes = [],
  permissionSearch,
  onSelectCategory,
  onSearchChange,
  onTogglePermission,
  onSelectAllCategory,
  disabled
}: RolePermissionsStepProps) {
  const currentCategoryPermissions = React.useMemo(() => {
    const list = groupedPermissions[activeCategory] || [];
    if (!permissionSearch.trim()) return list;
    const query = permissionSearch.toLowerCase();
    return list.filter(
      (p) => p.code.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
    );
  }, [activeCategory, groupedPermissions, permissionSearch]);

  const allInCurrentCategorySelected = React.useMemo(() => {
    const list = groupedPermissions[activeCategory] || [];
    if (list.length === 0) return false;
    return list.every((p) => selectedPermissionIds.includes(p.id));
  }, [activeCategory, groupedPermissions, selectedPermissionIds]);

  return (
    <div className='space-y-4 font-sans'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Apa saja hak akses yang boleh dibuka?
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Pilih izin dan fitur yang boleh digunakan oleh peran ini.
          </p>
        </div>
        <span className='inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold shrink-0'>
          {selectedPermissionIds.length} izin dipilih
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 border rounded-xl overflow-hidden bg-card'>
        {/* Left: Category Sidebar */}
        <div className='bg-muted/30 border-r border-border p-2 space-y-1 max-h-64 sm:max-h-72 overflow-y-auto'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1'>
            Kategori
          </p>
          {categories.map((cat) => {
            const catPerms = groupedPermissions[cat] || [];
            const selectedInCat = catPerms.filter((p) =>
              selectedPermissionIds.includes(p.id)
            ).length;
            const isSelected = activeCategory === cat;

            return (
              <button
                key={cat}
                type='button'
                disabled={disabled}
                onClick={() => onSelectCategory(cat)}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <span className='capitalize truncate'>{cat}</span>
                {selectedInCat > 0 && (
                  <Badge
                    variant={isSelected ? 'outline' : 'secondary'}
                    className={cn(
                      'ml-1 text-[10px] h-4 px-1.5 shrink-0',
                      isSelected && 'border-primary-foreground/30 text-primary-foreground'
                    )}
                  >
                    {selectedInCat}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Permissions List */}
        <div className='col-span-2 p-3 space-y-2.5 max-h-64 sm:max-h-72 flex flex-col min-h-0'>
          {/* Header with Search & Select All */}
          <div className='flex items-center justify-between gap-2 pb-2 border-b border-border shrink-0'>
            <div className='relative flex-1'>
              <Icons.search className='absolute left-2.5 top-2.5 size-3 text-muted-foreground' />
              <Input
                placeholder={`Cari izin di ${activeCategory}...`}
                value={permissionSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={disabled}
                className='h-8 pl-8 text-xs'
              />
            </div>

            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={disabled}
              onClick={() => onSelectAllCategory(activeCategory)}
              className='h-8 text-xs px-2.5 shrink-0'
            >
              {allInCurrentCategorySelected ? 'Batal Semua' : 'Pilih Semua'}
            </Button>
          </div>

          {/* Permissions Scrollable List */}
          <div className='flex-1 overflow-y-auto space-y-1.5 pr-1'>
            {currentCategoryPermissions.length === 0 ? (
              <p className='text-xs text-muted-foreground text-center py-6'>
                Tidak ada izin yang cocok.
              </p>
            ) : (
              currentCategoryPermissions.map((perm) => {
                const isChecked = selectedPermissionIds.includes(perm.id);
                const isInherited = !isChecked && effectivePermissionCodes.includes(perm.code);

                return (
                  <label
                    key={perm.id}
                    className={cn(
                      'flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer select-none',
                      isChecked
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-transparent hover:bg-muted/50'
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
                        <p className='text-xs font-semibold text-foreground font-mono'>
                          {perm.code}
                        </p>
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
                        <p className='text-[11px] text-muted-foreground leading-normal'>
                          {perm.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

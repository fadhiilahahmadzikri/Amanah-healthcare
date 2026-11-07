'use client';

import * as React from 'react';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Undo, Redo, RotateCcw } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group';
import { toast } from 'sonner';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { getPortalPrefix } from '@/core/routes';
import { roleManagementApi } from '../api/role-management.api';
import { roleManagementKeys } from '../api/query-keys';
import type { ApplicationPage } from '../types/role.types';

export interface EditPageModalProps {
  open: boolean;
  onClose: () => void;
  page: ApplicationPage | null;
  parentCategories?: ApplicationPage[];
  isNewCategory?: boolean;
  audience: string;
}

interface FormState {
  name: string;
  slugSuffix: string;
  description: string;
  icon: string;
  displayOrder: number;
  aliasSuffix: string;
  parentPageId: string;
  targetAudience: 'internal' | 'external';
}

// Client-side Zod Validation Schemas
const categoryValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama kategori minimal 2 karakter')
    .max(150, 'Nama kategori maksimal 150 karakter'),
  slugSuffix: z
    .string()
    .trim()
    .min(2, 'Slug minimal 2 karakter')
    .max(80, 'Slug maksimal 80 karakter')
    .regex(/^[a-z0-9_]+$/, 'Hanya boleh huruf kecil, angka, dan garis bawah (_)'),
  displayOrder: z
    .number()
    .int('Urutan harus berupa angka bulat')
    .min(0, 'Urutan minimal 0')
    .max(999, 'Urutan maksimal 999'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional()
});

const pageValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama halaman minimal 2 karakter')
    .max(150, 'Nama halaman maksimal 150 karakter'),
  displayOrder: z
    .number()
    .int('Urutan harus berupa angka bulat')
    .min(0, 'Urutan minimal 0')
    .max(999, 'Urutan maksimal 999'),
  aliasSuffix: z
    .string()
    .regex(
      /^[a-z0-9\-_]*$/,
      'Alias hanya boleh huruf kecil, angka, tanda minus (-), atau garis bawah (_)'
    )
    .optional(),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional()
});

export function EditPageModal({
  open,
  onClose,
  page,
  parentCategories = [],
  isNewCategory = false,
  audience: initialAudienceProp
}: EditPageModalProps) {
  const queryClient = useQueryClient();
  const isCategory = isNewCategory || page?.routePath === '#';

  // Form Validation Errors State
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Helper to extract raw alias suffix without audience prefix
  const extractSuffix = React.useCallback(
    (alias?: string | null, prefix?: string): string => {
      if (!alias) return '';
      if (prefix && alias.startsWith(prefix)) {
        return alias.slice(prefix.length);
      }
      return alias.replace(/^\/+/, '');
    },
    []
  );

  // Extract category slug suffix (e.g. "admin.patient_care" -> "patient_care")
  const extractSlugSuffix = React.useCallback((slug?: string | null): string => {
    if (!slug) return '';
    if (slug.startsWith('admin.')) return slug.slice(6);
    if (slug.startsWith('external.')) return slug.slice(9);
    return slug;
  }, []);

  const buildInitialState = React.useCallback((): FormState => {
    const rawAudience =
      (page?.audience as 'internal' | 'external') ||
      (initialAudienceProp === 'external' ? 'external' : 'internal');
    const pfx = `${getPortalPrefix(rawAudience)}/`;

    if (page) {
      return {
        name: page.name || '',
        slugSuffix: extractSlugSuffix(page.slug),
        description: page.description || '',
        icon: page.icon || (page.routePath === '#' ? 'folder' : 'file'),
        displayOrder: page.displayOrder ?? 10,
        aliasSuffix: extractSuffix(page.customAlias, pfx),
        parentPageId: page.parentPageId || 'none',
        targetAudience: rawAudience
      };
    }

    return {
      name: '',
      slugSuffix: '',
      description: '',
      icon: 'folder',
      displayOrder: 100,
      aliasSuffix: '',
      parentPageId: 'none',
      targetAudience: rawAudience
    };
  }, [page, initialAudienceProp, extractSuffix, extractSlugSuffix]);

  // Undo / Redo & Baseline State History
  const [history, setHistory] = React.useState<FormState[]>([buildInitialState()]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  // Sync state whenever the dialog opens or target page changes
  React.useEffect(() => {
    if (open) {
      const initial = buildInitialState();
      setHistory([initial]);
      setHistoryIndex(0);
      setErrors({});
    }
  }, [open, buildInitialState]);

  const currentState = history[historyIndex] ?? buildInitialState();
  const activeAudience = currentState.targetAudience;

  // Canonical prefix derived from centralized routes configuration
  const routePrefix = `${getPortalPrefix(activeAudience)}/`;
  const slugPrefix = activeAudience === 'external' ? 'external.' : 'admin.';

  // Query categories if not passed explicitly (e.g. from top-level toolbar)
  const { data: cachedTree } = useQuery({
    queryKey: roleManagementKeys.pageTree(activeAudience),
    queryFn: () => roleManagementApi.getPageTree(activeAudience),
    enabled: open && parentCategories.length === 0,
    staleTime: 1000 * 60 * 5
  });

  const availableCategories = React.useMemo(() => {
    const pool = parentCategories.length > 0 ? parentCategories : cachedTree || [];
    return pool.filter(
      (p) => (p.routePath === '#' || !p.parentPageId) && p.id !== page?.id
    );
  }, [parentCategories, cachedTree, page?.id]);

  const updateState = React.useCallback(
    (updater: (prev: FormState) => FormState) => {
      setHistory((prev) => {
        const nextState = updater(prev[historyIndex] ?? prev[0]);
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, nextState];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const validateField = (field: string, value: unknown) => {
    const schema = isCategory ? categoryValidationSchema : pageValidationSchema;
    const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[field];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [field]: result.error.issues[0]?.message || 'Input tidak valid'
        }));
        return;
      }
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const undo = React.useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex]);

  const redo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
    }
  }, [historyIndex, history.length]);

  const resetToBaseline = React.useCallback(() => {
    if (historyIndex !== 0) {
      setHistoryIndex(0);
      setErrors({});
      toast.info('Nilai dikembalikan ke default baseline');
    }
  }, [historyIndex]);

  // Global Keyboard Shortcuts for Undo (Ctrl+Z) & Redo (Ctrl+Y / Ctrl+Shift+Z)
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (!isCtrlOrMeta) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        e.key.toLowerCase() === 'y' ||
        (e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, undo, redo]);

  const handleNameChange = (val: string) => {
    updateState((prev) => {
      const next: FormState = { ...prev, name: val };
      if (isNewCategory && (!prev.slugSuffix || prev.slugSuffix === '')) {
        next.slugSuffix = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
      }
      return next;
    });
    validateField('name', val);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const { name, slugSuffix, description, icon, displayOrder, aliasSuffix, parentPageId, targetAudience } =
        currentState;

      // Full Zod validation before API submission
      if (isCategory) {
        const result = categoryValidationSchema.safeParse({
          name,
          slugSuffix,
          displayOrder,
          description: description || undefined
        });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of result.error.issues) {
            const path = String(issue.path[0]);
            if (!fieldErrors[path]) fieldErrors[path] = issue.message;
          }
          setErrors(fieldErrors);
          throw new Error('Mohon lengkapi kolom yang belum sesuai');
        }

        const fullSlug = `${slugPrefix}${slugSuffix.trim().replace(/^_+|_+$/g, '')}`;

        if (isNewCategory) {
          return roleManagementApi.createPage({
            slug: fullSlug,
            name: name.trim(),
            description: description.trim() || undefined,
            routePath: '#',
            parentPageId: null,
            audience: targetAudience,
            icon,
            displayOrder: Number(displayOrder) || 100
          });
        }

        if (page) {
          return roleManagementApi.updatePage(page.id, {
            name: name.trim(),
            description: description.trim() || undefined,
            icon,
            displayOrder: Number(displayOrder) || 10
          });
        }
      }

      // Child Page update
      if (page) {
        const result = pageValidationSchema.safeParse({
          name,
          displayOrder,
          aliasSuffix: aliasSuffix || undefined,
          description: description || undefined
        });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of result.error.issues) {
            const path = String(issue.path[0]);
            if (!fieldErrors[path]) fieldErrors[path] = issue.message;
          }
          setErrors(fieldErrors);
          throw new Error('Mohon lengkapi kolom yang belum sesuai');
        }

        const trimmedSuffix = aliasSuffix.trim().replace(/^\/+/, '');
        const resolvedAlias = trimmedSuffix ? `${routePrefix}${trimmedSuffix}` : null;
        const resolvedParentId = parentPageId !== 'none' ? parentPageId : null;

        return roleManagementApi.updatePage(page.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          displayOrder: Number(displayOrder) || 10,
          customAlias: resolvedAlias,
          parentPageId: resolvedParentId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree(activeAudience) });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
      toast.success(
        isNewCategory
          ? 'Kategori menu baru berhasil dibuat'
          : 'Informasi halaman berhasil diperbarui'
      );
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan';
      toast.error(msg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-[460px] p-0 overflow-hidden font-sans border-border/80 shadow-2xl'>
        <form onSubmit={handleSubmit} className='flex flex-col'>
          {/* Header with Undo & Redo Toolbars */}
          <DialogHeader className='px-5 pt-5 pb-3 border-b border-border/40'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <DialogTitle className='text-sm sm:text-base font-bold text-foreground'>
                  {isNewCategory
                    ? 'Tambah Kategori Menu'
                    : isCategory
                      ? 'Edit Kategori Menu'
                      : 'Edit Halaman Menu'}
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  {isCategory
                    ? 'Folder penampung grup menu navigasi di sidebar.'
                    : 'Konfigurasi label, rute alias, urutan, dan kategori induk.'}
                </DialogDescription>
              </div>

              {/* Undo / Redo & Baseline Actions */}
              <div className='flex items-center gap-1 shrink-0'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={undo}
                  disabled={!canUndo}
                  title='Urungkan perubahan (Ctrl+Z)'
                  className='size-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30'
                >
                  <Undo className='size-3.5' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={redo}
                  disabled={!canRedo}
                  title='Ulangi perubahan (Ctrl+Y)'
                  className='size-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30'
                >
                  <Redo className='size-3.5' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={resetToBaseline}
                  disabled={!canUndo}
                  title='Kembalikan ke nilai awal'
                  className='size-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30'
                >
                  <RotateCcw className='size-3.5' />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Form Body */}
          <div className='px-5 py-4 space-y-3.5 text-xs max-h-[68vh] overflow-y-auto scrollbar-thin'>
            {/* Audience Selection for New Category */}
            {isNewCategory && (
              <div className='space-y-1.5'>
                <Label htmlFor='target-audience' className='text-xs font-semibold'>
                  Audiens Portal <span className='text-destructive'>*</span>
                </Label>
                <Select
                  value={currentState.targetAudience}
                  onValueChange={(val: 'internal' | 'external') => {
                    updateState((prev) => ({ ...prev, targetAudience: val }));
                  }}
                >
                  <SelectTrigger id='target-audience' className='h-8 text-xs'>
                    <SelectValue placeholder='Pilih Audiens' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='internal'>Portal Admin (Internal)</SelectItem>
                    <SelectItem value='external'>Portal Pasien / Klinik (Eksternal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Page / Category Name */}
            <div className='space-y-1.5'>
              <Label htmlFor='page-name' className='text-xs font-semibold'>
                Nama {isCategory ? 'Kategori' : 'Menu / Halaman'} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='page-name'
                value={currentState.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isCategory ? 'Contoh: Pelayanan Khusus' : 'Contoh: Janji Temu Pasien'}
                className='h-8 text-xs'
                required
              />
              {errors.name && <p className='text-[10px] text-destructive'>{errors.name}</p>}
            </div>

            {/* Category Slug with Locked Persistent Prefix */}
            {isCategory && (
              <div className='space-y-1.5'>
                <Label htmlFor='category-slug-suffix' className='text-xs font-semibold'>
                  Identifier Slug <span className='text-destructive'>*</span>
                </Label>

                {isNewCategory ? (
                  <InputGroup className='h-8 font-mono text-xs'>
                    <InputGroupAddon align='inline-start'>
                      <InputGroupText className='font-mono text-xs font-semibold text-muted-foreground select-none'>
                        {slugPrefix}
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id='category-slug-suffix'
                      value={currentState.slugSuffix}
                      onChange={(e) => {
                        const clean = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, '_')
                          .replace(/^_+/, '');
                        updateState((prev) => ({ ...prev, slugSuffix: clean }));
                        validateField('slugSuffix', clean);
                      }}
                      placeholder='kategori_baru'
                      className='font-mono text-xs'
                      required
                    />
                  </InputGroup>
                ) : (
                  <div className='flex items-center justify-between text-[11px] py-1 px-2.5 rounded-md bg-muted/30 border border-border/50 text-muted-foreground'>
                    <span>Slug Sistem:</span>
                    <span className='font-mono font-medium text-foreground'>{page?.slug}</span>
                  </div>
                )}
                {errors.slugSuffix && <p className='text-[10px] text-destructive'>{errors.slugSuffix}</p>}
              </div>
            )}

            {/* Icon (HUG width) + Display Order in clean compact layout */}
            <div className='grid grid-cols-[auto_1fr] gap-3 items-end'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>
                  Visual Icon <span className='text-muted-foreground text-[10px] font-normal'>(Opsional)</span>
                </Label>
                <ShiftIconPickerPopover
                  value={currentState.icon}
                  onChange={(val) => updateState((prev) => ({ ...prev, icon: val }))}
                  fallback={currentState.name.charAt(0) || 'M'}
                  disabled={mutation.isPending}
                  className='h-8 w-auto min-w-[56px] px-2.5 gap-2 justify-center shrink-0'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='page-order' className='text-xs font-semibold'>
                  Urutan Tampilan <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='page-order'
                  type='number'
                  value={currentState.displayOrder}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    updateState((prev) => ({ ...prev, displayOrder: val }));
                    validateField('displayOrder', val);
                  }}
                  className='h-8 text-xs'
                  min={0}
                  max={999}
                />
                {errors.displayOrder && <p className='text-[10px] text-destructive'>{errors.displayOrder}</p>}
              </div>
            </div>

            {/* Parent Category Selection for Child Pages */}
            {!isCategory && (
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='parent-cat-select' className='text-xs font-semibold'>
                    Kategori / Folder Induk <span className='text-muted-foreground text-[10px] font-normal'>(Opsional)</span>
                  </Label>
                  {currentState.parentPageId !== 'none' && (
                    <button
                      type='button'
                      onClick={() => updateState((prev) => ({ ...prev, parentPageId: 'none' }))}
                      className='text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer'
                      title='Lepaskan halaman dari kategori agar menjadi halaman mandiri'
                    >
                      Lepaskan dari Kategori (Jadikan Mandiri)
                    </button>
                  )}
                </div>
                <Select
                  value={currentState.parentPageId}
                  onValueChange={(val) =>
                    updateState((prev) => ({ ...prev, parentPageId: val }))
                  }
                >
                  <SelectTrigger id='parent-cat-select' className='h-8 text-xs'>
                    <SelectValue placeholder='Pilih Kategori Induk' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Tanpa Kategori (Halaman Utama / Mandiri)</SelectItem>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Route Alias with Locked Persistent Prefix */}
            {!isCategory && (
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='page-alias-input' className='text-xs font-semibold'>
                    URL Alias Kustom <span className='text-muted-foreground text-[10px] font-normal'>(Opsional)</span>
                  </Label>
                  {currentState.aliasSuffix && (
                    <button
                      type='button'
                      onClick={() => {
                        updateState((prev) => ({ ...prev, aliasSuffix: '' }));
                        validateField('aliasSuffix', '');
                      }}
                      className='text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer'
                      title='Kembalikan ke rute fisik bawaan'
                    >
                      Reset ke Rute Bawaan
                    </button>
                  )}
                </div>

                <InputGroup className='h-8 font-mono text-xs'>
                  <InputGroupAddon align='inline-start'>
                    <InputGroupText className='font-mono text-xs font-semibold text-muted-foreground select-none'>
                      {routePrefix}
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id='page-alias-input'
                    value={currentState.aliasSuffix}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9\-_]/g, '-')
                        .replace(/^-+/, '');
                      updateState((prev) => ({ ...prev, aliasSuffix: clean }));
                      validateField('aliasSuffix', clean);
                    }}
                    placeholder={
                      page?.routePath
                        ? page.routePath.replace(routePrefix, '')
                        : 'alias-halaman'
                    }
                    className='font-mono text-xs'
                  />
                </InputGroup>
                {errors.aliasSuffix && <p className='text-[10px] text-destructive'>{errors.aliasSuffix}</p>}

                <p className='text-[10px] text-muted-foreground'>
                  Rute fisik bawaan:{' '}
                  <span className='font-mono text-foreground font-semibold'>
                    {page?.routePath}
                  </span>
                </p>
              </div>
            )}

            {/* Description */}
            <div className='space-y-1.5'>
              <Label htmlFor='page-desc' className='text-xs font-semibold'>
                Deskripsi Singkat <span className='text-muted-foreground text-[10px] font-normal'>(Opsional)</span>
              </Label>
              <Input
                id='page-desc'
                value={currentState.description}
                onChange={(e) => {
                  updateState((prev) => ({ ...prev, description: e.target.value }));
                  validateField('description', e.target.value);
                }}
                placeholder='Keterangan singkat fungsi halaman'
                className='h-8 text-xs'
              />
              {errors.description && <p className='text-[10px] text-destructive'>{errors.description}</p>}
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className='px-5 py-3 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={mutation.isPending}
              className='h-8 text-xs cursor-pointer'
            >
              Batal
            </Button>

            <Button
              type='submit'
              size='sm'
              disabled={mutation.isPending}
              className='h-8 text-xs font-medium cursor-pointer'
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

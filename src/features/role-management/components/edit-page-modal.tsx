'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { roleManagementApi } from '../api/role-management.api';
import { roleManagementKeys } from '../api/query-keys';
import type { ApplicationPage } from '../types/role.types';

export interface EditPageModalProps {
  open: boolean;
  onClose: () => void;
  page: ApplicationPage | null;
  parentCategories: ApplicationPage[];
  isNewCategory?: boolean;
  audience: string;
}

export function EditPageModal({
  open,
  onClose,
  page,
  parentCategories,
  isNewCategory = false,
  audience
}: EditPageModalProps) {
  const queryClient = useQueryClient();

  const isCategory = isNewCategory || page?.routePath === '#';

  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [icon, setIcon] = React.useState('folder');
  const [displayOrder, setDisplayOrder] = React.useState(10);
  const [parentPageId, setParentPageId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (page) {
      setName(page.name || '');
      setSlug(page.slug || '');
      setDescription(page.description || '');
      setIcon(page.icon || (page.routePath === '#' ? 'folder' : 'file'));
      setDisplayOrder(page.displayOrder ?? 10);
      setParentPageId(page.parentPageId ?? null);
    } else if (isNewCategory) {
      setName('');
      setSlug('');
      setDescription('');
      setIcon('folder');
      setDisplayOrder(100);
      setParentPageId(null);
    }
  }, [page, isNewCategory, open]);

  const autoGenerateSlug = (text: string) => {
    return (
      audience +
      '.' +
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
    );
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isNewCategory && (!slug || slug.startsWith(`${audience}.`))) {
      setSlug(autoGenerateSlug(val));
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (isNewCategory) {
        if (!name.trim()) throw new Error('Nama kategori wajib diisi');
        if (!slug.trim()) throw new Error('Slug kategori wajib diisi');
        return roleManagementApi.createPage({
          slug: slug.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          routePath: '#',
          parentPageId: null,
          audience,
          icon,
          displayOrder: Number(displayOrder) || 100
        });
      } else if (page) {
        if (!name.trim()) throw new Error('Nama halaman/kategori wajib diisi');
        return roleManagementApi.updatePage(page.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          displayOrder: Number(displayOrder) || 10,
          parentPageId: isCategory ? undefined : parentPageId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree(audience) });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
      toast.success(
        isNewCategory ? 'Kategori menu baru berhasil dibuat' : 'Informasi halaman berhasil diperbarui'
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

  return (
    <ModalWrapper
      isOpen={open}
      onClose={onClose}
      maxWidth='max-w-[480px]'
      className='flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[480px] my-auto shadow-2xl font-sans'
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Header */}
        <div className='pb-2 border-b border-border/40'>
          <h3 className='text-base font-bold text-foreground'>
            {isNewCategory
              ? 'Tambah Kategori Menu Baru'
              : isCategory
                ? 'Edit Kategori Menu'
                : 'Edit Halaman Menu'}
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {isCategory
              ? 'Kategori bertindak sebagai folder penampung menu di sidebar.'
              : 'Sesuaikan label, urutan tampilan, dan kategori induk halaman ini.'}
          </p>
        </div>

        {/* Inputs */}
        <div className='space-y-3 pt-1'>
          <div className='space-y-1.5'>
            <Label htmlFor='page-name' className='text-xs font-semibold'>
              {isCategory ? 'Nama Kategori' : 'Nama Menu / Halaman'}
            </Label>
            <Input
              id='page-name'
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={isCategory ? 'Contoh: Pelayanan Khusus' : 'Contoh: Janji Temu Dokter'}
              className='h-8 text-xs'
              required
            />
          </div>

          {isNewCategory ? (
            <div className='space-y-1.5'>
              <Label htmlFor='page-slug' className='text-xs font-semibold'>
                Identifier Slug
              </Label>
              <Input
                id='page-slug'
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder='admin.kategori_baru'
                className='h-8 font-mono text-xs'
                required
              />
              <p className='text-[10px] text-muted-foreground'>
                Format kode unik identifier: huruf kecil, angka, titik, atau garis bawah.
              </p>
            </div>
          ) : (
            <div className='space-y-1'>
              <span className='text-[11px] text-muted-foreground'>Slug Teknis:</span>{' '}
              <span className='font-mono text-[10px] text-foreground bg-muted/50 px-1.5 py-0.5 rounded border'>
                {slug}
              </span>
            </div>
          )}

          <div className='space-y-1.5'>
            <Label htmlFor='page-desc' className='text-xs font-semibold'>
              Deskripsi Singkat
            </Label>
            <Input
              id='page-desc'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Deskripsi tujuan halaman atau menu'
              className='h-8 text-xs'
            />
          </div>

          <div className='grid grid-cols-2 gap-3 items-end'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Visual Icon / Emoji
              </Label>
              <ShiftIconPickerPopover
                value={icon}
                onChange={setIcon}
                fallback={name.charAt(0) || 'M'}
                disabled={mutation.isPending}
                className='w-full h-8 justify-between'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='page-order' className='text-xs font-semibold'>
                Urutan Tampilan
              </Label>
              <Input
                id='page-order'
                type='number'
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className='h-8 text-xs'
                min={0}
                max={999}
              />
            </div>
          </div>

          {/* Re-parenting Dropdown for Child Pages */}
          {!isCategory && (
            <div className='space-y-1.5 pt-1'>
              <Label htmlFor='parent-cat' className='text-xs font-semibold'>
                Pindah ke Kategori / Folder Induk
              </Label>
              <select
                id='parent-cat'
                value={parentPageId || ''}
                onChange={(e) => setParentPageId(e.target.value || null)}
                className='w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-ring'
              >
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
              <p className='text-[10px] text-muted-foreground'>
                Memindahkan halaman ini ke kategori lain akan langsung memperbarui posisi grupnya di
                sidebar.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/40'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            shape='pill'
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>

          <Button
            type='submit'
            variant='primary'
            size='sm'
            shape='pill'
            isLoading={mutation.isPending}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

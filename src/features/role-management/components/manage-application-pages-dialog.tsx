'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderPlus, Layers, Unlink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { roleManagementApi } from '../api/role-management.api';
import { roleManagementKeys } from '../api/query-keys';
import { EditPageModal } from './edit-page-modal';
import type { ApplicationPage } from '../types/role.types';

export interface ManageApplicationPagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage?: boolean;
}

export function ManageApplicationPagesDialog({
  open,
  onOpenChange,
  canManage = true
}: ManageApplicationPagesDialogProps) {
  const queryClient = useQueryClient();
  const [selectedAudienceTab, setSelectedAudienceTab] = React.useState<'all' | 'internal' | 'external'>('all');
  const [editingPage, setEditingPage] = React.useState<ApplicationPage | null>(null);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = React.useState(false);

  // Fetch page trees for both internal and external
  const { data: internalTree = [], isLoading: isLoadingInternal } = useQuery({
    queryKey: roleManagementKeys.pageTree('internal'),
    queryFn: () => roleManagementApi.getPageTree('internal'),
    enabled: open,
    staleTime: 1000 * 30
  });

  const { data: externalTree = [], isLoading: isLoadingExternal } = useQuery({
    queryKey: roleManagementKeys.pageTree('external'),
    queryFn: () => roleManagementApi.getPageTree('external'),
    enabled: open,
    staleTime: 1000 * 30
  });

  const isLoading = isLoadingInternal || isLoadingExternal;

  const displayedPages = React.useMemo(() => {
    if (selectedAudienceTab === 'internal') return internalTree;
    if (selectedAudienceTab === 'external') return externalTree;
    return [...internalTree, ...externalTree];
  }, [selectedAudienceTab, internalTree, externalTree]);

  const [detachingCategory, setDetachingCategory] = React.useState<ApplicationPage | null>(null);

  // Group into categories (folders) and standalone top-level pages
  const { categories, standalonePages } = React.useMemo(() => {
    const categories: ApplicationPage[] = [];
    const standalonePages: ApplicationPage[] = [];

    for (const page of displayedPages) {
      if (page.routePath === '#') {
        categories.push(page);
      } else {
        standalonePages.push(page);
      }
    }

    return { categories, standalonePages };
  }, [displayedPages]);

  // Extract all categories for parent folder selection
  const parentCategories = React.useMemo(() => {
    return displayedPages.filter((p) => p.routePath === '#' || !p.parentPageId);
  }, [displayedPages]);

  // Mutation to toggle page CMS availability
  const togglePageMutation = useMutation({
    mutationFn: ({ pageId, isEnabled }: { pageId: string; isEnabled: boolean }) =>
      roleManagementApi.togglePage(pageId, isEnabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('internal') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('external') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
      toast.success(
        variables.isEnabled
          ? 'Halaman berhasil diaktifkan di CMS'
          : 'Halaman dinonaktifkan di CMS'
      );
    },
    onError: () => {
      toast.error('Gagal memperbarui status halaman');
    }
  });

  // Mutation to detach all children from a category
  const detachChildrenMutation = useMutation({
    mutationFn: (pageId: string) => roleManagementApi.detachChildren(pageId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('internal') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('external') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
      toast.success(
        `Berhasil melepaskan ${data.detachedCount} halaman menjadi halaman mandiri`
      );
      setDetachingCategory(null);
    },
    onError: () => {
      toast.error('Gagal melepaskan halaman dari kategori');
    }
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[960px] h-[86vh] max-h-[86vh] p-0 flex flex-col overflow-hidden font-sans border-border/80 shadow-2xl'>
          {/* Header with Title & Audience Tabs */}
          <DialogHeader className='px-6 pt-5 pb-3 border-b border-border/40 shrink-0 space-y-3'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2.5'>
                <div>
                  <DialogTitle className='text-base font-bold text-foreground'>
                    Kelola Katalog & Akses Halaman CMS
                  </DialogTitle>
                  <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                    Sentralisasi konfigurasi nama menu, visual icon, URL alias, urutan, dan status aktif halaman aplikasi.
                  </DialogDescription>
                </div>
              </div>

              {canManage && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setIsNewCategoryOpen(true)}
                  className='h-8 text-xs font-medium gap-1.5 cursor-pointer shrink-0'
                >
                  <FolderPlus className='size-3.5' />
                  <span>Tambah Kategori</span>
                </Button>
              )}
            </div>

            {/* Audience Filter Segmented Tabs */}
            <div className='flex items-center gap-1.5 pt-1'>
              <button
                type='button'
                onClick={() => setSelectedAudienceTab('all')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none',
                  selectedAudienceTab === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Semua Portal ({displayedPages.length})
              </button>
              <button
                type='button'
                onClick={() => setSelectedAudienceTab('internal')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none',
                  selectedAudienceTab === 'internal'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Portal Admin ({internalTree.length})
              </button>
              <button
                type='button'
                onClick={() => setSelectedAudienceTab('external')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none',
                  selectedAudienceTab === 'external'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Portal Pasien ({externalTree.length})
              </button>
            </div>
          </DialogHeader>

          {/* Scrollable Page Tree Grid */}
          <div className='flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin'>
            {isLoading ? (
              <div className='py-20 flex flex-col items-center justify-center text-muted-foreground gap-2'>
                <Icons.spinner className='size-6 animate-spin text-primary' />
                <p className='text-xs'>Memuat hierarki halaman dari database...</p>
              </div>
            ) : displayedPages.length === 0 ? (
              <div className='py-20 text-center text-muted-foreground'>
                <p className='text-xs'>Belum ada halaman terdaftar pada portal ini.</p>
              </div>
            ) : (
              <>
                {/* 1. Category Folders and their Submenus */}
                {categories.map((parent) => {
                  const children = parent.children || [];

                  return (
                    <div
                      key={parent.id}
                      className='rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs'
                    >
                      {/* Parent Category Header */}
                      <div className='flex items-center justify-between pb-2.5 border-b border-border/60'>
                        <div className='flex items-center gap-2.5 min-w-0'>
                          <ShiftIconDisplay
                            icon={parent.icon}
                            fallback={parent.name.charAt(0)}
                            size='sm'
                            bare
                            className='shrink-0 text-muted-foreground'
                          />
                          <div className='min-w-0'>
                            <div className='flex items-center gap-2'>
                              <span className='font-bold text-xs sm:text-sm text-foreground'>
                                {parent.name}
                              </span>
                              <span className='text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 rounded border bg-muted/30'>
                                {parent.audience === 'external' ? 'Eksternal' : 'Internal'}
                              </span>
                              <span className='text-[10px] text-muted-foreground'>
                                ({children.length} submenu)
                              </span>
                              {!parent.isEnabled && (
                                <span className='text-[11px] text-muted-foreground italic'>(Nonaktif)</span>
                              )}
                            </div>
                            {parent.description && (
                              <p className='text-[11px] text-muted-foreground pt-0.5 truncate max-w-lg'>
                                {parent.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Parent Edit, Detach All Children & CMS Toggle */}
                        {canManage && (
                          <div className='flex items-center gap-1.5 pl-3 shrink-0'>
                            {children.length > 0 && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='h-7 px-2 text-[11px] text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 cursor-pointer gap-1'
                                onClick={() => setDetachingCategory(parent)}
                                title='Lepaskan seluruh submenu dari kategori ini agar menjadi halaman mandiri'
                              >
                                <Unlink className='size-3 text-muted-foreground' />
                                <span className='hidden sm:inline'>Lepaskan Semua</span>
                              </Button>
                            )}
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer'
                              onClick={() => setEditingPage(parent)}
                              title={`Edit Kategori: ${parent.name}`}
                            >
                              <Icons.edit className='size-3.5' />
                            </Button>
                            <Switch
                              className='scale-80'
                              checked={parent.isEnabled}
                              onCheckedChange={(val) =>
                                togglePageMutation.mutate({ pageId: parent.id, isEnabled: val })
                              }
                              aria-label={`Saklar CMS ${parent.name}`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Child Pages Grid or Empty State */}
                      {children.length === 0 ? (
                        <div className='py-3 text-center text-xs text-muted-foreground italic border border-dashed rounded-lg bg-muted/5'>
                          Belum ada submenu dalam kategori ini. Anda dapat menetapkan halaman ke kategori ini melalui menu Edit halaman.
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-0.5'>
                          {children.map((child) => (
                            <div
                              key={child.id}
                              className={cn(
                                'flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors select-none gap-2 bg-muted/10 border-border/70 hover:bg-muted/20',
                                (!parent.isEnabled || !child.isEnabled) && 'opacity-60'
                              )}
                            >
                              <div className='flex items-center gap-2.5 flex-1 min-w-0'>
                                <ShiftIconDisplay
                                  icon={child.icon}
                                  fallback={child.name.charAt(0)}
                                  size='sm'
                                  bare
                                  className='shrink-0 text-muted-foreground'
                                />
                                <div className='min-w-0 flex-1 space-y-0.5'>
                                  <div className='text-xs font-semibold text-foreground truncate leading-tight'>
                                    {child.name}
                                  </div>
                                  <div className='font-mono text-[10px] text-muted-foreground truncate'>
                                    {child.customAlias ? (
                                      <span className='text-primary font-medium'>{child.customAlias}</span>
                                    ) : (
                                      child.routePath
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Individual Child Edit & CMS Switch */}
                              {canManage && (
                                <div className='shrink-0 flex items-center gap-1'>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    className='size-6 rounded-full text-muted-foreground hover:text-foreground cursor-pointer'
                                    onClick={() => setEditingPage(child)}
                                    title={`Edit Halaman: ${child.name}`}
                                  >
                                    <Icons.edit className='size-3' />
                                  </Button>
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
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. Standalone Pages (Halaman Utama / Mandiri Tanpa Kategori) */}
                {standalonePages.length > 0 && (
                  <div className='rounded-xl border border-dashed border-border/90 bg-card/60 p-3.5 space-y-3 shadow-2xs'>
                    <div className='flex items-center justify-between pb-2 border-b border-border/40'>
                      <div className='flex items-center gap-2'>
                        <Layers className='size-4 text-primary' />
                        <div>
                          <span className='font-bold text-xs sm:text-sm text-foreground'>
                            Halaman Utama / Mandiri (Tanpa Kategori)
                          </span>
                          <span className='ml-2 text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 rounded border bg-muted/30'>
                            {standalonePages.length} Halaman
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-0.5'>
                      {standalonePages.map((page) => (
                        <div
                          key={page.id}
                          className={cn(
                            'flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors select-none gap-2 bg-muted/10 border-border/70 hover:bg-muted/20',
                            !page.isEnabled && 'opacity-60'
                          )}
                        >
                          <div className='flex items-center gap-2.5 flex-1 min-w-0'>
                            <ShiftIconDisplay
                              icon={page.icon}
                              fallback={page.name.charAt(0)}
                              size='sm'
                              bare
                              className='shrink-0 text-muted-foreground'
                            />
                            <div className='min-w-0 flex-1 space-y-0.5'>
                              <div className='text-xs font-semibold text-foreground truncate leading-tight'>
                                {page.name}
                              </div>
                              <div className='font-mono text-[10px] text-muted-foreground truncate'>
                                {page.customAlias ? (
                                  <span className='text-primary font-medium'>{page.customAlias}</span>
                                ) : (
                                  page.routePath
                                )}
                              </div>
                            </div>
                          </div>

                          {canManage && (
                            <div className='shrink-0 flex items-center gap-1'>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='size-6 rounded-full text-muted-foreground hover:text-foreground cursor-pointer'
                                onClick={() => setEditingPage(page)}
                                title={`Edit Halaman: ${page.name}`}
                              >
                                <Icons.edit className='size-3' />
                              </Button>
                              <Switch
                                className='scale-75'
                                checked={page.isEnabled}
                                onCheckedChange={(val) =>
                                  togglePageMutation.mutate({ pageId: page.id, isEnabled: val })
                                }
                                aria-label={`Toggle CMS ${page.name}`}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog to Detach All Children */}
      <AlertDialog
        open={Boolean(detachingCategory)}
        onOpenChange={(open) => !open && setDetachingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lepaskan Seluruh Halaman?</AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh submenu ({detachingCategory?.children?.length ?? 0} halaman) dari kategori{' '}
              <span className='font-semibold text-foreground'>{detachingCategory?.name}</span> akan dilepaskan
              sehingga menjadi Halaman Utama / Mandiri tanpa folder induk di sidebar dan katalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (detachingCategory) {
                  detachChildrenMutation.mutate(detachingCategory.id);
                }
              }}
              disabled={detachChildrenMutation.isPending}
              className='bg-amber-600 hover:bg-amber-700 text-white'
            >
              {detachChildrenMutation.isPending ? 'Melepaskan...' : 'Ya, Lepaskan Semua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Page / Category Modal */}
      {(editingPage || isNewCategoryOpen) && (
        <EditPageModal
          open={Boolean(editingPage || isNewCategoryOpen)}
          onClose={() => {
            setEditingPage(null);
            setIsNewCategoryOpen(false);
          }}
          page={editingPage}
          parentCategories={parentCategories}
          isNewCategory={isNewCategoryOpen}
          audience={
            editingPage?.audience ||
            (selectedAudienceTab === 'external' ? 'external' : 'internal')
          }
        />
      )}
    </>
  );
}

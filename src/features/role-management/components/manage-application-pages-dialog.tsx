'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Columns3, FolderPlus, Layers, LayoutGrid, Unlink, AlertTriangle } from 'lucide-react';
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
import { PageCardItem } from './page-card-item';
import { PageFloatingBulkBar } from './page-floating-bulk-bar';
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
  const [viewMode, setViewMode] = React.useState<'grid' | 'kanban'>('grid');
  const [selectedAudienceTab, setSelectedAudienceTab] = React.useState<'all' | 'internal' | 'external'>('all');
  const [selectedPageIds, setSelectedPageIds] = React.useState<string[]>([]);
  const [editingPage, setEditingPage] = React.useState<ApplicationPage | null>(null);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = React.useState(false);
  const [detachingCategory, setDetachingCategory] = React.useState<ApplicationPage | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
  const [activeDraggedPage, setActiveDraggedPage] = React.useState<ApplicationPage | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    actionLabel?: string;
    variant?: 'default' | 'destructive' | 'amber';
    onConfirm: () => void;
  } | null>(null);

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

  // Flatten all displayed pages including children for easy lookup
  const allPagesFlat = React.useMemo(() => {
    const flat: ApplicationPage[] = [];
    for (const p of displayedPages) {
      flat.push(p);
      if (p.children && p.children.length > 0) {
        flat.push(...p.children);
      }
    }
    return flat;
  }, [displayedPages]);

  const findPage = React.useCallback(
    (id: string) => allPagesFlat.find((p) => p.id === id),
    [allPagesFlat]
  );

  // Bulking selection toggle
  const handleToggleSelect = React.useCallback((pageId: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  }, []);

  // Mutation to toggle single category/page CMS availability
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

  // Atomic bulk action mutation with deterministic DB-backed Undo
  const bulkMutation = useMutation({
    mutationFn: (payload: {
      action: 'move' | 'detach' | 'toggle_status' | 'reorder' | 'restore' | 'delete';
      pageIds: string[];
      targetParentId?: string | null;
      isEnabled?: boolean;
      restoreStates?: Array<{
        id: string;
        parentPageId?: string | null;
        isEnabled?: boolean;
        displayOrder?: number;
      }>;
    }) => roleManagementApi.bulkPageAction(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('internal') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('external') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
      setSelectedPageIds([]);

      if (variables.action !== 'restore' && data.previousStates.length > 0) {
        const count = data.updatedCount;
        const actionLabel =
          variables.action === 'move'
            ? `Berhasil memindahkan ${count} halaman`
            : variables.action === 'detach'
            ? `Berhasil melepaskan ${count} halaman menjadi mandiri`
            : variables.action === 'reorder'
            ? `Urutan halaman berhasil diperbarui`
            : variables.action === 'delete'
            ? `Berhasil menghapus ${count} folder kategori`
            : `Berhasil memperbarui status ${count} halaman`;

        toast.success(actionLabel, {
          action: variables.action === 'delete' ? undefined : {
            label: 'Urungkan',
            onClick: () => {
              bulkMutation.mutate({
                action: 'restore',
                pageIds: data.previousStates.map((p) => p.id),
                restoreStates: data.previousStates.map((p) => ({
                  id: p.id,
                  parentPageId: p.parentPageId,
                  isEnabled: p.isEnabled,
                  displayOrder: p.displayOrder
                }))
              });
            }
          }
        });
      } else if (variables.action === 'restore') {
        toast.success('Perubahan berhasil diurungkan');
      }
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Gagal menjalankan aksi massal';
      toast.error(errorMsg);
    }
  });

  // Mutation to delete single parent category
  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => roleManagementApi.deletePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('internal') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.pageTree('external') });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
      toast.success('Folder kategori berhasil dihapus');
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Gagal menghapus kategori';
      toast.error(errorMsg);
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

  // Handlers for category deletion
  const handleDeleteCategoryRequest = (cat: ApplicationPage) => {
    const childCount = cat.children?.length || 0;
    setConfirmAction({
      title: `Hapus Kategori "${cat.name}"?`,
      description:
        childCount === 0
          ? `Kategori ini kosong (0 halaman). Yakin ingin menghapus folder ini secara permanen dari CMS?`
          : `Kategori ini memiliki ${childCount} halaman di dalamnya. Menghapus folder ini akan melepaskan seluruh halaman di dalamnya menjadi halaman mandiri. Lanjutkan?`,
      actionLabel: 'Hapus Folder',
      variant: 'destructive',
      onConfirm: () => {
        deletePageMutation.mutate(cat.id);
      }
    });
  };

  const handleBulkDeleteCategoriesRequest = () => {
    const selectedCategoryIds = selectedPageIds.filter((id) => {
      const page = findPage(id);
      return page && (page.routePath === '#' || !page.parentPageId);
    });

    if (selectedCategoryIds.length === 0) return;

    setConfirmAction({
      title: `Hapus ${selectedCategoryIds.length} Folder Terpilih?`,
      description: `Yakin ingin menghapus ${selectedCategoryIds.length} folder kategori terpilih secara permanen? Seluruh halaman anak di dalamnya akan dilepaskan menjadi halaman mandiri tanpa folder induk.`,
      actionLabel: 'Hapus Folder Terpilih',
      variant: 'destructive',
      onConfirm: () => {
        bulkMutation.mutate({
          action: 'delete',
          pageIds: selectedCategoryIds
        });
      }
    });
  };

  const hasCategoriesSelected = React.useMemo(() => {
    return selectedPageIds.some((id) => {
      const page = findPage(id);
      return page && (page.routePath === '#' || !page.parentPageId);
    });
  }, [selectedPageIds, findPage]);

  // Drag-and-drop drop handler into a column/category
  const handleDropIntoTarget = (e: React.DragEvent<HTMLDivElement>, targetParentId: string | null) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const pageId = e.dataTransfer.getData('text/plain');
    if (!pageId || !canManage) return;

    const page = findPage(pageId) || activeDraggedPage;
    if (!page) return;

    if (targetParentId === null) {
      if (!page.parentPageId) return; // Sudah mandiri

      setConfirmAction({
        title: 'Jadikan Halaman Mandiri?',
        description: `Halaman "${page.name}" akan dikeluarkan dari kategorinya dan dijadikan halaman utama mandiri tanpa folder.`,
        actionLabel: 'Ya, Lepaskan',
        variant: 'amber',
        onConfirm: () => {
          bulkMutation.mutate({
            action: 'detach',
            pageIds: [page.id]
          });
        }
      });
      return;
    }

    const targetCat = categories.find((c) => c.id === targetParentId);
    if (!targetCat) return;

    // Strict Red Zone Validation (Cross-Portal rejection)
    if (page.audience !== targetCat.audience) {
      toast.error(
        `Zona Terlarang: Halaman portal ${
          page.audience === 'internal' ? 'Admin' : 'Pasien'
        } tidak dapat dipindahkan ke kategori portal ${
          targetCat.audience === 'internal' ? 'Admin' : 'Pasien'
        }!`
      );
      return;
    }

    if (page.parentPageId === targetParentId) return; // Sudah di kategori ini

    setConfirmAction({
      title: 'Pindahkan Halaman?',
      description: `Apakah Anda yakin ingin memindahkan halaman "${page.name}" ke dalam kategori "${targetCat.name}"?`,
      actionLabel: 'Ya, Pindahkan',
      variant: 'default',
      onConfirm: () => {
        bulkMutation.mutate({
          action: 'move',
          pageIds: [page.id],
          targetParentId
        });
      }
    });
  };

  // Card-to-card drop handler (Same parent = Reorder; Different parent = Move)
  const handleDropOnCard = (draggedPageId: string, targetCardPage: ApplicationPage) => {
    if (!canManage) return;
    const draggedPage = findPage(draggedPageId) || activeDraggedPage;
    if (!draggedPage || draggedPage.id === targetCardPage.id) return;

    // Case 1: Same parent -> REORDER within siblings!
    if (draggedPage.parentPageId === targetCardPage.parentPageId) {
      let siblings: ApplicationPage[] = [];
      if (targetCardPage.parentPageId) {
        const parentCat = categories.find((c) => c.id === targetCardPage.parentPageId);
        siblings = parentCat?.children ? [...parentCat.children] : [];
      } else {
        siblings = standalonePages.filter((p) => p.audience === targetCardPage.audience);
      }

      const draggedIdx = siblings.findIndex((p) => p.id === draggedPage.id);
      const targetIdx = siblings.findIndex((p) => p.id === targetCardPage.id);

      if (draggedIdx === -1 || targetIdx === -1 || draggedIdx === targetIdx) return;

      const updatedList = [...siblings];
      const [moved] = updatedList.splice(draggedIdx, 1);
      updatedList.splice(targetIdx, 0, moved);

      bulkMutation.mutate({
        action: 'reorder',
        pageIds: updatedList.map((p) => p.id),
        targetParentId: targetCardPage.parentPageId
      });
      return;
    }

    // Case 2: Dropped on a card that belongs to a different parent -> Move
    if (targetCardPage.parentPageId === null) {
      setConfirmAction({
        title: 'Jadikan Halaman Mandiri?',
        description: `Halaman "${draggedPage.name}" akan dikeluarkan dari kategorinya dan dijadikan halaman utama mandiri tanpa folder.`,
        actionLabel: 'Ya, Lepaskan',
        variant: 'amber',
        onConfirm: () => {
          bulkMutation.mutate({
            action: 'detach',
            pageIds: [draggedPage.id]
          });
        }
      });
      return;
    }

    const targetCat = categories.find((c) => c.id === targetCardPage.parentPageId);
    if (!targetCat) return;

    // Strict Red Zone Validation (Cross-Portal rejection)
    if (draggedPage.audience !== targetCat.audience) {
      toast.error(
        `Zona Terlarang: Halaman portal ${
          draggedPage.audience === 'internal' ? 'Admin' : 'Pasien'
        } tidak dapat dipindahkan ke kategori portal ${
          targetCat.audience === 'internal' ? 'Admin' : 'Pasien'
        }!`
      );
      return;
    }

    setConfirmAction({
      title: 'Pindahkan Halaman?',
      description: `Apakah Anda yakin ingin memindahkan halaman "${draggedPage.name}" ke dalam kategori "${targetCat.name}"?`,
      actionLabel: 'Ya, Pindahkan',
      variant: 'default',
      onConfirm: () => {
        bulkMutation.mutate({
          action: 'move',
          pageIds: [draggedPage.id],
          targetParentId: targetCat.id
        });
      }
    });
  };

  const handleRequestSelfDetach = (page: ApplicationPage) => {
    setConfirmAction({
      title: 'Keluarkan Halaman?',
      description: `Apakah Anda yakin ingin mengeluarkan halaman "${page.name}" dari kategorinya menjadi halaman mandiri?`,
      actionLabel: 'Ya, Keluarkan',
      variant: 'amber',
      onConfirm: () => {
        bulkMutation.mutate({
          action: 'detach',
          pageIds: [page.id]
        });
      }
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string, isRedZone = false) => {
    e.preventDefault();
    if (isRedZone) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverColumnId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'p-0 flex flex-col overflow-hidden font-sans border-border/80 shadow-2xl transition-all duration-200',
            viewMode === 'kanban'
              ? 'sm:max-w-[95vw] lg:max-w-[1440px] w-[95vw] h-[90vh] max-h-[90vh]'
              : 'sm:max-w-[960px] h-[86vh] max-h-[86vh]'
          )}
        >
          {/* Header with Title, View Switcher & Audience Tabs */}
          <DialogHeader className='px-6 pt-5 pb-3 border-b border-border/40 shrink-0 space-y-3'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2.5'>
                <div>
                  <DialogTitle className='text-base font-bold text-foreground'>
                    Kelola Katalog & Akses Halaman CMS
                  </DialogTitle>
                  <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                    Sentralisasi konfigurasi hierarki menu, drag-and-drop transversal, seleksi massal, dan status aktif halaman.
                  </DialogDescription>
                </div>
              </div>

              <div className='flex items-center gap-2 shrink-0'>
                {/* View Switcher: Grid vs Kanban */}
                <div className='flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/20'>
                  <button
                    type='button'
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    title='Tampilan Daftar / Grid'
                  >
                    <LayoutGrid className='size-3.5' />
                    <span className='hidden sm:inline'>Grid</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => setViewMode('kanban')}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                      viewMode === 'kanban'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    title='Tampilan Papan Kanban'
                  >
                    <Columns3 className='size-3.5' />
                    <span className='hidden sm:inline'>Kanban</span>
                  </button>
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

          {/* Main Content Area */}
          <div className='flex-1 min-h-0 overflow-hidden flex flex-col p-6'>
            {isLoading ? (
              <div className='m-auto py-20 flex flex-col items-center justify-center text-muted-foreground gap-2'>
                <Icons.spinner className='size-6 animate-spin text-primary' />
                <p className='text-xs'>Memuat hierarki halaman dari database...</p>
              </div>
            ) : displayedPages.length === 0 ? (
              <div className='m-auto py-20 text-center text-muted-foreground'>
                <p className='text-xs'>Belum ada halaman terdaftar pada portal ini.</p>
              </div>
            ) : viewMode === 'kanban' ? (
              /* KANBAN BOARD VIEW (Horizontal Scrolling Columns) */
              <div className='flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-0 flex-1 scrollbar-thin select-none'>
                {/* Category Columns */}
                {categories.map((cat) => {
                  const children = cat.children || [];
                  const isOver = dragOverColumnId === cat.id;
                  const isRedZone = Boolean(
                    activeDraggedPage && activeDraggedPage.audience !== cat.audience
                  );

                  return (
                    <div
                      key={cat.id}
                      onDragOver={(e) => handleDragOver(e, cat.id, isRedZone)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropIntoTarget(e, cat.id)}
                      className={cn(
                        'w-[300px] shrink-0 rounded-2xl border flex flex-col max-h-full bg-card/70 transition-all duration-200 shadow-xs',
                        isOver && !isRedZone && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                        isOver && isRedZone && 'border-destructive ring-2 ring-destructive/60 bg-destructive/10 text-destructive cursor-not-allowed',
                        !isOver && isRedZone && 'opacity-60 border-destructive/40 border-dashed',
                        !isOver && !isRedZone && 'border-border/80'
                      )}
                    >
                      {/* Column Header */}
                      <div className='p-3.5 border-b border-border/60 flex items-center justify-between gap-2 shrink-0 bg-muted/20 rounded-t-2xl'>
                        <div className='flex items-center gap-2 min-w-0'>
                          {canManage && (
                            <input
                              type='checkbox'
                              checked={selectedPageIds.includes(cat.id)}
                              onChange={() => handleToggleSelect(cat.id)}
                              className='size-3.5 rounded border-muted-foreground/40 text-primary focus:ring-primary/30 cursor-pointer shrink-0'
                              title='Pilih kategori ini untuk aksi massal'
                              aria-label={`Pilih kategori ${cat.name}`}
                            />
                          )}
                          <ShiftIconDisplay
                            icon={cat.icon}
                            fallback={cat.name.charAt(0)}
                            size='sm'
                            bare
                            className='shrink-0 text-muted-foreground'
                          />
                          <div className='min-w-0'>
                            <div className='flex items-center gap-1.5'>
                              <h4 className='text-xs font-bold text-foreground truncate leading-tight'>
                                {cat.name}
                              </h4>
                              {!cat.isEnabled && (
                                <span className='text-[10px] text-muted-foreground italic shrink-0'>
                                  (Nonaktif)
                                </span>
                              )}
                              {isRedZone && (
                                <span className='flex items-center gap-1 text-[9px] font-semibold text-destructive px-1.5 py-0.2 rounded bg-destructive/15 border border-destructive/25 shrink-0'>
                                  <AlertTriangle className='size-2.5 shrink-0' />
                                  Beda Portal
                                </span>
                              )}
                            </div>
                            <span className='text-[10px] text-muted-foreground font-mono'>
                              {children.length} halaman
                            </span>
                          </div>
                        </div>

                        {canManage && (
                          <div className='flex items-center gap-1 shrink-0'>
                            {children.length > 0 && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='size-6 rounded-full text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 cursor-pointer'
                                onClick={() => setDetachingCategory(cat)}
                                title='Lepaskan seluruh halaman dari kategori ini'
                              >
                                <Unlink className='size-3' />
                              </Button>
                            )}
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='size-6 rounded-full text-muted-foreground hover:text-foreground cursor-pointer'
                              onClick={() => setEditingPage(cat)}
                              title={`Edit Kategori: ${cat.name}`}
                            >
                              <Icons.edit className='size-3' />
                            </Button>
                            <Switch
                              className='scale-75'
                              checked={cat.isEnabled}
                              onCheckedChange={(val) =>
                                togglePageMutation.mutate({ pageId: cat.id, isEnabled: val })
                              }
                              aria-label={`Saklar CMS ${cat.name}`}
                            />
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='size-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                              onClick={() => handleDeleteCategoryRequest(cat)}
                              title={`Hapus Kategori: ${cat.name}`}
                            >
                              <Icons.trash className='size-3 text-destructive' />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Column Cards Drop Area */}
                      <div className='p-2.5 overflow-y-auto space-y-2 flex-1 min-h-[140px] scrollbar-thin'>
                        {isOver && isRedZone && (
                          <div className='p-2.5 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive text-center text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse select-none'>
                            <AlertTriangle className='size-4 shrink-0' />
                            <span>Zona Terlarang: Beda Portal</span>
                          </div>
                        )}
                        {children.length === 0 ? (
                          <div className='h-28 border border-dashed rounded-xl border-border/60 flex flex-col items-center justify-center text-center p-3 text-muted-foreground text-[11px] italic bg-muted/5'>
                            Tarik halaman ke sini untuk memasukkannya ke kategori ini
                          </div>
                        ) : (
                          children.map((child) => (
                            <PageCardItem
                              key={child.id}
                              page={child}
                              selected={selectedPageIds.includes(child.id)}
                              isBulkingActive={selectedPageIds.length > 0}
                              canManage={canManage}
                              onToggleSelect={handleToggleSelect}
                              onEdit={(page) => setEditingPage(page)}
                              onSelfDetach={handleRequestSelfDetach}
                              onToggleEnabled={(id, isEnabled) =>
                                togglePageMutation.mutate({ pageId: id, isEnabled })
                              }
                              onDragStart={(p) => setActiveDraggedPage(p)}
                              onDragEnd={() => {
                                setActiveDraggedPage(null);
                                setDragOverColumnId(null);
                              }}
                              onDropOnCard={handleDropOnCard}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Standalone Pages Column */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'standalone')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropIntoTarget(e, null)}
                  className={cn(
                    'w-[300px] shrink-0 rounded-2xl border border-dashed flex flex-col max-h-full bg-card/50 transition-all duration-200 shadow-xs',
                    dragOverColumnId === 'standalone'
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]'
                      : 'border-border/90'
                  )}
                >
                  <div className='p-3.5 border-b border-border/40 flex items-center justify-between gap-2 shrink-0 bg-muted/10 rounded-t-2xl'>
                    <div className='flex items-center gap-2 min-w-0'>
                      <Layers className='size-4 text-primary shrink-0' />
                      <div className='min-w-0'>
                        <h4 className='text-xs font-bold text-foreground truncate leading-tight'>
                          Halaman Mandiri
                        </h4>
                        <span className='text-[10px] text-muted-foreground font-mono'>
                          {standalonePages.length} halaman tanpa folder
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='p-2.5 overflow-y-auto space-y-2 flex-1 min-h-[140px] scrollbar-thin'>
                    {standalonePages.length === 0 ? (
                      <div className='h-28 border border-dashed rounded-xl border-border/60 flex flex-col items-center justify-center text-center p-3 text-muted-foreground text-[11px] italic bg-muted/5'>
                        Tarik halaman ke sini untuk menjadikannya halaman mandiri tanpa folder
                      </div>
                    ) : (
                      standalonePages.map((page) => (
                        <PageCardItem
                          key={page.id}
                          page={page}
                          selected={selectedPageIds.includes(page.id)}
                          isBulkingActive={selectedPageIds.length > 0}
                          canManage={canManage}
                          onToggleSelect={handleToggleSelect}
                          onEdit={(p) => setEditingPage(p)}
                          onToggleEnabled={(id, isEnabled) =>
                            togglePageMutation.mutate({ pageId: id, isEnabled })
                          }
                          onDragStart={(p) => setActiveDraggedPage(p)}
                          onDragEnd={() => {
                            setActiveDraggedPage(null);
                            setDragOverColumnId(null);
                          }}
                          onDropOnCard={handleDropOnCard}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* GRID / LIST VIEW (Structured Category Sections) */
              <div className='overflow-y-auto space-y-4 flex-1 min-h-0 pr-1 scrollbar-thin'>
                {categories.map((parent) => {
                  const children = parent.children || [];
                  const isOver = dragOverColumnId === parent.id;
                  const isRedZone = Boolean(
                    activeDraggedPage && activeDraggedPage.audience !== parent.audience
                  );

                  return (
                    <div
                      key={parent.id}
                      onDragOver={(e) => handleDragOver(e, parent.id, isRedZone)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropIntoTarget(e, parent.id)}
                      className={cn(
                        'rounded-xl border bg-card p-3.5 space-y-3 shadow-2xs transition-all duration-200',
                        isOver && !isRedZone && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                        isOver && isRedZone && 'border-destructive ring-2 ring-destructive/60 bg-destructive/10 text-destructive cursor-not-allowed',
                        !isOver && isRedZone && 'opacity-60 border-destructive/40 border-dashed',
                        !isOver && !isRedZone && 'border-border/80'
                      )}
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
                              {isRedZone && (
                                <span className='flex items-center gap-1 text-[10px] font-semibold text-destructive px-1.5 py-0.5 rounded bg-destructive/15 border border-destructive/25'>
                                  <AlertTriangle className='size-3 shrink-0' />
                                  Zona Terlarang: Beda Portal
                                </span>
                              )}
                              <span className='text-[10px] text-muted-foreground'>
                                ({children.length} submenu)
                              </span>
                              {!parent.isEnabled && (
                                <span className='text-[11px] text-muted-foreground italic'>
                                  (Nonaktif)
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

                        {canManage && (
                          <div className='flex items-center gap-1.5 pl-3 shrink-0'>
                            <input
                              type='checkbox'
                              checked={selectedPageIds.includes(parent.id)}
                              onChange={() => handleToggleSelect(parent.id)}
                              className='size-3.5 rounded border-muted-foreground/40 text-primary focus:ring-primary/30 cursor-pointer shrink-0 mr-1'
                              title='Pilih kategori ini untuk aksi massal'
                              aria-label={`Pilih kategori ${parent.name}`}
                            />
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
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='size-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                              onClick={() => handleDeleteCategoryRequest(parent)}
                              title={`Hapus Kategori: ${parent.name}`}
                            >
                              <Icons.trash className='size-3.5 text-destructive' />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Red Zone Warning Banner if hovering over forbidden category */}
                      {isOver && isRedZone && (
                        <div className='p-2.5 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-center text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse select-none'>
                          <AlertTriangle className='size-4 shrink-0' />
                          <span>Zona Terlarang: Halaman portal tidak dapat dipindahkan ke kategori portal berbeda</span>
                        </div>
                      )}

                      {/* Child Pages Grid or Empty State */}
                      {children.length === 0 ? (
                        <div className='py-3 text-center text-xs text-muted-foreground italic border border-dashed rounded-lg bg-muted/5'>
                          Belum ada submenu dalam kategori ini. Anda dapat menarik halaman ke sini atau menetapkannya via tombol Edit.
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-0.5'>
                          {children.map((child) => (
                            <PageCardItem
                              key={child.id}
                              page={child}
                              selected={selectedPageIds.includes(child.id)}
                              isBulkingActive={selectedPageIds.length > 0}
                              canManage={canManage}
                              onToggleSelect={handleToggleSelect}
                              onEdit={(p) => setEditingPage(p)}
                              onSelfDetach={handleRequestSelfDetach}
                              onToggleEnabled={(id, isEnabled) =>
                                togglePageMutation.mutate({ pageId: id, isEnabled })
                              }
                              onDragStart={(p) => setActiveDraggedPage(p)}
                              onDragEnd={() => {
                                setActiveDraggedPage(null);
                                setDragOverColumnId(null);
                              }}
                              onDropOnCard={handleDropOnCard}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Standalone Pages Section in Grid View */}
                {standalonePages.length > 0 && (
                  <div
                    onDragOver={(e) => handleDragOver(e, 'standalone')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropIntoTarget(e, null)}
                    className={cn(
                      'rounded-xl border border-dashed bg-card/60 p-3.5 space-y-3 shadow-2xs transition-all duration-200',
                      dragOverColumnId === 'standalone'
                        ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]'
                        : 'border-border/90'
                    )}
                  >
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
                        <PageCardItem
                          key={page.id}
                          page={page}
                          selected={selectedPageIds.includes(page.id)}
                          isBulkingActive={selectedPageIds.length > 0}
                          canManage={canManage}
                          onToggleSelect={handleToggleSelect}
                          onEdit={(p) => setEditingPage(p)}
                          onToggleEnabled={(id, isEnabled) =>
                            togglePageMutation.mutate({ pageId: id, isEnabled })
                          }
                          onDragStart={(p) => setActiveDraggedPage(p)}
                          onDragEnd={() => {
                            setActiveDraggedPage(null);
                            setDragOverColumnId(null);
                          }}
                          onDropOnCard={handleDropOnCard}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Bar (Snackbar) for Bulk Operations */}
      <PageFloatingBulkBar
        selectedCount={selectedPageIds.length}
        availableCategories={categories}
        canManage={canManage}
        onMoveToCategory={(targetParentId) => {
          const targetCat = categories.find((c) => c.id === targetParentId);
          if (!targetCat) return;

          const selectedPages = allPagesFlat.filter((p) => selectedPageIds.includes(p.id));
          const hasConflict = selectedPages.some((p) => p.audience !== targetCat.audience);
          if (hasConflict) {
            toast.error(
              `Zona Terlarang: Beberapa halaman terpilih memiliki portal berbeda dengan kategori "${targetCat.name}"!`
            );
            return;
          }

          setConfirmAction({
            title: 'Pindahkan Halaman Terpilih?',
            description: `Apakah Anda yakin ingin memindahkan ${selectedPageIds.length} halaman terpilih ke dalam kategori "${targetCat.name}"?`,
            actionLabel: 'Ya, Pindahkan',
            variant: 'default',
            onConfirm: () => {
              bulkMutation.mutate({
                action: 'move',
                pageIds: selectedPageIds,
                targetParentId
              });
            }
          });
        }}
        onDetachSelected={() => {
          setConfirmAction({
            title: 'Lepaskan Halaman Terpilih?',
            description: `Apakah Anda yakin ingin melepaskan ${selectedPageIds.length} halaman terpilih menjadi halaman mandiri tanpa folder?`,
            actionLabel: 'Ya, Lepaskan',
            variant: 'amber',
            onConfirm: () => {
              bulkMutation.mutate({
                action: 'detach',
                pageIds: selectedPageIds
              });
            }
          });
        }}
        onToggleStatus={(isEnabled) => {
          setConfirmAction({
            title: isEnabled ? 'Aktifkan Halaman Terpilih?' : 'Nonaktifkan Halaman Terpilih?',
            description: `Apakah Anda yakin ingin mengubah status CMS ${selectedPageIds.length} halaman terpilih menjadi ${
              isEnabled ? 'Aktif' : 'Nonaktif'
            }?`,
            actionLabel: isEnabled ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
            variant: isEnabled ? 'default' : 'amber',
            onConfirm: () => {
              bulkMutation.mutate({
                action: 'toggle_status',
                pageIds: selectedPageIds,
                isEnabled
              });
            }
          });
        }}
        hasCategoriesSelected={hasCategoriesSelected}
        onDeleteCategories={handleBulkDeleteCategoriesRequest}
        onCancel={() => setSelectedPageIds([])}
        isPending={bulkMutation.isPending}
      />

      {/* General Action Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmAction?.onConfirm();
                setConfirmAction(null);
              }}
              className={cn(
                confirmAction?.variant === 'destructive' &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                confirmAction?.variant === 'amber' &&
                  'bg-amber-600 text-white hover:bg-amber-700'
              )}
            >
              {confirmAction?.actionLabel || 'Lanjutkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

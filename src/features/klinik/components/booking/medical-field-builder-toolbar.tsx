'use client';

import * as React from 'react';
import { Eye, EyeOff, Pencil, Trash2, Sliders, Check, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import {
  COMPONENT_OPTIONS,
  mapComponentIdToFieldType,
  mapFieldTypeToComponentId
} from '../../constants/component-registry';
import type { MedicalFieldType, MedicalFormField } from '../../constants/medical-appointment-types';

interface MedicalFieldBuilderToolbarProps {
  field: MedicalFormField;
  onUpdateField?: (updated: Partial<MedicalFormField>) => void;
  onToggleActive?: () => void;
  onDeleteField?: () => void;
}

export function MedicalFieldBuilderToolbar({
  field,
  onUpdateField,
  onToggleActive,
  onDeleteField
}: MedicalFieldBuilderToolbarProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = React.useState(field.title);
  const [editPlaceholder, setEditPlaceholder] = React.useState(field.placeholder || '');
  const [editHelpText, setEditHelpText] = React.useState(field.helpText || '');
  const [editRequired, setEditRequired] = React.useState(field.required);
  const [editColSpan, setEditColSpan] = React.useState<'1' | 'full'>(
    field.colSpan === 'full' || field.colSpan === 2 ? 'full' : '1'
  );
  const [editChoices, setEditChoices] = React.useState<string[]>(field.choices || []);
  const [newChoiceInput, setNewChoiceInput] = React.useState('');

  const currentComponentId = mapFieldTypeToComponentId(field.type);
  const isInactive = field.isActive === false;

  const handleOpenEdit = () => {
    setEditTitle(field.title);
    setEditPlaceholder(field.placeholder || '');
    setEditHelpText(field.helpText || '');
    setEditRequired(field.required);
    setEditColSpan(field.colSpan === 'full' || field.colSpan === 2 ? 'full' : '1');
    setEditChoices(field.choices || []);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateField?.({
      title: editTitle.trim() || field.title,
      label: editTitle.trim() || field.title,
      placeholder: editPlaceholder.trim(),
      helpText: editHelpText.trim(),
      required: editRequired,
      colSpan: editColSpan === 'full' ? 'full' : 1,
      choices: editChoices
    });
    setIsEditDialogOpen(false);
  };

  const handleSelectComponent = (componentId: string) => {
    const nextType: MedicalFieldType = mapComponentIdToFieldType(componentId);
    let defaultChoices = field.choices;
    if (
      (nextType === 'MULTIPLE_CHOICE' || nextType === 'LIST') &&
      (!defaultChoices || defaultChoices.length === 0)
    ) {
      defaultChoices = ['Ya', 'Tidak'];
    }

    onUpdateField?.({
      type: nextType,
      colSpan: nextType === 'PARAGRAPH' || nextType === 'DATE' ? 'full' : field.colSpan,
      choices: defaultChoices
    });
  };

  const handleAddChoice = () => {
    const trimmed = newChoiceInput.trim();
    if (trimmed && !editChoices.includes(trimmed)) {
      setEditChoices([...editChoices, trimmed]);
      setNewChoiceInput('');
    }
  };

  const handleRemoveChoice = (indexToRemove: number) => {
    setEditChoices(editChoices.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <>
      <div
        className={cn(
          'absolute right-1 -top-3 z-30 flex items-center gap-0.5 rounded-full border border-border/80 bg-background/95 px-1.5 py-0.5 shadow-md backdrop-blur-xs transition-all duration-200 ease-out select-none',
          'translate-x-2.5 opacity-0 pointer-events-none group-hover:translate-x-0 group-hover:opacity-100 group-hover:pointer-events-auto',
          'hover:opacity-100 hover:translate-x-0 hover:pointer-events-auto'
        )}
      >
        {/* Toggle Active / Nonaktif */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive?.();
          }}
          title={isInactive ? 'Aktifkan Field' : 'Nonaktifkan (Sembunyikan)'}
          className={cn(
            'flex size-6 items-center justify-center rounded-full transition-colors',
            isInactive
              ? 'bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 dark:text-amber-400'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {isInactive ? <EyeOff className='size-3.5' /> : <Eye className='size-3.5' />}
        </button>

        {/* Ganti Komponen */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              onClick={(e) => e.stopPropagation()}
              title='Ganti Komponen Widget'
              className='flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <Sliders className='size-3.5' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56 text-xs'>
            <DropdownMenuLabel className='text-[11px] font-semibold text-muted-foreground'>
              Ganti Komponen Widget
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COMPONENT_OPTIONS.map((opt) => {
              const isSelected = opt.id === currentComponentId;
              return (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => handleSelectComponent(opt.id)}
                  className='flex cursor-pointer items-start justify-between py-1.5'
                >
                  <div className='flex flex-col gap-0.5'>
                    <span className={cn('font-medium', isSelected && 'text-primary font-semibold')}>
                      {opt.label}
                    </span>
                    <span className='text-[10px] text-muted-foreground line-clamp-1'>
                      {opt.description}
                    </span>
                  </div>
                  {isSelected && <Check className='ml-2 size-3.5 shrink-0 text-primary' />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Properties / Rename */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEdit();
          }}
          title='Ubah Properti / Label'
          className='flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Pencil className='size-3.5' />
        </button>

        {/* Hapus Field */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Hapus field "${field.title}" dari langkah ini?`)) {
              onDeleteField?.();
            }
          }}
          title='Hapus Field'
          className='flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
        >
          <Trash2 className='size-3.5' />
        </button>
      </div>

      {/* Dialog Edit Field */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle className='text-base font-bold'>Konfigurasi Field Formulir</DialogTitle>
              <DialogDescription className='text-xs'>
                Sesuaikan label, placeholder, dan aturan validasi untuk input ini.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 py-4 text-xs'>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-title' className='text-xs font-semibold'>
                  Label / Nama Field <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='edit-title'
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder='Contoh: Nama Lengkap Pasien'
                  required
                  className='h-8 text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-placeholder' className='text-xs font-semibold'>
                  Placeholder Teks
                </Label>
                <Input
                  id='edit-placeholder'
                  value={editPlaceholder}
                  onChange={(e) => setEditPlaceholder(e.target.value)}
                  placeholder='Contoh: Masukkan data sesuai identitas...'
                  className='h-8 text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-helptext' className='text-xs font-semibold'>
                  Teks Bantuan / Petunjuk
                </Label>
                <Input
                  id='edit-helptext'
                  value={editHelpText}
                  onChange={(e) => setEditHelpText(e.target.value)}
                  placeholder='Contoh: Format 16 digit angka'
                  className='h-8 text-xs'
                />
              </div>

              <div className='grid grid-cols-2 gap-3 pt-1'>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='edit-required'
                    checked={editRequired}
                    onChange={(e) => setEditRequired(e.target.checked)}
                    className='size-4 rounded border-border text-primary focus:ring-primary'
                  />
                  <Label htmlFor='edit-required' className='cursor-pointer text-xs font-medium'>
                    Wajib Diisi (Required)
                  </Label>
                </div>

                <div className='flex items-center gap-2'>
                  <Label
                    htmlFor='edit-colspan'
                    className='text-xs font-medium text-muted-foreground'
                  >
                    Tata Letak:
                  </Label>
                  <select
                    id='edit-colspan'
                    value={editColSpan}
                    onChange={(e) => setEditColSpan(e.target.value as '1' | 'full')}
                    className='h-7 rounded border border-border bg-background px-2 text-xs font-medium'
                  >
                    <option value='1'>1 Kolom (Separuh)</option>
                    <option value='full'>2 Kolom (Lebar Penuh)</option>
                  </select>
                </div>
              </div>

              {/* Opsi Pilihan (Jika Multiple Choice atau List) */}
              {(field.type === 'MULTIPLE_CHOICE' || field.type === 'LIST') && (
                <div className='space-y-2 rounded-lg border border-border/60 bg-muted/20 p-2.5'>
                  <Label className='text-xs font-semibold'>Daftar Pilihan Opsi</Label>
                  <div className='flex flex-wrap gap-1.5'>
                    {editChoices.map((choice, idx) => (
                      <span
                        key={idx}
                        className='inline-flex items-center gap-1 rounded-md border border-border/80 bg-background px-2 py-0.5 text-[11px] font-medium'
                      >
                        {choice}
                        <button
                          type='button'
                          onClick={() => handleRemoveChoice(idx)}
                          className='text-muted-foreground hover:text-destructive'
                        >
                          <X className='size-3' />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className='flex items-center gap-1.5 pt-1'>
                    <Input
                      value={newChoiceInput}
                      onChange={(e) => setNewChoiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChoice();
                        }
                      }}
                      placeholder='Tambah opsi pilihan baru...'
                      className='h-7 text-xs'
                    />
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={handleAddChoice}
                      className='h-7 text-xs'
                    >
                      <Plus className='size-3 mr-1' /> Tambah
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className='gap-2 sm:justify-end'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsEditDialogOpen(false)}
                className='text-xs'
              >
                Batal
              </Button>
              <Button type='submit' variant='primary' size='sm' className='text-xs'>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import type { AnyFieldApi } from '@tanstack/form-core';
import * as React from 'react';
import { ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
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
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { SideTray } from '@/components/ui/side-tray';
import { cn } from '@/lib/utils';
import { VISIT_TYPE } from '@/constants/visit-type.constants';

import type { ServiceCatalogItem } from '../api/catalog.service';
import type {
  PatientAffiliationProfile,
  PatientRelationshipType
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { AppointmentFormData, MedicalAppointmentFlow } from '../api/types';
import {
  convertJsonSchemaToSections,
  convertSectionsToJsonSchema,
  DEFAULT_RICH_FORM_TEMPLATE
} from '../constants/default-form-template';
import {
  getMedicalFlowDefinition,
  type MedicalFlowDefinition,
  type MedicalFormField,
  type MedicalFormSection
} from '../constants/medical-appointment-schemas';
import { historyGroups, useMedicalAppointmentForm } from '../model/useMedicalAppointmentForm';
import {
  type MedicalFieldType,
  REPEATABLE_GROUP_KEYS,
  STEP_DESCRIPTOR_TYPES
} from '../constants/medical-appointment-types';
import { MedicalSectionStep } from './booking/medical-appointment-steps';
import { getFieldValidators, MedicalSchemaField } from './booking/medical-schema-field';
import { MedicalHistoryCatalog } from './medical-history-catalog';
import { QueueSuccessModal } from './queue-success-modal';
import { ReservationModal, type ReservationContext } from './reservation/reservation-modal';

interface MedicalAppointmentModalProps {
  flow: MedicalAppointmentFlow;
  isOpen: boolean;
  selectedService?: ServiceCatalogItem | null;
  selectedPatient?: PatientAffiliationProfile | null;
  newPatientRelationship?: PatientRelationshipType | string;
  builderMode?: boolean;
  initialSchema?: Record<string, any> | null;
  formTitle?: string;
  formDescription?: string;
  onSaveSchema?: (schema: Record<string, any>) => Promise<void>;
  onClose: () => void;
  onCreated?: (appointment: AppointmentFormData) => void;
  onCompleteIntake?: (context: ReservationContext) => void;
  onBackToService?: () => void;
}

export function MedicalAppointmentModal({
  flow,
  isOpen,
  selectedService,
  selectedPatient,
  newPatientRelationship,
  builderMode = false,
  initialSchema,
  formTitle,
  formDescription,
  onSaveSchema,
  onClose,
  onCreated,
  onCompleteIntake,
  onBackToService
}: MedicalAppointmentModalProps) {
  const [internalReservationContext, setInternalReservationContext] =
    React.useState<ReservationContext | null>(null);
  const [isSavingSchema, setIsSavingSchema] = React.useState(false);
  const [isTrayOpen, setIsTrayOpen] = React.useState(false);

  const [sections, setSections] = React.useState<MedicalFormSection[]>(() => {
    if (initialSchema && Array.isArray(initialSchema.steps) && initialSchema.steps.length > 0) {
      return convertJsonSchemaToSections(initialSchema, builderMode);
    }
    const def = getMedicalFlowDefinition(flow);
    if (def) {
      return def.sections;
    }
    return convertJsonSchemaToSections(DEFAULT_RICH_FORM_TEMPLATE, builderMode);
  });

  React.useEffect(() => {
    if (initialSchema && Array.isArray(initialSchema.steps) && initialSchema.steps.length > 0) {
      setSections(convertJsonSchemaToSections(initialSchema, builderMode));
    }
  }, [initialSchema, builderMode]);

  const customDefinition = React.useMemo<MedicalFlowDefinition | null>(() => {
    if (!builderMode && !initialSchema) return null;
    const title = formTitle || initialSchema?.title || 'Formulir Pengkajian';
    const desc =
      formDescription || initialSchema?.description || 'Formulir pengkajian data medis pasien.';
    return {
      flow,
      formTitle: title,
      formDescription: desc,
      serviceName: formTitle || 'Pengkajian Medis',
      visitType: VISIT_TYPE.NEW_VISIT,
      patientNameFieldId: 'patient_full_name',
      patientContactFieldId: 'patient_phone',
      complaintFieldId: 'patient_chief_complaint',
      sections
    };
  }, [builderMode, initialSchema, formTitle, formDescription, flow, sections]);

  const handleCompleteIntake = React.useCallback(
    (ctx: ReservationContext) => {
      if (onCompleteIntake) {
        onCompleteIntake(ctx);
      } else {
        setInternalReservationContext(ctx);
      }
    },
    [onCompleteIntake]
  );

  const medical = useMedicalAppointmentForm({
    flow,
    isOpen,
    selectedService,
    selectedPatient,
    newPatientRelationship,
    customDefinition,
    builderMode,
    onClose,
    onCreated,
    onCompleteIntake: handleCompleteIntake,
    onBackToService
  });

  const stepContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!stepContainerRef.current) {
      return;
    }

    const scrollableElements = stepContainerRef.current.querySelectorAll<HTMLElement>(
      '[data-radix-scroll-area-viewport], .overflow-y-auto'
    );
    scrollableElements.forEach((element) => {
      element.scrollTop = 0;
    });
    stepContainerRef.current.scrollTop = 0;
  }, [medical.currentStep]);

  if (!isOpen) {
    return null;
  }

  const {
    definition,
    form,
    values,
    visibleMedicalSections,
    currentStep,
    currentDescriptor,
    isProcessing,
    isQueueSuccessOpen,
    createdAppointment,
    createdQueueItem,
    historyCounts,
    historyPrompt,
    catalogAction,
    isCurrentStepValid,
    actions
  } = medical;

  const currentSection =
    currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL
      ? visibleMedicalSections[currentDescriptor.sectionIndex]
      : undefined;
  const isQuestionnaireStep = currentSection?.layout === 'questionnaire';
  const isHistoryCatalogStep = currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG;

  let stepTitle = definition.formTitle;
  let stepDescription = definition.serviceName;

  if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL) {
    if (currentSection) {
      stepTitle = currentSection.title;
      stepDescription = currentSection.description;
    }
  } else if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG) {
    const isPregnancy = currentDescriptor.historyKey === 'pregnancy';
    stepTitle = isPregnancy
      ? 'Katalog Riwayat Kehamilan & Persalinan'
      : 'Katalog Riwayat KB / Kontrasepsi';
    stepDescription = isPregnancy
      ? 'Daftar riwayat kehamilan dan persalinan sebelumnya yang telah dicatat. Tinjau atau ubah riwayat bila diperlukan.'
      : 'Daftar riwayat penggunaan KB/kontrasepsi yang telah dicatat. Tinjau atau ubah riwayat bila diperlukan.';
  }

  const isLastStep = currentStep === medical.totalSteps;

  const handleUpdateSection = (sectionId: string, updated: Partial<MedicalFormSection>) => {
    setSections((prev) => prev.map((sec) => (sec.id === sectionId ? { ...sec, ...updated } : sec)));
  };

  const handleAddStep = () => {
    const nextIdx = sections.length + 1;
    const newSectionId = `step_${Date.now()}`;
    const newSection: MedicalFormSection = {
      id: newSectionId,
      title: `Langkah ${nextIdx}`,
      description: 'Isi data sesuai petunjuk langkah formulir ini.',
      fields: [
        {
          id: `field_${Date.now()}`,
          type: 'TEXT',
          title: 'Field Baru',
          label: 'Field Baru',
          helpText: '',
          placeholder: 'Masukkan data...',
          required: false,
          choices: [],
          goToSectionIdByChoice: null,
          colSpan: 1,
          disabled: false,
          isActive: true
        }
      ],
      layout: 'grid'
    };
    setSections((prev) => [...prev, newSection]);
    actions.goToStep(nextIdx);
  };

  const handleDeleteStep = (sectionId: string) => {
    if (sections.length <= 1) {
      toast.error('Formulir harus memiliki minimal 1 langkah');
      return;
    }
    if (window.confirm('Hapus langkah ini dan semua field di dalamnya?')) {
      const remainingSections = sections.filter((s) => s.id !== sectionId);
      setSections(remainingSections);
      actions.goToStep(Math.max(1, currentStep - 1));
    }
  };

  const handleUpdateField = (fieldId: string, updated: Partial<MedicalFormField>) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        fields: sec.fields.map((f) => (f.id === fieldId ? { ...f, ...updated } : f))
      }))
    );
  };

  const handleToggleFieldActive = (fieldId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        fields: sec.fields.map((f) =>
          f.id === fieldId ? { ...f, isActive: f.isActive === false } : f
        )
      }))
    );
  };

  const handleDeleteField = (fieldId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        const target = sec.fields.find((f) => f.id === fieldId);
        const relatedIds = new Set<string>([fieldId]);
        if (target?.yearFieldId) relatedIds.add(target.yearFieldId);
        if (target?.notesFieldId) relatedIds.add(target.notesFieldId);
        return {
          ...sec,
          fields: sec.fields.filter((f) => !relatedIds.has(f.id))
        };
      })
    );
  };

  const handleAddQuestionnaireRow = () => {
    if (!currentSection) return;
    const questionId = `question_${Date.now()}`;
    const yearId = `year_${Date.now()}`;
    const newQuestionField: MedicalFormField = {
      id: questionId,
      type: 'MULTIPLE_CHOICE',
      title: 'Pertanyaan / Kondisi Baru',
      label: 'Pertanyaan / Kondisi Baru',
      helpText: '',
      placeholder: '',
      required: false,
      choices: ['Tidak', 'Ya'],
      goToSectionIdByChoice: null,
      yearFieldId: yearId,
      colSpan: 1,
      isActive: true
    };
    const newYearField: MedicalFormField = {
      id: yearId,
      type: 'TEXT',
      title: 'Tahun',
      label: 'Tahun',
      helpText: '',
      placeholder: 'YYYY',
      required: false,
      choices: [],
      goToSectionIdByChoice: null,
      colSpan: 1,
      isActive: true
    };

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === currentSection.id
          ? { ...sec, fields: [...sec.fields, newQuestionField, newYearField] }
          : sec
      )
    );
    toast.success('Baris pertanyaan baru berhasil ditambahkan');
  };

  const handleMoveFieldToSection = (fieldId: string, targetSectionId: string) => {
    setSections((prev) => {
      let fieldToMove: MedicalFormField | null = null;
      const nextSections = prev.map((sec) => {
        const found = sec.fields.find((f) => f.id === fieldId);
        if (found) {
          fieldToMove = found;
          return {
            ...sec,
            fields: sec.fields.filter((f) => f.id !== fieldId)
          };
        }
        return sec;
      });

      if (!fieldToMove) return prev;

      return nextSections.map((sec) => {
        if (sec.id === targetSectionId) {
          return {
            ...sec,
            fields: [...sec.fields, fieldToMove!]
          };
        }
        return sec;
      });
    });
    toast.success('Field berhasil dipindahkan');
  };

  const handleAddElement = (type: MedicalFieldType | 'REGION' | 'TABLE') => {
    if (!currentSection) return;
    const newFieldId = `field_${Date.now()}`;

    if (type === 'TABLE') {
      handleUpdateSection(currentSection.id, {
        layout: 'questionnaire',
        tableConfig: {
          columns: [
            {
              id: 'condition',
              label: 'Kondisi / Pertanyaan',
              header: 'Kondisi / Pertanyaan',
              type: 'label'
            },
            { id: 'tidak', label: 'Tidak', header: 'Tidak', type: 'option', options: ['Tidak'] },
            { id: 'ya', label: 'Ya', header: 'Ya', type: 'option', options: ['Ya'] },
            {
              id: 'tahun',
              label: 'Tahun (jika Ya)',
              header: 'Tahun (jika Ya)',
              type: 'year',
              placeholder: 'YYYY',
              conditional: {
                dependsOnColumnId: 'ya',
                triggerValue: 'Ya',
                action: 'show'
              }
            }
          ]
        }
      });
      toast.success('Tata letak langkah diubah menjadi Tabel Kuesioner');
      return;
    }

    let newField: MedicalFormField;
    if (type === 'REGION') {
      newField = {
        id: `region_${Date.now()}`,
        type: 'LIST',
        title: 'Wilayah Tempat Tinggal',
        label: 'Wilayah Tempat Tinggal',
        helpText: 'Pilih Provinsi, Kota, Kecamatan, dan Kelurahan',
        placeholder: 'Pilih wilayah...',
        required: false,
        choices: [],
        goToSectionIdByChoice: null,
        colSpan: 'full',
        isActive: true,
        dataSource: {
          type: 'catalog',
          key: 'indonesian_regions'
        }
      };
    } else if (type === 'CHECKBOX') {
      newField = {
        id: newFieldId,
        type: 'CHECKBOX',
        title: 'Pernyataan / Persetujuan',
        label: 'Pernyataan / Persetujuan',
        helpText: '',
        placeholder: '',
        required: false,
        choices: [],
        goToSectionIdByChoice: null,
        colSpan: 1,
        isActive: true
      };
    } else if (type === 'MULTIPLE_CHOICE') {
      newField = {
        id: newFieldId,
        type: 'MULTIPLE_CHOICE',
        title: 'Pilihan Baru',
        label: 'Pilihan Baru',
        helpText: '',
        placeholder: '',
        required: false,
        choices: ['Ya', 'Tidak'],
        goToSectionIdByChoice: null,
        colSpan: 1,
        isActive: true
      };
    } else if (type === 'LIST') {
      newField = {
        id: newFieldId,
        type: 'LIST',
        title: 'Dropdown Pilihan',
        label: 'Dropdown Pilihan',
        helpText: '',
        placeholder: 'Pilih salah satu...',
        required: false,
        choices: ['Pilihan 1', 'Pilihan 2'],
        goToSectionIdByChoice: null,
        colSpan: 1,
        isActive: true
      };
    } else if (type === 'PARAGRAPH') {
      newField = {
        id: newFieldId,
        type: 'PARAGRAPH',
        title: 'Catatan Lengkap',
        label: 'Catatan Lengkap',
        helpText: '',
        placeholder: 'Masukkan catatan...',
        required: false,
        choices: [],
        goToSectionIdByChoice: null,
        colSpan: 'full',
        isActive: true
      };
    } else if (type === 'DATE') {
      newField = {
        id: newFieldId,
        type: 'DATE',
        title: 'Tanggal',
        label: 'Tanggal',
        helpText: '',
        placeholder: 'Pilih tanggal...',
        required: false,
        choices: [],
        goToSectionIdByChoice: null,
        colSpan: 'full',
        isActive: true
      };
    } else {
      newField = {
        id: newFieldId,
        type: 'TEXT',
        title: 'Field Teks Baru',
        label: 'Field Teks Baru',
        helpText: '',
        placeholder: 'Masukkan data...',
        required: false,
        choices: [],
        goToSectionIdByChoice: null,
        colSpan: 1,
        isActive: true
      };
    }

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === currentSection.id ? { ...sec, fields: [...sec.fields, newField] } : sec
      )
    );
    toast.success(`Elemen "${newField.title}" berhasil ditambahkan`);
  };

  const handleSaveBuilderSchema = async () => {
    if (!onSaveSchema) return;
    try {
      setIsSavingSchema(true);
      const schemaToSave = convertSectionsToJsonSchema(
        sections,
        customDefinition?.formTitle || stepTitle,
        customDefinition?.formDescription || stepDescription
      );
      await onSaveSchema(schemaToSave);
      toast.success('Skema formulir berhasil disimpan');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan skema formulir');
    } finally {
      setIsSavingSchema(false);
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen && !internalReservationContext}
        onClose={onClose}
        maxWidth={
          builderMode
            ? 'max-w-[760px]'
            : isQuestionnaireStep || isHistoryCatalogStep
              ? 'max-w-[720px]'
              : 'max-w-[580px]'
        }
        showCloseButton={false}
        className='flex h-auto max-h-[88dvh] flex-col overflow-hidden p-5 sm:p-6 shadow-2xl transition-[max-width,width,max-height,height] duration-300'
      >
        <div className='flex shrink-0 flex-col gap-2 pb-2 mb-3 border-b border-border/40 sm:pb-3 sm:mb-4'>
          <div className='flex items-start justify-between gap-2'>
            {builderMode && currentSection ? (
              <div className='min-w-0 flex-1 space-y-1 sm:space-y-1.5'>
                <div className='group/title relative flex items-center gap-1.5'>
                  <input
                    type='text'
                    value={currentSection.title}
                    onChange={(e) =>
                      handleUpdateSection(currentSection.id, { title: e.target.value })
                    }
                    className='h-auto w-full rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-base font-bold tracking-tight text-foreground transition-all sm:text-lg hover:border-border hover:bg-muted/40 focus:border-primary focus:bg-background focus:outline-hidden focus:ring-1 focus:ring-primary'
                    placeholder='Judul Langkah (contoh: Kenalan dulu, yuk)'
                  />
                  <Icons.edit className='size-3.5 text-muted-foreground/50 opacity-0 transition-opacity group-hover/title:opacity-100 pointer-events-none shrink-0' />
                </div>
                <div className='group/desc relative flex items-center gap-1.5'>
                  <input
                    type='text'
                    value={currentSection.description || ''}
                    onChange={(e) =>
                      handleUpdateSection(currentSection.id, { description: e.target.value })
                    }
                    className='h-auto w-full rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-muted-foreground transition-all sm:text-sm leading-normal hover:border-border hover:bg-muted/40 focus:border-primary focus:bg-background focus:text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
                    placeholder='Deskripsi petunjuk langkah...'
                  />
                  <Icons.edit className='size-3 text-muted-foreground/50 opacity-0 transition-opacity group-hover/desc:opacity-100 pointer-events-none shrink-0' />
                </div>
              </div>
            ) : (
              <div className='min-w-0 flex-1 space-y-1 sm:space-y-1.5'>
                <h3 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
                  {stepTitle}
                </h3>
                <p className='text-xs sm:text-sm text-muted-foreground leading-normal'>
                  {stepDescription}
                </p>
              </div>
            )}

            {builderMode && currentSection && (
              <div className='flex items-center gap-1.5 shrink-0'>
                {/* 1. Tambah Elemen: Icon-based button '+' */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      title='Tambah Elemen Formulir'
                      className='flex size-8 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    >
                      <Icons.add className='size-4' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-64 text-xs z-[80]'>
                    <DropdownMenuLabel className='text-[11px] font-semibold text-muted-foreground'>
                      Pilih Jenis Elemen Formulir
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAddElement('TEXT')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>Teks Singkat</span>
                        <span className='text-[10px] text-muted-foreground'>
                          Input teks standar satu baris
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddElement('PARAGRAPH')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>Paragraf / Catatan</span>
                        <span className='text-[10px] text-muted-foreground'>
                          Area teks multi-baris lebar penuh
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddElement('MULTIPLE_CHOICE')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>Pilihan Tunggal (Radio Chips)</span>
                        <span className='text-[10px] text-muted-foreground'>
                          Pilihan horizontal Ya / Tidak / custom
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddElement('LIST')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>Dropdown Pilihan (Select)</span>
                        <span className='text-[10px] text-muted-foreground'>
                          Menu dropdown pilihan data
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddElement('CHECKBOX')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>Kotak Centang (Checkbox)</span>
                        <span className='text-[10px] text-muted-foreground'>
                          Pernyataan persetujuan / verifikasi
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddElement('DATE')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>Tanggal (Date Picker)</span>
                        <span className='text-[10px] text-muted-foreground'>
                          Pemilih tanggal kalender
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAddElement('REGION')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium text-primary'>
                          Wilayah Indonesia (Cascading)
                        </span>
                        <span className='text-[10px] text-muted-foreground'>
                          Provinsi, Kota, Kecamatan, Kelurahan
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddElement('TABLE')}
                      className='cursor-pointer py-1.5'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium text-primary'>Tabel Kuesioner (Matrix)</span>
                        <span className='text-[10px] text-muted-foreground'>
                          Ubah langkah ini menjadi tabel baris kuesioner
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. Semua Langkah: Icon-based Chevron double toggle */}
                <button
                  type='button'
                  onClick={() => setIsTrayOpen((prev) => !prev)}
                  title={`Daftar Langkah Formulir (${currentStep}/${sections.length})`}
                  className='flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                >
                  <ChevronsRight className='size-4 text-primary' />
                </button>

                {/* 3. Hapus Langkah: Icon-based Trash2 */}
                {sections.length > 1 && (
                  <button
                    type='button'
                    onClick={() => handleDeleteStep(currentSection.id)}
                    title='Hapus langkah ini'
                    className='flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-1 focus:ring-destructive'
                  >
                    <Icons.trash className='size-4' />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sub-header action: Button + Tambah Kehamilan / + Tambah KB positioned under header text on the right side */}
          {isHistoryCatalogStep &&
          historyCounts[currentDescriptor.historyKey] <
            historyGroups[currentDescriptor.historyKey].maxRecords ? (
            <div className='flex items-center justify-end pt-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => actions.addHistoryFromCatalog(currentDescriptor.historyKey)}
                className='border-dashed text-xs font-medium hover:border-primary hover:bg-primary/5'
              >
                <Icons.add className='mr-1 size-3.5 shrink-0' />
                <span>
                  {currentDescriptor.historyKey === REPEATABLE_GROUP_KEYS.PREGNANCY
                    ? 'Tambah Kehamilan'
                    : 'Tambah KB'}
                </span>
              </Button>
            </div>
          ) : null}
        </div>

        <form.AppForm>
          <form.Form
            data-medical-flow={flow}
            className='flex flex-1 min-h-0 flex-col gap-0 p-0 md:p-0'
          >
            <div
              ref={stepContainerRef}
              className='flex-1 min-h-0 max-h-[calc(88dvh-8rem)] overflow-y-auto overflow-x-hidden pr-1.5 pt-1 pb-2'
            >
              {currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL ? (
                <MedicalSectionStep
                  section={visibleMedicalSections[currentDescriptor.sectionIndex]}
                  catalogActionType={catalogAction?.type ?? null}
                  onReturnToCatalog={actions.cancelCatalogAction}
                  values={values}
                  builderMode={builderMode}
                  onFieldChange={(fieldId, nextValue) => {
                    form.setFieldValue(fieldId, nextValue);
                  }}
                  onUpdateField={handleUpdateField}
                  onDeleteField={handleDeleteField}
                  onAddField={
                    currentSection?.layout === 'questionnaire'
                      ? handleAddQuestionnaireRow
                      : () => handleAddElement('TEXT')
                  }
                  renderField={(field) => (
                    <form.AppField
                      key={field.id}
                      name={field.id}
                      validators={getFieldValidators(field, builderMode)}
                    >
                      {(fieldApi: AnyFieldApi) => (
                        <MedicalSchemaField
                          fieldApi={fieldApi}
                          schemaField={field}
                          builderMode={builderMode}
                          currentSectionId={currentSection?.id}
                          availableSections={sections.map((s, idx) => ({
                            id: s.id,
                            title: `${idx + 1}. ${s.title}`
                          }))}
                          onUpdateField={(updated) => handleUpdateField(field.id, updated)}
                          onToggleActive={() => handleToggleFieldActive(field.id)}
                          onDeleteField={() => handleDeleteField(field.id)}
                          onMoveToSection={(targetSectionId) =>
                            handleMoveFieldToSection(field.id, targetSectionId)
                          }
                        />
                      )}
                    </form.AppField>
                  )}
                />
              ) : null}

              {currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG ? (
                <MedicalHistoryCatalog
                  groupKey={currentDescriptor.historyKey}
                  recordsCount={historyCounts[currentDescriptor.historyKey]}
                  maxRecords={historyGroups[currentDescriptor.historyKey].maxRecords}
                  values={values}
                  showHeader={false}
                  onEditRecord={(recordNumber) =>
                    actions.editHistoryFromCatalog(currentDescriptor.historyKey, recordNumber)
                  }
                  onRemoveRecord={(recordNumber) =>
                    actions.removeHistoryRecord(currentDescriptor.historyKey, recordNumber)
                  }
                  onAddRecord={() => actions.addHistoryFromCatalog(currentDescriptor.historyKey)}
                  className='h-full min-h-0 flex-1 overflow-y-auto pr-1 pb-2'
                />
              ) : null}
            </div>

            {builderMode ? (
              <div className='flex shrink-0 items-center justify-between pt-3 mt-auto border-t border-border/40'>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='ghost'
                    shape='pill'
                    onClick={actions.prevStep}
                    disabled={currentStep === 1}
                  >
                    Kembali
                  </Button>
                  {!isLastStep && (
                    <Button
                      type='button'
                      variant='outline'
                      shape='pill'
                      onClick={actions.nextStep}
                      className='text-xs'
                    >
                      Step Berikutnya
                    </Button>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <Button type='button' variant='ghost' shape='pill' onClick={onClose}>
                    Tutup
                  </Button>
                  <Button
                    type='button'
                    variant='primary'
                    shape='pill'
                    isLoading={isSavingSchema}
                    onClick={handleSaveBuilderSchema}
                    withTrailingCircleIcon
                    trailingIcon={<Icons.check className='size-3.5' />}
                  >
                    Simpan Formulir
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex shrink-0 items-center justify-between pt-3 mt-auto'>
                <Button type='button' variant='ghost' shape='pill' onClick={actions.prevStep}>
                  {currentStep === 1 && !onBackToService ? 'Batal' : 'Kembali'}
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  shape='pill'
                  hug
                  disabled={!isCurrentStepValid || isProcessing}
                  isLoading={isProcessing}
                  onClick={actions.nextStep}
                  withTrailingCircleIcon
                  trailingIcon={<Icons.arrowUpRight />}
                >
                  {isLastStep
                    ? isProcessing
                      ? 'Menyimpan data...'
                      : 'Lanjutkan ke Reservasi'
                    : 'Lanjutkan'}
                </Button>
              </div>
            )}
          </form.Form>
        </form.AppForm>
      </ModalWrapper>

      {builderMode && isOpen && (
        <SideTray
          items={sections.map((sec, idx) => ({
            key: sec.id,
            label: `${idx + 1}. ${sec.title}`,
            description: sec.description || undefined,
            count: sec.fields.length,
            badge: sec.layout === 'questionnaire' ? 'Tabel' : undefined
          }))}
          activeKey={currentSection?.id || ''}
          onSelect={(key) => {
            const targetIdx = sections.findIndex((s) => s.id === key);
            if (targetIdx !== -1) {
              actions.goToStep(targetIdx + 1);
            }
            setIsTrayOpen(false);
          }}
          title='Daftar Langkah Formulir'
          mode='overlay'
          isExpanded={isTrayOpen}
          onExpandedChange={setIsTrayOpen}
          triggerAriaLabel='Buka Daftar Langkah'
          headerSlot={
            <div className='flex items-center justify-between border-b border-border/60 p-3'>
              <div>
                <h4 className='text-xs font-bold text-foreground'>Navigasi Langkah</h4>
                <p className='text-[10px] text-muted-foreground'>
                  {sections.length} total langkah formulir
                </p>
              </div>
              <div className='flex items-center gap-1.5'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddStep}
                  className='h-7 border-dashed text-xs'
                >
                  <Icons.add className='mr-1 size-3' /> Tambah
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsTrayOpen(false)}
                  className='size-7 p-0'
                >
                  <Icons.close className='size-3.5' />
                </Button>
              </div>
            </div>
          }
        />
      )}

      {internalReservationContext ? (
        <ReservationModal
          isOpen={Boolean(internalReservationContext)}
          context={internalReservationContext}
          onClose={() => {
            setInternalReservationContext(null);
            onClose();
          }}
          onSuccess={(apt) => {
            onCreated?.(apt as unknown as AppointmentFormData);
          }}
        />
      ) : null}

      <Dialog
        open={Boolean(historyPrompt)}
        onOpenChange={(open) => {
          if (!open) {
            actions.promptNo();
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Tambah Riwayat Lain?</DialogTitle>
            <DialogDescription>
              {historyPrompt?.groupKey === 'pregnancy'
                ? 'Apakah ada lagi riwayat kehamilan atau persalinan sebelumnya yang ingin Anda tambahkan?'
                : 'Apakah ada lagi riwayat penggunaan KB/kontrasepsi yang ingin Anda tambahkan?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              shape='pill'
              onClick={actions.promptNo}
              className='text-xs'
            >
              Tidak, Buka Katalog
            </Button>
            <Button
              type='button'
              variant='primary'
              shape='pill'
              onClick={actions.promptYes}
              className='text-xs'
            >
              Ya, Tambah Riwayat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QueueSuccessModal
        isOpen={isQueueSuccessOpen}
        isProcessing={isProcessing}
        appointment={createdAppointment}
        queueItem={createdQueueItem}
        onClose={actions.closeQueueSuccess}
      />
    </>
  );
}

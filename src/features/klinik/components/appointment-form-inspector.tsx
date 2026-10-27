'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { klinikKeys } from '../api/query-keys';
import { FLOW_NAMES } from '../constants/kia-constants';
import {
  kiaIntakeService,
  type MaternalIntakeResponse,
  type ChildImmunizationResponse
} from '../api/kia-intake-service';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import type { Appointment } from '../api/types';
import type { UnifiedInspectorData, UnifiedInspectorPatient } from './inspector/types';
import { InspectorIdentityTab } from './inspector/inspector-identity-tab';
import { InspectorPartnerTab } from './inspector/inspector-partner-tab';
import { InspectorClinicalTab } from './inspector/inspector-clinical-tab';
import { InspectorObstetricTab } from './inspector/inspector-obstetric-tab';
import { InspectorImmunizationTab } from './inspector/inspector-immunization-tab';
import { InspectorGenericView } from './inspector/inspector-generic-view';
import {
  ClinicalDocumentFullscreenReader,
  adaptToPmbFormData,
  adaptToImunisasiFormData,
  adaptToRegulerFormData,
  exportPmbDocx,
  exportImunisasiDocx,
  exportRegulerDocx,
  type ClinicalFormFlow
} from './clinical-document';

export interface AppointmentFormInspectorProps {
  appointment: Appointment;
  onClose?: () => void;
  hideHeader?: boolean;
}

const PREGNANCY_TABS = [
  { value: 'identitas', label: 'Identitas Ibu' },
  { value: 'suami', label: 'Suami & Alamat' },
  { value: 'klinis', label: 'Skrining Klinis' },
  { value: 'obstetri', label: 'Obstetri & KB' }
] as const;

export function AppointmentFormInspector({
  appointment,
  onClose,
  hideHeader = false
}: AppointmentFormInspectorProps) {
  const [pregnancyTab, setPregnancyTab] = React.useState<string>('identitas');

  const { data: serverIntake, isLoading } = useQuery({
    queryKey: klinikKeys.appointmentIntake(appointment.id),
    queryFn: () => kiaIntakeService.getIntakeByAppointmentId(appointment.id),
    enabled: Boolean(appointment.id),
    staleTime: 60_000,
    retry: false
  });

  const { data: affiliations } = useQuery({
    queryKey: ['patient-affiliations', 'me'],
    queryFn: () => patientAffiliationService.getMyAffiliations(),
    staleTime: 60_000
  });

  const matchingAffiliation = React.useMemo(() => {
    if (!affiliations?.length) return null;
    return affiliations.find((a) => a.id === appointment.patient_id) || null;
  }, [affiliations, appointment.patient_id]);

  const parsedData = React.useMemo<UnifiedInspectorData>(() => {
    const rawData =
      serverIntake &&
      typeof serverIntake === 'object' &&
      'data' in serverIntake &&
      serverIntake.data
        ? typeof serverIntake.data === 'object' && 'data' in serverIntake.data
          ? (serverIntake.data as any).data
          : serverIntake.data
        : serverIntake;

    const flow = serverIntake?.flow ?? appointment.medical_flow;

    let answers: Record<string, any> = {};
    let automatic: Record<string, any> = {};
    let maternal: MaternalIntakeResponse | undefined = undefined;
    let child: ChildImmunizationResponse | undefined = undefined;

    if (rawData) {
      if (flow === FLOW_NAMES.PREGNANCY) {
        maternal = rawData as MaternalIntakeResponse;
        answers = (maternal.answers as Record<string, any>) || {};
        automatic = (maternal.automatic as Record<string, any>) || {};
      } else if (flow === FLOW_NAMES.IMMUNIZATION) {
        child = rawData as ChildImmunizationResponse;
        answers = (child.answers as Record<string, any>) || {};
        automatic = (child.automatic as Record<string, any>) || {};
      } else {
        answers = (rawData.answers as Record<string, any>) || {};
        automatic = (rawData.automatic as Record<string, any>) || {};
      }
    }

    if (appointment.medical_intake) {
      if (Object.keys(answers).length === 0 && appointment.medical_intake.answersByFieldId) {
        answers = { ...appointment.medical_intake.answersByFieldId };
      }
      if (Object.keys(automatic).length === 0 && appointment.medical_intake.automatic) {
        automatic = { ...appointment.medical_intake.automatic };
      }
    }

    const patient: UnifiedInspectorPatient | undefined =
      rawData?.patient ||
      (matchingAffiliation
        ? {
            id: matchingAffiliation.id,
            nik: matchingAffiliation.nik || undefined,
            fullName: matchingAffiliation.fullName,
            motherName: matchingAffiliation.motherName || undefined,
            birthPlace: matchingAffiliation.birthPlace || undefined,
            birthDate: matchingAffiliation.birthDate || undefined,
            gender: matchingAffiliation.gender,
            bloodType: matchingAffiliation.bloodType || undefined,
            occupation: matchingAffiliation.occupationName || undefined,
            phone: matchingAffiliation.phoneNumber || undefined,
            address: matchingAffiliation.address || undefined,
            relationshipType: matchingAffiliation.relationship,
            relationLabel: matchingAffiliation.relationshipLabel
          }
        : appointment.patient_name
          ? {
              fullName: appointment.patient_name,
              phone: appointment.patient_phone
            }
          : undefined);

    return {
      flow,
      answers,
      automatic,
      maternal,
      child,
      patient,
      appointmentId: appointment.id,
      bookingCode: appointment.booking_code,
      scheduledDate: appointment.date,
      scheduledStartTime: appointment.scheduled_start_time || '-',
      complaint: appointment.complaint || '-',
      serviceName: appointment.service || '-'
    };
  }, [serverIntake, appointment, matchingAffiliation]);

  const isPregnancy = parsedData.flow === FLOW_NAMES.PREGNANCY;
  const isImmunization = parsedData.flow === FLOW_NAMES.IMMUNIZATION || Boolean(parsedData.child);

  const [isReaderOpen, setIsReaderOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const pmbFormData = React.useMemo(() => {
    if (parsedData.flow === FLOW_NAMES.PREGNANCY) {
      return adaptToPmbFormData(parsedData);
    }
    return null;
  }, [parsedData]);

  const imunisasiFormData = React.useMemo(() => {
    if (parsedData.flow === FLOW_NAMES.IMMUNIZATION || Boolean(parsedData.child)) {
      return adaptToImunisasiFormData(parsedData);
    }
    return null;
  }, [parsedData]);

  const regulerFormData = React.useMemo(() => {
    if (!isPregnancy && !isImmunization) {
      return adaptToRegulerFormData(parsedData, appointment);
    }
    return null;
  }, [parsedData, appointment, isPregnancy, isImmunization]);

  const handleDirectDownload = async () => {
    try {
      setIsExporting(true);
      if (parsedData.flow === FLOW_NAMES.PREGNANCY) {
        const patientName = appointment.patient_name || 'Pasien';
        await exportPmbDocx(pmbFormData, `Formulir_ANC_${patientName.replace(/\s+/g, '_')}.docx`);
      } else if (parsedData.flow === FLOW_NAMES.IMMUNIZATION || Boolean(parsedData.child)) {
        const childName = appointment.patient_name || 'Anak';
        await exportImunisasiDocx(
          imunisasiFormData,
          `Formulir_Imunisasi_${childName.replace(/\s+/g, '_')}.docx`
        );
      } else {
        const patientName = appointment.patient_name || 'Pasien';
        await exportRegulerDocx(
          regulerFormData,
          `Formulir_Rawat_Jalan_${patientName.replace(/\s+/g, '_')}.docx`
        );
      }
    } catch (err) {
      console.error('Failed to export DOCX:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='w-full flex flex-col font-sans select-none justify-between h-full min-h-0'>
      {!hideHeader ? (
        <div className='flex items-center justify-between gap-4 pb-3 border-b border-border/40 shrink-0 min-h-[77px]'>
          <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5 justify-center'>
            <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
              {isPregnancy
                ? 'Formulir KIA & Kehamilan'
                : isImmunization
                  ? 'Formulir Imunisasi Anak'
                  : 'Formulir Pendaftaran Pasien'}
            </h3>
            <p className='text-sm font-medium text-muted-foreground truncate w-full'>
              {isPregnancy
                ? 'Data skrining klinis, kebiasaan, obstetri & riwayat KB'
                : isImmunization
                  ? 'Data riwayat vaksinasi dan tumbuh kembang anak'
                  : 'Data rekam medis & profil intake pasien'}
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              shape='rounded'
              onClick={() => setIsReaderOpen(true)}
              leadingIcon={<Icons.maximize className='size-3.5 text-muted-foreground' />}
              title='Buka Formulir Fullscreen PDF Reader (Ukuran Penuh)'
            >
              <span className='hidden sm:inline'>Ukuran Penuh (PDF Reader)</span>
            </Button>

            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='rounded'
              onClick={handleDirectDownload}
              disabled={isExporting}
              isLoading={isExporting}
              leadingIcon={
                !isExporting && (
                  <Icons.download className='size-3.5 text-emerald-600 dark:text-emerald-400' />
                )
              }
              className='border-emerald-300/80 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 shadow-2xs'
              title='Unduh Dokumen Word (.docx)'
            >
              <span className='hidden sm:inline'>
                {isExporting ? 'Mengunduh...' : 'Unduh Word'}
              </span>
            </Button>

            {onClose && (
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                shape='pill'
                onClick={onClose}
                aria-label='Tutup formulir'
                className='text-muted-foreground hover:text-foreground hover:bg-muted/70'
              >
                <Icons.chevronRight className='size-5' />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-end gap-2 pb-2 mb-2 border-b border-border/30 shrink-0'>
          <Button
            type='button'
            variant='secondary'
            size='compact'
            shape='rounded'
            onClick={() => setIsReaderOpen(true)}
            leadingIcon={<Icons.maximize className='size-3.5' />}
            title='Buka Formulir Fullscreen PDF Reader (Ukuran Penuh)'
          >
            <span>Ukuran Penuh (PDF)</span>
          </Button>
          <Button
            type='button'
            variant='outline'
            size='compact'
            shape='rounded'
            onClick={handleDirectDownload}
            disabled={isExporting}
            isLoading={isExporting}
            leadingIcon={
              !isExporting && (
                <Icons.download className='size-3.5 text-emerald-700 dark:text-emerald-400' />
              )
            }
            className='border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400'
            title='Unduh Dokumen Word (.docx)'
          >
            <span>{isExporting ? 'Mengunduh...' : 'Unduh Word'}</span>
          </Button>
        </div>
      )}

      <div className='py-3 flex-1 min-h-0 flex flex-col'>
        {isLoading && !appointment.medical_intake ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2'>
            <Icons.spinner className='size-5 animate-spin text-primary' />
            <span className='text-xs font-medium'>Memuat formulir medis...</span>
          </div>
        ) : isPregnancy ? (
          <Tabs
            value={pregnancyTab}
            onValueChange={setPregnancyTab}
            className='w-full flex flex-col h-full min-h-0'
          >
            {/* Mobile Morevert Dropdown Navigation: Clean, un-cramped, zero text truncation */}
            <div className='flex sm:hidden items-center justify-between p-2 mb-2.5 rounded-lg border border-border/60 bg-muted/30 shrink-0'>
              <div className='flex items-center gap-2 min-w-0'>
                <span className='text-xs font-bold text-foreground truncate'>
                  {PREGNANCY_TABS.find((t) => t.value === pregnancyTab)?.label || 'Identitas Ibu'}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon-sm'
                    shape='pill'
                    className='size-7 shrink-0 text-foreground hover:bg-muted'
                    aria-label='Pilih bagian formulir'
                  >
                    <Icons.ellipsis className='size-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  {PREGNANCY_TABS.map((tab) => (
                    <DropdownMenuItem
                      key={tab.value}
                      onClick={() => setPregnancyTab(tab.value)}
                      className={cn(
                        'flex items-center justify-between text-xs cursor-pointer',
                        pregnancyTab === tab.value && 'font-bold text-primary bg-primary/10'
                      )}
                    >
                      <span>{tab.label}</span>
                      {pregnancyTab === tab.value && (
                        <Icons.check className='size-3.5 text-primary' />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Horizontal Tabs */}
            <TabsList className='hidden sm:grid grid-cols-4 w-full h-9 mb-3 shrink-0'>
              {PREGNANCY_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className='text-xs font-semibold cursor-pointer'
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
              <TabsContent value='identitas' className='m-0 outline-none'>
                <InspectorIdentityTab appointment={appointment} data={parsedData} />
              </TabsContent>

              <TabsContent value='suami' className='m-0 outline-none'>
                <InspectorPartnerTab appointment={appointment} data={parsedData} />
              </TabsContent>

              <TabsContent value='klinis' className='m-0 outline-none'>
                <InspectorClinicalTab appointment={appointment} data={parsedData} />
              </TabsContent>

              <TabsContent value='obstetri' className='m-0 outline-none'>
                <InspectorObstetricTab appointment={appointment} data={parsedData} />
              </TabsContent>
            </div>
          </Tabs>
        ) : isImmunization ? (
          <InspectorImmunizationTab appointment={appointment} data={parsedData} />
        ) : (
          <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
            <InspectorGenericView appointment={appointment} data={parsedData} />
          </div>
        )}
      </div>

      <ClinicalDocumentFullscreenReader
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        flow={parsedData.flow as ClinicalFormFlow}
        pmbData={pmbFormData}
        imunisasiData={imunisasiFormData}
        regulerData={regulerFormData}
      />
    </div>
  );
}

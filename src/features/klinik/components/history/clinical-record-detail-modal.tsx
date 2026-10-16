'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  kiaIntakeService,
  type MaternalIntakeResponse,
  type ChildImmunizationResponse
} from '../../api/kia-intake-service';
import { InspectorImmunizationTab } from '../inspector/inspector-immunization-tab';
import { InspectorIdentityTab } from '../inspector/inspector-identity-tab';
import { InspectorPartnerTab } from '../inspector/inspector-partner-tab';
import { InspectorObstetricTab } from '../inspector/inspector-obstetric-tab';
import { InspectorClinicalTab } from '../inspector/inspector-clinical-tab';
import type { UnifiedInspectorData } from '../inspector/types';
import type { Appointment } from '../../api/types';

export interface ClinicalRecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordType: 'immunization' | 'maternity' | null;
  recordId: string | null;
}

const emptyAppointment: Appointment = {
  id: '',
  booking_code: '',
  patient_id: '',
  patient_name: '',
  patient_email: '',
  patient_avatar: '',
  patient_phone: '',
  doctor_name: '',
  doctor_specialty: '',
  room_name: '',
  service: '',
  complaint: '',
  date: '',
  time: '',
  session: '',
  session_name: '',
  queue_number: '',
  status: 'COMPLETED',
  created_at: ''
};

export function ClinicalRecordDetailModal({
  isOpen,
  onClose,
  recordType,
  recordId
}: ClinicalRecordDetailModalProps) {
  const {
    data: record,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['clinical-record-detail', recordType, recordId],
    queryFn: async () => {
      if (!recordId || !recordType) return null;
      if (recordType === 'immunization') {
        return await kiaIntakeService.getImmunizationIntakeById(recordId);
      }
      return await kiaIntakeService.getMaternalIntakeById(recordId);
    },
    enabled: isOpen && Boolean(recordId) && Boolean(recordType),
    staleTime: 60_000
  });

  const isImmunization = recordType === 'immunization';
  const childRecord = isImmunization
    ? (record as ChildImmunizationResponse | undefined)
    : undefined;
  const maternalRecord = !isImmunization
    ? (record as MaternalIntakeResponse | undefined)
    : undefined;

  const inspectorData: UnifiedInspectorData = React.useMemo(() => {
    if (isImmunization && childRecord) {
      return {
        flow: 'immunization',
        type: 'immunization',
        answers: childRecord.answers || {},
        automatic: {},
        child: childRecord,
        patient: {
          fullName: childRecord.childName,
          nik: childRecord.childNik,
          birthDate: childRecord.childBirthDate,
          gender: childRecord.childSex,
          phone: childRecord.parentPhone,
          address: childRecord.childAddress ?? undefined
        }
      };
    }
    if (!isImmunization && maternalRecord) {
      return {
        flow: 'pregnancy',
        type: 'pregnancy',
        answers: maternalRecord.answers || {},
        automatic: {},
        maternal: maternalRecord,
        patient: {
          fullName: maternalRecord.motherName,
          nik: maternalRecord.motherNik,
          birthDate: maternalRecord.motherBirthDate ?? undefined,
          phone: maternalRecord.phoneNumber ?? undefined,
          address: maternalRecord.domicileAddress ?? undefined
        }
      };
    }
    return {
      flow: isImmunization ? 'immunization' : 'pregnancy',
      type: isImmunization ? 'immunization' : 'pregnancy',
      answers: {},
      automatic: {}
    };
  }, [isImmunization, childRecord, maternalRecord]);

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[95vw] w-[95vw]'
      className='max-h-[90vh] h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden'
      showCloseButton={false}
    >
      <div className='relative font-sans flex flex-col min-h-0 flex-1 h-full'>
        {/* 1. Modal Header (Pinned) - Matching PatientModal */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span className='truncate'>
                {isImmunization
                  ? childRecord?.childName
                    ? `Detail Rekam Imunisasi: ${childRecord.childName}`
                    : 'Detail Rekam Imunisasi Anak'
                  : maternalRecord?.motherName
                    ? `Detail Rekam Kehamilan: ${maternalRecord.motherName}`
                    : 'Detail Rekam Kehamilan & Persalinan'}
              </span>
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              {isImmunization
                ? childRecord?.childNik
                  ? `NIK Anak: ${childRecord.childNik} • Arsip formulir rekam medis imunisasi anak`
                  : 'Arsip formulir rekam medis imunisasi anak'
                : maternalRecord?.motherNik
                  ? `NIK Ibu: ${maternalRecord.motherNik} • Arsip formulir rekam medis obstetrik dan kehamilan`
                  : 'Arsip formulir rekam medis obstetrik dan kehamilan'}
            </p>
          </div>
        </div>

        {/* 2. Modal Body / Content (Scrollable) */}
        <div className='flex-1 min-h-0 flex flex-col overflow-y-auto py-3.5 pr-1'>
          {isLoading ? (
            <div className='flex-1 flex flex-col items-center justify-center min-h-[350px] text-muted-foreground gap-3'>
              <Icons.spinner className='size-8 animate-spin text-primary' />
              <p className='text-xs font-medium'>Memuat rincian data klinis...</p>
            </div>
          ) : isError ? (
            <div className='flex-1 flex flex-col items-center justify-center min-h-[300px] p-4 text-center'>
              <div className='p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs'>
                {error instanceof Error
                  ? error.message
                  : 'Gagal memuat rincian rekam medis historis.'}
              </div>
            </div>
          ) : record ? (
            isImmunization ? (
              <InspectorImmunizationTab appointment={emptyAppointment} data={inspectorData} />
            ) : (
              <Tabs defaultValue='identitas' className='w-full flex flex-col h-full'>
                <TabsList className='grid grid-cols-4 w-full h-9 mb-4 shrink-0'>
                  <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer'>
                    Identitas Ibu
                  </TabsTrigger>
                  <TabsTrigger value='suami' className='text-xs font-semibold cursor-pointer'>
                    Suami & Domisili
                  </TabsTrigger>
                  <TabsTrigger value='obstetrik' className='text-xs font-semibold cursor-pointer'>
                    Riwayat Obstetrik
                  </TabsTrigger>
                  <TabsTrigger value='klinis' className='text-xs font-semibold cursor-pointer'>
                    Riwayat Klinis
                  </TabsTrigger>
                </TabsList>

                <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
                  <TabsContent value='identitas' className='m-0 outline-none'>
                    <InspectorIdentityTab appointment={emptyAppointment} data={inspectorData} />
                  </TabsContent>

                  <TabsContent value='suami' className='m-0 outline-none'>
                    <InspectorPartnerTab appointment={emptyAppointment} data={inspectorData} />
                  </TabsContent>

                  <TabsContent value='obstetrik' className='m-0 outline-none'>
                    <InspectorObstetricTab appointment={emptyAppointment} data={inspectorData} />
                  </TabsContent>

                  <TabsContent value='klinis' className='m-0 outline-none'>
                    <InspectorClinicalTab appointment={emptyAppointment} data={inspectorData} />
                  </TabsContent>
                </div>
              </Tabs>
            )
          ) : (
            <div className='text-center py-16 text-xs text-muted-foreground'>
              Data rekam medis tidak ditemukan.
            </div>
          )}
        </div>

        {/* 3. Modal Footer (Pinned at Bottom) - Matching PatientModal */}
        <div className='shrink-0 pt-3 flex items-center justify-end gap-2.5 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            size='md'
            shape='pill'
            onClick={onClose}
            className='px-6 font-semibold cursor-pointer'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

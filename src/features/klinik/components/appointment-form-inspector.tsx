'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { klinikKeys } from '../api/query-keys';
import {
  kiaIntakeService,
  type MaternalIntakeResponse,
  type ChildImmunizationResponse
} from '../api/kia-intake-service';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import type { Appointment } from '../api/types';
import type { UnifiedInspectorData, UnifiedInspectorPatient } from './inspector/types';
import { InspectorIdentityTab } from './inspector/inspector-identity-tab';
import { InspectorClinicalTab } from './inspector/inspector-clinical-tab';
import { InspectorObstetricTab } from './inspector/inspector-obstetric-tab';
import { InspectorImmunizationTab } from './inspector/inspector-immunization-tab';
import { InspectorGenericView } from './inspector/inspector-generic-view';

export interface AppointmentFormInspectorProps {
  appointment: Appointment;
  onClose?: () => void;
}

export function AppointmentFormInspector({ appointment, onClose }: AppointmentFormInspectorProps) {
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
    return (
      affiliations.find((a) => a.id === appointment.patient_id) ||
      affiliations.find(
        (a) => a.fullName.toLowerCase() === (appointment.patient_name || '').toLowerCase()
      ) ||
      null
    );
  }, [affiliations, appointment]);

  const parsedData = React.useMemo<UnifiedInspectorData>(() => {
    const rawData =
      serverIntake && typeof serverIntake === 'object' && 'data' in serverIntake && serverIntake.data
        ? (typeof serverIntake.data === 'object' && 'data' in serverIntake.data
            ? (serverIntake.data as any).data
            : serverIntake.data)
        : serverIntake;

    const flow =
      serverIntake?.flow ||
      (serverIntake as any)?.data?.flow ||
      appointment.medical_flow ||
      appointment.medical_intake?.flow ||
      (appointment.service?.toLowerCase().includes('imunisasi') ? 'immunization' : undefined) ||
      (appointment.service?.toLowerCase().includes('kebidanan') ||
      appointment.service?.toLowerCase().includes('persalinan')
        ? 'pregnancy'
        : undefined) ||
      'regular';

    const type =
      serverIntake?.type ||
      (serverIntake as any)?.data?.type ||
      (flow === 'pregnancy' ? 'maternal' : flow === 'immunization' ? 'immunization' : 'generic');

    let answers: Record<string, any> = {};
    let automatic: Record<string, any> = {};
    let maternal: MaternalIntakeResponse | undefined = undefined;
    let child: ChildImmunizationResponse | undefined = undefined;

    if (rawData) {
      if (type === 'maternal' || flow === 'pregnancy') {
        maternal = rawData as MaternalIntakeResponse;
        answers = (maternal.answers as Record<string, any>) || (rawData.answers as Record<string, any>) || {};
        automatic = (maternal.automatic as Record<string, any>) || (rawData.automatic as Record<string, any>) || {};
      } else if (type === 'immunization' || flow === 'immunization') {
        child = rawData as ChildImmunizationResponse;
        answers = (child.answers as Record<string, any>) || (rawData.answers as Record<string, any>) || {};
        automatic = (child.automatic as Record<string, any>) || (rawData.automatic as Record<string, any>) || {};
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
            birthPlace: matchingAffiliation.placeOfBirth || undefined,
            birthDate: matchingAffiliation.dateOfBirth || undefined,
            gender: matchingAffiliation.gender,
            bloodType: matchingAffiliation.bloodType || undefined,
            occupation: matchingAffiliation.occupationName || undefined,
            phone: matchingAffiliation.phoneNumber || appointment.patient_phone || undefined,
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
      type,
      answers,
      automatic,
      maternal,
      child,
      patient,
      appointmentId: rawData?.appointmentId || appointment.id,
      bookingCode: rawData?.bookingCode || appointment.booking_code,
      scheduledDate: rawData?.scheduledDate || appointment.date,
      scheduledStartTime:
        rawData?.scheduledStartTime || appointment.scheduled_start_time || appointment.time,
      complaint: rawData?.complaint || appointment.complaint,
      serviceName: rawData?.serviceName || appointment.service
    };
  }, [serverIntake, appointment, matchingAffiliation]);

  const isPregnancy = parsedData.flow === 'pregnancy';
  const isImmunization = parsedData.flow === 'immunization' || Boolean(parsedData.child);

  return (
    <div className='w-full flex flex-col font-sans select-none justify-between h-full min-h-0'>
      <div className='flex items-center justify-between gap-4 pb-3 border-b border-border/40 shrink-0 min-h-[77px]'>
        <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5 justify-center'>
          <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
            {isPregnancy
              ? 'Formulir KIA & Kehamilan'
              : parsedData.flow === 'immunization'
                ? 'Formulir Imunisasi Anak'
                : 'Formulir Pendaftaran Pasien'}
          </h3>
          <p className='text-sm font-medium text-muted-foreground truncate w-full'>
            {isPregnancy
              ? 'Data skrining klinis, kebiasaan, obstetri & riwayat KB'
              : parsedData.flow === 'immunization'
                ? 'Data riwayat vaksinasi dan tumbuh kembang anak'
                : 'Data rekam medis & profil intake pasien'}
          </p>
        </div>

        {onClose && (
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup formulir'
            className='p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer shrink-0'
          >
            <Icons.chevronRight className='size-5' />
          </button>
        )}
      </div>

      <div className='py-3 flex-1 overflow-y-auto min-h-0 pr-1'>
        {isLoading && !appointment.medical_intake ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2'>
            <Icons.spinner className='size-5 animate-spin text-primary' />
            <span className='text-xs font-medium'>Memuat formulir medis...</span>
          </div>
        ) : isPregnancy ? (
          <Tabs defaultValue='identitas' className='w-full flex flex-col h-full'>
            <TabsList className='grid grid-cols-3 w-full h-9 mb-3 shrink-0'>
              <TabsTrigger value='identitas' className='text-xs font-semibold cursor-pointer'>
                Identitas & Fisik
              </TabsTrigger>
              <TabsTrigger value='klinis' className='text-xs font-semibold cursor-pointer'>
                Kebiasaan & Penyakit
              </TabsTrigger>
              <TabsTrigger value='obstetri' className='text-xs font-semibold cursor-pointer'>
                Obstetri & KB
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-y-auto min-h-0 pr-1'>
              <TabsContent value='identitas' className='m-0 outline-none'>
                <InspectorIdentityTab appointment={appointment} data={parsedData} />
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
          <InspectorGenericView appointment={appointment} data={parsedData} />
        )}
      </div>
    </div>
  );
}

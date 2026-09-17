import { Appointment, Doctor, QueueItem, AppointmentFormData } from './types';

const LOCAL_STORAGE_KEY_APPOINTMENTS = 'amanah_appointments_v4';
const LOCAL_STORAGE_KEY_QUEUES = 'amanah_queues_v10';

import { getAmanahServiceByName } from '../constants/services';

export const getDoctors = (): Doctor[] => {
  return [];
};

export const getDoctorByName = (name: string): Doctor | undefined => {
  return getDoctors().find((doc) => doc.name === name);
};

export const getDoctorsByService = (serviceName?: string): Doctor[] => {
  const all = getDoctors();
  if (!serviceName) return all;

  const srvInfo = getAmanahServiceByName(serviceName);
  const targetSpec = srvInfo ? srvInfo.shortName.toLowerCase() : serviceName.toLowerCase();

  const filtered = all.filter((doc) => {
    const docSpec = doc.spec.toLowerCase();
    const docLoc = doc.location.toLowerCase();
    return (
      docSpec.includes(targetSpec) ||
      targetSpec.includes(docSpec) ||
      docLoc.includes(targetSpec) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(targetSpec)))
    );
  });

  return filtered;
};

export const getTimeSlots = (): string[] => {
  return [];
};

export const loadStoredAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_APPOINTMENTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed as Appointment[];
      }
    }
  } catch (e) {
    console.warn('Could not read appointments from localStorage', e);
  }
  return [];
};

export const saveAppointmentsToStorage = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  } catch (e) {
    console.warn('Could not save appointments to localStorage', e);
  }
};

export const loadStoredQueues = (): QueueItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_QUEUES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed as QueueItem[];
      }
    }
  } catch (e) {
    console.warn('Could not read queues from localStorage', e);
  }
  return [];
};

export const saveQueuesToStorage = (queues: QueueItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_QUEUES, JSON.stringify(queues));
  } catch (e) {
    console.warn('Could not save queues to localStorage', e);
  }
};

export const createAppointmentRecord = (
  formData: AppointmentFormData,
  existingList: Appointment[]
): Appointment => {
  const nextNumber = existingList.length + 1;
  const newId = `apt-${String(nextNumber).padStart(4, '0')}`;
  const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = new Date().toISOString();

  return {
    id: newId,
    booking_code: `KLINIK-${randomCode}`,
    patient_name: formData.patientName || '',
    patient_email: formData.patientEmail || '',
    patient_avatar: formData.patientAvatar || '',
    doctor_name: formData.doctor,
    date: formData.dateStr,
    time: formData.timeSlot,
    complaint: formData.complaint,
    status: 'PENDING',
    visit_type: formData.visitType,
    service: formData.service,
    medical_flow: formData.medicalFlow,
    medical_intake: formData.medicalIntake,
    created_at: timestamp,
    updated_at: timestamp
  };
};

export const createAppointmentRecordWithQueue = (
  formData: AppointmentFormData,
  existingList: Appointment[]
): { appointment: Appointment; queueItem: QueueItem } => {
  const appointment = createAppointmentRecord(formData, existingList);
  const srv = getAmanahServiceByName(formData.service);
  const codePrefix = srv?.codePrefix || 'KIA';

  // Count existing waiting patients in this poli
  const existingQueues = loadStoredQueues();
  const currentPoliQueues = existingQueues.filter(
    (q) => q.poli.toLowerCase() === (srv?.name.toLowerCase() || formData.service.toLowerCase())
  );
  const nextQueueIndex = currentPoliQueues.length + 1;
  const queueNumber = `${codePrefix}-${String(nextQueueIndex).padStart(3, '0')}`;

  const doc = getDoctorByName(formData.doctor);

  const timeMatch = formData.timeSlot.match(/(\d{1,2}[:.]\d{2})/);
  const estimatedTime = timeMatch ? `${timeMatch[1].replace('.', ':')} WIB` : '';

  const queueItem: QueueItem = {
    queue_number: queueNumber,
    patient_name: appointment.patient_name,
    patient_avatar: appointment.patient_avatar,
    doctor_name: formData.doctor,
    poli: srv?.name || formData.service || 'Poli KIA',
    room: doc?.location || 'Ruang KIA',
    estimated_time: estimatedTime,
    status: 'MENUNGGU',
    is_user: true,
    waiting_count: currentPoliQueues.filter((q) => q.status === 'MENUNGGU').length + 1
  };

  // Sync to queues storage
  const updatedQueues = [queueItem, ...existingQueues];
  saveQueuesToStorage(updatedQueues);

  const updatedAppointments = [appointment, ...existingList];
  saveAppointmentsToStorage(updatedAppointments);

  return { appointment, queueItem };
};

import { fakerID_ID, faker as defaultFaker } from '@faker-js/faker';
import initialAppointments from '../data/appointments.json';
import doctorsData from '../data/doctors.json';
import initialQueues from '../data/queues.json';
import timeSlotsData from '../data/timeSlots.json';
import { Appointment, Doctor, QueueItem, AppointmentStatus, AppointmentFormData } from './types';

const faker = fakerID_ID || defaultFaker;

const LOCAL_STORAGE_KEY_APPOINTMENTS = 'amanah_appointments_v3';
const LOCAL_STORAGE_KEY_QUEUES = 'amanah_queues_v7';

import { AMANAH_SERVICES, getAmanahServiceByName } from '../constants/services';

export const getDoctors = (): Doctor[] => {
  return doctorsData as Doctor[];
};

export const getDoctorByName = (name: string): Doctor | undefined => {
  return (doctorsData as Doctor[]).find((doc) => doc.name === name);
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

  return filtered.length > 0 ? filtered : all;
};

export const getTimeSlots = (): string[] => {
  return timeSlotsData;
};

export const loadStoredAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') {
    return initialAppointments as Appointment[];
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_APPOINTMENTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Appointment[];
      }
    }
  } catch (e) {
    console.warn('Could not read appointments from localStorage', e);
  }
  return initialAppointments as Appointment[];
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
    return initialQueues as QueueItem[];
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_QUEUES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as QueueItem[];
      }
    }
  } catch (e) {
    console.warn('Could not read queues from localStorage', e);
  }
  return initialQueues as QueueItem[];
};

export const saveQueuesToStorage = (queues: QueueItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_QUEUES, JSON.stringify(queues));
  } catch (e) {
    console.warn('Could not save queues to localStorage', e);
  }
};

export const generateFakerAppointment = (): Appointment => {
  const doctors = getDoctors();
  const doctor = faker.helpers.arrayElement(doctors);
  const randomNum = faker.number.int({ min: 100, max: 999 });
  const dateFormatted = faker.date.soon({ days: 14 });
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Ags',
    'Sep',
    'Okt',
    'Nov',
    'Des'
  ];

  const dateStr = `${dayNames[dateFormatted.getDay()]}, ${dateFormatted.getDate()} ${
    monthNames[dateFormatted.getMonth()]
  } 2026`;
  const timeSlot = faker.helpers.arrayElement(timeSlotsData);

  const statuses: AppointmentStatus[] = [
    'CONFIRMED',
    'PENDING',
    'CHECKED_IN',
    'COMPLETED',
    'CANCELLED'
  ];
  const status = faker.helpers.arrayElement(statuses);

  return {
    id: `apt-${String(randomNum).padStart(4, '0')}`,
    booking_code: `KLINIK-${faker.string.alphanumeric(5).toUpperCase()}`,
    patient_name: faker.person.fullName(),
    patient_email: faker.internet.email().toLowerCase(),
    patient_avatar: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`,
    doctor_name: doctor.name,
    date: dateStr,
    time: timeSlot,
    complaint: faker.helpers.arrayElement([
      'Pemeriksaan rutin tekanan darah dan keluhan pusing di pagi hari.',
      'Konsultasi alergi makanan laut dan timbul ruam di lengan.',
      'Pemeriksaan gigi ngilu saat minum air dingin & pembersihan karang gigi.',
      'Demam tinggi 2 hari disertai lemas dan batuk kering.',
      'Pemeriksaan USG rutin trimester kedua kehamilan.'
    ]),
    status,
    visit_type: faker.helpers.arrayElement(['Pemeriksaan Baru', 'Kontrol Ulang']),
    service: doctor.spec,
    created_at: 'Hari ini, Baru saja',
    updated_at: 'Hari ini, Baru saja'
  };
};

export const createAppointmentRecord = (
  formData: AppointmentFormData,
  existingList: Appointment[]
): Appointment => {
  const nextNumber = existingList.length + 1;
  const newId = `apt-${String(nextNumber).padStart(4, '0')}`;
  const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

  return {
    id: newId,
    booking_code: `KLINIK-${randomCode}`,
    patient_name: 'Rian Hidayat',
    patient_email: 'rian.hidayat@outlook.com',
    patient_avatar: 'https://i.pravatar.cc/150?img=1',
    doctor_name: formData.doctor,
    date: formData.dateStr,
    time: formData.timeSlot,
    complaint: formData.complaint,
    status: 'PENDING',
    visit_type: formData.visitType,
    service: formData.service,
    created_at: 'Hari ini, Baru saja',
    updated_at: 'Hari ini, Baru saja'
  };
};

export const createAppointmentRecordWithQueue = (
  formData: AppointmentFormData,
  existingList: Appointment[]
): { appointment: Appointment; queueItem: QueueItem } => {
  const appointment = createAppointmentRecord(formData, existingList);
  const srv = getAmanahServiceByName(formData.service);
  const codePrefix = srv?.codePrefix || 'A';

  // Count existing waiting patients in this poli
  const existingQueues = loadStoredQueues();
  const currentPoliQueues = existingQueues.filter(
    (q) => q.poli.toLowerCase() === (srv?.name.toLowerCase() || formData.service.toLowerCase())
  );
  const nextQueueIndex = currentPoliQueues.length + 1;
  const queueNumber = `${codePrefix}-${String(nextQueueIndex).padStart(3, '0')}`;

  const doc = getDoctorByName(formData.doctor);

  const queueItem: QueueItem = {
    queue_number: queueNumber,
    patient_name: appointment.patient_name,
    patient_avatar: appointment.patient_avatar,
    doctor_name: formData.doctor,
    poli: srv?.name || formData.service,
    room: doc?.location || 'Room 201',
    estimated_time: formData.timeSlot.split('-')[0]?.trim() || '09:00 WIB',
    status: 'MENUNGGU',
    is_user: true,
    waiting_count: Math.max(1, currentPoliQueues.filter((q) => q.status === 'MENUNGGU').length)
  };

  // Sync to queues storage
  const updatedQueues = [queueItem, ...existingQueues];
  saveQueuesToStorage(updatedQueues);

  return { appointment, queueItem };
};

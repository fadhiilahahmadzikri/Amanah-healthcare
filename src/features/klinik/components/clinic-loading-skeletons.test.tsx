import { describe, expect, it } from 'bun:test';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { AppointmentCardsSkeleton } from './appointment-cards-skeleton';
import { QueueViewSkeleton } from './queue-view-skeleton';
import { DoctorScheduleCardsSkeleton } from '@/features/jadwal-dokter/components/doctor-schedule-cards-skeleton';

describe('Clinic Loading Skeletons', () => {
  it('renders AppointmentCardsSkeleton without throwing', () => {
    const html = renderToString(React.createElement(AppointmentCardsSkeleton));
    expect(html).toBeDefined();
    expect(html.includes('animate-pulse')).toBe(true);
  });

  it('renders QueueViewSkeleton without throwing', () => {
    const html = renderToString(React.createElement(QueueViewSkeleton));
    expect(html).toBeDefined();
    expect(html.includes('animate-pulse')).toBe(true);
  });

  it('renders DoctorScheduleCardsSkeleton without throwing', () => {
    const html = renderToString(React.createElement(DoctorScheduleCardsSkeleton));
    expect(html).toBeDefined();
    expect(html.includes('animate-pulse')).toBe(true);
  });
});

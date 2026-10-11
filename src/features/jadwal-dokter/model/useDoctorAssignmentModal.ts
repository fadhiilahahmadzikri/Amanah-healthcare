'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { DoctorSchedule } from '../api/types';
import {
  type DoctorRosterOverview,
  type DoctorScheduleHistoryResult,
  getDoctorRosterAssignments,
  getDoctorScheduleHistory,
  updateDoctorRosterAssignments
} from '../api/service';
import { syncAllDoctorSchedules } from '../api/mutations';

export type DoctorAssignmentTab = 'roster' | 'history';

export interface UseDoctorAssignmentModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export function useDoctorAssignmentModal({
  doctor,
  isOpen,
  onClose
}: UseDoctorAssignmentModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DoctorAssignmentTab>('roster');
  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState('');

  const doctorId = doctor?.id || '';

  const { data: rosterData, isLoading: isLoadingRoster } = useQuery<DoctorRosterOverview>({
    queryKey: ['doctor-roster-assignments', doctorId],
    queryFn: () => getDoctorRosterAssignments(doctorId),
    enabled: Boolean(isOpen && doctorId),
    staleTime: 0,
    gcTime: 0
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery<DoctorScheduleHistoryResult>({
    queryKey: ['doctor-schedule-history', doctorId],
    queryFn: () => getDoctorScheduleHistory(doctorId),
    enabled: Boolean(isOpen && doctorId && activeTab === 'history'),
    staleTime: 0
  });

  // Synchronize local checkboxes whenever fresh server data arrives
  useEffect(() => {
    if (rosterData?.days && isOpen) {
      const initial: Record<string, boolean> = {};
      for (const day of rosterData.days) {
        for (const s of day.sessions) {
          const key = `${day.dow}_${s.sessionId}`;
          initial[key] = s.isActive;
        }
      }
      setSelectedAssignments(initial);
      setReason('');
    }
  }, [rosterData, isOpen]);

  // Reset transient local state on modal close
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('roster');
      setSelectedAssignments({});
      setReason('');
    }
  }, [isOpen]);

  const toggleSession = useCallback((dow: number, sessionId: string) => {
    const key = `${dow}_${sessionId}`;
    setSelectedAssignments((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!rosterData?.days) return;
      const assignmentsList: {
        dow: number;
        sessionId: string;
        isActive: boolean;
        preferredRoomId?: string | null;
      }[] = [];

      for (const day of rosterData.days) {
        for (const s of day.sessions) {
          const key = `${day.dow}_${s.sessionId}`;
          const isAct = Boolean(selectedAssignments[key]);
          assignmentsList.push({
            dow: day.dow,
            sessionId: s.sessionId,
            isActive: isAct,
            preferredRoomId: s.preferredRoomId
          });
        }
      }

      return updateDoctorRosterAssignments(doctorId, {
        assignments: assignmentsList,
        reason: reason.trim() || undefined
      });
    },
    onSuccess: () => {
      toast.success('Roster jadwal dokter berhasil disimpan');
      syncAllDoctorSchedules(queryClient);
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message;
      toast.error(msg || 'Gagal menyimpan roster jadwal dokter');
    }
  });

  const handleSave = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return {
    activeTab,
    setActiveTab,
    selectedAssignments,
    reason,
    setReason,
    rosterData,
    isLoadingRoster,
    historyData,
    isLoadingHistory,
    toggleSession,
    isSubmitting: mutation.isPending,
    handleSave
  };
}

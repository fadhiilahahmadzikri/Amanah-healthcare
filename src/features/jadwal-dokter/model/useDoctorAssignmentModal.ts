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
  updateDoctorRosterAssignments,
  resetDoctorRosterAssignments
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
    }
  }, [rosterData, isOpen]);

  // Reset transient local state on modal close
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('roster');
      setSelectedAssignments({});
    }
  }, [isOpen]);

  const toggleSession = useCallback((dow: number, sessionId: string) => {
    const key = `${dow}_${sessionId}`;
    setSelectedAssignments((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const toggleDay = useCallback(
    (dow: number) => {
      if (!rosterData?.days) return;
      const targetDay = rosterData.days.find((d) => d.dow === dow);
      if (!targetDay) return;

      const isCurrentlyActiveOnDay = targetDay.sessions.some((s) =>
        Boolean(selectedAssignments[`${dow}_${s.sessionId}`])
      );

      setSelectedAssignments((prev) => {
        const updated = { ...prev };
        for (const s of targetDay.sessions) {
          const key = `${dow}_${s.sessionId}`;
          updated[key] = !isCurrentlyActiveOnDay;
        }
        return updated;
      });
    },
    [rosterData, selectedAssignments]
  );

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
        assignments: assignmentsList
      });
    },
    onSuccess: () => {
      toast.success('Jadwal kerja dokter berhasil disimpan');
      syncAllDoctorSchedules(queryClient);
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message;
      toast.error(msg || 'Gagal menyimpan jadwal kerja dokter');
    }
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return resetDoctorRosterAssignments(doctorId);
    },
    onSuccess: (data) => {
      toast.success('Roster dokter berhasil dikembalikan ke template mingguan');
      queryClient.setQueryData(['doctor-roster-assignments', doctorId], data);
      syncAllDoctorSchedules(queryClient);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message;
      toast.error(msg || 'Gagal mereset roster dokter');
    }
  });

  const handleSave = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  const handleResetToTemplate = useCallback(() => {
    resetMutation.mutate();
  }, [resetMutation]);

  const resetDayToTemplate = useCallback(
    (dow: number) => {
      if (!rosterData?.days) return;
      const targetDay = rosterData.days.find((d) => d.dow === dow);
      if (!targetDay) return;

      setSelectedAssignments((prev) => {
        const updated = { ...prev };
        for (const s of targetDay.sessions) {
          const key = `${dow}_${s.sessionId}`;
          updated[key] = Boolean(s.isTemplateActive);
        }
        return updated;
      });
      toast.info(`Jadwal hari ${targetDay.dayName} disesuaikan ke template mingguan`);
    },
    [rosterData]
  );

  return {
    activeTab,
    setActiveTab,
    selectedAssignments,
    rosterData,
    isLoadingRoster,
    historyData,
    isLoadingHistory,
    toggleSession,
    toggleDay,
    isSubmitting: mutation.isPending,
    isResetting: resetMutation.isPending,
    handleSave,
    handleResetToTemplate,
    resetDayToTemplate
  };
}

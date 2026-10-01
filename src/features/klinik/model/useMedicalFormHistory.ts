'use client';

import * as React from 'react';
import type { MedicalFormSection } from '../constants/medical-appointment-schemas';
import type { MedicalAppointmentValues } from '../utils/medical-appointment';
import {
  type CatalogActionState,
  defaultHistoryCounts,
  type HistoryPromptState,
  type HistoryRecordActions,
  historyGroups,
  type RepeatableHistoryCounts,
  type RepeatableHistoryGroup,
  type RepeatableHistoryKey
} from './medical-form-history-types';
import { getHistorySection, getHistorySectionMeta } from '../utils/medical-form-helpers';
import { CATALOG_ACTION_TYPES } from '../constants/kia-constants';

interface UseMedicalFormHistoryParams {
  sections: MedicalFormSection[];
  values: MedicalAppointmentValues;
  setFieldValue: (fieldId: string, value: string) => void;
  flow: string;
  isOpen: boolean;
}

export function useMedicalFormHistory({
  sections,
  values,
  setFieldValue,
  flow,
  isOpen
}: UseMedicalFormHistoryParams) {
  const [historyCounts, setHistoryCounts] =
    React.useState<RepeatableHistoryCounts>(defaultHistoryCounts);
  const [historyPrompt, setHistoryPrompt] = React.useState<HistoryPromptState | null>(null);
  const [catalogAction, setCatalogAction] = React.useState<CatalogActionState | null>(null);
  const [pendingNavigateSectionId, setPendingNavigateSectionId] = React.useState<string | null>(
    null
  );
  const [pendingNavigateCatalogKey, setPendingNavigateCatalogKey] =
    React.useState<RepeatableHistoryKey | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setHistoryCounts(defaultHistoryCounts);
      setHistoryPrompt(null);
      setCatalogAction(null);
      setPendingNavigateSectionId(null);
      setPendingNavigateCatalogKey(null);
    }
  }, [flow, isOpen]);

  const clearHistoryRecordRange = React.useCallback(
    (group: RepeatableHistoryGroup, startRecord: number, endRecord: number) => {
      for (let recordNumber = startRecord; recordNumber <= endRecord; recordNumber += 1) {
        getHistorySection(sections, group, recordNumber)?.fields.forEach((field) => {
          setFieldValue(field.id, '');
        });
      }
    },
    [sections, setFieldValue]
  );

  const shiftHistoryRecords = React.useCallback(
    (group: RepeatableHistoryGroup, removedRecord: number) => {
      for (let recordNumber = removedRecord; recordNumber < group.maxRecords; recordNumber += 1) {
        const targetSection = getHistorySection(sections, group, recordNumber);
        const sourceSection = getHistorySection(sections, group, recordNumber + 1);

        targetSection?.fields.forEach((targetField, index) => {
          const sourceField = sourceSection?.fields[index];
          setFieldValue(targetField.id, sourceField ? values[sourceField.id] || '' : '');
        });
      }

      clearHistoryRecordRange(group, group.maxRecords, group.maxRecords);
    },
    [sections, values, setFieldValue, clearHistoryRecordRange]
  );

  const handleCancelCatalogAction = React.useCallback(() => {
    if (!catalogAction) {
      return;
    }

    const { type, groupKey, recordNumber } = catalogAction;

    if (type === CATALOG_ACTION_TYPES.ADD) {
      const group = historyGroups[groupKey];
      clearHistoryRecordRange(group, recordNumber, recordNumber);
    }

    setCatalogAction(null);
    setPendingNavigateCatalogKey(groupKey);
  }, [catalogAction, clearHistoryRecordRange]);

  const handlePromptYes = React.useCallback(() => {
    if (!historyPrompt) {
      return;
    }

    const groupKey = historyPrompt.groupKey;
    const currentCount = historyCounts[groupKey];
    setHistoryPrompt(null);

    if (currentCount >= historyGroups[groupKey].maxRecords) {
      return;
    }

    const nextRecordNumber = currentCount + 1;
    setCatalogAction({
      type: CATALOG_ACTION_TYPES.ADD,
      groupKey,
      recordNumber: nextRecordNumber
    });

    const targetSectionId = historyGroups[groupKey].sectionIds[nextRecordNumber - 1];
    setPendingNavigateSectionId(targetSectionId);
  }, [historyPrompt, historyCounts]);

  const handleAddHistoryFromCatalog = React.useCallback(
    (groupKey: RepeatableHistoryKey) => {
      const currentCount = historyCounts[groupKey];
      if (currentCount >= historyGroups[groupKey].maxRecords) {
        return;
      }

      const targetRecordNumber = currentCount + 1;
      setCatalogAction({
        type: CATALOG_ACTION_TYPES.ADD,
        groupKey,
        recordNumber: targetRecordNumber
      });

      const targetSectionId = historyGroups[groupKey].sectionIds[targetRecordNumber - 1];
      setPendingNavigateSectionId(targetSectionId);
    },
    [historyCounts]
  );

  const handleEditHistoryFromCatalog = React.useCallback(
    (groupKey: RepeatableHistoryKey, recordNumber: number) => {
      const targetSectionId = historyGroups[groupKey].sectionIds[recordNumber - 1];

      setCatalogAction({
        type: CATALOG_ACTION_TYPES.EDIT,
        groupKey,
        recordNumber
      });
      setPendingNavigateSectionId(targetSectionId);
    },
    []
  );

  const handleRemoveHistoryRecord = React.useCallback(
    (key: RepeatableHistoryKey, recordNumber: number) => {
      const group = historyGroups[key];
      const currentCount = historyCounts[key];

      if (currentCount <= 1) {
        clearHistoryRecordRange(group, 1, group.maxRecords);
        setHistoryCounts((previous) => ({
          ...previous,
          [key]: 0
        }));
        setPendingNavigateCatalogKey(key);
        return;
      }

      shiftHistoryRecords(group, recordNumber);
      setHistoryCounts((previous) => ({
        ...previous,
        [key]: Math.max(0, previous[key] - 1)
      }));
      setPendingNavigateCatalogKey(key);
    },
    [clearHistoryRecordRange, shiftHistoryRecords, historyCounts]
  );

  const getHistoryRecordActions = React.useCallback(
    (sectionId?: string): HistoryRecordActions | null => {
      if (!sectionId) {
        return null;
      }

      const historySection = getHistorySectionMeta(sectionId);
      if (!historySection) {
        return null;
      }

      const totalRecords = historyCounts[historySection.group.key];

      return {
        currentRecord: historySection.recordNumber,
        totalRecords,
        maxRecords: historySection.group.maxRecords,
        onAdd: () => handleAddHistoryFromCatalog(historySection.group.key),
        onRemove: () =>
          handleRemoveHistoryRecord(historySection.group.key, historySection.recordNumber)
      };
    },
    [historyCounts, handleAddHistoryFromCatalog, handleRemoveHistoryRecord]
  );

  return {
    historyCounts,
    setHistoryCounts,
    historyPrompt,
    setHistoryPrompt,
    catalogAction,
    setCatalogAction,
    pendingNavigateSectionId,
    setPendingNavigateSectionId,
    pendingNavigateCatalogKey,
    setPendingNavigateCatalogKey,
    clearHistoryRecordRange,
    shiftHistoryRecords,
    handleCancelCatalogAction,
    handlePromptYes,
    handleAddHistoryFromCatalog,
    handleEditHistoryFromCatalog,
    handleRemoveHistoryRecord,
    getHistoryRecordActions
  };
}

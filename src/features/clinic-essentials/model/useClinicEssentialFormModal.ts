'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import type {
  ClinicalIntakeForm,
  CreateCategoryPayload,
  CreateIntakeFormPayload,
  CreateRoomPayload,
  CreateServicePayload,
  CreateUnitPayload,
  FacilityUnit,
  FacilityUnitType,
  ServiceCategory
} from '../types/clinic-essentials.types';

export type ClinicEssentialEntityType = 'unit' | 'room' | 'category' | 'service' | 'form';

export interface UseClinicEssentialFormModalProps {
  type: ClinicEssentialEntityType;
  unitTypes?: FacilityUnitType[];
  units: FacilityUnit[];
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  onSuccess: () => void;
  onClose: () => void;
}

export function useClinicEssentialFormModal({
  type,
  unitTypes = [],
  units,
  categories,
  forms: _forms,
  onSuccess,
  onClose
}: UseClinicEssentialFormModalProps) {
  const queryClient = useQueryClient();

  const [currentStage, setCurrentStage] = React.useState(1);
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');

  const maxStages = type === 'form' ? 2 : 3;

  // 1. Unit Form State
  const [unitName, setUnitName] = React.useState('');
  const [unitCode, setUnitCode] = React.useState('');
  const [unitTypeId, setUnitTypeId] = React.useState('');
  const [unitQueuePrefix, setUnitQueuePrefix] = React.useState('');
  const [unitIconName, setUnitIconName] = React.useState('building-2');
  const [unitLocation, setUnitLocation] = React.useState('');
  const [unitFloor, setUnitFloor] = React.useState('1');

  // Pre-select first unitType if available
  React.useEffect(() => {
    if (type === 'unit' && unitTypes.length > 0 && !unitTypeId) {
      setUnitTypeId(unitTypes[0].id);
    }
  }, [type, unitTypes, unitTypeId]);

  // 2. Room Form State
  const [roomUnitId, setRoomUnitId] = React.useState('');
  const [roomName, setRoomName] = React.useState('');
  const [roomCode, setRoomCode] = React.useState('');
  const [roomLocation, setRoomLocation] = React.useState('');
  const [roomFloor, setRoomFloor] = React.useState('1');

  // Pre-select first unit for room if available
  React.useEffect(() => {
    if (type === 'room' && units.length > 0 && !roomUnitId) {
      setRoomUnitId(units[0].id);
    }
  }, [type, units, roomUnitId]);

  // 3. Category Form State
  const [categoryUnitId, setCategoryUnitId] = React.useState<string>('none');
  const [categoryName, setCategoryName] = React.useState('');
  const [categoryCode, setCategoryCode] = React.useState('');
  const [categoryCodePrefix, setCategoryCodePrefix] = React.useState('');
  const [categoryIconName, setCategoryIconName] = React.useState('folder');
  const [categoryDescription, setCategoryDescription] = React.useState('');

  // 4. Service Form State
  const [serviceCategoryId, setServiceCategoryId] = React.useState('');
  const [serviceIntakeFormId, setServiceIntakeFormId] = React.useState('none');
  const [serviceName, setServiceName] = React.useState('');
  const [serviceCode, setServiceCode] = React.useState('');
  const [serviceCodePrefix, setServiceCodePrefix] = React.useState('');
  const [serviceIconName, setServiceIconName] = React.useState('stethoscope');
  const [serviceComplaintsRaw, setServiceComplaintsRaw] = React.useState('');
  const [serviceDescription, setServiceDescription] = React.useState('');

  // Pre-select first category for service if available
  React.useEffect(() => {
    if (type === 'service' && categories.length > 0 && !serviceCategoryId) {
      setServiceCategoryId(categories[0].id);
    }
  }, [type, categories, serviceCategoryId]);

  // 5. Intake Form State
  const [formName, setFormName] = React.useState('');
  const [formCode, setFormCode] = React.useState('');
  const [formIconName, setFormIconName] = React.useState('clipboard-list');
  const [formDescription, setFormDescription] = React.useState('');

  // Auto-slugging helpers
  const handleUnitNameChange = (val: string) => {
    setUnitName(val);
    if (!unitCode || unitCode === unitName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
      setUnitCode(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9_]+/g, '_')
      );
    }
  };

  const handleRoomNameChange = (val: string) => {
    setRoomName(val);
    if (!roomCode || roomCode === roomName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
      setRoomCode(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9_]+/g, '_')
      );
    }
  };

  const handleCategoryNameChange = (val: string) => {
    setCategoryName(val);
    if (!categoryCode || categoryCode === categoryName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]+/g, '_');
      setCategoryCode(slug);
      if (!categoryCodePrefix) {
        setCategoryCodePrefix(
          val
            .slice(0, 3)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
        );
      }
    }
  };

  const handleServiceNameChange = (val: string) => {
    setServiceName(val);
    if (!serviceCode || serviceCode === serviceName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]+/g, '_');
      setServiceCode(slug);
      if (!serviceCodePrefix) {
        setServiceCodePrefix(
          val
            .slice(0, 3)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
        );
      }
    }
  };

  const handleFormNameChange = (val: string) => {
    setFormName(val);
    if (!formCode || formCode === formName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
      setFormCode(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9_]+/g, '_')
      );
    }
  };

  // Stage validation
  const isCurrentStageValid = React.useMemo(() => {
    switch (type) {
      case 'unit':
        if (currentStage === 1) return Boolean(unitName.trim() && unitCode.trim());
        if (currentStage === 2) return Boolean(unitTypeId);
        return true;
      case 'room':
        if (currentStage === 1) return Boolean(roomUnitId);
        if (currentStage === 2) return Boolean(roomName.trim() && roomCode.trim());
        return true;
      case 'category':
        if (currentStage === 1) return Boolean(categoryName.trim() && categoryCode.trim());
        return true;
      case 'service':
        if (currentStage === 1) return Boolean(serviceCategoryId);
        if (currentStage === 2) return Boolean(serviceName.trim() && serviceCode.trim());
        return true;
      case 'form':
        if (currentStage === 1) return Boolean(formName.trim() && formCode.trim());
        return true;
      default:
        return false;
    }
  }, [
    type,
    currentStage,
    unitName,
    unitCode,
    unitTypeId,
    roomUnitId,
    roomName,
    roomCode,
    categoryName,
    categoryCode,
    serviceCategoryId,
    serviceName,
    serviceCode,
    formName,
    formCode
  ]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      switch (type) {
        case 'unit': {
          const payload: CreateUnitPayload = {
            name: unitName.trim(),
            code: unitCode.trim(),
            unitTypeId,
            queuePrefix: unitQueuePrefix.trim().toUpperCase() || undefined,
            iconName: unitIconName || 'building-2',
            location: unitLocation.trim() || undefined,
            floor: unitFloor.trim() || undefined,
            isActive: true
          };
          return await clinicEssentialsApi.createUnit(payload);
        }
        case 'room': {
          const payload: CreateRoomPayload = {
            unitId: roomUnitId,
            name: roomName.trim(),
            code: roomCode.trim(),
            location: roomLocation.trim() || undefined,
            floor: roomFloor.trim() || undefined,
            isActive: true
          };
          return await clinicEssentialsApi.createRoom(payload);
        }
        case 'category': {
          const payload: CreateCategoryPayload = {
            unitId: categoryUnitId === 'none' ? undefined : categoryUnitId,
            name: categoryName.trim(),
            code: categoryCode.trim(),
            codePrefix: categoryCodePrefix.trim().toUpperCase() || undefined,
            iconName: categoryIconName || 'folder',
            description: categoryDescription.trim() || undefined,
            isActive: true
          };
          return await clinicEssentialsApi.createCategory(payload);
        }
        case 'service': {
          const complaints = serviceComplaintsRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const payload: CreateServicePayload = {
            serviceCategoryId,
            intakeFormId: serviceIntakeFormId === 'none' ? null : serviceIntakeFormId,
            name: serviceName.trim(),
            code: serviceCode.trim(),
            codePrefix: serviceCodePrefix.trim().toUpperCase() || 'SVC',
            iconName: serviceIconName || 'stethoscope',
            description: serviceDescription.trim() || undefined,
            complaints: complaints.length > 0 ? complaints : undefined,
            isActive: true,
            isBookable: true
          };
          return await clinicEssentialsApi.createService(payload);
        }
        case 'form': {
          const payload: CreateIntakeFormPayload = {
            name: formName.trim(),
            code: formCode.trim(),
            iconName: formIconName || 'clipboard-list',
            description: formDescription.trim() || undefined,
            isActive: true
          };
          return await clinicEssentialsApi.createForm(payload);
        }
      }
    },
    onSuccess: (data) => {
      const entityLabel =
        type === 'unit'
          ? 'Unit'
          : type === 'room'
            ? 'Ruangan'
            : type === 'category'
              ? 'Kategori'
              : type === 'service'
                ? 'Layanan'
                : 'Formulir';
      const name = (data as { name?: string }).name || '';
      toast.success(`${entityLabel} '${name}' berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      resetForm();
      onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data fasilitas';
      toast.error(msg);
    }
  });

  const resetForm = () => {
    setCurrentStage(1);
    setDirection('forward');
    // Unit
    setUnitName('');
    setUnitCode('');
    setUnitTypeId(unitTypes[0]?.id || '');
    setUnitQueuePrefix('');
    setUnitIconName('building-2');
    setUnitLocation('');
    setUnitFloor('1');
    // Room
    setRoomUnitId(units[0]?.id || '');
    setRoomName('');
    setRoomCode('');
    setRoomLocation('');
    setRoomFloor('1');
    // Category
    setCategoryUnitId('none');
    setCategoryName('');
    setCategoryCode('');
    setCategoryCodePrefix('');
    setCategoryIconName('folder');
    setCategoryDescription('');
    // Service
    setServiceCategoryId(categories[0]?.id || '');
    setServiceIntakeFormId('none');
    setServiceName('');
    setServiceCode('');
    setServiceCodePrefix('');
    setServiceIconName('stethoscope');
    setServiceComplaintsRaw('');
    setServiceDescription('');
    // Form
    setFormName('');
    setFormCode('');
    setFormIconName('clipboard-list');
    setFormDescription('');
  };

  const handleNextStage = () => {
    if (isCurrentStageValid && currentStage < maxStages) {
      setDirection('forward');
      setCurrentStage((prev) => prev + 1);
    }
  };

  const handlePrevStage = () => {
    if (currentStage > 1) {
      setDirection('backward');
      setCurrentStage((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!isCurrentStageValid || createMutation.isPending) return;
    createMutation.mutate();
  };

  return {
    state: {
      type,
      currentStage,
      maxStages,
      direction,
      isCurrentStageValid,
      isSubmitting: createMutation.isPending,
      // Unit values
      unitName,
      unitCode,
      unitTypeId,
      unitQueuePrefix,
      unitIconName,
      unitLocation,
      unitFloor,
      // Room values
      roomUnitId,
      roomName,
      roomCode,
      roomLocation,
      roomFloor,
      // Category values
      categoryUnitId,
      categoryName,
      categoryCode,
      categoryCodePrefix,
      categoryIconName,
      categoryDescription,
      // Service values
      serviceCategoryId,
      serviceIntakeFormId,
      serviceName,
      serviceCode,
      serviceCodePrefix,
      serviceIconName,
      serviceComplaintsRaw,
      serviceDescription,
      // Form values
      formName,
      formCode,
      formIconName,
      formDescription
    },
    actions: {
      setCurrentStage,
      handleNextStage,
      handlePrevStage,
      handleSubmit,
      resetForm,
      // Unit setters
      setUnitName: handleUnitNameChange,
      setUnitCode,
      setUnitTypeId,
      setUnitQueuePrefix,
      setUnitIconName,
      setUnitLocation,
      setUnitFloor,
      // Room setters
      setRoomUnitId,
      setRoomName: handleRoomNameChange,
      setRoomCode,
      setRoomLocation,
      setRoomFloor,
      // Category setters
      setCategoryUnitId,
      setCategoryName: handleCategoryNameChange,
      setCategoryCode,
      setCategoryCodePrefix,
      setCategoryIconName,
      setCategoryDescription,
      // Service setters
      setServiceCategoryId,
      setServiceIntakeFormId,
      setServiceName: handleServiceNameChange,
      setServiceCode,
      setServiceCodePrefix,
      setServiceIconName,
      setServiceComplaintsRaw,
      setServiceDescription,
      // Form setters
      setFormName: handleFormNameChange,
      setFormCode,
      setFormIconName,
      setFormDescription
    }
  };
}

export type UseClinicEssentialFormModalReturn = ReturnType<typeof useClinicEssentialFormModal>;

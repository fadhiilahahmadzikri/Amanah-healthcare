'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import type {
  ClinicService,
  ClinicalIntakeForm,
  CreateCategoryPayload,
  CreateIntakeFormPayload,
  CreateRoomPayload,
  CreateServicePayload,
  CreateUnitPayload,
  CreateUnitTypePayload,
  FacilityRoom,
  FacilityUnit,
  FacilityUnitType,
  ServiceCategory,
  UpdateCategoryPayload,
  UpdateIntakeFormPayload,
  UpdateRoomPayload,
  UpdateServicePayload,
  UpdateUnitPayload,
  UpdateUnitTypePayload
} from '../types/clinic-essentials.types';

export type ClinicEssentialEntityType =
  | 'unit-type'
  | 'unit'
  | 'room'
  | 'category'
  | 'service'
  | 'form';

export type ClinicEssentialEditItem =
  | FacilityUnitType
  | FacilityUnit
  | FacilityRoom
  | ServiceCategory
  | ClinicService
  | ClinicalIntakeForm;

export interface UseClinicEssentialFormModalProps {
  type: ClinicEssentialEntityType;
  unitTypes?: FacilityUnitType[];
  units: FacilityUnit[];
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  editItem?: ClinicEssentialEditItem | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function useClinicEssentialFormModal({
  type,
  unitTypes = [],
  units,
  categories,
  forms: _forms,
  editItem,
  onSuccess,
  onClose
}: UseClinicEssentialFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(editItem);

  const [currentStage, setCurrentStage] = React.useState(1);
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');

  const maxStages = type === 'unit-type' || type === 'form' ? 2 : 3;

  // 0. Unit Type Form State
  const [unitTypeName, setUnitTypeName] = React.useState('');
  const [unitTypeIconName, setUnitTypeIconName] = React.useState('');
  const [unitTypeDescription, setUnitTypeDescription] = React.useState('');
  const [unitTypeIsActive, setUnitTypeIsActive] = React.useState(true);

  // 1. Unit Form State
  const [unitName, setUnitName] = React.useState('');
  const [unitCode, setUnitCode] = React.useState('');
  const [unitTypeId, setUnitTypeId] = React.useState('');
  const [unitQueuePrefix, setUnitQueuePrefix] = React.useState('');
  const [unitIconName, setUnitIconName] = React.useState('');
  const [unitLocation, setUnitLocation] = React.useState('');
  const [unitFloor, setUnitFloor] = React.useState('1');
  const [unitIsActive, setUnitIsActive] = React.useState(true);

  // 2. Room Form State
  const [roomUnitId, setRoomUnitId] = React.useState('');
  const [roomName, setRoomName] = React.useState('');
  const [roomCode, setRoomCode] = React.useState('');
  const [roomLocation, setRoomLocation] = React.useState('');
  const [roomFloor, setRoomFloor] = React.useState('1');
  const [roomIsActive, setRoomIsActive] = React.useState(true);

  // 3. Category Form State
  const [categoryUnitId, setCategoryUnitId] = React.useState<string>('none');
  const [categoryName, setCategoryName] = React.useState('');
  const [categoryCode, setCategoryCode] = React.useState('');
  const [categoryCodePrefix, setCategoryCodePrefix] = React.useState('');
  const [categoryIconName, setCategoryIconName] = React.useState('');
  const [categoryDescription, setCategoryDescription] = React.useState('');
  const [categoryIsActive, setCategoryIsActive] = React.useState(true);

  // 4. Service Form State
  const [serviceCategoryId, setServiceCategoryId] = React.useState('');
  const [serviceIntakeFormId, setServiceIntakeFormId] = React.useState('none');
  const [serviceName, setServiceName] = React.useState('');
  const [serviceCode, setServiceCode] = React.useState('');
  const [serviceCodePrefix, setServiceCodePrefix] = React.useState('');
  const [serviceIconName, setServiceIconName] = React.useState('');
  const [serviceComplaintsRaw, setServiceComplaintsRaw] = React.useState('');
  const [serviceDescription, setServiceDescription] = React.useState('');
  const [serviceIsActive, setServiceIsActive] = React.useState(true);

  // 5. Intake Form State
  const [formName, setFormName] = React.useState('');
  const [formCode, setFormCode] = React.useState('');
  const [formIconName, setFormIconName] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formIsActive, setFormIsActive] = React.useState(true);

  // Pre-populate or Reset form state based on editItem
  React.useEffect(() => {
    setCurrentStage(1);
    setDirection('forward');

    if (editItem) {
      switch (type) {
        case 'unit-type': {
          const ut = editItem as FacilityUnitType;
          setUnitTypeName(ut.name);
          setUnitTypeIconName(ut.iconName || '');
          setUnitTypeDescription(ut.description || '');
          setUnitTypeIsActive(ut.isActive !== false);
          break;
        }
        case 'unit': {
          const u = editItem as FacilityUnit;
          setUnitName(u.name);
          setUnitCode(u.code);
          setUnitTypeId(u.unitTypeId);
          setUnitQueuePrefix(u.queuePrefix || '');
          setUnitIconName(u.iconName || '');
          setUnitLocation(u.location || '');
          setUnitFloor(u.floor || '1');
          setUnitIsActive(u.isActive !== false);
          break;
        }
        case 'room': {
          const r = editItem as FacilityRoom;
          setRoomUnitId(r.unitId);
          setRoomName(r.name);
          setRoomCode(r.code);
          setRoomLocation(r.location || '');
          setRoomFloor(r.floor || '1');
          setRoomIsActive(r.isActive !== false);
          break;
        }
        case 'category': {
          const c = editItem as ServiceCategory;
          setCategoryName(c.name);
          setCategoryCode(c.code);
          setCategoryCodePrefix(c.codePrefix || '');
          setCategoryUnitId(c.unitId || 'none');
          setCategoryIconName(c.iconName || '');
          setCategoryDescription(c.description || '');
          setCategoryIsActive(c.isActive !== false);
          break;
        }
        case 'service': {
          const s = editItem as ClinicService;
          setServiceName(s.name);
          setServiceCode(s.code);
          setServiceCodePrefix(s.codePrefix || '');
          setServiceCategoryId(s.serviceCategoryId);
          setServiceIntakeFormId(s.intakeFormId || 'none');
          setServiceIconName(s.iconName || '');
          setServiceComplaintsRaw((s.complaints || []).join(', '));
          setServiceDescription(s.description || '');
          setServiceIsActive(s.isActive !== false);
          break;
        }
        case 'form': {
          const f = editItem as ClinicalIntakeForm;
          setFormName(f.name);
          setFormCode(f.code);
          setFormIconName(f.iconName || '');
          setFormDescription(f.description || '');
          setFormIsActive(f.isActive !== false);
          break;
        }
      }
    } else {
      // Default creation state (empty icon string activates dynamic attention emoji loop)
      setUnitTypeName('');
      setUnitTypeIconName('');
      setUnitTypeDescription('');
      setUnitTypeIsActive(true);

      setUnitName('');
      setUnitCode('');
      setUnitTypeId(unitTypes[0]?.id || '');
      setUnitQueuePrefix('');
      setUnitIconName('');
      setUnitLocation('');
      setUnitFloor('1');
      setUnitIsActive(true);

      setRoomUnitId(units[0]?.id || '');
      setRoomName('');
      setRoomCode('');
      setRoomLocation('');
      setRoomFloor('1');
      setRoomIsActive(true);

      setCategoryUnitId('none');
      setCategoryName('');
      setCategoryCode('');
      setCategoryCodePrefix('');
      setCategoryIconName('');
      setCategoryDescription('');
      setCategoryIsActive(true);

      setServiceCategoryId(categories[0]?.id || '');
      setServiceIntakeFormId('none');
      setServiceName('');
      setServiceCode('');
      setServiceCodePrefix('');
      setServiceIconName('');
      setServiceComplaintsRaw('');
      setServiceDescription('');
      setServiceIsActive(true);

      setFormName('');
      setFormCode('');
      setFormIconName('');
      setFormDescription('');
      setFormIsActive(true);
    }
  }, [type, editItem, unitTypes, units, categories]);

  // Stage validation
  const isCurrentStageValid = React.useMemo(() => {
    switch (type) {
      case 'unit-type':
        if (currentStage === 1) return Boolean(unitTypeName.trim());
        return true;
      case 'unit':
        if (currentStage === 1) return Boolean(unitName.trim());
        if (currentStage === 2) return Boolean(unitTypeId);
        return true;
      case 'room':
        if (currentStage === 1) return Boolean(roomUnitId);
        if (currentStage === 2) return Boolean(roomName.trim());
        return true;
      case 'category':
        if (currentStage === 1) return Boolean(categoryName.trim());
        return true;
      case 'service':
        if (currentStage === 1) return Boolean(serviceCategoryId);
        if (currentStage === 2) return Boolean(serviceName.trim());
        return true;
      case 'form':
        if (currentStage === 1) return Boolean(formName.trim());
        return true;
      default:
        return false;
    }
  }, [
    type,
    currentStage,
    unitTypeName,
    unitName,
    unitTypeId,
    roomUnitId,
    roomName,
    categoryName,
    serviceCategoryId,
    serviceName,
    formName
  ]);

  const isAllStagesValid = React.useMemo(() => {
    switch (type) {
      case 'unit-type':
        return Boolean(unitTypeName.trim());
      case 'unit':
        return Boolean(unitName.trim()) && Boolean(unitTypeId);
      case 'room':
        return Boolean(roomUnitId) && Boolean(roomName.trim());
      case 'category':
        return Boolean(categoryName.trim());
      case 'service':
        return Boolean(serviceCategoryId) && Boolean(serviceName.trim());
      case 'form':
        return Boolean(formName.trim());
      default:
        return false;
    }
  }, [
    type,
    unitTypeName,
    unitName,
    unitTypeId,
    roomUnitId,
    roomName,
    categoryName,
    serviceCategoryId,
    serviceName,
    formName
  ]);

  // Unified Save Mutation (Handles both Create and Update)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing && editItem) {
        // UPDATE PATH
        switch (type) {
          case 'unit-type': {
            const payload: UpdateUnitTypePayload = {
              name: unitTypeName.trim(),
              iconName: unitTypeIconName || 'layers',
              description: unitTypeDescription.trim() || undefined,
              isActive: unitTypeIsActive
            };
            return await clinicEssentialsApi.updateUnitType(editItem.id, payload);
          }
          case 'unit': {
            const payload: UpdateUnitPayload = {
              name: unitName.trim(),
              code: unitCode.trim() || undefined,
              unitTypeId,
              queuePrefix: unitQueuePrefix.trim().toUpperCase() || undefined,
              iconName: unitIconName || 'building-2',
              location: unitLocation.trim() || undefined,
              floor: unitFloor.trim() || undefined,
              isActive: unitIsActive
            };
            return await clinicEssentialsApi.updateUnit(editItem.id, payload);
          }
          case 'room': {
            const payload: UpdateRoomPayload = {
              unitId: roomUnitId,
              name: roomName.trim(),
              code: roomCode.trim() || undefined,
              location: roomLocation.trim() || undefined,
              floor: roomFloor.trim() || undefined,
              isActive: roomIsActive
            };
            return await clinicEssentialsApi.updateRoom(editItem.id, payload);
          }
          case 'category': {
            const payload: UpdateCategoryPayload = {
              unitId: categoryUnitId === 'none' ? undefined : categoryUnitId,
              name: categoryName.trim(),
              code: categoryCode.trim() || undefined,
              codePrefix: categoryCodePrefix.trim().toUpperCase() || undefined,
              iconName: categoryIconName || 'folder',
              description: categoryDescription.trim() || undefined,
              isActive: categoryIsActive
            };
            return await clinicEssentialsApi.updateCategory(editItem.id, payload);
          }
          case 'service': {
            const complaints = serviceComplaintsRaw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            const payload: UpdateServicePayload = {
              serviceCategoryId,
              intakeFormId: serviceIntakeFormId === 'none' ? null : serviceIntakeFormId,
              name: serviceName.trim(),
              code: serviceCode.trim() || undefined,
              codePrefix: serviceCodePrefix.trim().toUpperCase() || undefined,
              iconName: serviceIconName || 'stethoscope',
              description: serviceDescription.trim() || undefined,
              complaints: complaints.length > 0 ? complaints : undefined,
              isActive: serviceIsActive,
              isBookable: true
            };
            return await clinicEssentialsApi.updateService(editItem.id, payload);
          }
          case 'form': {
            const payload: UpdateIntakeFormPayload = {
              name: formName.trim(),
              code: formCode.trim() || undefined,
              iconName: formIconName || 'clipboard-list',
              description: formDescription.trim() || undefined,
              isActive: formIsActive
            };
            return await clinicEssentialsApi.updateForm(editItem.id, payload);
          }
        }
      } else {
        // CREATE PATH
        switch (type) {
          case 'unit-type': {
            const payload: CreateUnitTypePayload = {
              name: unitTypeName.trim(),
              iconName: unitTypeIconName || 'layers',
              description: unitTypeDescription.trim() || undefined,
              isActive: true
            };
            return await clinicEssentialsApi.createUnitType(payload);
          }
          case 'unit': {
            const payload: CreateUnitPayload = {
              name: unitName.trim(),
              code: unitCode.trim() || undefined,
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
              code: roomCode.trim() || undefined,
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
              code: categoryCode.trim() || undefined,
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
              code: serviceCode.trim() || undefined,
              codePrefix: serviceCodePrefix.trim().toUpperCase() || undefined,
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
              code: formCode.trim() || undefined,
              iconName: formIconName || 'clipboard-list',
              description: formDescription.trim() || undefined,
              isActive: true
            };
            return await clinicEssentialsApi.createForm(payload);
          }
        }
      }
    },
    onSuccess: (data) => {
      const entityLabel =
        type === 'unit-type'
          ? 'Klasifikasi'
          : type === 'unit'
            ? 'Poliklinik'
            : type === 'room'
              ? 'Ruangan'
              : type === 'category'
                ? 'Kelompok Layanan'
                : type === 'service'
                  ? 'Service'
                  : 'Formulir';
      const name = (data as { name?: string }).name || '';
      toast.success(
        `${entityLabel} '${name}' berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}.`
      );
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
    // Unit Type
    setUnitTypeName('');
    setUnitTypeIconName('');
    setUnitTypeDescription('');
    setUnitTypeIsActive(true);
    // Unit
    setUnitName('');
    setUnitCode('');
    setUnitTypeId(unitTypes[0]?.id || '');
    setUnitQueuePrefix('');
    setUnitIconName('');
    setUnitLocation('');
    setUnitFloor('1');
    setUnitIsActive(true);
    // Room
    setRoomUnitId(units[0]?.id || '');
    setRoomName('');
    setRoomCode('');
    setRoomLocation('');
    setRoomFloor('1');
    setRoomIsActive(true);
    // Category
    setCategoryUnitId('none');
    setCategoryName('');
    setCategoryCode('');
    setCategoryCodePrefix('');
    setCategoryIconName('');
    setCategoryDescription('');
    setCategoryIsActive(true);
    // Service
    setServiceCategoryId(categories[0]?.id || '');
    setServiceIntakeFormId('none');
    setServiceName('');
    setServiceCode('');
    setServiceCodePrefix('');
    setServiceIconName('');
    setServiceComplaintsRaw('');
    setServiceDescription('');
    setServiceIsActive(true);
    // Form
    setFormName('');
    setFormCode('');
    setFormIconName('');
    setFormDescription('');
    setFormIsActive(true);
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
    if (!isAllStagesValid || saveMutation.isPending) return;
    saveMutation.mutate();
  };

  return {
    state: {
      type,
      isEditing,
      currentStage,
      maxStages,
      direction,
      isCurrentStageValid,
      isAllStagesValid,
      isSubmitting: saveMutation.isPending,
      // Unit Type values
      unitTypeName,
      unitTypeIconName,
      unitTypeDescription,
      unitTypeIsActive,
      // Unit values
      unitName,
      unitCode,
      unitTypeId,
      unitQueuePrefix,
      unitIconName,
      unitLocation,
      unitFloor,
      unitIsActive,
      // Room values
      roomUnitId,
      roomName,
      roomCode,
      roomLocation,
      roomFloor,
      roomIsActive,
      // Category values
      categoryUnitId,
      categoryName,
      categoryCode,
      categoryCodePrefix,
      categoryIconName,
      categoryDescription,
      categoryIsActive,
      // Service values
      serviceCategoryId,
      serviceIntakeFormId,
      serviceName,
      serviceCode,
      serviceCodePrefix,
      serviceIconName,
      serviceComplaintsRaw,
      serviceDescription,
      serviceIsActive,
      // Form values
      formName,
      formCode,
      formIconName,
      formDescription,
      formIsActive
    },
    actions: {
      setCurrentStage,
      handleNextStage,
      handlePrevStage,
      handleSubmit,
      resetForm,
      // Unit Type setters
      setUnitTypeName,
      setUnitTypeIconName,
      setUnitTypeDescription,
      setUnitTypeIsActive,
      // Unit setters
      setUnitName,
      setUnitCode,
      setUnitTypeId,
      setUnitQueuePrefix,
      setUnitIconName,
      setUnitLocation,
      setUnitFloor,
      setUnitIsActive,
      // Room setters
      setRoomUnitId,
      setRoomName,
      setRoomCode,
      setRoomLocation,
      setRoomFloor,
      setRoomIsActive,
      // Category setters
      setCategoryUnitId,
      setCategoryName,
      setCategoryCode,
      setCategoryCodePrefix,
      setCategoryIconName,
      setCategoryDescription,
      setCategoryIsActive,
      // Service setters
      setServiceCategoryId,
      setServiceIntakeFormId,
      setServiceName,
      setServiceCode,
      setServiceCodePrefix,
      setServiceIconName,
      setServiceComplaintsRaw,
      setServiceDescription,
      setServiceIsActive,
      // Form setters
      setFormName,
      setFormCode,
      setFormIconName,
      setFormDescription,
      setFormIsActive
    }
  };
}

export type UseClinicEssentialFormModalReturn = ReturnType<typeof useClinicEssentialFormModal>;

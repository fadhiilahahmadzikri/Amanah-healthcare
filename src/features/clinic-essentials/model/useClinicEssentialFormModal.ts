'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import {
  createUnitTypeSchema,
  createUnitSchema,
  createRoomSchema,
  createCategorySchema,
  createServiceSchema,
  createFormSchema,
  createRelationshipSchema
} from '../schemas/clinic-essentials.schema';
import type { z } from 'zod';
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
  PatientRelationshipTypeItem,
  ServiceCategory,
  CreateRelationshipPayload,
  UpdateRelationshipPayload,
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
  | 'form'
  | 'relationship';

export type ClinicEssentialEditItem =
  | FacilityUnitType
  | FacilityUnit
  | FacilityRoom
  | ServiceCategory
  | ClinicService
  | ClinicalIntakeForm
  | PatientRelationshipTypeItem;

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

  const maxStages = type === 'unit-type' || type === 'form' || type === 'relationship' ? 2 : 3;

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
  const [categoryUnitIds, setCategoryUnitIds] = React.useState<string[]>([]);
  const [categoryName, setCategoryName] = React.useState('');
  const [categoryCode, setCategoryCode] = React.useState('');
  const [categoryCodePrefix, setCategoryCodePrefix] = React.useState('');
  const [categoryIconName, setCategoryIconName] = React.useState('');
  const [categoryDescription, setCategoryDescription] = React.useState('');
  const [categoryIsActive, setCategoryIsActive] = React.useState(true);

  // 4. Service Form State
  const [serviceCategoryId, setServiceCategoryId] = React.useState('');
  const [serviceCategoryIds, setServiceCategoryIds] = React.useState<string[]>([]);
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

  // 6. Relationship Form State
  const [relationshipName, setRelationshipName] = React.useState('');
  const [relationshipIconName, setRelationshipIconName] = React.useState('');
  const [relationshipDescription, setRelationshipDescription] = React.useState('');
  const [relationshipDisplayOrder, setRelationshipDisplayOrder] = React.useState(0);
  const [relationshipIsActive, setRelationshipIsActive] = React.useState(true);
  const [relationshipIsSystem, setRelationshipIsSystem] = React.useState(false);

  // Field validation errors state (On-Demand Zod Validation)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const validateField = React.useCallback(
    (fieldName: string, value: unknown) => {
      let schema: z.ZodTypeAny | undefined;
      switch (type) {
        case 'unit-type':
          if (fieldName === 'name') schema = createUnitTypeSchema.shape.name;
          break;
        case 'unit':
          if (fieldName === 'name') schema = createUnitSchema.shape.name;
          if (fieldName === 'queuePrefix') schema = createUnitSchema.shape.queuePrefix;
          break;
        case 'room':
          if (fieldName === 'name') schema = createRoomSchema.shape.name;
          break;
        case 'category':
          if (fieldName === 'name') schema = createCategorySchema.shape.name;
          if (fieldName === 'codePrefix') schema = createCategorySchema.shape.codePrefix;
          break;
        case 'service':
          if (fieldName === 'name') schema = createServiceSchema.shape.name;
          if (fieldName === 'codePrefix') schema = createServiceSchema.shape.codePrefix;
          break;
        case 'form':
          if (fieldName === 'name') schema = createFormSchema.shape.name;
          break;
        case 'relationship':
          if (fieldName === 'name') schema = createRelationshipSchema.shape.name;
          break;
      }

      if (schema) {
        const res = schema.safeParse(value);
        if (!res.success) {
          const msg = res.error.issues[0]?.message || 'Input tidak valid';
          setFieldErrors((prev) => ({ ...prev, [fieldName]: msg }));
          return false;
        } else {
          setFieldErrors((prev) => {
            if (!prev[fieldName]) return prev;
            const next = { ...prev };
            delete next[fieldName];
            return next;
          });
          return true;
        }
      }
      return true;
    },
    [type]
  );

  const validateCurrentStage = React.useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    switch (type) {
      case 'unit-type': {
        if (currentStage === 1) {
          const res = createUnitTypeSchema.shape.name.safeParse(unitTypeName);
          if (!res.success) newErrors.name = res.error.issues[0]?.message || 'Nama tidak valid';
        }
        break;
      }
      case 'unit': {
        if (currentStage === 1) {
          const res = createUnitSchema.shape.name.safeParse(unitName);
          if (!res.success) newErrors.name = res.error.issues[0]?.message || 'Nama tidak valid';
        } else if (currentStage === 2) {
          if (!unitTypeId) newErrors.unitTypeId = 'Silakan pilih klasifikasi unit';
        }
        break;
      }
      case 'room': {
        if (currentStage === 1) {
          if (!roomUnitId) newErrors.unitId = 'Silakan pilih poliklinik induk';
        } else if (currentStage === 2) {
          const res = createRoomSchema.shape.name.safeParse(roomName);
          if (!res.success) newErrors.name = res.error.issues[0]?.message || 'Nama tidak valid';
        }
        break;
      }
      case 'category': {
        if (currentStage === 1) {
          const res = createCategorySchema.shape.name.safeParse(categoryName);
          if (!res.success) newErrors.name = res.error.issues[0]?.message || 'Nama tidak valid';
        }
        break;
      }
      case 'service': {
        if (currentStage === 1) {
          if (!serviceCategoryId && serviceCategoryIds.length === 0) {
            newErrors.serviceCategoryId = 'Silakan pilih kelompok layanan';
          }
        } else if (currentStage === 2) {
          const res = createServiceSchema.shape.name.safeParse(serviceName);
          if (!res.success) newErrors.name = res.error.issues[0]?.message || 'Nama tidak valid';
        }
        break;
      }
      case 'form': {
        if (currentStage === 1) {
          const res = createFormSchema.shape.name.safeParse(formName);
          if (!res.success) newErrors.name = res.error.issues[0]?.message || 'Nama tidak valid';
        }
        break;
      }
      case 'relationship': {
        if (currentStage === 1) {
          const res = createRelationshipSchema.shape.name.safeParse(relationshipName);
          if (!res.success) newErrors.name = res.error.issues[0]?.message || 'Nama tidak valid';
        }
        break;
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    serviceCategoryIds,
    serviceName,
    formName,
    relationshipName
  ]);

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
          const initialUnitIds =
            c.unitIds && c.unitIds.length > 0 ? c.unitIds : c.unitId ? [c.unitId] : [];
          setCategoryUnitIds(initialUnitIds);
          setCategoryUnitId(c.unitId || initialUnitIds[0] || 'none');
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
          const initialCategoryIds =
            s.categoryIds && s.categoryIds.length > 0
              ? s.categoryIds
              : s.serviceCategoryId
                ? [s.serviceCategoryId]
                : [];
          setServiceCategoryIds(initialCategoryIds);
          setServiceCategoryId(s.serviceCategoryId || initialCategoryIds[0] || '');
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
        case 'relationship': {
          const rel = editItem as PatientRelationshipTypeItem;
          setRelationshipName(rel.name);
          setRelationshipIconName(rel.iconName || '');
          setRelationshipDescription(rel.description || '');
          setRelationshipDisplayOrder(rel.displayOrder ?? 0);
          setRelationshipIsActive(rel.isActive !== false);
          setRelationshipIsSystem(rel.isSystem === true);
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
      setCategoryUnitIds([]);
      setCategoryName('');
      setCategoryCode('');
      setCategoryCodePrefix('');
      setCategoryIconName('');
      setCategoryDescription('');
      setCategoryIsActive(true);

      const defaultCatId = categories[0]?.id || '';
      setServiceCategoryId(defaultCatId);
      setServiceCategoryIds(defaultCatId ? [defaultCatId] : []);
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

      setRelationshipName('');
      setRelationshipIconName('');
      setRelationshipDescription('');
      setRelationshipDisplayOrder(0);
      setRelationshipIsActive(true);
      setRelationshipIsSystem(false);
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
        if (currentStage === 1) return Boolean(serviceCategoryId || serviceCategoryIds.length > 0);
        if (currentStage === 2) return Boolean(serviceName.trim());
        return true;
      case 'form':
        if (currentStage === 1) return Boolean(formName.trim());
        return true;
      case 'relationship':
        if (currentStage === 1) return Boolean(relationshipName.trim());
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
    serviceCategoryIds,
    serviceName,
    formName,
    relationshipName
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
        return (
          Boolean(serviceCategoryId || serviceCategoryIds.length > 0) && Boolean(serviceName.trim())
        );
      case 'form':
        return Boolean(formName.trim());
      case 'relationship':
        return Boolean(relationshipName.trim());
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
    serviceCategoryIds,
    serviceName,
    formName,
    relationshipName
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
            const finalUnitIds = categoryUnitIds.filter(Boolean);
            const primaryUnitId =
              categoryUnitId !== 'none' ? categoryUnitId : finalUnitIds[0] || undefined;
            const payload: UpdateCategoryPayload = {
              unitId: primaryUnitId,
              unitIds: finalUnitIds,
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
            const finalCatIds =
              serviceCategoryIds.length > 0
                ? serviceCategoryIds
                : serviceCategoryId
                  ? [serviceCategoryId]
                  : [];
            const primaryCatId = serviceCategoryId || finalCatIds[0] || '';
            const payload: UpdateServicePayload = {
              serviceCategoryId: primaryCatId,
              categoryIds: finalCatIds,
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
          case 'relationship': {
            const payload: UpdateRelationshipPayload = {
              name: relationshipName.trim(),
              iconName: relationshipIconName || 'user',
              description: relationshipDescription.trim() || undefined,
              displayOrder: relationshipDisplayOrder,
              isActive: relationshipIsActive,
              isSystem: relationshipIsSystem
            };
            return await clinicEssentialsApi.updateRelationship(editItem.id, payload);
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
            const finalUnitIds = categoryUnitIds.filter(Boolean);
            const primaryUnitId =
              categoryUnitId !== 'none' ? categoryUnitId : finalUnitIds[0] || undefined;
            const payload: CreateCategoryPayload = {
              unitId: primaryUnitId,
              unitIds: finalUnitIds,
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
            const finalCatIds =
              serviceCategoryIds.length > 0
                ? serviceCategoryIds
                : serviceCategoryId
                  ? [serviceCategoryId]
                  : [];
            const primaryCatId = serviceCategoryId || finalCatIds[0] || '';
            const payload: CreateServicePayload = {
              serviceCategoryId: primaryCatId,
              categoryIds: finalCatIds,
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
          case 'relationship': {
            const payload: CreateRelationshipPayload = {
              name: relationshipName.trim(),
              iconName: relationshipIconName || 'user',
              description: relationshipDescription.trim() || undefined,
              displayOrder: relationshipDisplayOrder,
              isActive: true,
              isSystem: relationshipIsSystem
            };
            return await clinicEssentialsApi.createRelationship(payload);
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
                  : type === 'form'
                    ? 'Formulir'
                    : 'Relasi Pasien';
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
    setCategoryUnitIds([]);
    setCategoryName('');
    setCategoryCode('');
    setCategoryCodePrefix('');
    setCategoryIconName('');
    setCategoryDescription('');
    setCategoryIsActive(true);
    // Service
    const defaultCatId = categories[0]?.id || '';
    setServiceCategoryId(defaultCatId);
    setServiceCategoryIds(defaultCatId ? [defaultCatId] : []);
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
    // Relationship
    setRelationshipName('');
    setRelationshipIconName('');
    setRelationshipDescription('');
    setRelationshipDisplayOrder(0);
    setRelationshipIsActive(true);
    setRelationshipIsSystem(false);
    setFieldErrors({});
  };

  const handleNextStage = () => {
    const isValid = validateCurrentStage();
    if (isValid && isCurrentStageValid && currentStage < maxStages) {
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
    const isValid = validateCurrentStage();
    if (!isValid || !isAllStagesValid || saveMutation.isPending) return;
    saveMutation.mutate();
  };

  return {
    state: {
      type,
      isEditing,
      currentStage,
      maxStages,
      direction,
      isCurrentStageValid: isCurrentStageValid && Object.keys(fieldErrors).length === 0,
      isAllStagesValid: isAllStagesValid && Object.keys(fieldErrors).length === 0,
      errors: fieldErrors,
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
      categoryUnitIds,
      categoryName,
      categoryCode,
      categoryCodePrefix,
      categoryIconName,
      categoryDescription,
      categoryIsActive,
      // Service values
      serviceCategoryId,
      serviceCategoryIds,
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
      formIsActive,
      // Relationship values
      relationshipName,
      relationshipIconName,
      relationshipDescription,
      relationshipDisplayOrder,
      relationshipIsActive,
      relationshipIsSystem
    },
    actions: {
      setCurrentStage,
      handleNextStage,
      handlePrevStage,
      handleSubmit,
      resetForm,
      validateField,
      // Unit Type setters
      setUnitTypeName: (val: string) => {
        setUnitTypeName(val);
        validateField('name', val);
      },
      setUnitTypeIconName,
      setUnitTypeDescription,
      setUnitTypeIsActive,
      // Unit setters
      setUnitName: (val: string) => {
        setUnitName(val);
        validateField('name', val);
      },
      setUnitCode,
      setUnitTypeId: (val: string) => {
        setUnitTypeId(val);
        setFieldErrors((prev) => {
          if (!prev.unitTypeId) return prev;
          const next = { ...prev };
          delete next.unitTypeId;
          return next;
        });
      },
      setUnitQueuePrefix: (val: string) => {
        setUnitQueuePrefix(val);
        validateField('queuePrefix', val);
      },
      setUnitIconName,
      setUnitLocation,
      setUnitFloor,
      setUnitIsActive,
      // Room setters
      setRoomUnitId: (val: string) => {
        setRoomUnitId(val);
        setFieldErrors((prev) => {
          if (!prev.unitId) return prev;
          const next = { ...prev };
          delete next.unitId;
          return next;
        });
      },
      setRoomName: (val: string) => {
        setRoomName(val);
        validateField('name', val);
      },
      setRoomCode,
      setRoomLocation,
      setRoomFloor,
      setRoomIsActive,
      // Category setters
      setCategoryUnitId,
      setCategoryUnitIds,
      setCategoryName: (val: string) => {
        setCategoryName(val);
        validateField('name', val);
      },
      setCategoryCode,
      setCategoryCodePrefix: (val: string) => {
        setCategoryCodePrefix(val);
        validateField('codePrefix', val);
      },
      setCategoryIconName,
      setCategoryDescription,
      setCategoryIsActive,
      // Service setters
      setServiceCategoryId: (val: string) => {
        setServiceCategoryId(val);
        setFieldErrors((prev) => {
          if (!prev.serviceCategoryId) return prev;
          const next = { ...prev };
          delete next.serviceCategoryId;
          return next;
        });
      },
      setServiceCategoryIds,
      setServiceIntakeFormId,
      setServiceName: (val: string) => {
        setServiceName(val);
        validateField('name', val);
      },
      setServiceCode,
      setServiceCodePrefix: (val: string) => {
        setServiceCodePrefix(val);
        validateField('codePrefix', val);
      },
      setServiceIconName,
      setServiceComplaintsRaw,
      setServiceDescription,
      setServiceIsActive,
      // Form setters
      setFormName: (val: string) => {
        setFormName(val);
        validateField('name', val);
      },
      setFormCode,
      setFormIconName,
      setFormDescription,
      setFormIsActive,
      // Relationship setters
      setRelationshipName: (val: string) => {
        setRelationshipName(val);
        validateField('name', val);
      },
      setRelationshipIconName,
      setRelationshipDescription,
      setRelationshipDisplayOrder,
      setRelationshipIsActive,
      setRelationshipIsSystem
    }
  };
}

export type UseClinicEssentialFormModalReturn = ReturnType<typeof useClinicEssentialFormModal>;

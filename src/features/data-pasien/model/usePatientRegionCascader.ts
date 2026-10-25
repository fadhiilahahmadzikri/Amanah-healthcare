'use client';

import * as React from 'react';
import { patientReferenceService } from '../api/patient-reference-service';
import type { PatientRegionValues } from '../components/registration/molecules/patient-region-dropdown';

export interface RegionItem {
  id: string;
  name: string;
}

export interface UsePatientRegionCascaderProps {
  values: PatientRegionValues;
  onChange: (updates: Partial<PatientRegionValues>) => void;
}

export function usePatientRegionCascader({ values, onChange }: UsePatientRegionCascaderProps) {
  // 1. Synchronously initialize provinces from memory cache if already fetched
  const [provinces, setProvinces] = React.useState<RegionItem[]>(() => {
    const cached = patientReferenceService.getCachedProvinces();
    return cached.map((p) => ({ id: p.id, name: p.name }));
  });

  const [regencies, setRegencies] = React.useState<RegionItem[]>(() => {
    if (!values.provinceCode) return [];
    const cached = patientReferenceService.getCachedRegencies(values.provinceCode);
    return cached ? cached.map((r) => ({ id: r.id, name: r.name })) : [];
  });

  const [districts, setDistricts] = React.useState<RegionItem[]>(() => {
    if (!values.regencyCode) return [];
    const cached = patientReferenceService.getCachedDistricts(values.regencyCode);
    return cached ? cached.map((d) => ({ id: d.id, name: d.name })) : [];
  });

  const [villages, setVillages] = React.useState<RegionItem[]>(() => {
    if (!values.districtCode) return [];
    const cached = patientReferenceService.getCachedVillages(values.districtCode);
    return cached ? cached.map((v) => ({ id: v.id, name: v.name })) : [];
  });

  // Loading state per tier
  const [loading, setLoading] = React.useState({
    provinces: provinces.length === 0,
    regencies: false,
    districts: false,
    villages: false
  });

  // Track mounted state for async cancellations
  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Ensure provinces are loaded if not in initial cache
  React.useEffect(() => {
    if (provinces.length > 0) return;

    setLoading((prev) => ({ ...prev, provinces: true }));
    patientReferenceService
      .getProvinces()
      .then((items) => {
        if (isMountedRef.current) {
          setProvinces(items.map((p) => ({ id: p.id, name: p.name })));
          setLoading((prev) => ({ ...prev, provinces: false }));
        }
      })
      .catch((err) => {
        console.error('Failed to load provinces:', err);
        if (isMountedRef.current) {
          setLoading((prev) => ({ ...prev, provinces: false }));
        }
      });
  }, [provinces.length]);

  // 2. Load regencies when provinceCode changes (external or initial)
  React.useEffect(() => {
    if (!values.provinceCode) {
      setRegencies([]);
      return;
    }

    const cached = patientReferenceService.getCachedRegencies(values.provinceCode);
    if (cached && cached.length > 0) {
      setRegencies(cached.map((r) => ({ id: r.id, name: r.name })));
      setLoading((prev) => ({ ...prev, regencies: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, regencies: true }));
    patientReferenceService
      .getRegencies(values.provinceCode)
      .then((items) => {
        if (isMountedRef.current) {
          setRegencies(items.map((r) => ({ id: r.id, name: r.name })));
          setLoading((prev) => ({ ...prev, regencies: false }));
        }
      })
      .catch((err) => {
        console.error('Failed to load regencies:', err);
        if (isMountedRef.current) {
          setLoading((prev) => ({ ...prev, regencies: false }));
        }
      });
  }, [values.provinceCode]);

  // 3. Load districts when regencyCode changes (external or initial)
  React.useEffect(() => {
    if (!values.regencyCode) {
      setDistricts([]);
      return;
    }

    const cached = patientReferenceService.getCachedDistricts(values.regencyCode);
    if (cached && cached.length > 0) {
      setDistricts(cached.map((d) => ({ id: d.id, name: d.name })));
      setLoading((prev) => ({ ...prev, districts: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, districts: true }));
    patientReferenceService
      .getDistricts(values.regencyCode)
      .then((items) => {
        if (isMountedRef.current) {
          setDistricts(items.map((d) => ({ id: d.id, name: d.name })));
          setLoading((prev) => ({ ...prev, districts: false }));
        }
      })
      .catch((err) => {
        console.error('Failed to load districts:', err);
        if (isMountedRef.current) {
          setLoading((prev) => ({ ...prev, districts: false }));
        }
      });
  }, [values.regencyCode]);

  // 4. Load villages when districtCode changes (external or initial)
  React.useEffect(() => {
    if (!values.districtCode) {
      setVillages([]);
      return;
    }

    const cached = patientReferenceService.getCachedVillages(values.districtCode);
    if (cached && cached.length > 0) {
      setVillages(cached.map((v) => ({ id: v.id, name: v.name })));
      setLoading((prev) => ({ ...prev, villages: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, villages: true }));
    patientReferenceService
      .getVillages(values.districtCode)
      .then((items) => {
        if (isMountedRef.current) {
          setVillages(items.map((v) => ({ id: v.id, name: v.name })));
          setLoading((prev) => ({ ...prev, villages: false }));
        }
      })
      .catch((err) => {
        console.error('Failed to load villages:', err);
        if (isMountedRef.current) {
          setLoading((prev) => ({ ...prev, villages: false }));
        }
      });
  }, [values.districtCode]);

  // Direct selection handlers with immediate preloading
  const selectProvince = React.useCallback(
    (item: RegionItem) => {
      onChange({
        provinceName: item.name,
        provinceCode: item.id,
        regencyName: '',
        regencyCode: '',
        districtName: '',
        districtCode: '',
        villageName: '',
        villageCode: ''
      });

      // Eagerly prefetch or set cached regencies
      const cached = patientReferenceService.getCachedRegencies(item.id);
      if (cached && cached.length > 0) {
        setRegencies(cached.map((r) => ({ id: r.id, name: r.name })));
        setLoading((prev) => ({ ...prev, regencies: false }));
      } else {
        setRegencies([]);
        setLoading((prev) => ({ ...prev, regencies: true }));
        patientReferenceService.getRegencies(item.id).then((res) => {
          if (isMountedRef.current) {
            setRegencies(res.map((r) => ({ id: r.id, name: r.name })));
            setLoading((prev) => ({ ...prev, regencies: false }));
          }
        });
      }
    },
    [onChange]
  );

  const selectRegency = React.useCallback(
    (item: RegionItem) => {
      onChange({
        regencyName: item.name,
        regencyCode: item.id,
        districtName: '',
        districtCode: '',
        villageName: '',
        villageCode: ''
      });

      // Eagerly prefetch or set cached districts
      const cached = patientReferenceService.getCachedDistricts(item.id);
      if (cached && cached.length > 0) {
        setDistricts(cached.map((d) => ({ id: d.id, name: d.name })));
        setLoading((prev) => ({ ...prev, districts: false }));
      } else {
        setDistricts([]);
        setLoading((prev) => ({ ...prev, districts: true }));
        patientReferenceService.getDistricts(item.id).then((res) => {
          if (isMountedRef.current) {
            setDistricts(res.map((d) => ({ id: d.id, name: d.name })));
            setLoading((prev) => ({ ...prev, districts: false }));
          }
        });
      }
    },
    [onChange]
  );

  const selectDistrict = React.useCallback(
    (item: RegionItem) => {
      onChange({
        districtName: item.name,
        districtCode: item.id,
        villageName: '',
        villageCode: ''
      });

      // Eagerly prefetch or set cached villages
      const cached = patientReferenceService.getCachedVillages(item.id);
      if (cached && cached.length > 0) {
        setVillages(cached.map((v) => ({ id: v.id, name: v.name })));
        setLoading((prev) => ({ ...prev, villages: false }));
      } else {
        setVillages([]);
        setLoading((prev) => ({ ...prev, villages: true }));
        patientReferenceService.getVillages(item.id).then((res) => {
          if (isMountedRef.current) {
            setVillages(res.map((v) => ({ id: v.id, name: v.name })));
            setLoading((prev) => ({ ...prev, villages: false }));
          }
        });
      }
    },
    [onChange]
  );

  const selectVillage = React.useCallback(
    (item: RegionItem) => {
      onChange({
        villageName: item.name,
        villageCode: item.id
      });
    },
    [onChange]
  );

  return {
    provinces,
    regencies,
    districts,
    villages,
    loading,
    selectProvince,
    selectRegency,
    selectDistrict,
    selectVillage
  };
}

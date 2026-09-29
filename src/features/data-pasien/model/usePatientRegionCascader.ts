'use client';

import * as React from 'react';
import {
  patientReferenceService,
  type RegionReferenceItem
} from '../api/patient-reference-service';
import type { PatientRegionValues } from '../components/registration/molecules/patient-region-dropdown';

export interface RegionItem {
  id: string;
  name: string;
}

export interface UsePatientRegionCascaderProps {
  values: PatientRegionValues;
  onChange: (updates: Partial<PatientRegionValues>) => void;
}

export function usePatientRegionCascader({
  values,
  onChange
}: UsePatientRegionCascaderProps) {
  // 1. Synchronously initialize provinces from memory cache if already fetched
  const [provinces, setProvinces] = React.useState<RegionItem[]>(() => {
    const cached = patientReferenceService.getCachedProvinces();
    return cached.map((p) => ({ id: p.id, name: p.name }));
  });

  const [regencies, setRegencies] = React.useState<RegionItem[]>(() => {
    if (!values.provinsiId) return [];
    const cached = patientReferenceService.getCachedRegencies(values.provinsiId);
    return cached ? cached.map((r) => ({ id: r.id, name: r.name })) : [];
  });

  const [districts, setDistricts] = React.useState<RegionItem[]>(() => {
    if (!values.kabupatenId) return [];
    const cached = patientReferenceService.getCachedDistricts(values.kabupatenId);
    return cached ? cached.map((d) => ({ id: d.id, name: d.name })) : [];
  });

  const [villages, setVillages] = React.useState<RegionItem[]>(() => {
    if (!values.kecamatanId) return [];
    const cached = patientReferenceService.getCachedVillages(values.kecamatanId);
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

  // 2. Load regencies when provinsiId changes (external or initial)
  React.useEffect(() => {
    if (!values.provinsiId) {
      setRegencies([]);
      return;
    }

    const cached = patientReferenceService.getCachedRegencies(values.provinsiId);
    if (cached && cached.length > 0) {
      setRegencies(cached.map((r) => ({ id: r.id, name: r.name })));
      setLoading((prev) => ({ ...prev, regencies: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, regencies: true }));
    patientReferenceService
      .getRegencies(values.provinsiId)
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
  }, [values.provinsiId]);

  // 3. Load districts when kabupatenId changes (external or initial)
  React.useEffect(() => {
    if (!values.kabupatenId) {
      setDistricts([]);
      return;
    }

    const cached = patientReferenceService.getCachedDistricts(values.kabupatenId);
    if (cached && cached.length > 0) {
      setDistricts(cached.map((d) => ({ id: d.id, name: d.name })));
      setLoading((prev) => ({ ...prev, districts: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, districts: true }));
    patientReferenceService
      .getDistricts(values.kabupatenId)
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
  }, [values.kabupatenId]);

  // 4. Load villages when kecamatanId changes (external or initial)
  React.useEffect(() => {
    if (!values.kecamatanId) {
      setVillages([]);
      return;
    }

    const cached = patientReferenceService.getCachedVillages(values.kecamatanId);
    if (cached && cached.length > 0) {
      setVillages(cached.map((v) => ({ id: v.id, name: v.name })));
      setLoading((prev) => ({ ...prev, villages: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, villages: true }));
    patientReferenceService
      .getVillages(values.kecamatanId)
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
  }, [values.kecamatanId]);

  // Direct selection handlers with immediate preloading
  const selectProvince = React.useCallback(
    (item: RegionItem) => {
      onChange({
        provinsi: item.name,
        provinsiId: item.id,
        kabupaten: '',
        kabupatenId: '',
        kecamatan: '',
        kecamatanId: '',
        kelurahan: '',
        kelurahanId: ''
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
        kabupaten: item.name,
        kabupatenId: item.id,
        kecamatan: '',
        kecamatanId: '',
        kelurahan: '',
        kelurahanId: ''
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
        kecamatan: item.name,
        kecamatanId: item.id,
        kelurahan: '',
        kelurahanId: ''
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
        kelurahan: item.name,
        kelurahanId: item.id
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

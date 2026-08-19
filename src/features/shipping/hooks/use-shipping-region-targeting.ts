'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCityOptions, getCountryOptions, getStateOptions } from '../api/service';
import type { Coordinate, CountryOption, LocationAddressDetails, StateOption } from '../api/types';
import {
  DEFAULT_COUNTRY_CODE,
  fallbackCountries,
  getFallbackCities,
  getFallbackStates,
  getFlagUrl
} from '../utils/location-map';

type SyncLocationInput = {
  addressDetails?: LocationAddressDetails;
  coordinate: Coordinate;
};

export function useShippingRegionTargeting() {
  const [countries, setCountries] = useState<CountryOption[]>(fallbackCountries);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countryName, setCountryNameValue] = useState('');
  const [stateName, setStateNameValue] = useState('');
  const [cityName, setCityNameValue] = useState('');
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);

  const activeCountry = useMemo(
    () => countries.find((country) => country.name === countryName),
    [countries, countryName]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCountries() {
      const result = await getCountryOptions();

      if (!isMounted || result.length === 0) {
        return;
      }

      setCountries((current) => mergeCountries(current, result));
    }

    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!countryName) {
      setStates([]);
      setCities([]);
      setStateNameValue('');
      setCityNameValue('');
      setIsLoadingRegions(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingRegions(true);

    async function loadStates() {
      const result = await getStateOptions(countryName);
      const fallback = getFallbackStates(countryName);
      const nextStates = result.length > 0 ? result : fallback;

      if (!isMounted) {
        return;
      }

      setStates((current) => mergeStates(current, nextStates, ''));
      setIsLoadingRegions(false);
    }

    loadStates();

    return () => {
      isMounted = false;
    };
  }, [countryName]);

  useEffect(() => {
    let isMounted = true;

    if (!countryName || !stateName) {
      setCities([]);
      setCityNameValue('');
      setIsLoadingRegions(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingRegions(true);

    async function loadCities() {
      const result = await getCityOptions(countryName, stateName);
      const fallback = getFallbackCities(countryName, stateName);
      const nextCities = result.length > 0 ? result : fallback;

      if (!isMounted) {
        return;
      }

      setCities((current) => mergeStrings(current, nextCities, ''));
      setIsLoadingRegions(false);
    }

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [countryName, stateName]);

  const setCountryName = useCallback((value: string) => {
    setCountryNameValue(value);
    setStateNameValue('');
    setCityNameValue('');
    setStates([]);
    setCities([]);
  }, []);

  const setStateName = useCallback((value: string) => {
    setStateNameValue(value);
    setCityNameValue('');
    setCities([]);
  }, []);

  const setCityName = useCallback((value: string) => {
    setCityNameValue(value);
  }, []);

  const syncFromLocation = useCallback(({ addressDetails, coordinate }: SyncLocationInput) => {
    const country = addressDetails?.country;
    const countryCode = addressDetails?.countryCode ?? DEFAULT_COUNTRY_CODE;
    const state = addressDetails?.state ?? addressDetails?.county;
    const city = addressDetails?.city ?? addressDetails?.suburb ?? addressDetails?.county;

    if (country) {
      setCountries((current) =>
        mergeCountries(current, [
          {
            name: country,
            code: countryCode,
            coordinate,
            flagUrl: getFlagUrl(countryCode)
          }
        ])
      );
      setCountryNameValue(country);
      if (!state) {
        setStates([]);
        setStateNameValue('');
      }
      if (!city) {
        setCities([]);
        setCityNameValue('');
      }
    }

    if (state) {
      setStates((current) => mergeStates(current, [{ name: state }], state));
      setStateNameValue(state);
    }

    if (city) {
      setCities((current) => mergeStrings(current, [city], city));
      setCityNameValue(city);
    }
  }, []);

  return {
    countries,
    states,
    cities,
    countryName,
    stateName,
    cityName,
    activeCountry,
    isLoadingRegions,
    setCountryName,
    setStateName,
    setCityName,
    syncFromLocation
  };
}

function mergeCountries(current: CountryOption[], incoming: CountryOption[]): CountryOption[] {
  const merged = new Map<string, CountryOption>();

  [...current, ...incoming].forEach((country) => {
    const key = country.name.toLowerCase();
    merged.set(key, {
      ...merged.get(key),
      ...country,
      flagUrl: country.flagUrl ?? getFlagUrl(country.code)
    });
  });

  return Array.from(merged.values()).toSorted((first, second) =>
    first.name.localeCompare(second.name)
  );
}

function mergeStates(
  current: StateOption[],
  incoming: StateOption[],
  selectedName: string
): StateOption[] {
  const merged = new Map<string, StateOption>();

  [...current, ...incoming].forEach((state) => {
    merged.set(state.name.toLowerCase(), state);
  });

  if (selectedName && !merged.has(selectedName.toLowerCase())) {
    merged.set(selectedName.toLowerCase(), { name: selectedName });
  }

  return Array.from(merged.values()).toSorted((first, second) =>
    first.name.localeCompare(second.name)
  );
}

function mergeStrings(current: string[], incoming: string[], selectedName: string): string[] {
  const merged = new Set([...current, ...incoming]);

  if (selectedName) {
    merged.add(selectedName);
  }

  return Array.from(merged).toSorted((first, second) => first.localeCompare(second));
}

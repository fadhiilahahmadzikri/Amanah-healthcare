'use client';

import { kiaIntakeService, type FormRequirementData } from '../api/kia-intake-service';

type RequirementCache = Map<string, FormRequirementData>;

class FormRequirementGuard {
  private cache: RequirementCache = new Map();
  private pendingPromises: Map<string, Promise<FormRequirementData | null>> = new Map();
  private activeRequirement: FormRequirementData | null = null;
  private isResolving = false;
  private listeners: Set<() => void> = new Set();

  private buildKey(serviceId: string, patientId?: string | null): string {
    return `${serviceId}:${patientId || 'anonymous'}`;
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getActiveRequirement(): FormRequirementData | null {
    return this.activeRequirement;
  }

  getIsResolving(): boolean {
    return this.isResolving;
  }

  getCached(serviceId?: string | null, patientId?: string | null): FormRequirementData | null {
    if (!serviceId) return null;
    return this.cache.get(this.buildKey(serviceId, patientId)) || null;
  }

  prefetch(serviceId: string, patientId?: string | null): Promise<FormRequirementData | null> {
    const key = this.buildKey(serviceId, patientId);
    if (this.cache.has(key)) {
      return Promise.resolve(this.cache.get(key) || null);
    }
    if (this.pendingPromises.has(key)) {
      return this.pendingPromises.get(key)!;
    }
    const fetchPromise = kiaIntakeService
      .getFormRequirement(serviceId, patientId || undefined)
      .then((data) => {
        if (data) {
          this.cache.set(key, data);
        }
        this.pendingPromises.delete(key);
        this.notify();
        return data;
      })
      .catch(() => {
        this.pendingPromises.delete(key);
        this.notify();
        return null;
      });

    this.pendingPromises.set(key, fetchPromise);
    return fetchPromise;
  }

  async resolveAndLock(
    serviceId: string,
    patientId?: string | null
  ): Promise<FormRequirementData | null> {
    const key = this.buildKey(serviceId, patientId);
    this.isResolving = true;
    this.notify();

    try {
      let requirement = this.cache.get(key) || null;
      if (!requirement) {
        requirement = await this.prefetch(serviceId, patientId);
      }
      this.activeRequirement = requirement;
      return requirement;
    } finally {
      this.isResolving = false;
      this.notify();
    }
  }

  setActiveRequirement(data: FormRequirementData | null) {
    this.activeRequirement = data;
    this.notify();
  }

  clearActiveRequirement() {
    this.activeRequirement = null;
    this.notify();
  }

  reset() {
    this.cache.clear();
    this.pendingPromises.clear();
    this.activeRequirement = null;
    this.isResolving = false;
    this.notify();
  }
}

export const formRequirementGuard = new FormRequirementGuard();

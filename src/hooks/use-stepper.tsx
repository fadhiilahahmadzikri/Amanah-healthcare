import type { AnyFormApi } from '@tanstack/react-form';
import { useCallback, useState } from 'react';
import type { ZodTypeAny } from 'zod';

type HandleCancelOrBackOpts = {
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
};

type StepState = {
  value: number;
  count: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  isCompleted: boolean;
};

export function useFormStepper(schemas: ZodTypeAny[]) {
  const stepCount = schemas.length;
  const [currentStep, setCurrentStep] = useState(1);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, stepCount));
  }, [stepCount]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const step: StepState = {
    value: currentStep,
    count: stepCount,
    goToNextStep,
    goToPrevStep,
    isCompleted: currentStep === stepCount
  };

  const currentValidator = schemas[currentStep - 1];
  const isFirstStep = currentStep === 1;

  const triggerFormGroup = async (form: AnyFormApi) => {
    const result = currentValidator.safeParse(form.state.values);
    if (!result.success) {
      await form.handleSubmit({ step: String(currentStep) });
      return result;
    }

    return result;
  };

  const handleNextStepOrSubmit = async (form: AnyFormApi) => {
    const result = await triggerFormGroup(form);
    if (!result.success) {
      return;
    }

    if (currentStep < stepCount) {
      goToNextStep();
      return;
    }

    if (currentStep === stepCount) {
      form.handleSubmit();
    }
  };

  const handleCancelOrBack = (opts?: HandleCancelOrBackOpts) => {
    if (isFirstStep || step.isCompleted) {
      opts?.onCancel?.();
      return;
    }

    if (currentStep > 1) {
      opts?.onBack?.();
      goToPrevStep();
    }
  };

  return {
    step,
    currentStep,
    isFirstStep,
    currentValidator,
    triggerFormGroup,
    handleNextStepOrSubmit,
    handleCancelOrBack
  };
}

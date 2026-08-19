import { createFormHookContexts, revalidateLogic, useStore } from '@tanstack/react-form';
import type { AnyFieldApi, DeepKeys } from '@tanstack/form-core';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import {
  Field as DefaultField,
  FieldError as DefaultFieldError,
  FieldSet as DefaultFieldSet,
  fieldVariants
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

const {
  fieldContext,
  formContext,
  useFieldContext: _useFieldContext,
  useFormContext
} = createFormHookContexts();

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const useFieldContext = () => {
  const { id } = React.useContext(FormItemContext);
  const fieldCtx = _useFieldContext();

  if (!fieldCtx) {
    throw new Error('useFieldContext should be used within <AppField>');
  }

  const { name, store, ...rest } = fieldCtx;
  const errors = useStore(store, (state) => state.meta.errors);

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    errors,
    store,
    ...rest
  };
};

function FieldSet({ className, children, ...props }: React.ComponentProps<'fieldset'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <DefaultFieldSet className={cn('grid gap-1', className)} {...props}>
        {children}
      </DefaultFieldSet>
    </FormItemContext.Provider>
  );
}

function Field({
  children,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  const { errors, formItemId, formDescriptionId, formMessageId, store } = useFieldContext();
  const form = useFormContext();
  const isTouched = useStore(store, (state) => state.meta.isTouched);

  const hasSubmitted = useStore(form.store, (s) => s.submissionAttempts > 0);
  const hasVisibleErrors = !!errors.length && (isTouched || hasSubmitted);

  return (
    <DefaultField
      data-invalid={hasVisibleErrors}
      id={formItemId}
      aria-describedby={
        !hasVisibleErrors ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={hasVisibleErrors}
      {...props}
    >
      {children}
    </DefaultField>
  );
}

function FieldError({ className, ...props }: React.ComponentProps<'p'>) {
  const { errors, formMessageId, store } = useFieldContext();
  const form = useFormContext();
  const isTouched = useStore(store, (state) => state.meta.isTouched);
  const hasSubmitted = useStore(form.store, (s) => s.submissionAttempts > 0);
  if (!errors.length || (!isTouched && !hasSubmitted)) return null;
  return (
    <DefaultFieldError
      data-slot='form-message'
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
      errors={errors}
    />
  );
}

function FormErrors({ className, ...props }: React.ComponentProps<'div'>) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.errors}>
      {(errors) => {
        if (!errors.length) return null;
        return (
          <div
            role='alert'
            className={cn(
              'bg-destructive/10 text-destructive rounded-md border p-3 text-sm',
              className
            )}
            {...props}
          >
            <ul className='list-disc space-y-1 pl-4'>
              {errors.map((error, i) => (
                <li key={i}>{String(error)}</li>
              ))}
            </ul>
          </div>
        );
      }}
    </form.Subscribe>
  );
}

function scrollToFirstError() {
  requestAnimationFrame(() => {
    const firstError = document.querySelector('[data-invalid="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const focusable = firstError.querySelector<HTMLElement>(
        'input, textarea, select, button, [tabindex]'
      );
      focusable?.focus({ preventScroll: true });
    }
  });
}

interface FieldValidatorConfig {
  onChange?: unknown;

  onChangeAsync?: unknown;

  onChangeAsyncDebounceMs?: number;

  onChangeListenTo?: string[];

  onBlur?: unknown;

  onBlurAsync?: unknown;

  onBlurAsyncDebounceMs?: number;

  onBlurListenTo?: string[];

  onSubmit?: unknown;

  onSubmitAsync?: unknown;

  onMount?: unknown;
}

interface FieldListenerConfig {
  onChange?: (props: { value: unknown; fieldApi: AnyFieldApi }) => void;

  onChangeDebounceMs?: number;

  onBlur?: (props: { value: unknown; fieldApi: AnyFieldApi }) => void;

  onBlurDebounceMs?: number;

  onMount?: (props: { value: unknown; fieldApi: AnyFieldApi }) => void;

  onSubmit?: (props: { value: unknown; fieldApi: AnyFieldApi }) => void;
}

interface FieldConfig {
  validators?: FieldValidatorConfig;

  asyncDebounceMs?: number;

  listeners?: FieldListenerConfig;

  mode?: 'value' | 'array';

  defaultValue?: unknown;
}

type FormFieldSlot = React.ComponentType<{
  name: string;
  validators?: FieldValidatorConfig;
  asyncDebounceMs?: number;
  listeners?: FieldListenerConfig;
  mode?: 'value' | 'array';
  defaultValue?: unknown;
  children: (fieldApi: AnyFieldApi) => React.ReactNode;
}>;

function createFormField<P extends object>(FieldComponent: React.ComponentType<P>) {
  function ComposedFormField({
    name,
    validators,
    asyncDebounceMs,
    listeners,
    mode,
    defaultValue,
    ...props
  }: { name: string } & FieldConfig &
    Omit<P, 'name' | 'validators' | 'asyncDebounceMs' | 'listeners' | 'mode' | 'defaultValue'>) {
    const form = useFormContext();
    const FieldSlot = form.Field as unknown as FormFieldSlot;
    return (
      <FieldSlot
        name={name}
        validators={validators}
        asyncDebounceMs={asyncDebounceMs}
        listeners={listeners}
        mode={mode}
        defaultValue={defaultValue}
      >
        {(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <FieldComponent {...(props as unknown as P)} />
          </fieldContext.Provider>
        )}
      </FieldSlot>
    );
  }
  ComposedFormField.displayName = `FormField(${FieldComponent.displayName || FieldComponent.name})`;
  return ComposedFormField;
}

type WithTypedName<C, TValues> =
  C extends React.ComponentType<infer P>
    ? P extends { name: string }
      ? React.ComponentType<Omit<P, 'name'> & { name: DeepKeys<TValues> & string }>
      : C
    : C;

function typedField<TValues extends Record<string, unknown>>() {
  return function <C extends React.ComponentType<{ name: string }>>(
    Component: C
  ): WithTypedName<C, TValues> {
    return Component as WithTypedName<C, TValues>;
  };
}

export type { FieldConfig, FieldValidatorConfig, FieldListenerConfig, WithTypedName };

export {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
  createFormField,
  typedField,
  revalidateLogic,
  scrollToFirstError,
  FieldSet as FormFieldSet,
  Field as FormField,
  FieldError as FormFieldError,
  FormErrors
};

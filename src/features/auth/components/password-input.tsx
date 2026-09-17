'use client';

import { useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';
import { Icons } from '@/components/icons';

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label: string;
}

export function PasswordInput({ label, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={isVisible ? 'text' : 'password'} {...props} />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          type='button'
          size='icon-xs'
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
          onClick={() => setIsVisible((value) => !value)}
        >
          {isVisible ? <Icons.eyeOff /> : <Icons.eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

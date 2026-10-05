import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ChangeDoctorModal } from '@/features/appointment-pasien/components/change-doctor-modal';

describe('ChangeDoctorModal component structure', () => {
  it('exports ChangeDoctorModal function', () => {
    expect(typeof ChangeDoctorModal).toBe('function');
  });

  it('strictly adheres to existing design system conventions', () => {
    const fileContent = readFileSync(
      join(
        process.cwd(),
        'src/features/appointment-pasien/components/change-doctor-modal.tsx'
      ),
      'utf8'
    );

    // 1. Uses ModalWrapper
    expect(fileContent).toContain('ModalWrapper');
    // 2. Uses dynamic Radix Tabs
    expect(fileContent).toContain('Tabs');
    expect(fileContent).toContain('TabsList');
    expect(fileContent).toContain('TabsTrigger');
    expect(fileContent).toContain('TabsContent');
    // 3. Reuses DoctorAvatar
    expect(fileContent).toContain('DoctorAvatar');
    // 4. Pill shape buttons
    expect(fileContent).toContain('shape=\'pill\'');
    // 5. Toast with action
    expect(fileContent).toContain('Lihat Janji Temu');
    // 6. Under 500 lines of code constraint
    const lineCount = fileContent.split('\n').length;
    expect(lineCount).toBeLessThan(500);
  });
});

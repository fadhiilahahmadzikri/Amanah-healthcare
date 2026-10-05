import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ChangeRoomModal } from '@/features/appointment-pasien/components/change-room-modal';

describe('ChangeRoomModal component structure', () => {
  it('exports ChangeRoomModal function', () => {
    expect(typeof ChangeRoomModal).toBe('function');
  });

  it('strictly adheres to existing design system conventions', () => {
    const fileContent = readFileSync(
      join(
        process.cwd(),
        'src/features/appointment-pasien/components/change-room-modal.tsx'
      ),
      'utf8'
    );

    // 1. Uses ModalWrapper
    expect(fileContent).toContain('ModalWrapper');
    // 2. Uses room status badges
    expect(fileContent).toContain('Tersedia');
    expect(fileContent).toContain('Terisi');
    // 3. Pill shape buttons
    expect(fileContent).toContain('shape=\'pill\'');
    // 4. Toast with action
    expect(fileContent).toContain('Lihat Janji Temu');
    // 5. Does not expose ID Pasien and does not contain developer jargon
    expect(fileContent).not.toContain('ID Pasien');
    expect(fileContent).not.toContain('Edge Case');
    // 6. Contains Lihat Pasien button
    expect(fileContent).toContain('Lihat Pasien');
    // 7. Under 500 lines of code constraint
    const lineCount = fileContent.split('\n').length;
    expect(lineCount).toBeLessThan(500);
  });
});

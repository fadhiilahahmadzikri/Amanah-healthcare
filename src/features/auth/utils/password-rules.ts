export interface PasswordRule {
  id: string;
  label: string;
  validate: (val: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'min-length',
    label: 'Minimal 8 karakter',
    validate: (val: string) => val.length >= 8
  },
  {
    id: 'uppercase',
    label: 'Mengandung huruf besar (A-Z)',
    validate: (val: string) => /[A-Z]/.test(val)
  },
  {
    id: 'lowercase',
    label: 'Mengandung huruf kecil (a-z)',
    validate: (val: string) => /[a-z]/.test(val)
  },
  {
    id: 'number',
    label: 'Mengandung angka (0-9)',
    validate: (val: string) => /[0-9]/.test(val)
  },
  {
    id: 'special-char',
    label: 'Mengandung simbol / karakter khusus (@$!%*?&)',
    validate: (val: string) => /[^A-Za-z0-9]/.test(val)
  }
];

export interface PasswordStrengthResult {
  score: number;
  percent: number;
  label: string;
  colorClass: string;
  barColorClass: string;
  rules: Array<PasswordRule & { passed: boolean }>;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const evaluatedRules = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.validate(password)
  }));

  const passedCount = evaluatedRules.filter((r) => r.passed).length;
  const percent = Math.round((passedCount / PASSWORD_RULES.length) * 100);

  let label = 'Sangat Lemah';
  let colorClass = 'text-destructive';
  let barColorClass = 'bg-destructive';

  if (!password) {
    label = 'Belum diisi';
    colorClass = 'text-muted-foreground';
    barColorClass = 'bg-muted';
  } else if (passedCount === 5) {
    label = 'Sangat Kuat';
    colorClass = 'text-emerald-500';
    barColorClass = 'bg-emerald-500';
  } else if (passedCount === 4) {
    label = 'Kuat';
    colorClass = 'text-teal-500';
    barColorClass = 'bg-teal-500';
  } else if (passedCount === 3) {
    label = 'Sedang';
    colorClass = 'text-amber-500';
    barColorClass = 'bg-amber-500';
  } else if (passedCount >= 1) {
    label = 'Lemah';
    colorClass = 'text-orange-500';
    barColorClass = 'bg-orange-500';
  }

  return {
    score: passedCount,
    percent,
    label,
    colorClass,
    barColorClass,
    rules: evaluatedRules
  };
}

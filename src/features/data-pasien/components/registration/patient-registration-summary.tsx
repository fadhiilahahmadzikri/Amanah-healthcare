'use client';

import type { PatientRegistrationFormValues } from '../../schemas/patient-registration-schema';

type PatientRegistrationSummaryProps = {
  values: PatientRegistrationFormValues;
};

const summaryFields = [
  ['nama lengkap', 'name'],
  ['nik ktp', 'nik'],
  ['nama ibu kandung', 'nama_ibu_kandung'],
  ['tempat, tgl lahir', 'birth'],
  ['jenis kelamin', 'gender'],
  ['golongan darah', 'blood_type'],
  ['domisili', 'domicile'],
  ['pekerjaan', 'pekerjaan']
] as const;

export function PatientRegistrationSummary({ values }: PatientRegistrationSummaryProps) {
  return (
    <dl className='space-y-1 pt-1 text-xs'>
      {summaryFields.map(([label, key]) => {
        const isDomicile = key === 'domicile';

        return (
          <div
            key={key}
            className={
              isDomicile
                ? 'flex flex-col gap-1 border-b border-border py-2.5'
                : 'flex items-center justify-between gap-4 border-b border-border py-2.5'
            }
          >
            <dt className='font-normal text-muted-foreground'>{label}</dt>
            <dd
              className={
                key === 'nik'
                  ? 'break-words text-right font-mono font-medium text-primary'
                  : 'break-words text-right font-medium text-primary'
              }
            >
              {getSummaryValue(values, key)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function getSummaryValue(
  values: PatientRegistrationFormValues,
  key: (typeof summaryFields)[number][1]
): string {
  if (key === 'birth') {
    return `${values.tempat_lahir}, ${formatDisplayDate(values.birth_date)}`;
  }

  if (key === 'domicile') {
    return `${values.alamat_detail}, Kel. ${values.kelurahan}, Kec. ${values.kecamatan}, ${values.kabupaten}, Prov. ${values.provinsi}`;
  }

  return values[key as keyof PatientRegistrationFormValues];
}

function formatDisplayDate(value: string): string {
  if (!value) {
    return '';
  }

  const [year = 0, month = 1, day = 1] = value.split('-').map(Number);

  return new Date(year, month - 1, day)
    .toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    .toLowerCase();
}

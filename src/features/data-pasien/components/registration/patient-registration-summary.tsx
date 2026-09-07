'use client';

import type { PatientRegistrationFormValues } from '../../schemas/patient-registration-schema';

type PatientRegistrationSummaryProps = {
  values: PatientRegistrationFormValues;
};

const summaryFields = [
  ['Nama lengkap', 'name'],
  ['NIK', 'nik'],
  ['Nama ibu kandung', 'nama_ibu_kandung'],
  ['Tempat, tanggal lahir', 'birth'],
  ['Jenis kelamin', 'gender'],
  ['Golongan darah', 'blood_type'],
  ['Domisili', 'domicile'],
  ['Pekerjaan', 'pekerjaan']
] as const;

export function PatientRegistrationSummary({ values }: PatientRegistrationSummaryProps) {
  return (
    <dl className='grid gap-3 text-sm'>
      {summaryFields.map(([label, key]) => (
        <div key={key} className='grid gap-1 border-b pb-3 last:border-b-0 last:pb-0'>
          <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
          <dd className='break-words font-medium text-foreground'>
            {getSummaryValue(values, key)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function getSummaryValue(
  values: PatientRegistrationFormValues,
  key: (typeof summaryFields)[number][1]
): string {
  if (key === 'birth') {
    return `${values.tempat_lahir}, ${values.birth_date}`;
  }

  if (key === 'domicile') {
    return `${values.alamat_detail}, Kel. ${values.kelurahan}, Kec. ${values.kecamatan}, ${values.kabupaten}, Prov. ${values.provinsi}`;
  }

  return values[key as keyof PatientRegistrationFormValues];
}

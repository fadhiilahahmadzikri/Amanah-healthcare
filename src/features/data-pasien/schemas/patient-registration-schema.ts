import { z } from 'zod';

export const patientRegistrationSchema = z.object({
  name: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter'),
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  nama_ibu_kandung: z.string().trim().min(3, 'Nama ibu kandung minimal 3 karakter'),
  tempat_lahir: z.string().trim().min(2, 'Tempat lahir harus diisi'),
  birth_date: z.string().trim().min(1, 'Tanggal lahir harus diisi'),
  gender: z.enum(['Laki-laki', 'Perempuan'], {
    message: 'Pilih jenis kelamin'
  }),
  blood_type: z.enum(['A', 'B', 'AB', 'O', 'Belum Tahu'], {
    message: 'Pilih golongan darah'
  }),
  provinsi: z.string().trim().min(1, 'Pilih provinsi'),
  provinsi_id: z.string().trim().min(1, 'Pilih provinsi'),
  kabupaten: z.string().trim().min(1, 'Pilih kota atau kabupaten'),
  kabupaten_id: z.string().trim().min(1, 'Pilih kota atau kabupaten'),
  kecamatan: z.string().trim().min(1, 'Pilih kecamatan'),
  kecamatan_id: z.string().trim().min(1, 'Pilih kecamatan'),
  kelurahan: z.string().trim().min(1, 'Pilih kelurahan atau desa'),
  kelurahan_id: z.string().trim().min(1, 'Pilih kelurahan atau desa'),
  alamat_detail: z.string().trim().min(5, 'Alamat detail minimal 5 karakter'),
  pekerjaan: z.string().trim().min(2, 'Pekerjaan harus diisi')
});

export const patientRegistrationStepSchemas = [
  patientRegistrationSchema.pick({ name: true }),
  patientRegistrationSchema.pick({ nik: true }),
  patientRegistrationSchema.pick({ nama_ibu_kandung: true }),
  patientRegistrationSchema.pick({ tempat_lahir: true, birth_date: true }),
  patientRegistrationSchema.pick({ gender: true }),
  patientRegistrationSchema.pick({ blood_type: true }),
  patientRegistrationSchema.pick({
    provinsi: true,
    provinsi_id: true,
    kabupaten: true,
    kabupaten_id: true,
    kecamatan: true,
    kecamatan_id: true,
    kelurahan: true,
    kelurahan_id: true,
    alamat_detail: true
  }),
  patientRegistrationSchema.pick({ pekerjaan: true }),
  patientRegistrationSchema
] as const;

export type PatientRegistrationFormValues = z.infer<typeof patientRegistrationSchema>;

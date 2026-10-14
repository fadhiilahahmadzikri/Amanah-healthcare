import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().trim().min(2, 'Nama pasien minimal 2 karakter'),
  patient_id: z.string().min(3, 'Nomor Rekam Medis / ID Pasien harus diisi'),
  nik: z
    .string()
    .refine(
      (val) => !val || val.trim().length === 0 || /^\d{16}$/.test(val.trim()),
      'NIK harus berupa 16 digit angka'
    )
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .refine(
      (val) => !val || val.trim().length === 0 || val.trim().length >= 8,
      'Nomor telepon minimal 8 digit'
    )
    .optional()
    .or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  gender: z.string().min(1, 'Pilih jenis kelamin'),
  age: z.number().min(0, 'Umur minimal 0').max(150, 'Umur maksimal 150'),
  birth_date: z.string().min(1, 'Tanggal lahir harus diisi'),
  blood_type: z.string().min(1, 'Golongan darah harus dipilih'),
  address: z.string().optional().or(z.literal('')),
  domisili: z.string().optional().or(z.literal('')),
  nama_ibu_kandung: z.string().optional().or(z.literal('')),
  tempat_lahir: z.string().optional().or(z.literal('')),
  pekerjaan: z.string().optional().or(z.literal('')),
  emergency_contact: z.string().optional().or(z.literal('')),
  provinsi: z.string().optional().or(z.literal('')),
  provinsi_id: z.string().optional().or(z.literal('')),
  kabupaten: z.string().optional().or(z.literal('')),
  kabupaten_id: z.string().optional().or(z.literal('')),
  kecamatan: z.string().optional().or(z.literal('')),
  kecamatan_id: z.string().optional().or(z.literal('')),
  kelurahan: z.string().optional().or(z.literal('')),
  kelurahan_id: z.string().optional().or(z.literal('')),
  alamat_detail: z.string().optional().or(z.literal('')),
  account_status: z.string().min(1, 'Pilih status akun')
});

export type PatientFormValues = z.infer<typeof patientSchema>;

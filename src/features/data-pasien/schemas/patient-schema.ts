import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(2, 'Nama pasien minimal 2 karakter'),
  patient_id: z.string().min(3, 'Nomor Rekam Medis / ID Pasien harus diisi'),
  nik: z.string().min(10, 'NIK minimal 10 digit (standar 16 digit)'),
  phone: z.string().min(8, 'Nomor telepon minimal 8 digit'),
  email: z.string().email('Format email tidak valid').or(z.literal('')),
  gender: z.string().min(1, 'Pilih jenis kelamin'),
  age: z.number().min(0, 'Umur minimal 0').max(150, 'Umur maksimal 150'),
  birth_date: z.string().min(1, 'Tanggal lahir harus diisi'),
  blood_type: z.string().min(1, 'Golongan darah harus dipilih'),
  address: z.string().optional(),
  domisili: z.string().optional(),
  nama_ibu_kandung: z.string().optional(),
  tempat_lahir: z.string().optional(),
  pekerjaan: z.string().optional(),
  emergency_contact: z.string().optional(),
  provinsi: z.string().optional(),
  provinsi_id: z.string().optional(),
  kabupaten: z.string().optional(),
  kabupaten_id: z.string().optional(),
  kecamatan: z.string().optional(),
  kecamatan_id: z.string().optional(),
  kelurahan: z.string().optional(),
  kelurahan_id: z.string().optional(),
  alamat_detail: z.string().optional(),
  account_status: z.string().min(1, 'Pilih status akun')
});

export type PatientFormValues = z.infer<typeof patientSchema>;

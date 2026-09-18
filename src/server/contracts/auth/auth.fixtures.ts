import 'server-only';
import type { LoginResponseDto, AuthenticatedUserDto, RefreshResponseDto } from './auth.dto';

export const authFixtures = {
  doctorUserDto: {
    id: 'e81d77a2-f947-4952-b88d-e6b8408f65a1',
    email: 'dr.ahmad@amanah-healthcare.local',
    systemRole: 'STAF' as const,
    role: {
      id: 2,
      name: 'STAF'
    },
    staff: {
      id: '993f4a36-7c16-43e9-9133-14b2d56a2977',
      practitionerId: '35efae0a-85b8-4d5c-9c76-f8180e0c9041',
      userId: 'e81d77a2-f947-4952-b88d-e6b8408f65a1',
      poliklinikId: 'b18b4e7c-b6fa-4993-8025-a13437e2311f',
      fullName: 'dr. Ahmad Fauzi, Sp.A',
      profession: 'Dokter Spesialis Anak',
      idCardNumber: 'STF-DOK-001',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d',
      phoneNumber: '+6281234567891',
      isActive: true
    },
    patient: null
  } satisfies AuthenticatedUserDto,

  loginResponseDto: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4MWQ3N2EyIn0.signature',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4MWQ3N2EyIn0.refresh_signature',
    tokenExpires: 1726794000000,
    user: {
      id: 'e81d77a2-f947-4952-b88d-e6b8408f65a1',
      email: 'dr.ahmad@amanah-healthcare.local',
      systemRole: 'STAF' as const,
      role: {
        id: 2,
        name: 'STAF'
      },
      staff: {
        id: '993f4a36-7c16-43e9-9133-14b2d56a2977',
        practitionerId: '35efae0a-85b8-4d5c-9c76-f8180e0c9041',
        userId: 'e81d77a2-f947-4952-b88d-e6b8408f65a1',
        poliklinikId: 'b18b4e7c-b6fa-4993-8025-a13437e2311f',
        fullName: 'dr. Ahmad Fauzi, Sp.A',
        profession: 'Dokter Spesialis Anak',
        idCardNumber: 'STF-DOK-001',
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d',
        phoneNumber: '+6281234567891',
        isActive: true
      },
      patient: null
    }
  } satisfies LoginResponseDto,

  refreshResponseDto: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_token',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh_token',
    tokenExpires: 1726880400000
  } satisfies RefreshResponseDto
} as const;

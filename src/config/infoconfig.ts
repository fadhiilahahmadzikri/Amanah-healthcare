import type { InfobarContent } from '@/components/ui/infobar';

export const workspacesInfoContent: InfobarContent = {
  title: 'Workspaces Management',
  sections: [
    {
      title: 'Overview',
      description:
        'Halaman Unit Layanan memungkinkan pengelola untuk melihat dan mengatur unit layanan klinik operasional. Anda dapat meninjau unit yang tersedia dan mengelola konteks unit aktif.',
      links: []
    },
    {
      title: 'Creating Workspaces',
      description:
        'Konfigurasi unit layanan baru dan cabang operasional dikelola secara terpusat oleh administrator sistem klinik sesuai izin operasional fasilitas kesehatan.',
      links: []
    },
    {
      title: 'Switching Workspaces',
      description:
        'Anda dapat berpindah antar unit layanan untuk menyesuaikan cakupan operasional, data pasien, dan antrean yang dikelola.',
      links: []
    },
    {
      title: 'Workspace Features',
      description:
        'Setiap unit layanan beroperasi secara terintegrasi dengan data rekam medis, antrean, dan jadwal dokter yang terpusat.',
      links: []
    },
    {
      title: 'Server-Side Permission Checks',
      description:
        'Aplikasi menerapkan otorisasi Server-First RBAC. Pemeriksaan izin dilakukan di tingkat server untuk menjamin keamanan akses data medis.',
      links: []
    }
  ]
};

export const teamInfoContent: InfobarContent = {
  title: 'Team Management',
  sections: [
    {
      title: 'Overview',
      description:
        'Halaman Manajemen Tim memungkinkan administrator mengelola staf klinik, dokter, perawat, tenaga medis, dan peran operasional fasilitas kesehatan.',
      links: []
    },
    {
      title: 'Managing Team Members',
      description:
        'Anda dapat menambah, memperbarui, dan mengelola staf medis serta mengatur hak akses operasional sesuai tugas dan spesialisasi masing-masing.',
      links: []
    },
    {
      title: 'Roles and Permissions',
      description:
        'Peran dan hak akses dikelola secara terpusat melalui sistem RBAC Amanah Healthcare, mencakup peran Administrator, Staf Medis, Bidan, dan Tenaga Pendukung.',
      links: []
    },
    {
      title: 'Security Settings',
      description:
        'Pengaturan keamanan akun, sesi login terpusat, dan kontrol akses staf untuk melindungi kerahasiaan data rekam medis pasien.',
      links: []
    },
    {
      title: 'Organization Settings',
      description:
        'Konfigurasi identitas klinik, informasi kontak fasilitas kesehatan, dan preferensi operasional tim.',
      links: []
    },
    {
      title: 'Navigation RBAC System',
      description:
        'Navigasi dashboard disaring secara otomatis berdasarkan peran akun terverifikasi dari server dengan zero hydration flicker.',
      links: []
    }
  ]
};
